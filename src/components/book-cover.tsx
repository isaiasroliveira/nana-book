"use client";

import { useState } from "react";

export function BookCover({ book }: { book: { title: string; author: string; color: string; art: string; coverUrl?: string } }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const showImage = book.coverUrl && failedUrl !== book.coverUrl;
  return (
    <div className="book-cover" style={{ backgroundColor: book.color }} aria-label={showImage ? undefined : `Capa ilustrativa de ${book.title}`}>
      {showImage ? <img className="catalog-cover" src={book.coverUrl} alt={`Capa de ${book.title}`} referrerPolicy="no-referrer" onError={() => setFailedUrl(book.coverUrl)} /> : <>
      <small>{book.author}</small>
      <span className="cover-art" aria-hidden="true">{book.art}</span>
      <strong>{book.title}</strong>
      </>}
    </div>
  );
}
