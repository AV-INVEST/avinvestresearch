'use client';

import Link from 'next/link';
import {
  CirclePlay,
  Eye,
  FileText,
  ArrowRight,
  CheckCircle2,
  Package,
  GraduationCap,
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import TradingStarterCheckoutButton from '@/components/sections/TradingStarterCheckoutButton';
import MarketLensCheckoutButton from '@/components/sections/MarketLensCheckoutButton';
import type { CourseStatus, EntitlementsState } from '@/lib/entitlements';

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
    ownedHref: '/area-membri/prodotti#trading-starter',
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
    ownedHref: '/area-membri/prodotti',
  },
];

const FOUNDATIONS_SLUG = siteConfig.courses.foundations.slug;
const TRADING_LAB_SLUG = siteConfig.courses.tradingLab.slug;

const OWNED_COURSE_STATUSES: CourseStatus[] = [
  'owned_not_started',
  'owned_in_progress',
  'owned_completed',
];

function isProductOwned(
  key: (typeof items)[number]['key'],
  entitlements: EntitlementsState | undefined,
): boolean {
  if (!entitlements) return false;
  if (key === 'trading-starter') return entitlements.tradingStarter.status === 'owned';
  return entitlements.marketLens.status === 'owned';
}

function isCourseOwned(status: CourseStatus): boolean {
  return OWNED_COURSE_STATUSES.includes(status);
}

type AcademyKind = 'guest' | 'none' | 'one' | 'both' | 'unknown';

interface AcademyState {
  kind: AcademyKind;
  foundations: CourseStatus;
  tradingLab: CourseStatus;
  ownedCount: number;
}

function resolveAcademy(
  entitlements: EntitlementsState | undefined,
  isAuthenticated: boolean,
): AcademyState {
  if (!isAuthenticated) {
    return { kind: 'guest', foundations: 'locked', tradingLab: 'locked', ownedCount: 0 };
  }
  // Diritti non verificabili: stato neutrale, senza presumere alcun acquisto.
  if (!entitlements) {
    return { kind: 'unknown', foundations: 'locked', tradingLab: 'locked', ownedCount: 0 };
  }
  const foundations = entitlements.courses[FOUNDATIONS_SLUG]?.status ?? 'locked';
  const tradingLab = entitlements.courses[TRADING_LAB_SLUG]?.status ?? 'locked';
  const ownedCount = (isCourseOwned(foundations) ? 1 : 0) + (isCourseOwned(tradingLab) ? 1 : 0);
  const kind: AcademyKind = ownedCount === 2 ? 'both' : ownedCount === 1 ? 'one' : 'none';
  return { kind, foundations, tradingLab, ownedCount };
}

