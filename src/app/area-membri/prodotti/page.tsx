import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getEntitlements } from '@/lib/entitlements';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import PendingPaymentRefresher from '@/components/payment/PendingPaymentRefresher';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Info,
  Lock,
  Package,
  Sparkles,
} from 'lucide-react';
import DownloadButton from '@/components/products/DownloadButton';
import MarketLensCheckoutButton from '@/components/sections/MarketLensCheckoutButton';

export const metadata: Metadata = {
  title: 'I miei prodotti',
  description: 'I tuoi prodotti digitali acquistati su AV-INVEST Research.',
  alternates: { canonical: '/area-membri/prodotti' },
};

export const dynamic = 'force-dynamic';

export default async function MyProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    const target =
      '/login?callbackUrl=' + encodeURIComponent('/area-membri/prodotti');
    redirect(target);
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const checkoutParam =
    typeof resolvedParams?.checkout === 'string' ? resolvedParams.checkout : null;
  const sessionIdParam =
    typeof resolvedParams?.session_id === 'string' ? resolvedParams.session_id : null;

  const entitlements = await getEntitlements(session.user.id, session.user.email);
  const marketLens = entitlements.marketLens;
  const ml = siteConfig.marketLens;

  const checkoutSuccess = checkoutParam === 'success';
  const checkoutCancelled = checkoutParam === 'cancelled';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-av-green">
            <Package className="h-3.5 w-3.5" />
            I tuoi prodotti
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Prodotti digitali
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
            Qui trovi tutti i prodotti one-time acquistati con il tuo account e i
            relativi download.
          </p>
        </div>
      </div>

      {checkoutSuccess && marketLens.status !== 'owned' ? (
        <div className="flex items-start gap-2 rounded-2xl border border-yellow-400/40 bg-yellow-400/[0.04] px-4 py-3 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 flex-none text-yellow-300" />
          <div className="min-w-0">
            <p className="font-semibold text-yellow-200">Pagamento ricevuto</p>
            <p className="mt-1 leading-relaxed text-yellow-100/85">
              Stiamo confermando l&apos;acquisto con il nostro sistema. Se tra
              qualche secondo la card non si aggiorna, usa il pulsante per
              ricaricare manualmente.
            </p>
            {sessionIdParam ? (
              <p className="mt-1 text-[11px] text-yellow-100/70 font-mono break-all">
                Sessione: {sessionIdParam}
              </p>
            ) : null}
            <div className="mt-3">
              <PendingPaymentRefresher initialAnyPending compact />
            </div>
          </div>
        </div>
      ) : null}

      {checkoutCancelled ? (
        <div className="flex items-start gap-2 rounded-2xl border border-av-line bg-av-bg-2/60 px-4 py-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 flex-none text-av-muted" />
          <div className="min-w-0">
            <p className="font-semibold text-white">Pagamento annullato</p>
            <p className="mt-1 leading-relaxed text-av-muted/90">
              Nessun importo è stato addebitato. Se cambi idea, puoi riprovare
              l&apos;acquisto in qualsiasi momento.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <GlassCard
          className="lg:col-span-8 overflow-hidden border border-white/5"
          style={{
            backgroundImage:
              'radial-gradient(1000px 400px at 100% 0%, rgba(0,255,106,0.06), transparent 60%)',
          }}
        >
          <div className="relative p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
                    <Eye className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-av-green">
                      PRODOTTO ONE-TIME
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-white">
                      {ml.title}
                    </h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-av-muted/95 sm:text-base max-w-2xl">
                  {ml.tagline}
                </p>
              </div>

              {marketLens.status === 'owned' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-av-green">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Posseduto
                </span>
              ) : marketLens.status === 'payment_pending' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  In conferma
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-av-muted">
                  <Lock className="h-3.5 w-3.5" />
                  Non disponibile
                </span>
              )}
            </div>

            {marketLens.status === 'owned' ? (
              <div className="mt-6 rounded-2xl border border-av-green-deep/40 bg-av-green/[0.04] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      Acquisto completato
                    </p>
                    {marketLens.purchasedAt ? (
                      <p className="mt-1 text-xs text-av-muted/90">
                        Data:{' '}
                        {new Date(marketLens.purchasedAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="sm:hidden mt-4 mb-4 flex items-start gap-2 rounded-xl border border-av-line bg-av-bg-2/60 px-3 py-2.5">
                  <Info className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-av-green">
                      Installazione consigliata da computer
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-av-muted/90">
                      Puoi scaricare i file anche da smartphone, ma per installare AV Market Lens utilizza TradingView da browser desktop e segui la guida PDF.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DownloadButton
                    kind="indicator"
                    label="Scarica indicatore"
                    subLabel="File Pine Script per TradingView"
                    variant="primary"
                  />
                  <DownloadButton
                    kind="guide"
                    label="Scarica guida PDF"
                    subLabel="Istruzioni e panoramica completa"
                    variant="secondary"
                  />
                </div>

                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-av-muted/90">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-none text-av-green" />
                  <span>
                    Questi file sono riservati al tuo account personale. Non
                    condividere, pubblicare, vendere o rivendere il codice Pine
                    Script o la guida PDF.
                  </span>
                </p>
              </div>
            ) : marketLens.status === 'payment_pending' ? (
              <div className="mt-6 rounded-2xl border border-yellow-400/40 bg-yellow-400/[0.04] p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-yellow-400/40 bg-yellow-400/10 text-yellow-300">
                    <Clock className="h-5 w-5 animate-pulse" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-yellow-200">
                      Pagamento in fase di elaborazione
                    </p>
                    <p className="mt-1 leading-relaxed text-yellow-100/85 text-sm sm:text-base">
                      Stiamo aspettando la conferma definitiva da Stripe. Se hai
                      abbandonato il checkout, puoi riprenderlo o riprovare qui
                      sotto.
                    </p>
                    <div className="mt-4">
                      <PendingPaymentRefresher initialAnyPending compact />
                    </div>
                  </div>
                </div>
                <MarketLensCheckoutButton label="resume" />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-av-line bg-av-bg-2/60 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
                      <Lock className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Non hai ancora acquistato {ml.title}
                      </p>
                      <p className="mt-1 leading-relaxed text-av-muted/90 text-sm sm:text-base">
                        Acquista dalla homepage per ricevere subito l&apos;accesso
                        all&apos;indicatore Pine Script e alla guida PDF.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/#market-lens"
                      className="btn-primary shadow-glow-green-sm whitespace-nowrap"
                    >
                      Scopri AV Market Lens
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-4 overflow-hidden p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
              Riepilogo
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-white">
              Note importanti
            </h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-av-muted/95">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-av-green" />
              <span>
                Ogni prodotto è associato all&apos;account Google con cui hai
                effettuato l&apos;acquisto.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-av-green" />
              <span>
                La licenza è personale e non trasferibile: non puoi condividere,
                pubblicare o vendere i file.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-av-green" />
              <span>
                Serve un account TradingView (anche gratuito) per usare l
                &apos;indicatore Pine Script.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-av-green" />
              <span>
                I download sono serviti direttamente dal server: nessun link
                pubblico o permanente.
              </span>
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
