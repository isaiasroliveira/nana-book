"use client";

import { useEffect, useState } from "react";
import { Palette as PaletteIcon } from "lucide-react";

import { readAppearance, saveAppearance, type Palette, type Mode } from "../services/appearance";

export function AppearanceSettings() {
  const [palette, setPalette] = useState<Palette | "">("");
  const [mode, setMode] = useState<Mode>("dark");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = readAppearance(localStorage);
      if (saved) {
        setPalette(saved.palette);
        setMode(saved.mode);
      }
    } catch { /* Storage may be unavailable or contain invalid data. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (palette) document.documentElement.dataset.palette = palette;
    else delete document.documentElement.dataset.palette;
    if (palette || mode === "light") document.documentElement.dataset.mode = mode;
    else delete document.documentElement.dataset.mode;
    try {
      saveAppearance(localStorage, palette || mode === "light" ? { palette, mode } : null);
    } catch { /* Keep the current choice for this visit. */ }

  }, [loaded, palette, mode]);

  return <details className="appearance-settings">
    <summary><PaletteIcon size={19} aria-hidden="true" /><span>Aparência</span></summary>
    <div className="appearance-panel">
      <label>Paleta
        <select value={palette} onChange={event => setPalette(event.target.value as Palette | "")}>
          <option value="">Original</option>
          <option value="petrol">Azul petróleo</option>
          <option value="sage">Verde sálvia</option>
          <option value="rose">Rosa queimado</option>
        </select>
      </label>
      <label>Modo
        <select value={mode} onChange={event => setMode(event.target.value as Mode)}>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </label>
    </div>
  </details>;
}
