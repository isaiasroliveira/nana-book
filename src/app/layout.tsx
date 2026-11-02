import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";
import "./appearance.css";

export const metadata: Metadata = {
  title: "Nana Book | Seu diário de leitura",
  description: "Guarde suas leituras, avalie livros e compartilhe suas impressões.",
  icons: {
    icon: "/nana-book.png",
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try {
    const saved = JSON.parse(localStorage.getItem("nana-appearance") || "null");
    if (["", "petrol", "sage", "rose"].includes(saved?.palette) && ["light", "dark"].includes(saved?.mode)) {
      if (saved.palette) document.documentElement.dataset.palette = saved.palette;
      document.documentElement.dataset.mode = saved.mode;
    }
  } catch {}` }} /></head><body><MotionProvider>{children}</MotionProvider></body></html>;
}
