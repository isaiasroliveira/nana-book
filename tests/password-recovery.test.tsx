import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PasswordRecovery } from "../src/components/password-recovery";

test("readers can request a password reset without entering their password", () => {
  const html = renderToStaticMarkup(<PasswordRecovery />);
  assert.match(html, /type="email"/);
  assert.match(html, /Enviar link/);
  assert.doesNotMatch(html, /type="password"/);
});

test("a reset link presents a new password field", () => {
  const html = renderToStaticMarkup(<PasswordRecovery token="test-token" />);
  assert.match(html, /type="password"/);
  assert.match(html, /Alterar senha/);
  assert.match(html, /Pelo menos 12 caracteres/);
  assert.match(html, /Uma letra maiúscula/);
  assert.match(html, /Um caractere especial/);
  assert.doesNotMatch(html, /type="email"/);
});
