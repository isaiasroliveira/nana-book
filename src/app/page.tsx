import Image from "next/image";
import { AppearanceSettings } from "@/components/appearance-settings";
import { Diary } from "@/components/diary";

export default function HomePage() {
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
        <div className="top-right"><AppearanceSettings /><a className="account-link" href="/auth/sign-in">Conta</a></div>
      </header>
      <main className="wrap"><Diary /></main>
    </>
  );
}
