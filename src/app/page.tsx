import { BookCover } from "@/components/book-cover";
import Image from "next/image";
import { BookSearch } from "@/components/book-search";
import { Rating } from "@/components/rating";
import { AppearanceSettings } from "@/components/appearance-settings";

const books = [
  { title: "A vida invisível de Eurídice Gusmão", author: "Martha Batalha", color: "#b8694d", art: "●", coverUrl: "https://books.google.com/books/content?id=XzbyCwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 5 },
  { title: "Torto arado", author: "Itamar Vieira Junior", color: "#a75336", art: "◉", coverUrl: "https://books.google.com/books/content?id=lL2GDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 4.5 },
  { title: "Pequena coreografia do adeus", author: "Aline Bei", color: "#789094", art: "✦", coverUrl: "https://books.google.com/books/content?id=jtUnEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 4 },
  { title: "O avesso da pele", author: "Jeferson Tenório", color: "#947654", art: "◌", coverUrl: "https://books.google.com/books/content?id=cC_tDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 5 },
  { title: "Tudo é rio", author: "Carla Madeira", color: "#52675d", art: "≈", coverUrl: "https://books.google.com/books/content?id=BCH3EAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api", rating: 4.5 },
];


export default function HomePage() {
  const latestBook = books[0];
  return (
    <>
      <header className="top">
        <a className="brand" href="/" aria-label="Nana Book, início">
          <Image src="/nana-book.png" alt="" width={38} height={38} priority />
          <span>nana book</span>
        </a>
        <nav className="nav" aria-label="Principal">
          <a className="active" href="/" aria-current="page">Início</a>
          <a href="#readings">Minhas leituras</a>
        </nav>
        <div className="top-right"><AppearanceSettings /><span className="avatar" aria-label="Perfil de demonstração: Marina">M</span></div>
      </header>
      <main className="wrap">
        <div className="reading-intro">
          <section className="hero" aria-labelledby="welcome-heading">
            <h1 className="heading" id="welcome-heading">Seu canto<br />de leitura.</h1>
            <p className="sub">Guarde sua opinião sobre os livros que leu.</p>
          </section>
          <BookSearch />
        </div>
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
      </main>
    </>
  );
}
