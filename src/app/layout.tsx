import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./appearance.css";

export const metadata: Metadata = {
  title: "Nana Books | Seu diário de leitura",
  description: "Guarde suas leituras, avalie livros e compartilhe suas impressões.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
