"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/services/auth-client";
import styles from "./auth.module.css";

export default function SignInPage() {
  const { data: session, isPending, error: sessionError, refetch } = authClient.useSession();
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true);
    setMessage("");
    try {
      const result = registering
        ? await authClient.signUp.email({ email, password, name: String(form.get("name") ?? "").trim() })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setMessage(result.error.code === "EMAIL_NOT_VERIFIED"
          ? "Confirme seu e-mail antes de entrar."
          : registering ? "Não foi possível criar sua conta. Confira os dados e tente novamente." : "Não foi possível entrar. Confira seu e-mail e sua senha.");
        return;
      }
      const current = await authClient.getSession();
      if (current.data?.user) window.location.assign("/");
      else setMessage("Conta criada. Confira seu e-mail para verificar a conta e depois entre.");
    } catch {
      setMessage("Não foi possível acessar sua conta. Tente novamente.");
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    setMessage("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw result.error;
      window.location.assign("/");
    } catch { setMessage("Não foi possível sair da conta. Tente novamente."); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <a href="/" className="brand">nana book</a>
    <h1>{session?.user ? "Sua conta" : registering ? "Crie sua conta" : "Entre no seu diário"}</h1>
    {isPending ? <p role="status">Verificando sua sessão…</p> : sessionError ? <>
      <p role="alert" className={styles.message}>Não foi possível verificar sua sessão.</p>
      <button className="button" onClick={() => refetch()}>Tentar novamente</button>
    </> : session?.user ? <>
      <p className={styles.message}>{session.user.name} · {session.user.email}</p>
      <p><a className="shelf-link" href="/">Abrir meu diário</a></p>
      <button className="button" onClick={signOut} disabled={busy}>{busy ? "Saindo…" : "Sair da conta"}</button>
    </> : <>
      <p className={styles.message}>Suas avaliações ficam no seu diário privado.</p>
      <form onSubmit={submit} className={styles.form} aria-busy={busy}>
        {registering && <label>Nome<input name="name" autoComplete="name" required maxLength={200} disabled={busy} /></label>}
        <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} /></label>
        <label>Senha<input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={8} maxLength={128} disabled={busy} /></label>
        <button className="button" disabled={busy}>{busy ? "Aguarde…" : registering ? "Criar conta" : "Entrar"}</button>
      </form>
      <button className={styles.switch} disabled={busy} onClick={() => { setRegistering(!registering); setMessage(""); }}>
        {registering ? "Já tenho uma conta" : "Criar uma conta"}
      </button>
    </>}
    <p role="status" aria-live="polite" className={styles.message}>{message}</p>
  </main>;
}
