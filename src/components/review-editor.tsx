"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { BookResult } from "@/services/book-catalog";

export type Review = {
  id: string;
  volumeId: string;
  ratingUnits: number;
  opinion: string | null;
  containsSpoilers: boolean;
  createdAt: string;
  updatedAt: string;
  book?: BookResult | null;
};

export function ReviewEditor({ book, initialReview, expectedUserId, onSaved, onCancel, onSessionChanged }: {
  book: BookResult;
  initialReview?: Review;
  expectedUserId: string;
  onSaved: () => void;
  onCancel: () => void;
  onSessionChanged: () => void;
}) {
  const [ratingUnits, setRatingUnits] = useState(initialReview?.ratingUnits.toString() ?? "");
  const [opinion, setOpinion] = useState(initialReview?.opinion ?? "");
  const [containsSpoilers, setContainsSpoilers] = useState(initialReview?.containsSpoilers ?? false);
  const [confirmed, setConfirmed] = useState(!!initialReview);
  const [loading, setLoading] = useState(!initialReview);
  const [ready, setReady] = useState(!!initialReview);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [retry, setRetry] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
    if (initialReview) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setReady(false);
      setError("");
      try {
        const response = await fetch(`/api/reviews?volumeId=${encodeURIComponent(book.id)}`, {
          cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Não foi possível consultar sua avaliação. Tente novamente.");
        if (controller.signal.aborted) return;
        const review = data.reviews[0] as Review | undefined;
        if (review) {
          setRatingUnits(review.ratingUnits.toString());
          setOpinion(review.opinion ?? "");
          setContainsSpoilers(review.containsSpoilers);
        }
        setReady(true);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error && failure.name !== "TimeoutError" ? failure.message : "A consulta demorou mais que o esperado. Tente novamente.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [book.id, initialReview, retry]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !ready || !confirmed) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const sessionResponse = await fetch("/api/session", { cache: "no-store", signal: AbortSignal.timeout(12000) });
      const session = await sessionResponse.json();
      if (!sessionResponse.ok) throw new Error("Não foi possível verificar sua conta. Tente novamente.");
      if (session.user?.id !== expectedUserId) {
        onSessionChanged();
        return;
      }
      const response = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json", "X-Expected-User-Id": expectedUserId },
        body: JSON.stringify({ volumeId: book.id, ratingUnits: Number(ratingUnits), opinion: opinion.trim(), containsSpoilers }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await response.json();
      if (response.status === 409) {
        onSessionChanged();
        return;
      }
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar a avaliação. Tente novamente.");
      setStatus("Avaliação salva.");
      onSaved();
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== "TimeoutError" ? failure.message : "Não foi possível confirmar o salvamento. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="review-editor" className="review-editor" aria-labelledby="review-heading">
      <h2 id="review-heading" ref={heading} tabIndex={-1}>Sua avaliação</h2>
      <h3>{book.title}</h3>
      <p className="sub">{book.authors.join(", ") || "Autoria não informada"}</p>
      <p className="book-author">{[book.publisher, book.publishedDate, book.language, book.isbn].filter(Boolean).join(" · ")}</p>
      <small>Fonte: {book.source}</small>
      {loading && <p role="status">Consultando sua avaliação…</p>}
      <form className="review-form" onSubmit={save} aria-busy={saving || loading}>
        <fieldset disabled={!ready || saving}>
          <label className="checkbox-label"><input type="checkbox" name="confirmed" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />Confirmo que esta é a edição que li</label>
          <label htmlFor="rating-units">Sua nota</label>
          <select id="rating-units" name="ratingUnits" required value={ratingUnits} onChange={event => setRatingUnits(event.target.value)}>
            <option value="">Escolha uma nota</option>
            {Array.from({ length: 10 }, (_, index) => index + 1).map(units => <option key={units} value={units}>{(units / 2).toLocaleString("pt-BR")} de 5 estrelas</option>)}
          </select>
          <label htmlFor="review-opinion">Sua opinião (opcional)</label>
          <textarea id="review-opinion" name="opinion" maxLength={5000} rows={6} value={opinion} onChange={event => setOpinion(event.target.value)} aria-describedby="opinion-limit" />
          <small id="opinion-limit" className="book-author">Até 5.000 caracteres. Sua avaliação é privada.</small>
          <label className="checkbox-label"><input type="checkbox" name="containsSpoilers" checked={containsSpoilers} onChange={event => setContainsSpoilers(event.target.checked)} />Esta opinião contém spoilers</label>
        </fieldset>
        <div className="review-actions">
          <button className="button" disabled={!ready || saving}>{saving ? "Salvando…" : "Salvar avaliação"}</button>
          <button type="button" className="text-button" disabled={saving} onClick={onCancel}>Cancelar</button>
        </div>
      </form>
      {error && <p role="alert">{error}</p>}
      {!loading && !ready && <button type="button" className="text-button" onClick={() => setRetry(retry + 1)}>Tentar consultar novamente</button>}
      <p role="status" aria-live="polite">{status}</p>
    </section>
  );
}
