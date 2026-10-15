import type { ManualGrantKind } from '@prisma/client';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';

/**
 * Kill-switch degli accessi manuali.
 * Impostazione predefinita: disattivato (false).
 * I grant vengono letti da DB solo quando la variabile vale esattamente "true".
 */
export function isManualGrantsEnabled(): boolean {
  return process.env.MANUAL_GRANTS_ENABLED === 'true';
}

export interface ActiveManualGrant {
  productSlug: string;
  kind: ManualGrantKind;
  grantedAt: Date;
}

/**
 * Grant ATTIVI per l'email indicata.
 * Ritorna un array vuoto se il kill-switch è disattivato o il DB non è configurato.
 */
export async function loadActiveManualGrants(
  email: string | null | undefined,
): Promise<ActiveManualGrant[]> {
  if (!isManualGrantsEnabled()) return [];
  if (!isDatabaseConfigured()) return [];
  const userEmail = normalizeEmail(email);
  if (!userEmail) return [];
  try {
    const rows = await prisma.manualGrant.findMany({
      where: { userEmail, status: 'ACTIVE' },
      select: { productSlug: true, kind: true, grantedAt: true },
      orderBy: { grantedAt: 'desc' },
    });
    return rows;
  } catch {
    return [];
  }
}

/**
 * Accessor condiviso per i gate server-side dei prodotti una tantum.
 * Riconosce sia gli acquisti Stripe riusciti sia i grant manuali attivi.
 * In caso di errore DB degrada a "nessun accesso" (fail-closed).
 */
export async function hasOneTimeProductAccess(
  email: string | null | undefined,
  productSlug: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const userEmail = normalizeEmail(email);
  if (!userEmail) return false;
  try {
    const purchase = await prisma.purchase.findFirst({
      where: { userEmail, productSlug, status: 'succeeded' },
      select: { id: true },
    });
    if (purchase) return true;
  } catch {
    return false;
  }
  const grants = await loadActiveManualGrants(userEmail);
  return grants.some((grant) => grant.productSlug === productSlug);
}
