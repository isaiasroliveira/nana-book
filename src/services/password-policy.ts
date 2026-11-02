export const passwordRequirements = [
  { label: "Pelo menos 12 caracteres", test: (value: string) => Array.from(value).length >= 12 },
  { label: "Uma letra maiúscula", test: (value: string) => /\p{Lu}/u.test(value) },
  { label: "Uma letra minúscula", test: (value: string) => /\p{Ll}/u.test(value) },
  { label: "Um número", test: (value: string) => /[0-9]/.test(value) },
  { label: "Um caractere especial", test: (value: string) => /[\p{P}\p{S}]/u.test(value) },
];

export function validPassword(value: string) {
  return Array.from(value).length <= 128 && passwordRequirements.every(requirement => requirement.test(value));
}
