export type PasswordCheck = {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
}

export function validatePassword(pw: string): {
  ok: boolean;
  checks: PasswordCheck;
} {
  const checks: PasswordCheck = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };

  const ok = Object.values(checks).every(Boolean);

  return { ok, checks };
}