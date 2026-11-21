/**
 * Persistenza dello stato commerciale (ON/OFF + quantità) su Vercel Blob privato.
 * Nessun database, nessuna migrazione: un unico piccolo file JSON.
 *
 * Sola lettura/scrittura: la quantità è decisa dall'amministratore e non viene
 * mai decrementata automaticamente né sincronizzata con Stripe.
 */
import { getStorageStatus } from '@/lib/storage';
import {
  SALES_STORAGE_KEY,
  buildDefaultSalesState,
  normalizeSalesState,
  type SalesState,
} from './sales-shared';

export function isSalesStorageConfigured(): boolean {
  const status = getStorageStatus();
  return status.configured && status.provider === 'VERCEL_BLOB';
}

/**
 * Legge lo stato salvato. Se il file non esiste (primo avvio) o lo storage non
 * è disponibile, restituisce lo stato di default che preserva la disponibilità
 * commerciale attuale (prodotti acquistabili, nessuna quantità mostrata).
 */
export async function getSalesState(): Promise<SalesState> {
  if (!isSalesStorageConfigured()) return buildDefaultSalesState();
  try {
    const { get } = await import('@vercel/blob');
    const res = await get(SALES_STORAGE_KEY, { access: 'private', useCache: false });
    if (!res) return buildDefaultSalesState();
    const text = await new Response(res.stream).text();
    return normalizeSalesState(JSON.parse(text));
  } catch {
    return buildDefaultSalesState();
  }
}

export interface SaveSalesResult {
  ok: boolean;
  error?: string;
  state?: SalesState;
}

/** Sovrascrive il file JSON con lo stato normalizzato e aggiorna `updatedAt`. */
export async function saveSalesState(state: SalesState): Promise<SaveSalesResult> {
  if (!isSalesStorageConfigured()) {
    return {
      ok: false,
      error:
        'Storage Vercel Blob non configurato. Imposta BLOB_READ_WRITE_TOKEN per salvare le impostazioni.',
    };
  }
  const normalized = normalizeSalesState({
    products: state.products,
    callsAvailable: state.callsAvailable,
    updatedAt: new Date().toISOString(),
  });
  try {
    const { put } = await import('@vercel/blob');
    await put(SALES_STORAGE_KEY, JSON.stringify(normalized), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return { ok: true, state: normalized };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Errore salvataggio Vercel Blob: ${msg}` };
  }
}
