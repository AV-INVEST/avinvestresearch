import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Target,
  Gauge,
  Clock,
  CalendarDays,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileCode,
  FileText,
  Package,
} from 'lucide-react';
import { auth } from '@/auth';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import MarketLensCheckoutButton from '@/components/sections/MarketLensCheckoutButton';
import { DEFAULT_ENTITLEMENT_STATE, type EntitlementsState, type MarketLensEntitlement } from '@/lib/entitlements';

const featureIcons: Record<string, typeof TrendingUp> = {
  trend: TrendingUp,
  levels: Target,
  volatility: Gauge,
  sessions: Clock,
  'daily-context': CalendarDays,
  setups: Sparkles,
};

async function resolveMarketLensEntitlement(): Promise<MarketLensEntitlement> {
  const session = await auth().catch(() => null);
  if (!session?.user?.id && !session?.user?.email) {
    return DEFAULT_ENTITLEMENT_STATE.marketLens;
  }
  try {
    const { getEntitlements } = await import('@/lib/entitlements');
    const state = (await getEntitlements(session.user.id, session.user.email).catch(
      () => DEFAULT_ENTITLEMENT_STATE,
    )) as EntitlementsState;
    return state.marketLens;
  } catch {
    return DEFAULT_ENTITLEMENT_STATE.marketLens;
  }
}

export default async function MarketLens() {
  const ml = siteConfig.marketLens;
  const entitlement = await resolveMarketLensEntitlement();
  const owned = entitlement.status === 'owned';

  return (
    <section
      id="market-lens"
      className="relative py-24 sm:py-32 scroll-mt-28"
      aria-labelledby="market-lens-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_58%),radial-gradient(ellipse_at_bottom_left,rgba(76,29,149,0.06),transparent_55%)]"
      />
      <div className="container-page">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="eyebrow">
              <Eye className="h-3.5 w-3.5" />
              PRODOTTO ONE-TIME
            </span>
            <h2 id="market-lens-heading" className="mt-5 heading-lg">
              {ml.title}
            </h2>
            <p className="mt-5 body-lg">
              {ml.tagline}
            </p>
            <p className="mt-4 text-sm text-av-muted sm:text-base leading-relaxed">
              {ml.description}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-5xl font-semibold text-av-green">
                  39,90
                </span>
                <span className="text-base text-av-muted">€ una tantum · IVA inclusa</span>
              </div>
              <ul className="space-y-2 max-w-md text-sm text-av-muted/95">
                {ml.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>

              {owned ? (
                <div className="flex flex-wrap items-center gap-3 pt-1 w-full max-w-md">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-av-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Nel tuo account
                  </span>
                  <Link
                    href="/area-membri/prodotti"
                    className="btn-primary items-center gap-2 shadow-glow-green-sm"
                  >
                    <Package className="h-4 w-4" />
                    Vai ai tuoi prodotti
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : entitlement.status === 'payment_pending' ? (
                <div className="flex flex-wrap items-center gap-3 pt-1 w-full max-w-md">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    Pagamento in corso
                  </span>
                  <Link
                    href="/area-membri/prodotti"
                    className="btn-ghost items-center gap-2"
                  >
                    Controlla lo stato
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="w-full max-w-md pt-1">
                  <MarketLensCheckoutButton />
                </div>
              )}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-av-muted/90 max-w-md">
              AV Market Lens è uno strumento di supporto all&apos;analisi tecnica e
              non fornisce segnali personalizzati di acquisto o vendita. I marker
              evidenziati derivano da condizioni tecniche predefinite, non
              garantiscono risultati e non sostituiscono una valutazione personale.
            </p>
          </div>

          <div className="lg:col-span-7">
            <GlassCard
              className="relative overflow-hidden border border-white/5"
              style={{
                backgroundImage:
                  'radial-gradient(1000px 400px at 100% 0%, rgba(0,255,106,0.06), transparent 60%)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-av-green/10 blur-3xl"
              />
              <div className="relative p-5 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <div className="relative overflow-hidden rounded-2xl border border-av-line bg-av-bg-2/60 aspect-[16/9]">
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(0deg, rgba(0,255,106,0.12) 0px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(0,255,106,0.08) 0px, transparent 1px, transparent 24px)',
                        }}
                      />
                      <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
                        <div className="w-full max-w-md">
                          <div className="flex items-center justify-between border-b border-av-line pb-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-av-muted">
                                Anteprima indicatore
                              </p>
                              <p className="mt-1 font-display text-lg font-semibold text-white">
                                {ml.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-av-green animate-pulse" />
                              <span className="font-mono text-[11px] uppercase tracking-widest text-av-green">
                                Live
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3">
                            <div className="h-2 rounded-full bg-av-bg-2/80 overflow-hidden">
                              <div
                                className="h-full w-3/4 bg-gradient-to-r from-av-green-deep via-av-green to-emerald-300"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {['Trend', 'Livelli', 'Alert'].map((label) => (
                                <div
                                  key={label}
                                  className="rounded-xl border border-av-line bg-av-bg-2/50 p-3"
                                >
                                  <p className="text-[10px] uppercase tracking-widest text-av-muted">
                                    {label}
                                  </p>
                                  <p className="mt-1 font-mono text-sm text-white">
                                    Attivi
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {ml.features.map((f) => {
                    const Icon = featureIcons[f.key] ?? Sparkles;
                    return (
                      <div
                        key={f.key}
                        className="group rounded-2xl border border-av-line bg-av-bg-2/40 p-4 sm:p-5 transition-all duration-300 hover:border-av-green-deep/40 hover:bg-av-surface"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green group-hover:shadow-glow-green-sm transition-all">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-display text-base sm:text-lg font-semibold text-white">
                            {f.title}
                          </h3>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-av-muted/95">
                          {f.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="relative mt-6 flex flex-wrap items-center gap-2 border-t border-av-line pt-6">
                  <span className="text-xs font-medium text-av-muted sm:text-sm">
                    Cosa ricevi dopo il pagamento:
                  </span>
                  <span className="chip border border-av-green-deep/40 bg-av-green/10 text-av-green">
                    <FileCode className="h-3 w-3" />
                    Pine Script
                  </span>
                  <span className="chip">
                    <FileText className="h-3 w-3" />
                    Guida PDF
                  </span>
                  <span className="chip">Licenza personale</span>
                  <span className="chip">Accesso illimitato</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
