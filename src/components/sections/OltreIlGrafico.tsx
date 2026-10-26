import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  Feather,
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import OltreIlGraficoCheckoutButton from '@/components/sections/OltreIlGraficoCheckoutButton';
import { DEFAULT_ENTITLEMENT_STATE, type OltreIlGraficoEntitlement } from '@/lib/entitlements';

export default function OltreIlGrafico({
  entitlement,
}: {
  entitlement?: OltreIlGraficoEntitlement;
}) {
  const og = siteConfig.oltreIlGrafico;
  const ent = entitlement ?? DEFAULT_ENTITLEMENT_STATE.oltreIlGrafico;
  const owned = ent.status === 'owned';

  return (
    <section
      id="oltre-il-grafico"
      className="relative py-12 sm:py-16 scroll-mt-28"
      aria-labelledby="oltre-il-grafico-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.08),transparent_60%)]"
      />
      <div className="container-page">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow !border-[#C9A961]/50 !bg-[#C9A961]/10 !text-[#E4CE96]">
              <Feather className="h-3.5 w-3.5" />
              ROMANZO · ONE-TIME
            </span>
            <h2 id="oltre-il-grafico-heading" className="mt-4 heading-md">
              {og.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-[#E4CE96]">
              di {og.author} · {og.pagesLabel}
            </p>
            <p className="mt-3 text-base sm:text-lg text-av-muted font-medium leading-snug">
              {og.tagline}
            </p>
            <p className="mt-3 text-sm text-av-muted/95 sm:text-base leading-relaxed max-w-xl">
              {og.logline}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl sm:text-5xl font-semibold text-[#E4CE96]">
                  14,90
                </span>
                <span className="text-sm sm:text-base text-av-muted">
                  € PDF digitale · IVA inclusa
                </span>
              </div>
              <ul className="space-y-1.5 max-w-sm text-xs sm:text-sm text-av-muted/95">
                {og.notes.slice(0, 2).map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-[#C9A961]" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              {owned ? (
                <div className="flex flex-wrap items-center gap-3 w-full max-w-md">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A961]/40 bg-[#C9A961]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E4CE96]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Nel tuo account
                  </span>
                  <Link
                    href="/area-membri/prodotti#oltre-il-grafico"
                    className="btn-rc-primary items-center gap-2 shadow-glow-gold-sm"
                  >
                    <Package className="h-4 w-4" />
                    Scarica il PDF
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
                      href="/area-membri/prodotti#oltre-il-grafico"
                      className="btn-ghost items-center gap-2 !py-2.5 !px-4 text-sm"
                    >
                      Controlla lo stato
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <OltreIlGraficoCheckoutButton label="resume" />
                </div>
              ) : (
                <div className="w-full max-w-md space-y-3">
                  <OltreIlGraficoCheckoutButton />
                  <Link
                    href="/libro/oltre-il-grafico"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#E4CE96] transition-colors hover:text-white"
                  >
                    Scopri di più sul romanzo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <GlassCard
              className="relative overflow-hidden border border-[#C9A961]/20"
              style={{
                backgroundImage:
                  'radial-gradient(700px 300px at 100% 0%, rgba(201,169,97,0.10), transparent 60%)',
              }}
            >
              <div className="relative p-5 sm:p-6">
                <div className="relative mx-auto w-full max-w-[260px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_20%,rgba(201,169,97,0.22),transparent_65%)] blur-lg"
                  />
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[#C9A961]/30 bg-av-bg-2/60 shadow-glow-gold">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={og.coverFront}
                      alt={`Copertina del romanzo ${og.title} di ${og.author}`}
                      width={680}
                      height={1020}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-av-line pt-5">
                  <span className="text-xs font-medium text-av-muted sm:text-sm">
                    Formato:
                  </span>
                  <span className="chip !border-[#C9A961]/40 !bg-[#C9A961]/10 !text-[#E4CE96]">
                    <BookOpen className="h-3 w-3" />
                    PDF digitale
                  </span>
                  <span className="chip">Cartaceo su Amazon</span>
                  <span className="chip">{og.pagesLabel}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-av-muted/90 max-w-3xl">
          {og.title} è un&apos;opera di narrativa. Nessun contenuto costituisce
          consulenza finanziaria, raccomandazione o segnale operativo e non
          promette alcun risultato. La versione cartacea si acquista su Amazon.it,
          che gestisce autonomamente ordine, pagamento e spedizione.
        </p>
      </div>
    </section>
  );
}
