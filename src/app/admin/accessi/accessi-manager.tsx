'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Gift,
  History,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Undo2,
} from 'lucide-react';
import {
  createComplimentaryManualGrant,
  createVerifiedManualGrant,
  reactivateManualGrant,
  recheckManualGrantEvidence,
  revokeManualGrant,
  type ManualGrantActionResult,
} from '@/lib/admin/manual-grant-admin';
import type { ManualGrantEventRow, ManualGrantRow } from '@/lib/admin/manual-grant-shared';

interface Props {
  enabled: boolean;
  grants: ManualGrantRow[];
  events: ManualGrantEventRow[];
  grantsError: string | null;
  eventsError: string | null;
  products: { slug: string; title: string }[];
  reasons: { value: string; label: string }[];
  evidenceTypes: { value: string; label: string }[];
}

type Tab = 'paid' | 'gift' | 'log';

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return iso.slice(0, 16).replace('T', ' ');
}

function ResultBanner({ result }: { result: ManualGrantActionResult | null }) {
  if (!result) return null;
  if (result.ok) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-av-green">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {result.message ?? 'Operazione completata.'}
      </p>
    );
  }
  return (
    <div className="space-y-1">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-300">
        <AlertCircle className="h-3.5 w-3.5" />
        {result.error ?? 'Operazione non riuscita.'}
      </p>
      {result.details && result.details.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-[11px] text-red-200/80">
          {result.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function AccessiManager({
  enabled,
  grants,
  events,
  grantsError,
  eventsError,
  products,
  reasons,
  evidenceTypes,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('paid');
  const [isPending, startTransition] = useTransition();
  const [paidResult, setPaidResult] = useState<ManualGrantActionResult | null>(null);
  const [giftResult, setGiftResult] = useState<ManualGrantActionResult | null>(null);
  const [rowResult, setRowResult] = useState<ManualGrantActionResult | null>(null);

  // --- Verifica pagamento ---
  const [paidEmail, setPaidEmail] = useState('');
  const [paidSlug, setPaidSlug] = useState(products[0]?.slug ?? '');
  const [evidenceType, setEvidenceType] = useState('STRIPE_CHECKOUT_SESSION');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [offPlatformNote, setOffPlatformNote] = useState('');
  const [offPlatformAttestation, setOffPlatformAttestation] = useState(false);
  const [paidAdminNote, setPaidAdminNote] = useState('');
  const [ackRequired, setAckRequired] = useState<{ code: string; message: string }[]>([]);
  const [acked, setAcked] = useState<Record<string, boolean>>({});

  // --- Accesso omaggio ---
  const [giftEmail, setGiftEmail] = useState('');
  const [giftSlugs, setGiftSlugs] = useState<string[]>([]);
  const [giftReason, setGiftReason] = useState(reasons[0]?.value ?? 'amico');
  const [giftReasonNote, setGiftReasonNote] = useState('');
  const [giftAdminNote, setGiftAdminNote] = useState('');
  const [giftConfirmed, setGiftConfirmed] = useState(false);
  const [giftTerms, setGiftTerms] = useState(false);

  // --- Revoca ---
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const isOffPlatform = evidenceType === 'OFF_PLATFORM';

  function submitPaid() {
    startTransition(async () => {
      const acknowledgment = ackRequired
        .filter((item) => acked[item.code])
        .map((item) => item.code);
      const result = await createVerifiedManualGrant({
        targetEmail: paidEmail,
        productSlug: paidSlug,
        evidenceType: evidenceType as
          | 'STRIPE_CHECKOUT_SESSION'
          | 'STRIPE_PAYMENT_INTENT'
          | 'STRIPE_INVOICE'
          | 'OFF_PLATFORM',
        evidenceReference,
        acknowledgment,
        offPlatformNote,
        offPlatformAttestation,
        adminNote: paidAdminNote,
      });
      setPaidResult(result);
      if (result.ok) {
        setAckRequired([]);
        setAcked({});
        setEvidenceReference('');
        setOffPlatformNote('');
        setOffPlatformAttestation(false);
        setPaidAdminNote('');
        router.refresh();
        return;
      }
      if (result.requiresAcknowledgment && result.requiresAcknowledgment.length > 0) {
        const details = result.details ?? [];
        setAckRequired(
          result.requiresAcknowledgment.map((code, index) => ({
            code,
            message: details[index] ?? code,
          })),
        );
      }
    });
  }

  function submitGift() {
    startTransition(async () => {
      const result = await createComplimentaryManualGrant({
        targetEmail: giftEmail,
        productSlugs: giftSlugs,
        reason: giftReason,
        reasonNote: giftReasonNote,
        adminNote: giftAdminNote,
        confirmed: giftConfirmed,
        termsAcknowledged: giftTerms,
      });
      setGiftResult(result);
      if (result.ok) {
        setGiftSlugs([]);
        setGiftReasonNote('');
        setGiftAdminNote('');
        setGiftConfirmed(false);
        setGiftTerms(false);
        router.refresh();
      }
    });
  }

  function toggleGiftSlug(slug: string) {
    setGiftSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
    );
  }

  function runRowAction(action: () => Promise<ManualGrantActionResult>) {
    startTransition(async () => {
      const result = await action();
      setRowResult(result);
      if (result.ok) {
        setRevokeTarget(null);
        setRevokeReason('');
        router.refresh();
      }
    });
  }

  const inputClass =
    'w-full rounded-xl border border-av-line bg-av-bg-2/60 px-3 py-2 text-sm text-white placeholder:text-av-muted/60 focus:border-av-green-deep/60 focus:outline-none';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-av-muted';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-av-green-deep/60 bg-av-green/10 text-av-green">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold text-white sm:text-xl">
              Accessi manuali
            </h1>
            <p className="text-xs text-av-muted">
              Attribuzione manuale degli accessi ai prodotti una tantum, con audit e revoca.
            </p>
          </div>
        </div>

        {!enabled ? (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/[0.06] p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-200">
              <ShieldOff className="h-4 w-4" />
              Accessi manuali disattivati
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-100/80">
              La funzione è protetta dal kill-switch <code>MANUAL_GRANTS_ENABLED</code> (valore
              predefinito: <code>false</code>). Finché è disattivata, i grant non vengono letti dal
              database e nessun accesso viene modificato. Imposta la variabile a{' '}
              <code>true</code> per attivare la modalità.
            </p>
          </div>
        ) : null}

        <nav className="mt-4 flex flex-wrap gap-2 border-t border-av-line pt-4">
          <button
            type="button"
            onClick={() => setTab('paid')}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              tab === 'paid'
                ? 'border-av-green-deep/60 bg-av-green/10 text-white'
                : 'border-av-line bg-av-bg-2/50 text-av-muted hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-av-green" />
            Verifica pagamento
          </button>
          <button
            type="button"
            onClick={() => setTab('gift')}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              tab === 'gift'
                ? 'border-av-green-deep/60 bg-av-green/10 text-white'
                : 'border-av-line bg-av-bg-2/50 text-av-muted hover:text-white'
            }`}
          >
            <Gift className="h-4 w-4 text-av-green" />
            Accesso omaggio
          </button>
          <button
            type="button"
            onClick={() => setTab('log')}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              tab === 'log'
                ? 'border-av-green-deep/60 bg-av-green/10 text-white'
                : 'border-av-line bg-av-bg-2/50 text-av-muted hover:text-white'
            }`}
          >
            <History className="h-4 w-4 text-av-green" />
            Registro
          </button>
        </nav>
      </div>

      {tab === 'paid' ? (
        <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-white">
              Verifica pagamento e attiva accesso
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-av-muted">
              Il pagamento viene verificato in sola lettura tramite API Stripe (importo, valuta,
              prodotto, rimborsi e contestazioni). Non viene creata alcuna transazione o Purchase.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="paid-email">
                Email Google destinatario
              </label>
              <input
                id="paid-email"
                type="email"
                value={paidEmail}
                onChange={(event) => setPaidEmail(event.target.value)}
                placeholder="nome@example.com"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="paid-slug">
                Prodotto
              </label>
              <select
                id="paid-slug"
                value={paidSlug}
                onChange={(event) => setPaidSlug(event.target.value)}
                className={`mt-1.5 ${inputClass}`}
              >
                {products.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="paid-evidence-type">
                Tipo evidenza
              </label>
              <select
                id="paid-evidence-type"
                value={evidenceType}
                onChange={(event) => setEvidenceType(event.target.value)}
                className={`mt-1.5 ${inputClass}`}
              >
                {evidenceTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="paid-ref">
                Riferimento pagamento (ID Stripe)
              </label>
              <input
                id="paid-ref"
                type="text"
                value={evidenceReference}
                onChange={(event) => setEvidenceReference(event.target.value)}
                placeholder="cs_... / pi_... / in_..."
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
          </div>

          {isOffPlatform ? (
            <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3">
              <p className="text-[11px] leading-relaxed text-amber-100/80">
                L&apos;evidenza off-platform non è verificabile automaticamente: richiede una nota
                descrittiva e l&apos;attestazione esplicita dell&apos;amministratore.
              </p>
              <div>
                <label className={labelClass} htmlFor="paid-off-note">
                  Nota evidenza (min. 20 caratteri)
                </label>
                <textarea
                  id="paid-off-note"
                  value={offPlatformNote}
                  onChange={(event) => setOffPlatformNote(event.target.value)}
                  rows={3}
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-white">
                <input
                  type="checkbox"
                  checked={offPlatformAttestation}
                  onChange={(event) => setOffPlatformAttestation(event.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                Attesto di aver verificato personalmente l&apos;avvenuto pagamento.
              </label>
            </div>
          ) : null}

          <div>
            <label className={labelClass} htmlFor="paid-note">
              Nota amministratore (opzionale)
            </label>
            <textarea
              id="paid-note"
              value={paidAdminNote}
              onChange={(event) => setPaidAdminNote(event.target.value)}
              rows={2}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          {ackRequired.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3">
              <p className="text-xs font-semibold text-amber-200">
                Conferme richieste prima di procedere
              </p>
              {ackRequired.map((item) => (
                <label key={item.code} className="flex items-start gap-2 text-[11px] text-white">
                  <input
                    type="checkbox"
                    checked={Boolean(acked[item.code])}
                    onChange={(event) =>
                      setAcked((prev) => ({ ...prev, [item.code]: event.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>
                    {item.message} <span className="text-av-muted">({item.code})</span>
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submitPaid}
              disabled={isPending || !enabled}
              className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
              Verifica e attiva accesso
            </button>
            <ResultBanner result={paidResult} />
          </div>
        </div>
      ) : null}

      {tab === 'gift' ? (
        <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-white">Accesso omaggio</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-av-muted">
              Modalità indipendente dai pagamenti. Non viene richiesto alcun pagamento Stripe e non
              viene creata alcuna transazione o Purchase: il grant è registrato come{' '}
              <code>COMPLIMENTARY</code> e separato dalle vendite reali.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="gift-email">
                Email Google destinatario
              </label>
              <input
                id="gift-email"
                type="email"
                value={giftEmail}
                onChange={(event) => setGiftEmail(event.target.value)}
                placeholder="nome@example.com"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="gift-reason">
                Motivazione
              </label>
              <select
                id="gift-reason"
                value={giftReason}
                onChange={(event) => setGiftReason(event.target.value)}
                className={`mt-1.5 ${inputClass}`}
              >
                {reasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className={labelClass}>Prodotti da sbloccare</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {products.map((product) => (
                <label
                  key={product.slug}
                  className="flex items-center gap-2 rounded-xl border border-av-line bg-av-bg-2/50 px-3 py-2 text-sm text-white"
                >
                  <input
                    type="checkbox"
                    checked={giftSlugs.includes(product.slug)}
                    onChange={() => toggleGiftSlug(product.slug)}
                    className="h-4 w-4"
                  />
                  {product.title}
                </label>
              ))}
            </div>
          </fieldset>

          {giftReason === 'altro' ? (
            <div>
              <label className={labelClass} htmlFor="gift-reason-note">
                Specifica motivazione (min. 5 caratteri)
              </label>
              <input
                id="gift-reason-note"
                type="text"
                value={giftReasonNote}
                onChange={(event) => setGiftReasonNote(event.target.value)}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
          ) : null}

          <div>
            <label className={labelClass} htmlFor="gift-note">
              Nota amministratore (opzionale)
            </label>
            <textarea
              id="gift-note"
              value={giftAdminNote}
              onChange={(event) => setGiftAdminNote(event.target.value)}
              rows={2}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2 text-xs text-white">
              <input
                type="checkbox"
                checked={giftTerms}
                onChange={(event) => setGiftTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              Confermo di aver informato il destinatario dell&apos;applicabilità dei Termini e
              Condizioni e della Privacy Policy.
            </label>
            <label className="flex items-start gap-2 text-xs text-white">
              <input
                type="checkbox"
                checked={giftConfirmed}
                onChange={(event) => setGiftConfirmed(event.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              Confermo esplicitamente l&apos;attivazione dell&apos;accesso omaggio.
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submitGift}
              disabled={isPending || !enabled}
              className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              Attiva accesso omaggio
            </button>
            <ResultBanner result={giftResult} />
          </div>
        </div>
      ) : null}

      {tab === 'log' ? (
        <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5">
          <h2 className="font-display text-base font-semibold text-white">Registro audit</h2>
          <p className="mt-1 text-[11px] text-av-muted">
            Registro append-only delle azioni sugli accessi manuali.
          </p>
          {eventsError ? (
            <p className="mt-3 text-xs text-red-300">{eventsError}</p>
          ) : events.length === 0 ? (
            <p className="mt-3 text-xs text-av-muted">Nessun evento registrato.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-av-muted">
                  <tr>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Azione</th>
                    <th className="py-2 pr-4">Amministratore</th>
                    <th className="py-2 pr-4">Destinatario</th>
                    <th className="py-2 pr-4">Prodotto</th>
                    <th className="py-2">Dettaglio</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {events.map((event) => (
                    <tr key={event.id} className="border-t border-av-line/60">
                      <td className="py-2 pr-4 whitespace-nowrap text-av-muted">
                        {formatDate(event.createdAt)}
                      </td>
                      <td className="py-2 pr-4 font-semibold">{event.action}</td>
                      <td className="py-2 pr-4">{event.actorEmail}</td>
                      <td className="py-2 pr-4">{event.targetEmail}</td>
                      <td className="py-2 pr-4">{event.productSlug}</td>
                      <td className="py-2 max-w-[280px] truncate text-av-muted">{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-white">Accessi attribuiti</h2>
          <ResultBanner result={rowResult} />
        </div>
        {grantsError ? (
          <p className="mt-3 text-xs text-red-300">{grantsError}</p>
        ) : grants.length === 0 ? (
          <p className="mt-3 text-xs text-av-muted">Nessun accesso manuale registrato.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-av-muted">
                <tr>
                  <th className="py-2 pr-4">Destinatario</th>
                  <th className="py-2 pr-4">Prodotto</th>
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2 pr-4">Stato</th>
                  <th className="py-2 pr-4">Evidenza</th>
                  <th className="py-2 pr-4">Concesso</th>
                  <th className="py-2">Azioni</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {grants.map((grant) => (
                  <tr key={grant.id} className="border-t border-av-line/60 align-top">
                    <td className="py-2.5 pr-4">{grant.userEmail}</td>
                    <td className="py-2.5 pr-4">{grant.productTitle}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          grant.kind === 'COMPLIMENTARY'
                            ? 'border-av-green-deep/40 bg-av-green/10 text-av-green'
                            : 'border-av-line bg-av-bg-2/60 text-av-muted'
                        }`}
                      >
                        {grant.kind === 'COMPLIMENTARY' ? 'Omaggio' : 'Pagamento verificato'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`font-semibold ${
                          grant.status === 'ACTIVE' ? 'text-av-green' : 'text-red-300'
                        }`}
                      >
                        {grant.status === 'ACTIVE' ? 'Attivo' : 'Revocato'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-av-muted">
                      {grant.evidenceType ? (
                        <span>
                          {grant.evidenceType}
                          {grant.evidenceReference ? ` · ${grant.evidenceReference}` : ''}
                        </span>
                      ) : (
                        '-'
                      )}
                      {grant.reason ? <span className="block">Motivo: {grant.reason}</span> : null}
                      {grant.warnings.length > 0 ? (
                        <span className="block text-amber-200">
                          {grant.warnings.length} avvisi
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-4 text-av-muted">
                      {formatDate(grant.grantedAt)}
                      <span className="block">{grant.grantedBy}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {grant.status === 'ACTIVE' ? (
                          revokeTarget === grant.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={revokeReason}
                                onChange={(event) => setRevokeReason(event.target.value)}
                                placeholder="Motivo revoca (opzionale)"
                                className={inputClass}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={isPending}
                                  onClick={() =>
                                    runRowAction(() => revokeManualGrant(grant.id, revokeReason))
                                  }
                                  className="!py-1.5 !px-3 text-[11px] rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 disabled:opacity-60"
                                >
                                  Conferma revoca
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRevokeTarget(null);
                                    setRevokeReason('');
                                  }}
                                  className="!py-1.5 !px-3 text-[11px] rounded-lg border border-av-line text-av-muted"
                                >
                                  Annulla
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRevokeTarget(grant.id)}
                              className="!py-1.5 !px-3 text-[11px] rounded-lg border border-red-500/30 text-red-300 inline-flex items-center gap-1"
                            >
                              <ShieldOff className="h-3.5 w-3.5" />
                              Revoca
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => runRowAction(() => reactivateManualGrant(grant.id))}
                            className="!py-1.5 !px-3 text-[11px] rounded-lg border border-av-line text-av-muted inline-flex items-center gap-1 disabled:opacity-60"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            Riattiva
                          </button>
                        )}
                        {grant.evidenceType && grant.evidenceType !== 'OFF_PLATFORM' ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => runRowAction(() => recheckManualGrantEvidence(grant.id))}
                            className="!py-1.5 !px-3 text-[11px] rounded-lg border border-av-line text-av-muted inline-flex items-center gap-1 disabled:opacity-60"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Riverifica
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
