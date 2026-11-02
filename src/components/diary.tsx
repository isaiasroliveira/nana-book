"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookCover } from "./book-cover";
import { BookSearch } from "./book-search";
import { Rating } from "./rating";
import { Button } from "./ui/button";
import { ReviewEditor, type Review } from "./review-editor";
import type { BookResult } from "@/services/book-catalog";

const books = [
  { title: "A vida invisível de Eurídice Gusmão", author: "Martha Batalha", color: "#b8694d", art: "●", coverUrl: "https://books.google.com/books/content?id=XzbyCwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 5 },
  { title: "Torto arado", author: "Itamar Vieira Junior", color: "#a75336", art: "◉", coverUrl: "https://books.google.com/books/content?id=lL2GDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 4.5 },
  { title: "Pequena coreografia do adeus", author: "Aline Bei", color: "#789094", art: "✦", coverUrl: "https://books.google.com/books/content?id=jtUnEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 4 },
  { title: "O avesso da pele", author: "Jeferson Tenório", color: "#947654", art: "◌", coverUrl: "https://books.google.com/books/content?id=cC_tDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 5 },
  { title: "Tudo é rio", author: "Carla Madeira", color: "#52675d", art: "≈", coverUrl: "https://books.google.com/books/content?id=BCH3EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 4.5 },
];

type Reader = { id: string; name: string; email: string };

export function Diary() {
  const [user, setUser] = useState<Reader | null>();
  const [sessionError, setSessionError] = useState("");
  const [accountChanged, setAccountChanged] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCursor, setRetryCursor] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ book: BookResult; review?: Review } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const readerId = useRef<string | null | undefined>(undefined);
  const sessionRequest = useRef<AbortController | null>(null);
  const reviewRequest = useRef<AbortController | null>(null);

  const clearPrivateState = useCallback(() => {
    reviewRequest.current?.abort();
    setReviews([]);
    setNextCursor(null);
    setRetryCursor(null);
    setSelection(null);
    setDeleting(null);
    setDeleteError("");
    setError("");
    setLoading(false);
  }, []);

  const loadSession = useCallback(async () => {
    sessionRequest.current?.abort();
    const controller = new AbortController();
    sessionRequest.current = controller;
    setSessionError("");
    try {
      const response = await fetch("/api/session", { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]) });
      const data = await response.json();
      if (!response.ok) throw new Error("Não foi possível verificar sua conta. Tente novamente.");
      if (controller.signal.aborted) return;
      const nextReaderId = data.user?.id ?? null;
      if (readerId.current !== nextReaderId) {
        if (readerId.current !== undefined) {
          clearPrivateState();
          setAccountChanged(true);
        }
        readerId.current = nextReaderId;
        setUser(data.user);
      }
    } catch {
      if (!controller.signal.aborted) setSessionError("Não foi possível verificar sua conta. Tente novamente.");
    }
  }, [clearPrivateState]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") void loadSession(); };
    void loadSession();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      sessionRequest.current?.abort();
      reviewRequest.current?.abort();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadSession]);

  const loadReviews = useCallback(async (cursor: string | null = null) => {
    reviewRequest.current?.abort();
    const controller = new AbortController();
    reviewRequest.current = controller;
    setLoading(true);
    setError("");
    setRetryCursor(cursor);
    try {
      const response = await fetch(`/api/reviews${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(data.error ?? "Não foi possível carregar suas avaliações. Tente novamente.");
      setReviews(current => cursor ? [...current, ...data.reviews] : data.reviews);
      setNextCursor(data.nextCursor);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error && failure.name !== "TimeoutError" ? failure.message : "A consulta demorou mais que o esperado. Tente novamente.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void loadReviews();
  }, [user, loadReviews]);

  async function deleteReview(id: string) {
    if (!user) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE", headers: { "X-Expected-User-Id": user.id }, signal: AbortSignal.timeout(15000),
      });
      if (!response.ok && response.status !== 404) throw new Error();
      setDeleting(null);
      setReviews(current => current.filter(review => review.id !== id));
      if (selection?.review?.id === id) setSelection(null);
      await loadReviews();
    } catch { setDeleteError("Não foi possível excluir sua avaliação. Tente novamente."); }
    finally { setDeleteBusy(false); }
  }

  const latestBook = books[0];
  return (
    <>
      <div className="reading-intro">
        <section className="hero" aria-labelledby="welcome-heading">
          <h1 className="heading" id="welcome-heading">Seu canto<br />de leitura.</h1>
          <p className="sub">Guarde sua opinião sobre os livros que leu.</p>
        </section>
        <BookSearch onSelect={book => { setAccountChanged(false); setSelection({ book }); }} />
      </div>
      {user === undefined && !sessionError && <p role="status" className="sub">Verificando sua conta…</p>}
      {sessionError && <div><p role="alert">{sessionError}</p><button className="text-button" onClick={() => { void loadSession(); }}>Tentar novamente</button></div>}
      {accountChanged && <p role="status">Sua conta mudou. Selecione novamente o livro que deseja avaliar.</p>}
      {selection && user === null && <p role="status" className="sub"><a className="shelf-link" href="/auth/sign-in">Entre na sua conta</a> para avaliar {selection.book.title}.</p>}
      {selection && user && <ReviewEditor key={`${user.id}:${selection.book.id}:${selection.review?.id ?? "new"}`} expectedUserId={user.id} book={selection.book} initialReview={selection.review} onSaved={() => { void loadReviews(); }} onCancel={() => setSelection(null)} onSessionChanged={() => {
        clearPrivateState();
        readerId.current = undefined;
        setUser(undefined);
        setAccountChanged(true);
        void loadSession();
      }} />}
      {user && reviews[0] && <article className="hero-card" aria-label="Última leitura avaliada">
        <div className="featured-cover"><BookCover book={{ title: reviews[0].book?.title ?? "Edição indisponível no catálogo", author: reviews[0].book?.authors.join(", ") ?? "", coverUrl: reviews[0].book?.coverUrl, color: "#52675d", art: "" }} /></div>
        <div className="featured-details">
          <p className="reading-label">Na mesa de cabeceira</p>
          <h2>{reviews[0].book?.title ?? "Edição indisponível no catálogo"}</h2>
          <p className="sub">{reviews[0].book?.authors.join(", ") || "Autoria indisponível"}</p>
          <a className="shelf-link" href="#readings">Ir para minha estante</a>
        </div>
        <aside className="diary-note" aria-label="Sua nota de leitura">
          <span>Uma nota para lembrar</span>
          {reviews[0].containsSpoilers ? <p>Esta opinião contém spoilers.</p> : reviews[0].opinion ? <blockquote>{reviews[0].opinion.length > 180 ? `${reviews[0].opinion.slice(0, 180).trimEnd()}…` : reviews[0].opinion}</blockquote> : <p>Você ainda não escreveu uma opinião.</p>}
          <Rating value={reviews[0].ratingUnits / 2} />
        </aside>
      </article>}
      {user && <section id="readings" aria-labelledby="readings-heading">
        <div className="section-head"><h2 id="readings-heading">Livros que ficam</h2><span className="book-author">Seu diário privado</span></div>
        {!loading && !error && !reviews.length && <p className="sub">Sua estante começa com uma leitura. Busque um livro e salve sua primeira avaliação.</p>}
        <div className="diary-readings" aria-busy={loading}>
          {reviews.map(review => <article key={review.id} data-review-id={review.id}>
            <BookCover book={{ title: review.book?.title ?? "Edição indisponível no catálogo", author: review.book?.authors.join(", ") ?? "", coverUrl: review.book?.coverUrl, color: "#52675d", art: "" }} />
            <div>
              <h3 className="book-title">{review.book?.title ?? "Edição indisponível no catálogo"}</h3>
              {review.book ? <p className="book-author">{review.book.authors.join(", ")}<br />Fonte: {review.book.source}</p> : <p className="book-author">Sua avaliação continua salva. Tente consultar o catálogo mais tarde.</p>}
              <Rating value={review.ratingUnits / 2} />
              {review.containsSpoilers && <p className="spoiler-label">Contém spoilers</p>}
              {review.opinion && <p className="review-opinion">{review.opinion}</p>}
              <button type="button" className="text-button" onClick={() => { setAccountChanged(false); setSelection({ book: review.book ?? { id: review.volumeId, title: "Edição indisponível no catálogo", authors: [], source: "Google Books" }, review }); }}>Editar avaliação</button>
              {deleting === review.id ? <div role="group" aria-label="Confirmar exclusão da avaliação">
                <p>Excluir esta avaliação?</p>
                <button type="button" className="text-button" disabled={deleteBusy} onClick={() => { void deleteReview(review.id); }}>{deleteBusy ? "Excluindo…" : "Confirmar exclusão"}</button>{" "}
                <button type="button" className="text-button" disabled={deleteBusy} onClick={() => { setDeleting(null); setDeleteError(""); }}>Cancelar</button>
                {deleteError && <p role="alert">{deleteError}</p>}
              </div> : <button type="button" className="text-button" onClick={() => { setDeleting(review.id); setDeleteError(""); }}>Excluir avaliação</button>}
            </div>
          </article>)}
        </div>
        {loading && <p role="status" className="sub">Carregando suas avaliações…</p>}
        {error && <div><p role="alert">{error}</p><button type="button" className="text-button" disabled={loading} onClick={() => { void loadReviews(retryCursor); }}>Tentar novamente</button></div>}
        {nextCursor && !error && <Button type="button" className="diary-action" loading={loading} onClick={() => { void loadReviews(nextCursor); }}>Carregar mais</Button>}
      </section>}
      {user === null && <>
        <article className="hero-card" aria-label="Leitura em destaque de demonstração">
          <div className="featured-cover"><BookCover book={latestBook} /></div>
          <div className="featured-details">
            <p className="reading-label">Na mesa de cabeceira</p>
            <h2>{latestBook.title}</h2>
            <p className="sub">{latestBook.author}</p>
            <a className="shelf-link" href="#readings">Ir para minha estante</a>
          </div>
          <aside className="diary-note" aria-label="Nota de leitura demonstrativa">
            <span>Uma nota para lembrar</span>
            <blockquote>“Uma história que continua comigo depois da última página.”</blockquote>
            <Rating value={latestBook.rating} />
            <small>Marina, nesta prévia</small>
          </aside>
        </article>
        <section id="readings" aria-labelledby="readings-heading">
          <div className="section-head"><h2 id="readings-heading">Livros que ficam</h2><span className="book-author">Da sua estante</span></div>
          <div className="covers">
            {books.map(book => (
              <article key={book.title}>
                <BookCover book={book} />
                <h3 className="book-title">{book.title}</h3>
                <span className="book-author">{book.author}</span>
                <Rating value={book.rating} />
              </article>
            ))}
          </div>
        </section>
        <p className="demo-banner">Você está em uma prévia. Leituras e notas demonstrativas, ainda sem salvar alterações. Capas: Google Books.</p>

      </>}
    </>
  );
}
