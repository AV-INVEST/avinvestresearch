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

/** Temi colore prestabiliti del banner promozionale (nessun color picker libero). */
export type PromotionTheme = 'gold' | 'green' | 'anthracite';

/**
 * Campagna promozionale gestibile dall'amministratore. Il codice è puramente
 * comunicativo: non viene applicato automaticamente al checkout Stripe.
 */
export interface PromotionState {
  /** Switch ON/OFF del banner nella Hero. All'avvio è sempre OFF. */
  enabled: boolean;
  /** Etichetta premium (es. BLACK FRIDAY). */
  campaignName: string;
  /** Titolo promozionale. */
  headline: string;
  /** Descrizione breve secondaria. */
  description: string;
  /** Codice sconto mostrato nel banner (comunicativo). */
  code: string;
  /** Tema colore prestabilito. */
  theme: PromotionTheme;
}

export interface SalesState {
  products: Record<SaleProductKey, SaleProductState>;
  /**
   * Prenotazioni delle call orientative: controlla i pulsanti pubblici
   * "PRENOTA UNA CALL". Retrocompatibilità: se assente vale true (aperte).
   */
  callsAvailable: boolean;
  /** Campagna promozionale del banner Hero. Retrocompatibilità: se assente è OFF. */
  promotion: PromotionState;
  /**
   * Video testimonianze nella Hero (sostituisce il grafico "AV MARKET VIEW").
   * Retrocompatibilità: se assente è OFF e viene mostrato il grafico originale.
   */
  heroVideo: HeroVideoState;
  updatedAt: string | null;
}

/**
 * Video YouTube configurabile dall'amministratore per la Hero.
 * Il codice è puramente presentazionale: nessun dato sensibile, nessun autoplay.
 */
export interface HeroVideoState {
  /** Switch ON/OFF. È effettivo solo con un link YouTube valido. */
  enabled: boolean;
  /** URL YouTube inserito dall'amministratore (validato lato server). */
  url: string;
  /** Titolo visibile sopra la copertina. */
  title: string;
}

export const HERO_VIDEO_DEFAULT_TITLE = 'Dicono di me';

/** Limiti di lunghezza validati lato server per i campi del video. */
export const HERO_VIDEO_MAX = {
  url: 300,
  title: 80,
} as const;

export const SALE_PRODUCT_KEYS: readonly SaleProductKey[] = [
  'market-lens',
  'foundations',
  'trading-lab',
  'complete-academy',
] as const;

export const SALES_STORAGE_KEY = 'admin/sales-state.json';

export const MAX_SALE_QUANTITY = 1_000_000;

export const PROMOTION_THEMES: readonly PromotionTheme[] = ['gold', 'green', 'anthracite'] as const;

/** Limiti di lunghezza validati lato server per i testi della campagna. */
export const PROMOTION_MAX = {
  campaignName: 40,
  headline: 120,
  description: 200,
  code: 40,
} as const;

/**
 * Stato di default: preserva la disponibilità commerciale attuale.
 * Le quantità non sono configurate, quindi nessun numero è mostrato
 * finché l'amministratore non le imposta.
 * La campagna promozionale parte sempre OFF, per non modificare la homepage.
 */
export function buildDefaultSalesState(): SalesState {
  return {
    products: {
      'market-lens': { available: true, quantity: null },
      foundations: { available: true, quantity: null },
      'trading-lab': { available: true, quantity: null },
      'complete-academy': { available: true, quantity: null },
    },
    callsAvailable: true,
    promotion: buildDefaultPromotion(),
    heroVideo: buildDefaultHeroVideo(),
    updatedAt: null,
  };
}

export function buildDefaultPromotion(): PromotionState {
  return {
    enabled: false,
    campaignName: '',
    headline: '',
    description: '',
    code: '',
    theme: 'gold',
  };
}

export function buildDefaultHeroVideo(): HeroVideoState {
  return {
    enabled: false,
    url: '',
    title: HERO_VIDEO_DEFAULT_TITLE,
  };
}

function clampText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Normalizza la campagna: valori mancanti o non validi ricadono sui default (OFF). */
export function normalizePromotion(raw: unknown): PromotionState {
  const base = buildDefaultPromotion();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  base.enabled = r.enabled === true;
  base.campaignName = clampText(r.campaignName, PROMOTION_MAX.campaignName);
  base.headline = clampText(r.headline, PROMOTION_MAX.headline);
  base.description = clampText(r.description, PROMOTION_MAX.description);
  base.code = clampText(r.code, PROMOTION_MAX.code);
  base.theme = PROMOTION_THEMES.includes(r.theme as PromotionTheme)
    ? (r.theme as PromotionTheme)
    : 'gold';
  return base;
}

/**
 * Una campagna è attivabile solo con nome, titolo e codice non vuoti:
 * evita banner vuoti o incompleti.
 */
export function isPromotionComplete(promotion: PromotionState): boolean {
  return (
    promotion.campaignName.trim().length > 0 &&
    promotion.headline.trim().length > 0 &&
    promotion.code.trim().length > 0
  );
}

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Estrae l'ID video da un link YouTube valido (watch, youtu.be, shorts, live,
 * embed, youtube-nocookie). Ritorna `null` se il link non è riconosciuto: così
 * non è mai possibile inserire URL arbitrari in un iframe.
 */
export function parseYouTubeId(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
    ? raw
    : `https://${raw.replace(/^\/+/, '')}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, '').toLowerCase();
  const allowedHosts = new Set([
    'youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtube-nocookie.com',
    'youtu.be',
  ]);
  if (!allowedHosts.has(host)) return null;

  let candidate: string | null = null;

  if (host === 'youtu.be') {
    candidate = url.pathname.split('/').filter(Boolean)[0] ?? null;
  } else {
    candidate = url.searchParams.get('v');
    if (!candidate) {
      const segments = url.pathname.split('/').filter(Boolean);
      const prefixes = ['embed', 'shorts', 'live', 'v'];
      if (segments.length >= 2 && prefixes.includes(segments[0])) {
        candidate = segments[1];
      }
    }
  }

  if (!candidate) return null;
  const id = candidate.trim();
  return YOUTUBE_ID_RE.test(id) ? id : null;
}

/**
 * Normalizza il video della Hero: senza un link YouTube valido lo switch è
 * forzato OFF, così la Hero mostra sempre il grafico originale come fallback.
 */
export function normalizeHeroVideo(raw: unknown): HeroVideoState {
  const base = buildDefaultHeroVideo();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const url = typeof r.url === 'string' ? r.url.trim().slice(0, HERO_VIDEO_MAX.url) : '';
  const title = typeof r.title === 'string' ? r.title.trim().slice(0, HERO_VIDEO_MAX.title) : '';
  base.url = url;
  base.title = title || HERO_VIDEO_DEFAULT_TITLE;
  base.enabled = r.enabled === true && parseYouTubeId(url) !== null;
  return base;
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

  // Retrocompatibilità: se il campo non esiste, le call restano aperte (ON).
  const callsAvailable = (raw as { callsAvailable?: unknown }).callsAvailable;
  base.callsAvailable = callsAvailable === undefined ? true : Boolean(callsAvailable);

  // Retrocompatibilità: promozione assente nel JSON esistente = campagna OFF.
  base.promotion = normalizePromotion((raw as { promotion?: unknown }).promotion);

  // Retrocompatibilità: video Hero assente nel JSON esistente = OFF (grafico originale).
  base.heroVideo = normalizeHeroVideo((raw as { heroVideo?: unknown }).heroVideo);

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
