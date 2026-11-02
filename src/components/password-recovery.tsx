"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/services/auth-client";
import { PasswordRequirements } from "@/components/password-requirements";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { validPassword } from "@/services/password-policy";

export function PasswordRecovery({ token, formClassName }: { token?: string; formClassName?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (token && !validPassword(password)) { setMessage("Atenda aos requisitos da senha."); return; }
    setBusy(true);
    setMessage("");
    try {
      const result = token
        ? await authClient.resetPassword({ newPassword: String(data.get("password")), token })
        : await authClient.requestPasswordReset({ email: String(data.get("email")).trim(), redirectTo: `${window.location.origin}/auth/reset-password` });
      if (result.error) throw result.error;
      setMessage(token ? "Senha alterada. Entre com sua nova senha." : "Se existir uma conta com este e-mail, você receberá instruções para redefinir a senha.");
    } catch {
      setMessage(token ? "Não foi possível alterar a senha. O link pode ser inválido ou ter expirado." : "Não foi possível solicitar a recuperação. Tente novamente.");
    } finally { setBusy(false); }
  }
  return <>
    <form onSubmit={submit} className={formClassName} aria-busy={busy}>
      {token ? <><label>Nova senha<Input name="password" type="password" autoComplete="new-password" required maxLength={128} disabled={busy} value={password} onChange={event => setPassword(event.target.value)} aria-describedby="password-requirements" /></label><PasswordRequirements password={password} /></>
        : <label>E-mail<Input name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} /></label>}
      <Button type="submit" className="diary-action" loading={busy}>{token ? "Alterar senha" : "Enviar link"}</Button>
    </form>
    <p role="status" aria-live="polite">{message}</p>
  </>;
}
