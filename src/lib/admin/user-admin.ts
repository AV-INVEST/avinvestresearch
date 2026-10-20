'use server';

import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/admin/course-admin';
import { normalizeEmail } from '@/lib/stripe/normalize';

export type AdminUserStatus = 'CLIENTE' | 'OMAGGIO' | 'MAI_ACQUISTATO';

export interface AdminUserRow {
  email: string;
  name: string | null;
  createdAt: string;
  status: AdminUserStatus;
  paid: boolean;
  gift: boolean;
  evidence: string[];
}

export interface AdminUsersResult {
  ok: boolean;
  error?: string;
  users: AdminUserRow[];
}

// Tetto di sicurezza per la lettura in sola lettura della tabella User.
const MAX_USERS = 2000;

function toEmailSet(rows: Array<{ userEmail: string }>): Set<string> {
  const set = new Set<string>();
  for (const row of rows) {
    const email = normalizeEmail(row.userEmail);
    if (email) set.add(email);
  }
  return set;
}

/**
 * Elenco utenti registrati (tabella User) con classificazione cliente in sola lettura.
 * Cliente = acquisto reale (Purchase succeeded/refunded), abbonamento non INCOMPLETE
 * oppure accesso manuale con pagamento verificato (ManualGrant PAID_VERIFIED, es. bonifico).
 * Gli accessi omaggio (COMPLIMENTARY attivi) non sono considerati pagamenti.
 */
export async function listAdminUsers(): Promise<AdminUsersResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error, users: [] };

  try {
    const [users, paidPurchases, subscriptions, paidGrants, gifts] = await Promise.all([
      prisma.user.findMany({
        select: { email: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: MAX_USERS,
      }),
      prisma.purchase.findMany({
        where: { status: { in: ['succeeded', 'refunded'] } },
        select: { userEmail: true },
        distinct: ['userEmail'],
      }),
      prisma.subscription.findMany({
        where: { status: { not: 'INCOMPLETE' } },
        select: { userEmail: true },
        distinct: ['userEmail'],
      }),
      prisma.manualGrant.findMany({
        where: { kind: 'PAID_VERIFIED' },
        select: { userEmail: true },
        distinct: ['userEmail'],
      }),
      prisma.manualGrant.findMany({
        where: { kind: 'COMPLIMENTARY', status: 'ACTIVE' },
        select: { userEmail: true },
        distinct: ['userEmail'],
      }),
    ]);

    const purchaseEmails = toEmailSet(paidPurchases);
    const subscriptionEmails = toEmailSet(subscriptions);
    const paidGrantEmails = toEmailSet(paidGrants);
    const giftEmails = toEmailSet(gifts);

    const rows: AdminUserRow[] = users.map((user) => {
      const email = normalizeEmail(user.email) ?? user.email;
      const hasPaidPurchase = purchaseEmails.has(email);
      const hasSubscription = subscriptionEmails.has(email);
      const hasPaidGrant = paidGrantEmails.has(email);
      const hasGift = giftEmails.has(email);
      const paid = hasPaidPurchase || hasSubscription || hasPaidGrant;

      const evidence: string[] = [];
      if (hasPaidPurchase) evidence.push('Acquisto');
      if (hasSubscription) evidence.push('Abbonamento');
      if (hasPaidGrant) evidence.push('Pagamento verificato');
      if (hasGift) evidence.push('Omaggio');

      return {
        email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        status: paid ? 'CLIENTE' : hasGift ? 'OMAGGIO' : 'MAI_ACQUISTATO',
        paid,
        gift: hasGift,
        evidence,
      };
    });

    return { ok: true, users: rows };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore caricamento utenti.',
      users: [],
    };
  }
}
