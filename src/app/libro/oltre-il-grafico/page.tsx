import Link from 'next/link';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { getEntitlements } from '@/lib/entitlements';
import { siteConfig } from '@/config/siteConfig';
import OltreIlGraficoCoverSwitch from '@/components/sections/OltreIlGraficoCoverSwitch';
import OltreIlGraficoCheckoutButton from '@/components/sections/OltreIlGraficoCheckoutButton';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Feather,
  Lock,
  Package,
  ShoppingCart,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Oltre il Grafico — romanzo di Andrea Vivace | AV-INVEST Research',
  description:
    'Oltre il Grafico, romanzo di Andrea Vivace: 184 pagine su trading, disciplina e ciò che si muove davvero dietro il prezzo. PDF digitale a 14,90 € su avinvestresearch.com e versione cartacea su Amazon.it.',
  alternates: { canonical: 'https://avinvestresearch.com/libro/oltre-il-grafico' },
  openGraph: {
    type: 'book',
    locale: 'it_IT',
    url: 'https://avinvestresearch.com/libro/oltre-il-grafico',
    siteName: 'AV-INVEST RESEARCH',
    title: 'Oltre il Grafico — romanzo di Andrea Vivace',
    description:
      'Un romanzo sul trading, sulla disciplina e su quello che si muove davvero dietro il prezzo.',
  },
};

export default async function OltreIlGraficoPage() {
  const og = siteConfig.oltreIlGrafico;
  const session = await auth().catch(() => null);
  const entitlements = session?.user
    ? await getEntitlements(session.user.id, session.user.email).catch(() => null)
    : null;
  const ent = entitlements?.oltreIlGrafico;
  const owned = ent?.status === 'owned';
  const pending = ent?.status === 'payment_pending';

  return (
    <>
      <section
        className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 scroll-mt-28"
        aria-labelledby="page-heading"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.09),transparent_58%)]"
        />
        <div className="container-page">
          <Link
            href="/#oltre-il-grafico"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-av-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Torna alla home
          </Link>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5 lg:order-2">
              <OltreIlGraficoCoverSwitch
                frontSrc={og.coverFront}
                backSrc={og.coverBack}
                title={og.title}
              />
            </div>

            <div className="lg:col-span-7 lg:order-1">
              <span className="eyebrow !border-[#C9A961]/50 !bg-[#C9A961]/10 !text-[#E4CE96]">
                <Feather className="h-3.5 w-3.5" />
                ROMANZO
              </span>
              <h1 id="page-heading" className="mt-5 heading-xl">
                {og.title}
              </h1>
              <p className="mt-3 text-sm font-medium text-[#E4CE96] sm:text-base">
                di {og.author} · {og.pagesLabel}
              </p>
              <p className="mt-5 body-lg max-w-2xl">{og.tagline}</p>
              <p className="mt-4 text-sm leading-relaxed text-av-muted/95 sm:text-base max-w-2xl">
                {og.logline}
              </p>

              <ul className="mt-7 space-y-2 max-w-xl text-sm text-av-muted/95 sm:text-base">
                {og.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#C9A961]" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-16 sm:pb-20" aria-labelledby="trama-heading">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 id="trama-heading" className="heading-md">
              La trama
            </h2>
            <div className="mt-5 space-y-4">
              {og.synopsis.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-av-muted/95 sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-20 sm:pb-28" aria-labelledby="acquisto-heading">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 id="acquisto-heading" className="heading-md">
              Due modi per leggerlo
            </h2>
            <p className="mt-3 body-lg">
              Scegli la versione digitale, con download protetto nel tuo account,
              oppure il libro cartaceo acquistabile su Amazon.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
            {/* PDF digitale */}
            <div className="flex flex-col rounded-2xl border border-[#C9A961]/25 bg-av-surface/60 p-5 sm:p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#C9A961]/50 bg-[#C9A961]/10 text-[#E4CE96]">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E4CE96]">
                    PDF digitale
                  </p>
                  <h3 className="mt-0.5 font-display text-lg font-semibold text-white">
                    Scarica subito
                  </h3>
                </div>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold text-[#E4CE96]">
                  14,90
                </span>
                <span className="text-sm text-av-muted">€ una tantum · IVA inclusa</span>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-av-muted/90 sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-[#C9A961]" />
                  <span>Acquisto sicuro su questo sito tramite Stripe.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-[#C9A961]" />
                  <span>Download protetto nell&apos;area membri, riservato al tuo account.</span>
                </li>
              </ul>

              <div className="mt-6 pt-1">
                {owned ? (
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A961]/40 bg-[#C9A961]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E4CE96]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Nel tuo account
                    </span>
                    <Link
                      href="/area-membri/prodotti#oltre-il-grafico"
                      className="btn-rc-primary w-full items-center justify-center gap-2 shadow-glow-gold-sm"
                    >
                      <Package className="h-4 w-4" />
                      Scarica il PDF
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : pending ? (
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      Pagamento in corso
                    </span>
                    <OltreIlGraficoCheckoutButton label="resume" />
                  </div>
                ) : (
                  <OltreIlGraficoCheckoutButton />
                )}
              </div>
            </div>

            {/* Cartaceo Amazon */}
            <div className="flex flex-col rounded-2xl border border-av-line bg-av-surface/40 p-5 sm:p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/70 text-av-muted">
                  <ShoppingCart className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted">
                    Libro cartaceo
                  </p>
                  <h3 className="mt-0.5 font-display text-lg font-semibold text-white">
                    Ordina su Amazon
                  </h3>
                </div>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold text-white">
                  16,90
                </span>
                <span className="text-sm text-av-muted">€ · copia cartacea</span>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-av-muted/90 sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-av-muted" />
                  <span>Acquisto gestito da Amazon.it (ordine, pagamento e spedizione).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-av-muted" />
                  <span>Prezzo, disponibilità e tempi di consegna sono indicati da Amazon.</span>
                </li>
              </ul>

              <div className="mt-6 pt-1">
                {og.amazonUrl ? (
                  <a
                    href={og.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost w-full items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Acquista su Amazon · 16,90 €
                  </a>
                ) : (
                  <div className="space-y-3">
                    <span
                      aria-disabled="true"
                      className="btn-ghost w-full cursor-not-allowed items-center justify-center gap-2 opacity-60"
                    >
                      <Lock className="h-4 w-4" />
                      Acquista su Amazon · 16,90 €
                    </span>
                    <p className="flex items-start gap-2 text-xs leading-relaxed text-av-muted/90">
                      <Clock className="mt-0.5 h-3.5 w-3.5 flex-none text-[#C9A961]" />
                      <span>Disponibile a breve su Amazon.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-xs leading-relaxed text-av-muted/90">
            {og.title} è un&apos;opera di narrativa. Nessun contenuto costituisce
            consulenza finanziaria, raccomandazione o segnale operativo e non
            promette alcun risultato. Per la versione cartacea il venditore e il
            responsabile di ordine, pagamento e spedizione è Amazon; eventuali
            richieste relative a quella copia vanno rivolte ad Amazon.
          </p>
        </div>
      </section>
    </>
  );
}
