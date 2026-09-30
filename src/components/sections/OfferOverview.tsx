'use client';

import Link from 'next/link';
import {
  BookOpen,
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
    description: 'Capire i mercati da zero, con basi chiare.',
    price: siteConfig.tradingStarter.price,
    currency: siteConfig.tradingStarter.currency,
    decimals: 2,
    ctaScrollTo: '#trading-starter',
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
  },
  {
    key: 'foundations' as const,
    icon: BookOpen,
    iconColor: 'text-av-green',
    iconBg: 'bg-av-green/10 border-av-green-deep/40',
    category: 'VIDEOCORSO · COMPLETO',
    title: siteConfig.courses.foundations.title,
    description: `Analisi tecnica strutturata, ${siteConfig.courses.foundations.durationLabel}.`,
    price: siteConfig.courses.foundations.price,
    currency: siteConfig.courses.foundations.currency,
    decimals: 0,
    ctaScrollTo: '#percorsi',
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
            <BookOpen className="h-3.5 w-3.5" />
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
            return (
              <GlassCard
                key={it.key}
                hover
                className="relative flex h-full w-full min-w-0 max-w-full flex-col p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span
                    className={`grid h-11 w-11 flex-none place-items-center rounded-xl border ${it.iconBg} ${it.iconColor}`}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <span className="inline-flex items-center rounded-full border border-av-line bg-av-bg-2/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-av-muted">
                    {it.category}
                  </span>
                </div>

                <div className="mt-5 min-w-0">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight text-white break-words">
                    {it.title}
                  </h3>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base min-w-0 max-w-full break-words line-clamp-2">
                  {it.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1.5 min-w-0">
                  <span className="font-display text-2xl sm:text-3xl font-semibold text-white">
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
