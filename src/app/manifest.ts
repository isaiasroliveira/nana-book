import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nana Book",
    short_name: "Nana Book",
    description: "Seu diário de leitura",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#25251f",
    theme_color: "#25251f",
    icons: [
      { src: "/icons/nana-book-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/nana-book-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
