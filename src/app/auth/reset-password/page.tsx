"use client";

import { useEffect, useState } from "react";
import { PasswordRecovery } from "@/components/password-recovery";
import styles from "../sign-in/auth.module.css";

export default function ResetPasswordPage() {
  const [query, setQuery] = useState<{ token: string | null; error: boolean } | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery({ token: params.get("token"), error: params.has("error") });
  }, []);
  return <main className={styles.page}>
    <a href="/" className="brand">nana book</a>
    <h1>Recuperar senha</h1>
    {query?.error ? <p role="alert">Este link é inválido ou expirou. Solicite um novo link.</p>
      : query && <PasswordRecovery token={query.token || undefined} formClassName={styles.form} />}
    <p><a className="shelf-link" href="/auth/sign-in">Voltar para entrar</a></p>
    {query?.error && <p><a className="shelf-link" href="/auth/reset-password">Solicitar novo link</a></p>}
  </main>;
}
