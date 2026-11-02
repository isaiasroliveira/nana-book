"use client";

import { useRef, useState, type FormEvent } from "react";
import { authClient } from "@/services/auth-client";
import styles from "./auth.module.css";
import { PasswordRequirements } from "@/components/password-requirements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validPassword } from "@/services/password-policy";

export default function SignInPage() {
  const { data: session, isPending, error: sessionError, refetch } = authClient.useSession();
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const verifying = verificationEmail !== null;
  const verificationEmailInput = useRef<HTMLInputElement>(null);

  function startVerification(email: string) {
    setVerificationEmail(email);
    setPassword("");
  }

  async function sendCode(email: string) {
    const result = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
    if (result.error) throw result.error;
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const otp = String(form.get("code") ?? "").trim();
    setBusy(true);
    setMessage("");
    try {
      const result = await authClient.emailOtp.verifyEmail({ email, otp });
      if (result.error) throw result.error;
      setVerificationEmail(null);
      setRegistering(false);
      setPassword("");
      setMessage("E-mail confirmado.");
    } catch { setMessage("Código inválido ou expirado. Confira o código ou solicite outro."); }
    finally { setBusy(false); }
  }

  async function resendCode() {
    const input = verificationEmailInput.current;
    if (!input?.reportValidity()) return;
    setBusy(true);
    setMessage("");
    try { await sendCode(input.value.trim()); setMessage("Se a conta precisar de confirmação, enviaremos um código."); }
    catch { setMessage("Não foi possível enviar o código. Tente novamente."); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (registering && !validPassword(password)) { setMessage("Atenda aos requisitos da senha."); return; }
    setBusy(true);
    setMessage("");
    try {
      const result = registering
        ? await authClient.signUp.email({ email, password, name: String(form.get("name") ?? "").trim() })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        if (result.error.code === "EMAIL_NOT_VERIFIED") startVerification(email);
        setMessage(result.error.code === "EMAIL_NOT_VERIFIED"
          ? "Confirme seu e-mail antes de entrar."
          : registering ? "Não foi possível criar sua conta. Confira os dados e tente novamente." : "Não foi possível entrar. Confira seu e-mail e sua senha.");
        return;
      }
      if (registering && !result.data?.user?.emailVerified) {
        startVerification(email);
        setMessage("Informe o código de confirmação recebido por e-mail.");
        return;
      }
      const current = await authClient.getSession();
      if (current.data?.user) window.location.assign("/");
      else if (registering) {
        startVerification(email);
        setMessage("Informe o código de confirmação recebido por e-mail.");
      } else setMessage("Não foi possível confirmar sua sessão. Tente entrar novamente.");
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
    <h1>{verifying ? "Confirme seu e-mail" : session?.user ? "Sua conta" : registering ? "Crie sua conta" : "Entre no seu diário"}</h1>
    {isPending ? <p role="status">Verificando sua sessão…</p> : sessionError ? <>
      <p role="alert" className={styles.message}>Não foi possível verificar sua sessão.</p>
      <Button type="button" className="diary-action" onClick={() => refetch()}>Tentar novamente</Button>
    </> : verifying ? <>
      <p className={styles.message}>Informe seu e-mail e o código recebido para confirmar a conta.</p>
      <form onSubmit={verifyEmail} className={styles.form} aria-busy={busy}>
        <label>E-mail<Input ref={verificationEmailInput} name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} value={verificationEmail ?? ""} onChange={event => setVerificationEmail(event.target.value)} /></label>
        <label>Código de confirmação<Input name="code" inputMode="numeric" autoComplete="one-time-code" required disabled={busy} /></label>
        <Button type="submit" className="diary-action" loading={busy}>Confirmar e-mail</Button>
      </form>
      <button type="button" className={styles.switch} disabled={busy} onClick={resendCode}>Enviar outro código</button>
      <p><button type="button" className={styles.switch} disabled={busy} onClick={() => { setVerificationEmail(null); setRegistering(false); setMessage(""); }}>Voltar para entrar</button></p>
    </> : session?.user ? <>
      <p className={styles.message}>{session.user.name} · {session.user.email}</p>
      <p><a className="shelf-link" href="/">Abrir meu diário</a></p>
      <Button type="button" className="diary-action" onClick={signOut} loading={busy}>Sair da conta</Button>
    </> : <>
      <p className={styles.message}>Suas avaliações ficam no seu diário privado.</p>
      <form onSubmit={submit} className={styles.form} aria-busy={busy}>
        {registering && <label>Nome<Input name="name" autoComplete="name" required maxLength={200} disabled={busy} /></label>}
        <label>E-mail<Input name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} /></label>
        <label>Senha<Input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} required maxLength={128} disabled={busy} value={password} onChange={event => setPassword(event.target.value)} aria-describedby={registering ? "password-requirements" : undefined} /></label>
        {registering && <PasswordRequirements password={password} />}
        <Button type="submit" className="diary-action" loading={busy}>{registering ? "Criar conta" : "Entrar"}</Button>
      </form>
      <button className={styles.switch} disabled={busy} onClick={() => { setRegistering(!registering); setMessage(""); }}>
        {registering ? "Já tenho uma conta" : "Criar uma conta"}
      </button>
      {!registering && <p><a className="shelf-link" href="/auth/reset-password">Esqueci minha senha</a></p>}
      {!registering && <p><button type="button" className={styles.switch} disabled={busy} onClick={() => { startVerification(""); setMessage(""); }}>Já tenho um código de confirmação</button></p>}
    </>}
    <p role="status" aria-live="polite" className={styles.message}>{message}</p>
  </main>;
}
