export interface ResolvedProduct {
  slug: 'foundations' | 'trading-lab' | 'research-club' | 'market-lens' | 'trading-starter';
  priceId: string;
  title: string;
  amountInCents: number;
  currency: 'EUR';
  billingMode: 'one_time' | 'subscription';
}

interface AllowlistEntry {
  envKey: string;
  slug: ResolvedProduct['slug'];
  title: string;
  amountInCents: number;
  currency: 'EUR';
  billingMode: 'one_time' | 'subscription';
}

const PRODUCT_ALLOWLIST: Record<string, AllowlistEntry> = {
  foundations: {
    envKey: 'STRIPE_PRICE_AV_FOUNDATIONS',
    slug: 'foundations',
    title: 'AV Foundations',
    amountInCents: 29700,
    currency: 'EUR',
    billingMode: 'one_time',
  },
  'trading-lab': {
    envKey: 'STRIPE_PRICE_AV_TRADING_LAB',
    slug: 'trading-lab',
    title: 'AV Trading Lab',
    amountInCents: 49700,
    currency: 'EUR',
    billingMode: 'one_time',
  },
  'research-club': {
    envKey: 'STRIPE_PRICE_AV_RESEARCH_CLUB',
    slug: 'research-club',
    title: 'AV Research Club',
    amountInCents: 1990,
    currency: 'EUR',
    billingMode: 'subscription',
  },
  'market-lens': {
    envKey: 'STRIPE_PRICE_AV_MARKET_LENS',
    slug: 'market-lens',
    title: 'AV Market Lens',
    amountInCents: 3990,
    currency: 'EUR',
    billingMode: 'one_time',
  },
  'trading-starter': {
    envKey: 'STRIPE_PRICE_AV_TRADING_STARTER',
    slug: 'trading-starter',
    title: 'AV Trading Starter',
    amountInCents: 990,
    currency: 'EUR',
    billingMode: 'one_time',
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
    billingMode: entry.billingMode,
  };
}

export function isKnownProductSlug(slug: unknown): slug is ResolvedProduct['slug'] {
  return typeof slug === 'string' && Object.prototype.hasOwnProperty.call(PRODUCT_ALLOWLIST, slug);
}

export function productTitleBySlug(slug: string): string {
  const entry = PRODUCT_ALLOWLIST[slug];
  return entry ? entry.title : 'Percorso formativo';
}
