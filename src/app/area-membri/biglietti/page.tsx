import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listMemberLiveEventTickets, type MemberLiveEventTicket } from '@/lib/live-events/member-tickets';
import { LIVE_EVENT_PRICE_LABEL, formatRomeDateTime } from '@/lib/admin/live-event-shared';
import RefreshPageButton from '@/components/payment/RefreshPageButton';
import {
  ArrowRight,
  CalendarClock,
  Clock,
  History,
  Info,
  LifeBuoy,
  RotateCcw,
  Ticket,
  Video,
  XCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'I miei biglietti',
  description: 'I biglietti degli Eventi Live Premium acquistati con il tuo account.',
  alternates: { canonical: '/area-membri/biglietti' },
};

const STATUS_META: Record<
  MemberLiveEventTicket['status'],
  { label: string; className: string; Icon: typeof Clock }
> = {
  succeeded: {
    label: 'Valido',
    className: 'border-av-green-deep/40 bg-av-green/10 text-av-green',
    Icon: Ticket,
  },
  pending: {
    label: 'In attesa di conferma',
    className: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300',
    Icon: Clock,
  },
  failed: {
    label: 'Non completato',
    className: 'border-av-line bg-av-bg-2/60 text-av-muted',
    Icon: XCircle,
  },
  refunded: {
    label: 'Rimborsato',
    className: 'border-av-line bg-av-bg-2/60 text-av-muted',
    Icon: RotateCcw,
  },
};

function StatusBadge({ status }: { status: MemberLiveEventTicket['status'] }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function TicketActions({ ticket }: { ticket: MemberLiveEventTicket }) {
  if (ticket.meetUrl) {
    return (
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <a
          href={ticket.meetUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-rc-primary shadow-glow-gold-sm w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Video className="h-4 w-4" aria-hidden="true" />
          Entra su Google Meet
        </a>
        {ticket.replayUrl ? (
          <a
            href={ticket.replayUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost w-full items-center justify-center gap-2 sm:w-auto"
          >
            <History className="h-4 w-4 text-av-green" aria-hidden="true" />
            Guarda il replay
          </a>
        ) : null}
      </div>
    );
  }

  if (ticket.status === 'succeeded' && ticket.meetAvailableFromIso) {
    return (
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-av-line bg-av-bg-2/60 px-3 py-2.5 text-xs leading-relaxed text-av-muted">
        <Clock className="mt-0.5 h-4 w-4 flex-none text-[#C9A961]" aria-hidden="true" />
        <span>
          Il pulsante per entrare su Google Meet sarà disponibile qui a partire da{' '}
          <strong className="text-white">{formatRomeDateTime(ticket.meetAvailableFromIso)}</strong> (60 minuti prima dell’inizio).
        </span>
      </div>
    );
  }

  if (ticket.status === 'pending') {
    return (
      <div className="mt-4 space-y-3 rounded-xl border border-yellow-400/40 bg-yellow-400/[0.04] px-3 py-2.5 text-xs leading-relaxed text-yellow-100/85">
        <p>
          Pagamento in fase di conferma. L’accesso viene abilitato solo dopo la verifica del pagamento.
        </p>
        <RefreshPageButton label="AGGIORNA STATO" variant="yellow" compact />
      </div>
    );
  }

  return null;
}

function TicketCard({ ticket }: { ticket: MemberLiveEventTicket }) {
  return (
    <li className="rounded-2xl border border-av-line bg-av-surface/60 p-4 backdrop-blur-xl sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E4CE96]">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatRomeDateTime(ticket.startsAtIso)}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold text-white">{ticket.eventTitle}</h3>
          {ticket.eventDescription ? (
            <p className="mt-1 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-av-muted">
              {ticket.eventDescription}
            </p>
          ) : null}
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <TicketActions ticket={ticket} />
    </li>
  );
}

export default async function BigliettiPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/area-membri/biglietti'));
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const checkoutParam = typeof resolvedParams?.checkout === 'string' ? resolvedParams.checkout : null;

  const { upcoming, past, hasAny } = await listMemberLiveEventTickets(session.user.email);

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#C9A961]/40 bg-[#C9A961]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E4CE96]">
          <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
          Eventi Live
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">I miei biglietti</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-av-muted sm:text-base">
          Qui trovi i biglietti acquistati, lo stato di ciascuno e l’accesso agli eventi su Google Meet.
        </p>
      </div>

      {checkoutParam === 'success' ? (
        <div className="flex items-start gap-2 rounded-2xl border border-av-green-deep/40 bg-av-green/[0.04] px-4 py-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 flex-none text-av-green" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-semibold text-av-green">Acquisto completato</p>
            <p className="mt-1 leading-relaxed text-av-muted/90">
              Se il pagamento risulta ancora in elaborazione, usa «Aggiorna stato» o ricarica la pagina per verificare l’attivazione del biglietto.
            </p>
          </div>
        </div>
      ) : null}

      {!hasAny ? (
        <div className="rounded-2xl border border-dashed border-av-line bg-av-bg-2/40 p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#E4CE96]">
            <Ticket className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-white">Non hai ancora biglietti</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-av-muted">
            Scopri i prossimi eventi formativi online e acquista il tuo biglietto a {LIVE_EVENT_PRICE_LABEL}.
          </p>
          <Link href="/eventi" className="btn-rc-primary shadow-glow-gold-sm mt-5 inline-flex items-center justify-center gap-2">
            Scopri gli eventi
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <section>
            <h2 className="font-display text-lg font-semibold text-white sm:text-xl">Prossimi eventi</h2>
            {upcoming.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {upcoming.map((t) => (
                  <TicketCard key={t.id} ticket={t} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-av-line bg-av-bg-2/40 p-5 text-sm text-av-muted">
                Nessun evento futuro tra i tuoi biglietti.
              </p>
            )}
          </section>

          {past.length > 0 ? (
            <section>
              <h2 className="font-display text-lg font-semibold text-white sm:text-xl">Eventi passati</h2>
              <ul className="mt-4 space-y-4">
                {past.map((t) => (
                  <TicketCard key={t.id} ticket={t} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <div className="flex items-start gap-2 rounded-2xl border border-av-line bg-av-bg-2/40 px-4 py-3 text-xs leading-relaxed text-av-muted">
        <LifeBuoy className="mt-0.5 h-4 w-4 flex-none text-av-green" aria-hidden="true" />
        <p>
          Il biglietto è personale e non trasferibile. Per rimborsi, cancellazioni o rinvii degli
          eventi consulta i{' '}
          <Link href="/termini" className="link-underline text-av-green" target="_blank" rel="noreferrer">
            Termini e condizioni
          </Link>{' '}
          o scrivi all’assistenza.
        </p>
      </div>
    </div>
  );
}
