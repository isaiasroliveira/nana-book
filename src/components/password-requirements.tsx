import { passwordRequirements } from "@/services/password-policy";

export function PasswordRequirements({ password }: { password: string }) {
  return <ul id="password-requirements" className="password-requirements" aria-label="Requisitos da senha">
    {passwordRequirements.map(requirement => {
      const met = requirement.test(password);
      return <li key={requirement.label} data-met={met}><span aria-hidden="true" className="requirement-mark">{met ? "✓" : "○"}</span><span>{requirement.label}<span className="requirement-status">{met ? ", atendido" : ", não atendido"}</span></span></li>;
    })}
  </ul>;
}
