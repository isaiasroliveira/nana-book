"use client";

import Image from "next/image";
import { BookOpen, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover";
import { FluidHoverHighlight } from "./fluid-hover-highlight";
import { AppearanceSettings } from "./appearance-settings";

export function SiteHeader() {
  const navigation = useRef<HTMLElement>(null);
  const homeLink = useRef<HTMLAnchorElement>(null);
  const readingsLink = useRef<HTMLAnchorElement>(null);
  const appearanceLink = useRef<HTMLElement>(null);
  const accountLink = useRef<HTMLAnchorElement>(null);
  const hover = useFluidHover(navigation, { axis: "x" });
  useRegisterFluidHoverItem(hover.registerItem, 0, homeLink);
  useRegisterFluidHoverItem(hover.registerItem, 1, readingsLink);
  useRegisterFluidHoverItem(hover.registerItem, 2, appearanceLink);
  useRegisterFluidHoverItem(hover.registerItem, 3, accountLink);
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
        const selector = mobile.matches ? ".nav.glass-refraction" : ".top.glass-refraction";
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
    <nav ref={navigation} {...hover.handlers} className="nav glass-refraction" aria-label="Principal">
      <FluidHoverHighlight hover={hover} className="rounded-2xl" />
      <a ref={homeLink} className={!reading ? "active" : undefined} href="/" aria-current={!reading ? "page" : undefined}><Image src="/nana-book.png" alt="" width={24} height={24} /><span>Início</span></a>
      <a ref={readingsLink} className={reading ? "active" : undefined} href="#readings" aria-current={reading ? "location" : undefined} onClick={() => setReading(true)}><BookOpen size={19} aria-hidden="true" /><span>Leituras</span></a>
      <div className="nav-settings"><AppearanceSettings summaryRef={appearanceLink} /></div>
      <a ref={accountLink} className="account-link" href="/auth/sign-in"><UserRound size={19} aria-hidden="true" /><span>Conta</span></a>
    </nav>
  </header>;
}
