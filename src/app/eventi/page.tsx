import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarClock, Info, Ticket, Video, History, Sparkles } from 'lucide-react';
import { listPublicLiveEvents } from '@/lib/live-events/public';
import {
  LIVE_EVENT_PRICE_LABEL,
  LIVE_EVENT_TICKET_IMAGE_BACK,
  LIVE_EVENT_TICKET_IMAGE_FRONT,
  formatRomeDateTime,
} from '@/lib/admin/live-event-shared';
import LiveEventTicketFlip from '@/components/events/LiveEventTicketFlip';
import LiveEventCheckoutButton from '@/components/events/LiveEventCheckoutButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Eventi Live Premium',
  description:
    'Eventi formativi online in diretta su Google Meet: un biglietto personale a 9,90 € per ogni incontro. Accesso dalla tua area membri da 60 minuti prima dell’inizio.',
  alternates: { canonical: 'https://avinvestresearch.com/eventi' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

function durationLabel(startsAtIso: string, endsAtIso: string | null): string | null {
  if (!endsAtIso) return null;
  const minutes = Math.round((new Date(endsAtIso).getTime() - new Date(startsAtIso).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return h === 1 ? '1 ora' : `${h} ore`;
  }
  return `${minutes} minuti`;
}

export default async function EventiPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const checkoutParam = typeof resolvedParams?.checkout === 'string' ? resolvedParams.checkout : null;

  const { upcoming, past } = await listPublicLiveEvents();
  const hasEvents = upcoming.length > 0 || past.length > 0;

  return (
    <div className="relative min-h-screen pt-24 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.12),transparent_55%)]"
      />
      <div className="container-page pb-20 sm:pb-28">
        {checkoutParam === 'cancelled' ? (
          <div className="mb-8 flex items-start gap-2 rounded-2xl border border-av-line bg-av-bg-2/60 px-4 py-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 flex-none text-av-muted" />
            <div className="min-w-0">
              <p className="font-semibold text-white">Pagamento annullato</p>
              <p className="mt-1 leading-relaxed text-av-muted/90">
                Nessun importo è stato addebitato. Puoi riprovare l’acquisto quando vuoi.
              </p>
            </div>
          </div>
        ) : null}
        {checkoutParam === 'success' ? (
          <div className="mb-8 flex items-start gap-2 rounded-2xl border border-av-green-deep/40 bg-av-green/[0.04] px-4 py-3 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 flex-none text-av-green" />
            <div className="min-w-0">
              <p className="font-semibold text-av-green">Acquisto completato</p>
              <p className="mt-1 leading-relaxed text-av-muted/90">
                Trovi il tuo biglietto in{' '}
                <Link href="/area-membri/biglietti" className="link-underline text-av-green">
                  Area membri · I miei biglietti
                </Link>
                . Dopo la conferma del pagamento il link Google Meet sarà disponibile da 60 minuti prima dell’inizio.
              </p>
            </div>
          </div>
        ) : null}

        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <span className="eyebrow !border-[#C9A961]/50 !bg-[#C9A961]/10 !text-[#E4CE96]">
            <CalendarClock className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
            Eventi Live Premium
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Format online in diretta, <span className="text-[#E4CE96]">in piccolo gruppo</span>.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-av-muted sm:text-lg">
            Un biglietto personale a {LIVE_EVENT_PRICE_LABEL} per ogni incontro, su Google Meet.
            Accesso e replay disponibili nella tua area membri.
          </p>
        </header>

        {/* Biglietto + come funziona */}
        <section className="mx-auto mt-12 grid max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <LiveEventTicketFlip frontSrc={LIVE_EVENT_TICKET_IMAGE_FRONT} backSrc={LIVE_EVENT_TICKET_IMAGE_BACK} />
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-[#C9A961]/50 bg-[#C9A961]/10 text-[#E4CE96]">
                <Ticket className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Biglietto personale</p>
                <p className="mt-1 text-sm leading-relaxed text-av-muted">
                  Un solo biglietto per account ed evento, non trasferibile. Eventi diversi si acquistano separatamente.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-[#C9A961]/50 bg-[#C9A961]/10 text-[#E4CE96]">
                <Video className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Accesso Google Meet</p>
                <p className="mt-1 text-sm leading-relaxed text-av-muted">
                  Il pulsante per entrare compare nella tua area membri da 60 minuti prima dell’inizio e resta valido per biglietti confermati.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-[#C9A961]/50 bg-[#C9A961]/10 text-[#E4CE96]">
                <History className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Replay dopo l’evento</p>
                <p className="mt-1 text-sm leading-relaxed text-av-muted">
                  Quando previsto, dopo lo svolgimento il replay è disponibile agli aventi diritto nell’area membri.
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* Prossimi eventi */}
        <section className="mt-16 sm:mt-20">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Prossimi eventi</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-av-muted sm:text-base">
            Acquisti con il tuo account Google. Il pagamento è gestito in modo sicuro tramite Stripe.
          </p>

          {upcoming.length > 0 ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {upcoming.map((ev) => {
                const dur = durationLabel(ev.startsAtIso, ev.endsAtIso);
                return (
                  <article
                    key={ev.id}
                    className="flex flex-col rounded-2xl border border-av-line bg-av-surface/60 p-5 backdrop-blur-xl sm:p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E4CE96]">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatRomeDateTime(ev.startsAtIso)}
                      {dur ? <span className="text-av-muted">· {dur}</span> : null}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-white">{ev.title}</h3>
                    {ev.description ? (
                      <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-av-muted">
                        {ev.description}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-av-line pt-4">
                      <span className="font-display text-lg font-semibold text-white">{LIVE_EVENT_PRICE_LABEL}</span>
                      <span className="text-[11px] uppercase tracking-wider text-av-muted">IVA inclusa</span>
                    </div>
                    <LiveEventCheckoutButton eventId={ev.id} eventTitle={ev.title} className="mt-4" />
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-av-line bg-av-bg-2/40 p-8 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#E4CE96]">
                <CalendarClock className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-white">Nessun evento in programma al momento</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-av-muted">
                Stiamo preparando i prossimi incontri. Torna a trovarci o resta sintonizzato: qui compariranno le date appena pubblicate.
              </p>
            </div>
          )}
        </section>

        {/* Eventi passati */}
        {past.length > 0 ? (
          <section className="mt-16 sm:mt-20">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Eventi passati</h2>
            <ul className="mt-6 divide-y divide-av-line overflow-hidden rounded-2xl border border-av-line bg-av-surface/50">
              {past.map((ev) => (
                <li key={ev.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{ev.title}</p>
                    <p className="mt-1 text-xs text-av-muted">{formatRomeDateTime(ev.startsAtIso)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-muted">
                    <History className="h-3.5 w-3.5" aria-hidden="true" />
                    Concluso
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-av-muted">
              Hai partecipato? Gli eventuali replay disponibili sono nella tua{' '}
              <Link href="/area-membri/biglietti" className="link-underline text-av-green">
                area membri
              </Link>
              .
            </p>
          </section>
        ) : null}

        {!hasEvents ? null : (
          <div className="mx-auto mt-14 flex max-w-2xl items-start gap-2 rounded-2xl border border-av-line bg-av-bg-2/40 px-4 py-3 text-xs leading-relaxed text-av-muted">
            <Info className="mt-0.5 h-4 w-4 flex-none text-[#C9A961]" aria-hidden="true" />
            <p>
              Gli eventi hanno finalità formativa e informativa e non costituiscono consulenza
              finanziaria. Hai già un biglietto?{' '}
              <Link href="/area-membri/biglietti" className="link-underline text-av-green">
                Vai a «I miei biglietti»
              </Link>
              <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
