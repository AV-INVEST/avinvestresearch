import { normalizeEmail } from '@/lib/stripe/normalize';
import type { Session } from 'next-auth';

export function getAdminEmailsFromEnv(): string[] {
  const raw = process.env.ADMIN_GOOGLE_EMAILS;
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return [];
  }
  const parts = raw.split(',');
  const out: string[] = [];
  for (const p of parts) {
    const n = normalizeEmail(p);
    if (n && !out.includes(n)) {
      out.push(n);
    }
  }
  return out;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  const list = getAdminEmailsFromEnv();
  return list.includes(normalized);
}

export function isAdminSession(session: Session | null | undefined): boolean {
  if (!session?.user?.email) return false;
  return isAdminEmail(session.user.email);
}
