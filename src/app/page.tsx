import { BookCover } from "@/components/book-cover";
import Image from "next/image";
import { Search } from "lucide-react";
import { BookSearch } from "@/components/book-search";
import { Rating } from "@/components/rating";
import { AppearanceSettings } from "@/components/appearance-settings";

const books = [
  { title: "A vida invisível de Eurídice Gusmão", author: "Martha Batalha", color: "#b8694d", art: "●", rating: 5 },
  { title: "Torto arado", author: "Itamar Vieira Junior", color: "#a75336", art: "◉", rating: 4.5 },
  { title: "Pequena coreografia do adeus", author: "Aline Bei", color: "#789094", art: "✦", rating: 4 },
  { title: "O avesso da pele", author: "Jeferson Tenório", color: "#947654", art: "◌", rating: 5 },
  { title: "Tudo é rio", author: "Carla Madeira", color: "#52675d", art: "≈", rating: 4.5 },
];


export default function HomePage() {
  const latestBook = books[0];
  return (
    <>
      <div className="landing-art" aria-hidden="true" />
      <header className="top">
        <a className="brand" href="/" aria-label="Nana Books, início">
          <Image src="/nana.png" alt="" width={38} height={38} priority />
          <span>nana<br />books</span>
        </a>
        <nav className="nav" aria-label="Principal">
          <a className="active" href="/" aria-current="page">Início</a>
          <a href="#readings">Minhas leituras</a>
        </nav>
        <div className="top-right"><AppearanceSettings /><span className="avatar" aria-label="Perfil de demonstração: Marina">M</span></div>
      </header>
      <main className="wrap">
        <section className="hero" aria-labelledby="welcome-heading">
          <div className="hero-intro">
            <h1 className="heading" id="welcome-heading">Seus livros,<br />suas histórias.</h1>
            <p className="sub">Um lugar para guardar suas leituras e as impressões que ficam.</p>
            <a className="button" href="#search"><Search size={18} aria-hidden="true" />Buscar um livro</a>
          </div>
        </section>
      <p className="demo-banner">Prévia do Nana Books com leituras e capas ilustrativas. Seus dados ainda não são salvos.</p>

          <article className="hero-card" aria-label="Última leitura de demonstração">
            <BookCover book={latestBook} />
            <div>
              <p className="eyebrow">Sua última leitura</p>
              <p className="note">“Uma história que continua comigo depois da última página.”</p>
              <Rating value={latestBook.rating} />
              <div className="line" />
              <span className="book-author">Sua avaliação · 24 de outubro</span>
            </div>
          </article>
        <BookSearch />
        <section id="readings" aria-labelledby="readings-heading">
          <div className="section-head"><h2 id="readings-heading">Suas últimas leituras</h2></div>
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
      </main>
    </>
  );
}
