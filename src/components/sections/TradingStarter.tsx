import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  Sparkles,
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import TradingStarterCheckoutButton from '@/components/sections/TradingStarterCheckoutButton';
import { DEFAULT_ENTITLEMENT_STATE, type TradingStarterEntitlement } from '@/lib/entitlements';

export default function TradingStarter({
  entitlement,
}: {
  entitlement?: TradingStarterEntitlement;
}) {
  const ts = siteConfig.tradingStarter;
  const ent = entitlement ?? DEFAULT_ENTITLEMENT_STATE.tradingStarter;
  const owned = ent.status === 'owned';

  return (
    <section
      id="trading-starter"
      className="relative py-12 sm:py-16 scroll-mt-28"
      aria-labelledby="trading-starter-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.06),transparent_60%)]"
      />
      <div className="container-page">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              ENTRY-LEVEL · GUIDA ONE-TIME
            </span>
            <h2 id="trading-starter-heading" className="mt-4 heading-md">
              {ts.title}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-av-muted font-medium leading-snug">
              {ts.tagline}
            </p>
            <p className="mt-3 text-sm text-av-muted/95 sm:text-base leading-relaxed max-w-xl">
              {ts.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl sm:text-5xl font-semibold text-av-green">
                  9,90
                </span>
                <span className="text-sm sm:text-base text-av-muted">
                  € una tantum · IVA inclusa
                </span>
              </div>
              <ul className="space-y-1.5 max-w-sm text-xs sm:text-sm text-av-muted/95">
                {ts.notes.slice(0, 2).map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-av-green" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              {owned ? (
                <div className="flex flex-wrap items-center gap-3 w-full max-w-md">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-av-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Nel tuo account
                  </span>
                  <Link
                    href="/area-membri/prodotti#trading-starter"
                    className="btn-primary items-center gap-2 shadow-glow-green-sm"
                  >
                    <Package className="h-4 w-4" />
                    Scarica la guida
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : ent.status === 'payment_pending' ? (
                <div className="w-full max-w-md space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      Pagamento in corso
                    </span>
                    <Link
                      href="/area-membri/prodotti#trading-starter"
                      className="btn-ghost items-center gap-2 !py-2.5 !px-4 text-sm"
                    >
                      Controlla lo stato
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <TradingStarterCheckoutButton label="resume" />
                </div>
              ) : (
                <div className="w-full max-w-md">
                  <TradingStarterCheckoutButton />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <GlassCard
              className="relative overflow-hidden border border-white/5"
              style={{
                backgroundImage:
                  'radial-gradient(700px 300px at 100% 0%, rgba(0,255,106,0.06), transparent 60%)',
              }}
            >
              <div className="relative p-5 sm:p-6">
                <div className="relative overflow-hidden rounded-2xl border border-av-line bg-av-bg-2/60 aspect-[4/3]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(0,255,106,0.10) 0px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(0,255,106,0.06) 0px, transparent 1px, transparent 20px)',
                    }}
                  />
                  <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid h-10 w-10 place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green shadow-glow-green-sm">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-display text-sm sm:text-base font-semibold text-white leading-none">
                            {ts.title}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-widest text-av-muted leading-none">
                            Guida PDF · Principianti
                          </p>
                        </div>
                      </div>
                      <span className="chip chip-green !py-1 !text-[11px]">
                        ENTRY-LEVEL
                      </span>
                    </div>
                    <div className="grid gap-2.5 mt-5">
                      <div className="flex items-center gap-3 rounded-xl border border-av-line bg-av-bg-2/50 px-3.5 py-2.5">
                        <CheckCircle2 className="h-4 w-4 flex-none text-av-green" />
                        <p className="text-xs sm:text-sm text-white/90">Basi di grafici e price action</p>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-av-line bg-av-bg-2/50 px-3.5 py-2.5">
                        <CheckCircle2 className="h-4 w-4 flex-none text-av-green" />
                        <p className="text-xs sm:text-sm text-white/90">Riconoscere trend e livelli chiave</p>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-av-line bg-av-bg-2/50 px-3.5 py-2.5">
                        <CheckCircle2 className="h-4 w-4 flex-none text-av-green" />
                        <p className="text-xs sm:text-sm text-white/90">Gestione del rischio e mindset</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-av-line pt-5">
                  <span className="text-xs font-medium text-av-muted sm:text-sm">
                    Contenuto:
                  </span>
                  <span className="chip border border-av-green-deep/40 bg-av-green/10 text-av-green">
                    <BookOpen className="h-3 w-3" />
                    1 Guida PDF
                  </span>
                  <span className="chip">Licenza personale</span>
                  <span className="chip">Accesso illimitato</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-av-muted/90 max-w-3xl">
          AV Trading Starter è materiale esclusivamente educativo e informativo,
          studiato per l&apos;apprendimento dei concetti base. Non costituisce
          consulenza finanziaria, non è una raccomandazione o un segnale operativo
          e non promette alcun risultato o profitto.
        </p>
      </div>
    </section>
  );
}
