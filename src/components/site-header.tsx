"use client";

import Image from "next/image";
import { BookOpen, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AppearanceSettings } from "./appearance-settings";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40);
      const section = document.getElementById("readings");
      setReading(!!section && window.scrollY > 40 && section.getBoundingClientRect().top < window.innerHeight * 0.65);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let lenses: { destroy(): void }[] = [];
    const mobile = window.matchMedia("(max-width: 760px)");
    let refresh = () => {};
    void import("../vendor/liquid-glass/liquid-glass.mjs").then(({ createGlass }) => {
      if (cancelled || window.matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
      refresh = () => {
        lenses.forEach(lens => lens.destroy());
        const selector = mobile.matches ? ".nav.glass-refraction, .search-section.glass-refraction" : ".top.glass-refraction, .search-section.glass-refraction";
        lenses = Array.from(document.querySelectorAll<HTMLElement>(selector)).map(element =>
          createGlass(element, { mode: "backdrop", fit: true, radius: 28, refraction: 24, fallback: "blur(20px) saturate(160%)" }));
      };
      refresh();
    });
    const onChange = () => refresh();
    mobile.addEventListener("change", onChange);
    return () => { cancelled = true; mobile.removeEventListener("change", onChange); lenses.forEach(lens => lens.destroy()); };
  }, []);

  return <header className={`top glass-refraction${scrolled ? " top-scrolled" : ""}`}>
    <a className="brand" href="/" aria-label="Nana Book, início">
      <Image src="/nana-book.png" alt="" width={38} height={38} priority />
      <span>nana book</span>
    </a>
    <nav className="nav glass-refraction" aria-label="Principal">
      <a className={!reading ? "active" : undefined} href="/" aria-current={!reading ? "page" : undefined}><Image src="/nana-book.png" alt="" width={24} height={24} /><span>Início</span></a>
      <a className={reading ? "active" : undefined} href="#readings" aria-current={reading ? "location" : undefined} onClick={() => setReading(true)}><BookOpen size={19} aria-hidden="true" /><span>Leituras</span></a>
      <div className="nav-settings"><AppearanceSettings /></div>
      <a className="account-link" href="/auth/sign-in"><UserRound size={19} aria-hidden="true" /><span>Conta</span></a>
    </nav>
  </header>;
}
