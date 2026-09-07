import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { getStripeClient } from '@/lib/stripe/client';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { siteConfig } from '@/config/siteConfig';

export const dynamic = 'force-dynamic';

function buildReturnUrl(base: string): string {
  const cleanBase = base.replace(/\/+$/, '');
  const returnUrl = new URL('/area-membri/profilo', cleanBase);
  returnUrl.searchParams.set('portal', 'returned');
  return returnUrl.toString();
}

function resolveBaseUrl(req: Request): string {
  const PRODUCTION_URL = siteConfig.url.replace(/\/+$/, '');
  const isProduction = process.env.NODE_ENV === 'production';

  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromPublic && typeof fromPublic === 'string' && fromPublic.length > 0) {
    const cleaned = fromPublic.replace(/\/+$/, '');
    if (isProduction) {
      if (cleaned.startsWith('https://avinvestresearch.com')) return cleaned;
      return PRODUCTION_URL;
    }
    return cleaned;
  }
  if (isProduction) return PRODUCTION_URL;
  const origin = req.headers.get('origin');
  if (origin && typeof origin === 'string' && origin.length > 0 && origin.startsWith('http')) {
    return origin.replace(/\/+$/, '');
  }
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = req.headers.get('host');
  const proto = forwardedProto || (host && host.includes('localhost') ? 'http' : 'https');
  const finalHost = forwardedHost || host;
  if (finalHost) {
    return `${proto}://${finalHost}`.replace(/\/+$/, '');
  }
  return PRODUCTION_URL;
}

export async function POST(req: Request): Promise<Response> {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Servizio non disponibile (database non configurato).' },
      { status: 503 },
    );
  }

  const session = await auth().catch(() => null);
  const userEmail = normalizeEmail(session?.user?.email);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Autenticazione richiesta.', loginUrl: '/login?callbackUrl=' + encodeURIComponent('/area-membri/profilo') },
      { status: 401 },
    );
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe non configurato';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const subscriptionRow = await prisma.subscription.findFirst({
    where: { userEmail, product: 'AV_RESEARCH_CLUB' },
    select: { stripeCustomerId: true },
    orderBy: { updatedAt: 'desc' },
  });

  const purchaseRow = !subscriptionRow?.stripeCustomerId
    ? await prisma.purchase.findFirst({
        where: { userEmail, status: 'succeeded', customerId: { not: null } },
        select: { customerId: true },
        orderBy: { purchasedAt: 'desc' },
      })
    : null;

  const stripeCustomerId = subscriptionRow?.stripeCustomerId ?? purchaseRow?.customerId ?? null;

  if (!stripeCustomerId || typeof stripeCustomerId !== 'string' || stripeCustomerId.length === 0) {
    return NextResponse.json(
      { error: 'Nessun profilo di fatturazione collegato al tuo account. Contatta il supporto se ritieni ci sia un errore.' },
      { status: 404 },
    );
  }

  const baseUrl = resolveBaseUrl(req);
  const returnUrl = buildReturnUrl(baseUrl);

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
    if (!portalSession.url) {
      return NextResponse.json(
        { error: 'Impossibile creare la sessione di gestione abbonamento.' },
        { status: 502 },
      );
    }
    return NextResponse.redirect(portalSession.url, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore durante la creazione della sessione Customer Portal.';
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
