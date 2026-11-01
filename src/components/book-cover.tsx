export function BookCover({ book }: { book: { title: string; author: string; color: string; art: string } }) {
  return (
    <div className="book-cover" style={{ backgroundColor: book.color }} aria-label={`Capa ilustrativa de ${book.title}`}>
      <small>{book.author}</small>
      <span className="cover-art" aria-hidden="true">{book.art}</span>
      <strong>{book.title}</strong>
    </div>
  );
}
