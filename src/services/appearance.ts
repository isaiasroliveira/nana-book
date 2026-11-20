export const appearanceStorageKey = "nana-appearance";
export const appearancePalettes = ["", "petrol", "sage", "rose"] as const;
export const appearanceModes = ["light", "dark"] as const;
export type Palette = Exclude<(typeof appearancePalettes)[number], "">;
export type Mode = (typeof appearanceModes)[number];
export type Appearance = { palette: Palette | ""; mode: Mode };

export function readAppearance(storage: Pick<Storage, "getItem">): Appearance | null {
  try {
    const saved = JSON.parse(storage.getItem(appearanceStorageKey) || "null");
    if (appearancePalettes.includes(saved?.palette) && appearanceModes.includes(saved?.mode)) return saved;
  } catch {
    // An unavailable store or invalid preference must not prevent rendering.
  }
  return null;
}

export function saveAppearance(storage: Pick<Storage, "setItem" | "removeItem">, appearance: Appearance | null) {
  try {
    if (appearance) storage.setItem(appearanceStorageKey, JSON.stringify(appearance));
    else storage.removeItem(appearanceStorageKey);
  } catch {
    // The selected appearance remains usable for this visit.
  }
}
