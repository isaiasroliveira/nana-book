import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import HomePage from "../../page";
import "./prototype.css";

const palettes = [
  { key: "petrol", name: "Azul petróleo", colors: { "--paper": "#f1f5f5", "--ink": "#19363d", "--muted": "#526b70", "--line": "#d1dfe0", "--surface": "#fbfdfd", "--review": "#dcebed", "--accent": "#27616c", "--action": "#24545e", "--action-text": "#ffffff" } },
  { key: "sage", name: "Verde sálvia", colors: { "--paper": "#f1f4f0", "--ink": "#283c33", "--muted": "#5b6d62", "--line": "#d5dfd6", "--surface": "#fbfdfb", "--review": "#dfeae0", "--accent": "#426c52", "--action": "#345640", "--action-text": "#ffffff" } },
  { key: "rose", name: "Rosa queimado", colors: { "--paper": "#f8f3f3", "--ink": "#482f39", "--muted": "#785d67", "--line": "#e8d9dd", "--surface": "#fffafb", "--review": "#f2e1e5", "--accent": "#92536a", "--action": "#704052", "--action-text": "#ffffff" } },
];

export default async function ColorPrototype({ searchParams }: { searchParams: Promise<{ palette?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { palette } = await searchParams;
  const current = palettes.findIndex(item => item.key === palette);
  const index = current < 0 ? 0 : current;
  const selected = palettes[index];
  return <div className="color-prototype" style={selected.colors as CSSProperties}>
    <HomePage />
    <nav className="palette-switcher" aria-label="Comparar paletas de cores">
      <a href={`?palette=${palettes[(index + 2) % 3].key}`} aria-label="Paleta anterior">←</a>
      <span>Paleta: {selected.name}</span>
      <a href={`?palette=${palettes[(index + 1) % 3].key}`} aria-label="Próxima paleta">→</a>
    </nav>
  </div>;
}
