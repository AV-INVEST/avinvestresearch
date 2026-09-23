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
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import MarketLensCheckoutButton from '@/components/sections/MarketLensCheckoutButton';
import { DEFAULT_ENTITLEMENT_STATE, type MarketLensEntitlement } from '@/lib/entitlements';

const featureIcons: Record<string, typeof TrendingUp> = {
  trend: TrendingUp,
  levels: Target,
  volatility: Gauge,
  sessions: Clock,
  'daily-context': CalendarDays,
  setups: Sparkles,
};

export default function MarketLens({
  entitlement,
}: {
  entitlement?: MarketLensEntitlement;
}) {
  const ml = siteConfig.marketLens;
  const ent = entitlement ?? DEFAULT_ENTITLEMENT_STATE.marketLens;
  const owned = ent.status === 'owned';

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
              ) : ent.status === 'payment_pending' ? (
                <div className="w-full max-w-md pt-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      Pagamento in corso
                    </span>
                    <Link
                      href="/area-membri/prodotti"
                      className="btn-ghost items-center gap-2 !py-2.5 !px-4 text-sm"
                    >
                      Controlla lo stato
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <MarketLensCheckoutButton label="resume" />
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
                          <div className="flex items-center justify-between border-b border-av-line py-2 sm:py-3">
                            <p className="font-display text-base sm:text-lg font-semibold text-white leading-none">
                              {ml.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-av-green animate-pulse" />
                              <span className="font-mono text-[11px] uppercase tracking-widest text-av-green leading-none">
                                LIVE
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
                    const isLevels = f.key === 'levels';
                    return (
                      <div
                        key={f.key}
                        className={`group rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
                          isLevels
                            ? 'border border-[#C9A961]/35 bg-[#C9A961]/[0.05] hover:border-[#D4B46A]/55 hover:bg-[#C9A961]/[0.08] shadow-[0_0_0_1px_rgba(201,169,97,0.05),0_4px_24px_-10px_rgba(201,169,97,0.25)] hover:shadow-[0_0_0_1px_rgba(212,180,106,0.08),0_6px_28px_-8px_rgba(201,169,97,0.35)]'
                            : 'border border-av-line bg-av-bg-2/40 hover:border-av-green-deep/40 hover:bg-av-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                              isLevels
                                ? 'border border-[#C9A961]/45 bg-[#C9A961]/12 text-[#D4B46A] group-hover:shadow-[0_0_12px_rgba(201,169,97,0.25)]'
                                : 'border border-av-green-deep/50 bg-av-green/10 text-av-green group-hover:shadow-glow-green-sm'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3
                            className={`font-display text-base sm:text-lg font-semibold ${
                              isLevels ? 'text-[#D4B46A]' : 'text-white'
                            }`}
                          >
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
