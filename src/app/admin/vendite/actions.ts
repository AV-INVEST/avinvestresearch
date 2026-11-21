'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { getSalesState, saveSalesState, isSalesStorageConfigured } from '@/lib/sales/sales-store';
import {
  SALE_PRODUCT_KEYS,
  clampQuantity,
  type SaleProductKey,
  type SalesState,
} from '@/lib/sales/sales-shared';

export interface SalesActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  /** Stato completo aggiornato, da usare per riallineare l'interfaccia admin. */
  state?: SalesState;
}

/**
 * Guard amministratore per il modulo vendite: non richiede il database, perché
 * lo stato commerciale è salvato su Vercel Blob e non su Prisma.
 */
async function requireSalesAdmin(): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await auth().catch(() => null);
    if (!session?.user?.email) return { ok: false, error: 'Autenticazione richiesta.' };
    if (!isAdminSession(session)) return { ok: false, error: 'Accesso non autorizzato.' };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore autorizzazione.',
    };
  }
}

export async function updateSaleProduct(
  key: SaleProductKey,
  patch: { available?: boolean; quantity?: number | null },
): Promise<SalesActionResult> {
  const guard = await requireSalesAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!SALE_PRODUCT_KEYS.includes(key)) {
    return { ok: false, error: 'Prodotto non valido.' };
  }

  if (!isSalesStorageConfigured()) {
    return {
      ok: false,
      error:
        'Storage Vercel Blob non configurato. Imposta BLOB_READ_WRITE_TOKEN per salvare le impostazioni.',
    };
  }

  const current = await getSalesState();
  const prev = current.products[key];
  const next: SalesState = {
    ...current,
    products: {
      ...current.products,
      [key]: {
        available: patch.available === undefined ? prev.available : Boolean(patch.available),
        quantity:
          patch.quantity === undefined ? prev.quantity : clampQuantity(patch.quantity),
      },
    },
  };

  const saved = await saveSalesState(next);
  if (!saved.ok) return { ok: false, error: saved.error };

  revalidatePath('/admin/vendite');
  revalidatePath('/');
  revalidatePath('/area-membri');
  revalidatePath('/area-membri/prodotti');
  revalidatePath('/area-membri/percorsi');

  return { ok: true, message: 'Impostazioni salvate.', state: saved.state };
}
