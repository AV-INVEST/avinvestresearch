import { isStripeConfigured } from '@/lib/stripe/client';

/**
 * Prezzo dedicato ai biglietti degli Eventi Live Premium.
 * Separato dalla allowlist dei prodotti (`pricing.ts`): gli eventi non
 * condividono logica di checkout, abbonamenti o licenze con i prodotti.
 *
 * Il Price ID è letto dalla variabile server `STRIPE_PRICE_AV_LIVE_EVENT`.
 */

const FORBIDDEN = ['replace', 'REPLACE', 'xxx', 'XXX', '---'];

export function getLiveEventPriceId(): string | null {
  const raw = process.env.STRIPE_PRICE_AV_LIVE_EVENT;
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (FORBIDDEN.some((f) => trimmed.includes(f))) return null;
  if (!trimmed.startsWith('price_')) return null;
  return trimmed;
}

/** Checkout biglietti operativo solo con Stripe e il prezzo evento configurati. */
export function isLiveEventCheckoutConfigured(): boolean {
  return isStripeConfigured() && getLiveEventPriceId() !== null;
}
