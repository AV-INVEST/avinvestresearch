/**
 * Stato commerciale dei prodotti gestiti manualmente dall'amministratore.
 * Modulo puro (nessuna dipendenza server) così da poter essere importato
 * anche dai componenti client senza trascinare codice server nello bundle.
 *
 * La quantità è decisa esclusivamente dall'amministratore: non viene mai
 * decrementata automaticamente e non è sincronizzata con Stripe.
 */

export type SaleProductKey =
  | 'market-lens'
  | 'foundations'
  | 'trading-lab'
  | 'complete-academy';

export interface SaleProductState {
  /** Switch Disponibile / Non disponibile. */
  available: boolean;
  /**
   * Numero di accessi impostato manualmente dall'amministratore.
   * null = non configurato: il sito mostra il pulsante senza alcun numero.
   */
  quantity: number | null;
}

export interface SalesState {
  products: Record<SaleProductKey, SaleProductState>;
  updatedAt: string | null;
}

export const SALE_PRODUCT_KEYS: readonly SaleProductKey[] = [
  'market-lens',
  'foundations',
  'trading-lab',
  'complete-academy',
] as const;

export const SALES_STORAGE_KEY = 'admin/sales-state.json';

export const MAX_SALE_QUANTITY = 1_000_000;

/**
 * Stato di default: preserva la disponibilità commerciale attuale.
 * Le quantità non sono configurate, quindi nessun numero è mostrato
 * finché l'amministratore non le imposta.
 */
export function buildDefaultSalesState(): SalesState {
  return {
    products: {
      'market-lens': { available: true, quantity: null },
      foundations: { available: true, quantity: null },
      'trading-lab': { available: true, quantity: null },
      'complete-academy': { available: true, quantity: null },
    },
    updatedAt: null,
  };
}

export function clampQuantity(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const int = Math.trunc(n);
  if (int <= 0) return int < 0 ? 0 : int;
  if (int > MAX_SALE_QUANTITY) return MAX_SALE_QUANTITY;
  return int;
}

export function normalizeSalesState(raw: unknown): SalesState {
  const base = buildDefaultSalesState();
  if (!raw || typeof raw !== 'object') return base;

  const products = (raw as { products?: unknown }).products;
  if (products && typeof products === 'object') {
    for (const key of SALE_PRODUCT_KEYS) {
      const entry = (products as Record<string, unknown>)[key];
      if (entry && typeof entry === 'object') {
        const e = entry as { available?: unknown; quantity?: unknown };
        base.products[key] = {
          available: e.available === undefined ? true : Boolean(e.available),
          quantity: clampQuantity(e.quantity),
        };
      }
    }
  }

  const updatedAt = (raw as { updatedAt?: unknown }).updatedAt;
  base.updatedAt = typeof updatedAt === 'string' ? updatedAt : null;
  return base;
}

/**
 * Un prodotto è acquistabile quando lo switch è ON e la quantità
 * non è zero. Con quantità non configurata (null) resta acquistabile
 * e il numero non viene mostrato.
 */
export function isSalePurchasable(product: SaleProductState): boolean {
  return product.available && (product.quantity === null || product.quantity > 0);
}

/**
 * Tipo di accesso commerciale mostrato nel badge:
 * - "download": AV Market Lens (file scaricabili).
 * - "seat": AV Foundations, AV Trading Lab, AV Complete Academy (posti).
 */
export type SaleAvailabilityKind = 'download' | 'seat';

/**
 * Etichetta del badge per una quantità positiva decisa dall'amministratore.
 * Singolare e plurale gestiti per tipo di accesso.
 */
export function saleAvailabilityLabel(
  kind: SaleAvailabilityKind,
  quantity: number,
): string {
  if (kind === 'download') {
    return quantity === 1
      ? 'ULTIMO DOWNLOAD DISPONIBILE'
      : `ULTIMI ${quantity} DOWNLOAD DISPONIBILI`;
  }
  return quantity === 1
    ? 'ULTIMO POSTO DISPONIBILE'
    : `ULTIMI ${quantity} POSTI DISPONIBILI`;
}
