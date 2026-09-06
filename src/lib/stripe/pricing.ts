export interface ResolvedProduct {
  slug: 'foundations' | 'trading-lab';
  priceId: string;
  title: string;
  amountInCents: number;
  currency: 'EUR';
}

interface AllowlistEntry {
  envKey: string;
  slug: ResolvedProduct['slug'];
  title: string;
  amountInCents: number;
  currency: 'EUR';
}

const PRODUCT_ALLOWLIST: Record<string, AllowlistEntry> = {
  foundations: {
    envKey: 'STRIPE_PRICE_AV_FOUNDATIONS',
    slug: 'foundations',
    title: 'AV Foundations',
    amountInCents: 29700,
    currency: 'EUR',
  },
  'trading-lab': {
    envKey: 'STRIPE_PRICE_AV_TRADING_LAB',
    slug: 'trading-lab',
    title: 'AV Trading Lab',
    amountInCents: 49700,
    currency: 'EUR',
  },
};

export const KNOWN_PRODUCT_SLUGS = Object.freeze(
  Object.keys(PRODUCT_ALLOWLIST) as ResolvedProduct['slug'][],
);

export function resolveProduct(inputSlug: unknown): ResolvedProduct | null {
  if (typeof inputSlug !== 'string') return null;
  const slug = inputSlug.trim();
  const entry = PRODUCT_ALLOWLIST[slug];
  if (!entry) return null;
  const priceId = process.env[entry.envKey];
  if (!priceId || typeof priceId !== 'string' || priceId.length === 0) return null;
  return {
    slug: entry.slug,
    priceId,
    title: entry.title,
    amountInCents: entry.amountInCents,
    currency: entry.currency,
  };
}

export function isKnownProductSlug(slug: unknown): slug is ResolvedProduct['slug'] {
  return typeof slug === 'string' && Object.prototype.hasOwnProperty.call(PRODUCT_ALLOWLIST, slug);
}

export function productTitleBySlug(slug: string): string {
  const entry = PRODUCT_ALLOWLIST[slug];
  return entry ? entry.title : 'Percorso formativo';
}
