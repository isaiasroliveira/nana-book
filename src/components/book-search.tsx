"use client";

import { useState, type FormEvent } from "react";
import { BookCover } from "./book-cover";
import { Search } from "lucide-react";
import type { BookResult } from "@/services/book-catalog";

export function BookSearch({ onSelect }: { onSelect: (book: BookResult) => void }) {
  const [books, setBooks] = useState<BookResult[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    setLoading(true);
    setBooks([]);
    setStatus("Buscando livros…");
    try {
      const response = await fetch(`/api/books?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(12000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível consultar os livros.");
      setBooks(data.books);
      setStatus(data.books.length ? `${data.books.length} resultados encontrados.` : "Nenhum livro encontrado. Tente outro título, autor ou ISBN.");
    } catch (error) {
      setStatus(error instanceof Error && error.name !== "TimeoutError" ? error.message : "A busca demorou mais que o esperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="search" aria-labelledby="search-heading" className="search-section">
      <div className="section-head"><h2 id="search-heading">Avaliar um livro</h2></div>
      <form onSubmit={search} className="search-form">
        <label htmlFor="book-query">Título, autor ou ISBN</label>
        <div className="search-controls">
          <input id="book-query" name="q" required minLength={2} maxLength={200} placeholder="Qual livro você leu?" disabled={loading} />
          <button className="button" disabled={loading}><Search size={18} aria-hidden="true" />{loading ? "Buscando…" : "Buscar livro"}</button>
        </div>
      </form>
      <p role="status" aria-live="polite" className="sub">{status}</p>
      <ul className="search-results" aria-busy={loading}>
        {books.map(book => <li key={book.id}>
          <BookCover book={{ title: book.title, author: book.authors.join(", "), color: "#52675d", art: "", coverUrl: book.coverUrl }} />
          <h3>{book.title}</h3><p>{book.authors.join(", ") || "Autoria não informada"}</p>
          <p className="book-author">{[book.publisher, book.publishedDate, book.language].filter(Boolean).join(" · ")}</p>
          {book.isbn && <p className="book-author">ISBN: {book.isbn}</p>}
          <small>Fonte: {book.source}</small>
          <button type="button" className="button" onClick={() => onSelect(book)}>Avaliar esta edição</button>
        </li>)}
      </ul>
    </section>
  );
}
