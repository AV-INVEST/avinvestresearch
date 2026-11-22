'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { getSalesState, saveSalesState, isSalesStorageConfigured } from '@/lib/sales/sales-store';
import {
  PROMOTION_THEMES,
  SALE_PRODUCT_KEYS,
  clampQuantity,
  isPromotionComplete,
  normalizePromotion,
  type PromotionTheme,
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

/**
 * Attiva/disattiva le prenotazioni delle call orientative. Riusa lo stesso
 * file JSON su Vercel Blob e non tocca i quattro prodotti.
 */
export async function updateCallsAvailability(available: boolean): Promise<SalesActionResult> {
  const guard = await requireSalesAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!isSalesStorageConfigured()) {
    return {
      ok: false,
      error:
        'Storage Vercel Blob non configurato. Imposta BLOB_READ_WRITE_TOKEN per salvare le impostazioni.',
    };
  }

  const current = await getSalesState();
  const next: SalesState = { ...current, callsAvailable: Boolean(available) };

  const saved = await saveSalesState(next);
  if (!saved.ok) return { ok: false, error: saved.error };

  revalidatePath('/admin/vendite');
  revalidatePath('/');

  return { ok: true, message: 'Impostazioni salvate.', state: saved.state };
}

/** Campi modificabili della campagna promozionale. */
export interface PromotionInput {
  enabled?: boolean;
  campaignName?: string;
  headline?: string;
  description?: string;
  code?: string;
  theme?: PromotionTheme;
}

/**
 * Salva la campagna promozionale (testi, tema, ON/OFF) preservando integralmente
 * prodotti, quantità e switch delle call. I testi sono validati e normalizzati
 * lato server: mai interpretati come HTML, solo testo con limiti di lunghezza.
 * L'attivazione è consentita solo con nome, titolo e codice validi.
 */
export async function updatePromotion(input: PromotionInput): Promise<SalesActionResult> {
  const guard = await requireSalesAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!isSalesStorageConfigured()) {
    return {
      ok: false,
      error:
        'Storage Vercel Blob non configurato. Imposta BLOB_READ_WRITE_TOKEN per salvare le impostazioni.',
    };
  }

  const current = await getSalesState();
  const patch: Record<string, unknown> = { ...current.promotion };
  if (input.enabled !== undefined) patch.enabled = Boolean(input.enabled);
  if (typeof input.campaignName === 'string') patch.campaignName = input.campaignName;
  if (typeof input.headline === 'string') patch.headline = input.headline;
  if (typeof input.description === 'string') patch.description = input.description;
  if (typeof input.code === 'string') patch.code = input.code;
  if (input.theme !== undefined && PROMOTION_THEMES.includes(input.theme)) {
    patch.theme = input.theme;
  }

  const promotion = normalizePromotion(patch);
  if (promotion.enabled && !isPromotionComplete(promotion)) {
    return {
      ok: false,
      error:
        'Per attivare la campagna inserisci almeno nome campagna, titolo promozionale e codice sconto.',
    };
  }

  const next: SalesState = { ...current, promotion };
  const saved = await saveSalesState(next);
  if (!saved.ok) return { ok: false, error: saved.error };

  revalidatePath('/admin/vendite');
  revalidatePath('/');

  return { ok: true, message: 'Campagna promozionale salvata.', state: saved.state };
}
