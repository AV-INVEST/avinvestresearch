const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string | null | undefined): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim();
  if (trimmed.length === 0) return null;
  const normalized = trimmed.toLowerCase();
  if (!EMAIL_RE.test(normalized)) return null;
  return normalized;
}
