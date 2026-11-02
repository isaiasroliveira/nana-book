export type Palette = "petrol" | "sage" | "rose";
export type Mode = "light" | "dark";
export type Appearance = { palette: Palette | ""; mode: Mode };

export function readAppearance(storage: Pick<Storage, "getItem">): Appearance | null {
  try {
    const saved = JSON.parse(storage.getItem("nana-appearance") || "null");
    if (["", "petrol", "sage", "rose"].includes(saved?.palette) &&
        (saved?.mode === "light" || saved?.mode === "dark")) return saved;
  } catch {
    // An unavailable store or invalid preference must not prevent rendering.
  }
  return null;
}

export function saveAppearance(storage: Pick<Storage, "setItem" | "removeItem">, appearance: Appearance | null) {
  try {
    if (appearance) storage.setItem("nana-appearance", JSON.stringify(appearance));
    else storage.removeItem("nana-appearance");
  } catch {
    // The selected appearance remains usable for this visit.
  }
}
