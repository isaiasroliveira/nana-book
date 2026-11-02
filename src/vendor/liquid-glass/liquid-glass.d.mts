export function createGlass(target: HTMLElement, options: {
  mode: "backdrop";
  fit: boolean;
  radius: number;
  refraction: number;
  fallback: string;
}): { destroy(): void };
