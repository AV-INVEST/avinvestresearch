import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { productTitleBySlug } from '@/lib/stripe/pricing';
import { getResearchClubEntitlement } from '@/lib/entitlements';
import type { PurchaseStatus } from '@prisma/client';
import {
  ArrowLeft,
  ArrowRight,
  LogOut,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Cookie,
  Lock,
  UserRound,
  ExternalLink,
  CalendarDays,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  CreditCard,
  XCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Profilo e sicurezza',
  description: 'Gestisci profilo e sicurezza dell\'area membri.',
  alternates: { canonical: '/area-membri/profilo' },
};

async function logoutAction() {
  'use server';
  await signOut({ redirectTo: '/' });
}

export default async function ProfiloPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    const target =
      '/login?callbackUrl=' + encodeURIComponent('/area-membri/profilo');
    redirect(target);
  }
  const name = session.user.name || 'Membro AV-INVEST';
  const email = session.user.email || '';
  const image = session.user.image;

  const delSubject = encodeURIComponent(
    'Richiesta eliminazione dati e account',
  );
  const delBody = encodeURIComponent(
    `Ciao AV-INVEST,\n\nVorrei richiedere la eliminazione dei miei dati e la chiusura dell'account.\n\nNome: ${name}\nEmail: ${email}\nID sessione Google (se disponibile): ${session.user.id || 'N/A'}\n\nNote:\n- Confermo di voler procedere con la richiesta di cancellazione.\n\nData: ${new Date().toISOString()}\n`,
  );
  const deleteMailto = `mailto:${siteConfig.contactEmail}?subject=${delSubject}&body=${delBody}`;

  const normalizedEmail = normalizeEmail(email);
  let purchases: Array<{
    id: string;
    productSlug: string;
    amountTotal: number;
    currency: string;
    status: PurchaseStatus;
    purchasedAt: Date | null;
    refundedAt: Date | null;
    refundedAmount: number | null;
    invoiceHostedUrl: string | null;
    invoicePdfUrl: string | null;
    createdAt: Date;
  }> = [];
  if (isDatabaseConfigured() && normalizedEmail) {
    try {
      purchases = await prisma.purchase.findMany({
        where: { userEmail: normalizedEmail },
        orderBy: [{ purchasedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          productSlug: true,
          amountTotal: true,
          currency: true,
          status: true,
          purchasedAt: true,
          refundedAt: true,
          refundedAmount: true,
          invoiceHostedUrl: true,
          invoicePdfUrl: true,
          createdAt: true,
        },
      });
    } catch {
      purchases = [];
    }
  }

  const rcEntitlement = normalizedEmail
    ? await getResearchClubEntitlement(undefined, normalizedEmail)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/area-membri"
            className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla Panoramica
          </Link>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Profilo e sicurezza
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
            Controlla i tuoi dati e le impostazioni di sicurezza dell&apos;area
            membri.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="overflow-hidden p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="relative grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-2xl border border-av-green-deep/60 bg-av-green/10 text-av-green">
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <UserRound className="h-8 w-8" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold text-white truncate">
                {name}
              </p>
              <p className="mt-1 text-sm text-av-muted truncate">{email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                <ShieldCheck className="h-3 w-3" />
                Provider · Google
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-av-muted">
            <div className="flex items-center justify-between gap-3 border-t border-av-line pt-3">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-av-green" />
                Sessione
              </span>
              <span className="text-white">Attiva</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-av-line pt-3">
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-av-muted" />
                Data creazione account
              </span>
              <span>Non disponibile</span>
            </div>
          </div>
          <form action={logoutAction} className="mt-6">
            <button
              type="submit"
              className="btn-ghost w-full !py-2.5 !px-4 text-sm items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4 text-av-green" />
              LOGOUT
            </button>
          </form>
        </GlassCard>

        <div className="space-y-4 lg:col-span-3">
          <GlassCard className="overflow-hidden p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Collegamenti rapidi
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-av-muted">
              Riferimenti legali e strumenti utili per la tua privacy.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/privacy"
                className="group inline-flex items-center justify-between gap-3 rounded-xl border border-av-line bg-av-bg-2/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-av-green-deep/60"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-av-green" />
                  Privacy Policy
                </span>
              </Link>
              <Link
                href="/cookie"
                className="group inline-flex items-center justify-between gap-3 rounded-xl border border-av-line bg-av-bg-2/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-av-green-deep/60"
              >
                <span className="inline-flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-av-green" />
                  Gestisci preferenze cookie
                </span>
              </Link>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Sessioni e sicurezza
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-av-muted">
              L&apos;autenticazione usa sessioni JWT gestite tramite provider
              Google. La validit&agrave; di tutte le sessioni attive dipende
              dal tuo account Google: per disconnettere tutti i dispositivi
              contemporaneamente puoi usare la gestione sicurezza del tuo
              profilo Google.
            </p>
          </GlassCard>
        </div>
      </div>

      <section aria-labelledby="research-club-title">
        <GlassCard className="overflow-hidden border-[#C9A961]/20 bg-gradient-to-br from-[#C9A961]/[0.04] via-transparent to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#D4B46A]">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="research-club-title"
                    className="font-display text-lg font-semibold text-white"
                  >
                    AV Research Club
                  </h2>
                  {rcEntitlement?.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/50 bg-av-green/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Attivo
                    </span>
                  ) : rcEntitlement?.status === 'cancel_at_period_end' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      Rinnovo disattivato
                    </span>
                  ) : rcEntitlement?.status === 'payment_problem' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Problema pagamento
                    </span>
                  ) : rcEntitlement?.status === 'ended' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-muted">
                      <XCircle className="h-3.5 w-3.5" />
                      Scaduto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-muted">
                      Nessun abbonamento
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-av-muted">
                  {rcEntitlement?.status === 'none' || !rcEntitlement
                    ? 'Analisi e ricerche di mercato riservate ai membri. Abbonamento ricorrente 19,90 €/mese.'
                    : rcEntitlement.message}
                </p>
                {rcEntitlement?.nextDate && rcEntitlement.status !== 'none' ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-3 py-1 text-xs text-av-muted">
                    <CalendarDays className="h-3.5 w-3.5 text-[#C9A961]" />
                    {rcEntitlement.status === 'cancel_at_period_end' || rcEntitlement.status === 'ended'
                      ? 'Accesso disponibile fino al '
                      : 'Prossimo rinnovo: '}
                    <time className="font-medium text-white" dateTime={rcEntitlement.nextDate.toISOString()}>
                      {rcEntitlement.nextDate.toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </time>
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              <span className="font-display text-2xl font-semibold text-white">
                19,90 <span className="text-base text-av-muted">€/mese</span>
              </span>
            </div>
          </div>

          {rcEntitlement?.status === 'active' || rcEntitlement?.status === 'cancel_at_period_end' || rcEntitlement?.status === 'payment_problem' ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <form action="/api/stripe/customer-portal" method="POST">
                <button
                  type="submit"
                  className="btn-primary shadow-glow-green-sm !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  GESTISCI ABBONAMENTO
                </button>
              </form>
              <Link
                href="/area-membri/research-club"
                className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
              >
                Vai alle ricerche
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/#research-club"
                className="btn-primary shadow-glow-green-sm !py-2.5 !px-4 text-sm items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-[#C9A961]" />
                ENTRA NEL RESEARCH CLUB
              </Link>
            </div>
          )}
        </GlassCard>
      </section>

      <section aria-labelledby="danger-zone-title">
        <GlassCard className="overflow-hidden border-red-500/20 bg-red-500/[0.02] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="danger-zone-title"
                className="font-display text-lg font-semibold text-white"
              >
                Gestione ed eliminazione dei dati
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                L&apos;accesso all&apos;area membri avviene tramite il tuo account
                Google. AV-INVEST Research non salva la password del tuo account
                Google.
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-av-muted">
                <li>
                  • Per terminare la sessione attiva utilizza il pulsante LOGOUT.
                </li>
                <li>
                  • Per esercitare i tuoi diritti sui dati personali, inclusa la
                  cancellazione quando applicabile, invia una richiesta tramite il
                  pulsante seguente.
                </li>
                <li>
                  • I dati fiscali o transazionali soggetti a obblighi legali sono
                  conservati per il periodo previsto dalla normativa e gestiti
                  secondo la Privacy Policy.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={deleteMailto}
                  className="btn-ghost border-red-500/40 text-red-200 hover:border-red-500/60 hover:text-white !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4 text-red-300" />
                  Richiedi eliminazione dati
                </a>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <section aria-labelledby="billing-title">
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-green-deep/40 bg-av-green/10 text-av-green">
                <Receipt className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="billing-title"
                  className="font-display text-lg font-semibold text-white"
                >
                  Acquisti e fatturazione
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-av-muted">
                  Cronologia degli acquisti, stato dei pagamenti e accesso alle
                  ricevute fiscali.
                </p>
              </div>
            </div>
          </div>

          {purchases.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-av-line bg-av-bg-2/40 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/60 text-av-muted">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold text-white sm:text-lg">
                    Nessun acquisto registrato
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-av-muted">
                    Quando completerai un acquisto, troverai qui il riepilogo del
                    pagamento e il link alla ricevuta.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/#percorsi"
                      className="btn-primary shadow-glow-green-sm !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                    >
                      Scopri i percorsi
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              {purchases.map((p) => {
                const title = productTitleBySlug(p.productSlug);
                const amount = new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: (p.currency || 'EUR').toUpperCase(),
                  maximumFractionDigits: 2,
                }).format((p.amountTotal || 0) / 100);
                const date = p.purchasedAt ?? p.createdAt;
                const dateLabel = date.toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                let statusLabel = 'In attesa';
                let statusClass =
                  'border-av-line bg-av-bg-2/60 text-av-muted';
                if (p.status === 'succeeded') {
                  statusLabel = 'Completato';
                  statusClass =
                    'border-av-green-deep/50 bg-av-green/10 text-av-green';
                } else if (p.status === 'refunded') {
                  statusLabel = 'Rimborsato';
                  statusClass =
                    'border-red-500/40 bg-red-500/10 text-red-300';
                } else if (p.status === 'failed') {
                  statusLabel = 'Fallito';
                  statusClass =
                    'border-amber-500/40 bg-amber-500/10 text-amber-300';
                }
                const refunded =
                  p.refundedAmount != null && p.refundedAmount > 0 ? p.refundedAmount : 0;
                const refundAmountLabel =
                  refunded > 0
                    ? new Intl.NumberFormat('it-IT', {
                        style: 'currency',
                        currency: (p.currency || 'EUR').toUpperCase(),
                        maximumFractionDigits: 2,
                      }).format(refunded / 100)
                    : null;
                const receiptUrl = p.invoiceHostedUrl || p.invoicePdfUrl || null;
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-av-line bg-av-bg-2/40 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-base font-semibold text-white sm:text-lg truncate">
                            {title}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClass}`}
                          >
                            {p.status === 'succeeded' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : null}
                            {statusLabel}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-av-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Data acquisto:{' '}
                            <time dateTime={date.toISOString()}>
                              {dateLabel}
                            </time>
                          </span>
                          <span>Importo: <span className="font-semibold text-white">{amount}</span></span>
                        </div>
                        {refundAmountLabel ? (
                          <div className="mt-2 text-xs sm:text-sm text-red-300/90">
                            Importo rimborsato:{' '}
                            <span className="font-semibold">
                              {refundAmountLabel}
                            </span>
                            {p.refundedAt ? (
                              <span className="text-av-muted">
                                {' '}
                                ·{' '}
                                <time dateTime={p.refundedAt.toISOString()}>
                                  {p.refundedAt.toLocaleDateString('it-IT')}
                                </time>
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        {receiptUrl ? (
                          <a
                            href={receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost !py-2 !px-3.5 text-xs sm:text-sm items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <ExternalLink className="h-4 w-4 text-av-green" />
                            Apri ricevuta
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-av-line bg-av-bg-2/50 px-3 py-2 text-[11px] sm:text-xs text-av-muted">
                            <Receipt className="h-3.5 w-3.5" />
                            Ricevuta in elaborazione
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </section>
    </div>
  );
}
