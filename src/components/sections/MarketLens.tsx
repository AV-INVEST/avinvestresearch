import Link from 'next/link';
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
      className="relative py-12 sm:py-20 scroll-mt-28"
      aria-labelledby="market-lens-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_58%),radial-gradient(ellipse_at_bottom_left,rgba(76,29,149,0.06),transparent_55%)]"
      />
      <div className="container-page">
        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-12 min-w-0">
          <div className="lg:col-span-5 min-w-0">
            <span className="eyebrow">
              <Eye className="h-3.5 w-3.5" />
              PRODOTTO ONE-TIME
            </span>
            <h2 id="market-lens-heading" className="mt-5 heading-lg">
              {ml.title}
            </h2>
            <p className="mt-4 sm:mt-5 body-lg">
              {ml.tagline}
            </p>
            <p className="mt-3 sm:mt-4 text-sm text-av-muted sm:text-base leading-relaxed">
              {ml.description}
            </p>

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-4xl sm:text-5xl font-semibold text-av-green">
                  39,90
                </span>
                <span className="text-sm sm:text-base text-av-muted">€ una tantum · IVA inclusa</span>
              </div>
              <ul className="space-y-1.5 sm:space-y-2 max-w-md text-sm text-av-muted/95">
                {ml.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>

              {owned ? (
                <div className="flex flex-wrap items-center gap-3 pt-0.5 sm:pt-1 w-full max-w-md">
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
                <div className="w-full max-w-md pt-0.5 sm:pt-1 space-y-2.5 sm:space-y-3">
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
                <div className="w-full max-w-md pt-0.5 sm:pt-1">
                  <MarketLensCheckoutButton />
                </div>
              )}
            </div>

            <p className="mt-5 sm:mt-6 text-xs leading-relaxed text-av-muted/90 max-w-md">
              AV Market Lens è uno strumento di supporto all&apos;analisi tecnica e
              non fornisce segnali personalizzati di acquisto o vendita. I marker
              evidenziati derivano da condizioni tecniche predefinite, non
              garantiscono risultati e non sostituiscono una valutazione personale.
            </p>
          </div>

          <div className="lg:col-span-7 min-w-0 w-full">
            <GlassCard
              className="relative overflow-hidden border border-white/5 w-full min-w-0"
              style={{
                backgroundImage:
                  'radial-gradient(1000px 400px at 100% 0%, rgba(0,255,106,0.06), transparent 60%)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-av-green/10 blur-3xl"
              />
              <div className="relative p-3.5 sm:p-5 w-full min-w-0">
                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5 sm:gap-3 w-full min-w-0">
                  {ml.features.map((f) => {
                    const Icon = featureIcons[f.key] ?? Sparkles;
                    return (
                      <div
                        key={f.key}
                        className="group rounded-xl border border-av-line bg-av-bg-2/40 p-2.5 sm:p-3.5 transition-all duration-300 hover:border-av-green-deep/40 hover:bg-av-surface min-w-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-av-green-deep/50 bg-av-green/10 text-av-green transition-all group-hover:shadow-glow-green-sm">
                            <Icon className="h-4 w-4" />
                          </div>
                          <h3 className="font-display text-[13px] sm:text-sm font-semibold text-white leading-tight break-words">
                            {f.title}
                          </h3>
                        </div>
                        <p className="mt-1.5 text-[11px] sm:text-xs leading-snug text-av-muted/95 break-words">
                          {f.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="relative mt-3.5 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-av-line pt-3.5 sm:pt-4 w-full min-w-0">
                  <span className="text-xs font-medium text-av-muted sm:text-sm shrink-0">
                    Cosa ricevi dopo il pagamento:
                  </span>
                  <span className="chip !py-1 border border-av-green-deep/40 bg-av-green/10 text-av-green">
                    <FileCode className="h-3 w-3" />
                    Pine Script
                  </span>
                  <span className="chip !py-1">
                    <FileText className="h-3 w-3" />
                    Guida PDF
                  </span>
                  <span className="chip !py-1">Licenza personale</span>
                  <span className="chip !py-1">Accesso illimitato</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
