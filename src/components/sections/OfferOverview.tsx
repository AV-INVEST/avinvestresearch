'use client';

import Link from 'next/link';
import {
  CirclePlay,
  Eye,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import TradingStarterCheckoutButton from '@/components/sections/TradingStarterCheckoutButton';
import MarketLensCheckoutButton from '@/components/sections/MarketLensCheckoutButton';
import CourseCheckoutButton from '@/components/sections/CourseCheckoutButton';
import type { EntitlementsState } from '@/lib/entitlements';

function formatPrice(value: number, currency: string, decimals = 0) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

const items = [
  {
    key: 'trading-starter' as const,
    icon: FileText,
    iconColor: 'text-av-green',
    iconBg: 'bg-av-green/10 border-av-green-deep/40',
    category: 'GUIDA PDF · ENTRY-LEVEL',
    title: siteConfig.tradingStarter.title,
    description: 'Una guida pratica per capire grafici, trend, livelli e gestione del rischio partendo da zero.',
    price: siteConfig.tradingStarter.price,
    currency: siteConfig.tradingStarter.currency,
    decimals: 2,
    ctaScrollTo: '#trading-starter',
    premium: false,
  },
  {
    key: 'market-lens' as const,
    icon: Eye,
    iconColor: 'text-av-green',
    iconBg: 'bg-av-green/10 border-av-green-deep/40',
    category: 'INDICATORE · ONE-TIME',
    title: siteConfig.marketLens.title,
    description: 'Contesto di mercato in pochi secondi su TradingView.',
    price: siteConfig.marketLens.price,
    currency: siteConfig.marketLens.currency,
    decimals: 2,
    ctaScrollTo: '#market-lens',
    premium: false,
  },
  {
    key: 'foundations' as const,
    icon: CirclePlay,
    iconColor: 'text-[#D4B46A]',
    iconBg: 'border-[#C9A961]/45 bg-[#C9A961]/10',
    category: 'VIDEOCORSO · COMPLETO',
    title: siteConfig.courses.foundations.title,
    description: '~6 ore di videocorso per imparare analisi tecnica, metodo e gestione del rischio.',
    price: siteConfig.courses.foundations.price,
    currency: siteConfig.courses.foundations.currency,
    decimals: 2,
    ctaScrollTo: '#percorsi',
    premium: true,
  },
];

export default function OfferOverview({
  entitlements,
}: {
  entitlements?: EntitlementsState;
}) {
  return (
    <section
      id="offerta"
      className="relative py-14 sm:py-24 scroll-mt-28"
      aria-labelledby="offerta-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_60%)]"
      />
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <CirclePlay className="h-3.5 w-3.5" />
            Offerta formativa
          </span>
          <h2
            id="offerta-heading"
            className="mt-5 heading-lg"
          >
            Scopri l&apos;offerta.{' '}
            <span className="text-av-green">Scegli il tuo punto di partenza.</span>
          </h2>
          <p className="mt-4 sm:mt-5 body-lg max-w-2xl mx-auto">
            Tre prodotti pensati per livelli diversi: dalla guida entry-level al
            videocorso completo, fino all&apos;indicatore operativo. Nessun
            carrello, checkout diretto.
          </p>
        </div>

        <div className="mt-9 sm:mt-12 grid w-full min-w-0 max-w-full gap-5 sm:gap-6 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            const isPremium = it.premium === true;
            return (
              <GlassCard
                key={it.key}
                hover
                className={[
                  'relative flex h-full w-full min-w-0 max-w-full p-0 sm:p-0 [&>*:last-child]:h-full [&>*:last-child]:flex [&>*:last-child]:flex-col [&>*:last-child]:w-full [&>*:last-child]:min-w-0 [&>*:last-child]:p-5 [&>*:last-child]:sm:p-6',
                  isPremium
                    ? 'border-[#C9A961]/40 shadow-[0_0_0_1px_rgba(201,169,97,0.10),0_8px_40px_-12px_rgba(201,169,97,0.28)] hover:border-[#D4B46A]/70 hover:shadow-glow-gold'
                    : '',
                ].filter(Boolean).join(' ')}
                style={
                  isPremium
                    ? {
                        backgroundImage:
                          'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(201,169,97,0.06) 100%)',
                      }
                    : undefined
                }
              >
                {isPremium ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.16),transparent_70%)]"
                  />
                ) : null}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span
                    className={[
                      'grid h-11 w-11 flex-none place-items-center rounded-xl border',
                      it.iconBg,
                      it.iconColor,
                      isPremium ? 'shadow-[0_0_14px_rgba(201,169,97,0.22)]' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <span
                    className={[
                      'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
                      isPremium
                        ? 'border-[#C9A961]/40 bg-[#C9A961]/10 text-[#D4B46A]'
                        : 'border-av-line bg-av-bg-2/70 text-av-muted',
                    ].filter(Boolean).join(' ')}
                  >
                    {it.category}
                  </span>
                </div>

                <div className="mt-5 min-w-0">
                  <h3
                    className={[
                      'font-display text-xl sm:text-2xl font-semibold leading-tight break-words',
                      isPremium ? 'text-white' : 'text-white',
                    ].join(' ')}
                  >
                    {it.title}
                  </h3>
                </div>

                <p className="mt-2 min-h-[3.5rem] lg:min-h-[4.25rem] text-sm leading-relaxed sm:text-base min-w-0 max-w-full break-words text-av-muted">
                  {it.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1.5 min-w-0">
                  <span
                    className={[
                      'font-display text-2xl sm:text-3xl font-semibold',
                      isPremium ? 'text-[#F4E2B0]' : 'text-white',
                    ].filter(Boolean).join(' ')}
                  >
                    {formatPrice(it.price, it.currency, it.decimals)}
                  </span>
                </div>

                <div className="mt-auto pt-5 space-y-2.5 w-full min-w-0 max-w-full">
                  {it.key === 'trading-starter' ? (
                    <TradingStarterCheckoutButton label="buy" className="w-full !justify-center" />
                  ) : it.key === 'market-lens' ? (
                    <MarketLensCheckoutButton label="buy" className="w-full !justify-center" />
                  ) : (
                    <CourseCheckoutButton slug="foundations" />
                  )}
                  <Link
                    href={it.ctaScrollTo}
                    className="btn-ghost w-full items-center justify-center gap-1.5 !py-2.5 text-sm"
                  >
                    Scopri di più
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