function CourseRow({
  title,
  level,
  status,
  neutral,
}: {
  title: string;
  level: string;
  status: CourseStatus;
  neutral: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-[#C9A961]/20 bg-black/20 px-2.5 py-2 min-w-0">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-white leading-tight break-words">{title}</p>
        <p className="text-[10px] uppercase tracking-wider text-av-muted">{level}</p>
      </div>
      {!neutral && isCourseOwned(status) ? (
        <span className="inline-flex flex-none items-center gap-1 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-av-green">
          <CheckCircle2 className="h-3 w-3" />
          Posseduto
        </span>
      ) : !neutral && status === 'payment_pending' ? (
        <span className="inline-flex flex-none items-center gap-1 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
          In corso
        </span>
      ) : !neutral ? (
        <span className="inline-flex flex-none items-center rounded-full border border-av-line bg-av-bg-2/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-av-muted">
          Disponibile
        </span>
      ) : null}
    </div>
  );
}

export default function OfferOverview({
  entitlements,
  isAuthenticated = false,
}: {
  entitlements?: EntitlementsState;
  isAuthenticated?: boolean;
}) {
  const academy = resolveAcademy(entitlements, isAuthenticated);
  const neutral = academy.kind === 'unknown';
  const tradingLabOwned = isCourseOwned(academy.tradingLab);

  const academyBadge =
    academy.kind === 'both'
      ? '2 di 2 acquistati'
      : academy.kind === 'one'
        ? '1 di 2 acquistati'
        : null;

  const academyCta: { label: string; href: string; member: boolean } =
    academy.kind === 'both' || neutral
      ? { label: 'Accedi ai miei videocorsi', href: '/area-membri/percorsi', member: true }
      : academy.kind === 'one'
        ? {
            label: tradingLabOwned ? 'Scopri Foundations' : 'Scopri Trading Lab',
            href: '/#percorsi',
            member: false,
          }
        : { label: 'Esplora i videocorsi', href: '/#percorsi', member: false };

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
            Strumenti e formazione
          </span>
          <h2
            id="offerta-heading"
            className="mt-5 heading-lg"
          >
            Scegli da dove iniziare.{' '}
            <span className="text-av-green">Strumenti adatti al tuo livello.</span>
          </h2>
          <p className="mt-4 sm:mt-5 body-lg max-w-2xl mx-auto">
            Tre punti di partenza: la guida entry-level, l&apos;indicatore operativo
            e AV Academy, il percorso formativo con AV Foundations e AV Trading
            Lab. Nessun carrello, checkout diretto.
          </p>
        </div>

        <div className="mt-9 sm:mt-12 grid w-full min-w-0 max-w-full gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            const owned = isProductOwned(it.key, entitlements);
            return (
              <GlassCard
                key={it.key}
                hover
                className="relative flex h-full w-full min-w-0 max-w-full p-0 sm:p-0 [&>*:last-child]:h-full [&>*:last-child]:flex [&>*:last-child]:flex-col [&>*:last-child]:w-full [&>*:last-child]:min-w-0 [&>*:last-child]:p-5 [&>*:last-child]:sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span
                    className={[
                      'grid h-11 w-11 flex-none place-items-center rounded-xl border',
                      it.iconBg,
                      it.iconColor,
                    ].join(' ')}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <span className="inline-flex items-center rounded-full border border-av-line bg-av-bg-2/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-av-muted">
                    {it.category}
                  </span>
                </div>

                <div className="mt-5 min-w-0">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight break-words text-white">
                    {it.title}
                  </h3>
                </div>

                <p className="mt-2 min-h-[3.5rem] lg:min-h-[4.25rem] text-sm leading-relaxed sm:text-base min-w-0 max-w-full break-words text-av-muted">
                  {it.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1.5 min-w-0">
                  {owned ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-av-green">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Già in tuo possesso
                    </span>
                  ) : (
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-white">
                      {formatPrice(it.price, it.currency, it.decimals)}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-5 space-y-2.5 w-full min-w-0 max-w-full">
                  {owned ? (
                    <Link
                      href={it.ownedHref}
                      prefetch={false}
                      className="btn-primary w-full items-center justify-center gap-2 shadow-glow-green-sm"
                    >
                      <Package className="h-4 w-4" />
                      Vai al prodotto
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : it.key === 'trading-starter' ? (
                    <TradingStarterCheckoutButton label="buy" className="w-full !justify-center" />
                  ) : (
                    <MarketLensCheckoutButton label="buy" className="w-full !justify-center" />
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

          <GlassCard
            hover
            className="relative flex h-full w-full min-w-0 max-w-full p-0 sm:p-0 [&>*:last-child]:h-full [&>*:last-child]:flex [&>*:last-child]:flex-col [&>*:last-child]:w-full [&>*:last-child]:min-w-0 [&>*:last-child]:p-5 [&>*:last-child]:sm:p-6 border-[#C9A961]/40 shadow-[0_0_0_1px_rgba(201,169,97,0.10),0_8px_40px_-12px_rgba(201,169,97,0.28)] hover:border-[#D4B46A]/70 hover:shadow-glow-gold"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(201,169,97,0.06) 100%)',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.16),transparent_70%)]"
            />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-[#C9A961]/45 bg-[#C9A961]/10 text-[#D4B46A] shadow-[0_0_14px_rgba(201,169,97,0.22)]">
                <GraduationCap className="h-5.5 w-5.5" />
              </span>
              <span className="inline-flex items-center rounded-full border border-[#C9A961]/40 bg-[#C9A961]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4B46A]">
                VIDEOCORSI · 2 PERCORSI
              </span>
            </div>

            <div className="mt-5 min-w-0">
              <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight break-words text-white">
                AV Academy
              </h3>
            </div>

            <p className="mt-2 min-h-[3.5rem] lg:min-h-[4.25rem] text-sm leading-relaxed sm:text-base min-w-0 max-w-full break-words text-av-muted">
              Il percorso formativo completo: dalle basi di analisi tecnica al
              metodo operativo avanzato.
            </p>

            <div className="mt-2 space-y-2 min-w-0">
              <CourseRow
                title={siteConfig.courses.foundations.title}
                level={siteConfig.courses.foundations.level ?? 'BASE / INTERMEDIO'}
                status={academy.foundations}
                neutral={neutral}
              />
              <CourseRow
                title={siteConfig.courses.tradingLab.title}
                level={siteConfig.courses.tradingLab.level ?? 'AVANZATO'}
                status={academy.tradingLab}
                neutral={neutral}
              />
            </div>

            <div className="mt-4 flex items-center min-h-[2rem]">
              {academyBadge ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A961]/40 bg-[#C9A961]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#EBD9A8]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {academyBadge}
                </span>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
                  Due percorsi, progressi separati
                </span>
              )}
            </div>

            <div className="mt-auto pt-5 w-full min-w-0 max-w-full">
              <Link
                href={academyCta.href}
                prefetch={false}
                className="btn-rc-primary w-full items-center justify-center gap-2"
              >
                {academyCta.member ? <Package className="h-4 w-4" /> : null}
                {academyCta.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
