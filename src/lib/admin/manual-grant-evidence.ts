/**
 * Valutazione dell'evidenza di pagamento per gli accessi manuali.
 *
 * Modulo PURO: nessun import a runtime, nessun accesso a rete o database.
 * Riceve i "fatti" già normalizzati dal livello che interroga Stripe, così da
 * poter essere verificato con dati sintetici.
 */

export type EvidenceKind =
  | 'STRIPE_CHECKOUT_SESSION'
  | 'STRIPE_PAYMENT_INTENT'
  | 'STRIPE_INVOICE'
  | 'OFF_PLATFORM';

/** Fatti normalizzati estratti dall'oggetto Stripe verificato lato server. */
export interface EvidenceFacts {
  reference: string;
  /** Stato dell'oggetto: payment_status della sessione, status del PI, status della fattura. */
  status: string | null;
  amountPaid: number | null;
  currency: string | null;
  paidAt: string | null;
  customerEmail: string | null;
  priceId: string | null;
  metadata: Record<string, string>;
  /** Somma già rimborsata in centesimi. `null` se non determinabile. */
  refundedAmount: number | null;
  /** Contestazione (chargeback) in corso. `null` se non determinabile. */
  disputed: boolean | null;
  chargeId: string | null;
  /** Identificativo della Purchase esistente collegata all'evidenza, se rilevata in sola lettura. */
  linkedPurchaseId?: string | null;
}

export interface EvidenceIssue {
  code: string;
  message: string;
  blocking: boolean;
}

export interface EvidenceVerdict {
  /** true solo se non ci sono problemi bloccanti. */
  ok: boolean;
  issues: EvidenceIssue[];
  blockingIssues: EvidenceIssue[];
  /** Codici che l'amministratore deve confermare esplicitamente per procedere. */
  requiresAcknowledgment: string[];
  normalized: {
    reference: string;
    amountTotal: number | null;
    currency: string | null;
    paidAt: string | null;
    customerEmail: string | null;
    chargeId: string | null;
    linkedPurchaseId: string | null;
  };
}

export interface EvaluateEvidenceInput {
  kind: Exclude<EvidenceKind, 'OFF_PLATFORM'>;
  facts: EvidenceFacts;
  expectedSlug: string;
  expectedAmountInCents: number | null;
  expectedCurrency: string;
  expectedPriceId: string | null;
}

const PAID_STATUSES: Record<Exclude<EvidenceKind, 'OFF_PLATFORM'>, string[]> = {
  STRIPE_CHECKOUT_SESSION: ['paid'],
  STRIPE_PAYMENT_INTENT: ['succeeded'],
  STRIPE_INVOICE: ['paid'],
};

export const CONSENT_VERSION_PATTERN = /^v[0-9]+(\.[0-9]+)?$/;

export function isValidConsentVersion(value: unknown): value is string {
  return typeof value === 'string' && CONSENT_VERSION_PATTERN.test(value);
}

function issue(code: string, message: string, blocking: boolean): EvidenceIssue {
  return { code, message, blocking };
}

/**
 * Confronta i fatti verificati con il prodotto e i valori attesi.
 * Non effettua chiamate: riceve solo dati già letti.
 */
export function evaluateEvidence(input: EvaluateEvidenceInput): EvidenceVerdict {
  const { facts, expectedSlug, expectedAmountInCents, expectedCurrency, expectedPriceId } = input;
  const issues: EvidenceIssue[] = [];

  const reference = (facts.reference ?? '').trim();
  if (reference.length === 0) {
    issues.push(issue('EVIDENCE_MISSING_REFERENCE', 'Riferimento di pagamento mancante.', true));
  }

  const allowedStatuses = PAID_STATUSES[input.kind];
  const status = (facts.status ?? '').toLowerCase();
  if (!status) {
    issues.push(
      issue('EVIDENCE_STATUS_MISSING', 'Stato del pagamento non determinabile.', true),
    );
  } else if (!allowedStatuses.includes(status)) {
    issues.push(
      issue(
        'EVIDENCE_NOT_PAID',
        `Il pagamento non risulta completato (stato rilevato: ${facts.status}).`,
        true,
      ),
    );
  }

  if (!facts.currency) {
    issues.push(issue('EVIDENCE_CURRENCY_MISSING', 'Valuta non determinabile.', true));
  } else if (facts.currency.toUpperCase() !== expectedCurrency.toUpperCase()) {
    issues.push(
      issue(
        'EVIDENCE_CURRENCY_MISMATCH',
        `Valuta non coerente: attesa ${expectedCurrency}, rilevata ${facts.currency}.`,
        true,
      ),
    );
  }

  if (facts.refundedAmount === null) {
    issues.push(
      issue(
        'EVIDENCE_REFUND_STATUS_UNKNOWN',
        'Impossibile verificare automaticamente l\u2019assenza di rimborsi: richiesta conferma manuale.',
        false,
      ),
    );
  } else if (facts.refundedAmount > 0) {
    issues.push(
      issue(
        'EVIDENCE_REFUNDED',
        `Pagamento rimborsato (importo rimborsato: ${facts.refundedAmount}).`,
        true,
      ),
    );
  }

  if (facts.disputed === true) {
    issues.push(issue('EVIDENCE_DISPUTED', 'Pagamento contestato (chargeback in corso).', true));
  } else if (facts.disputed === null) {
    issues.push(
      issue(
        'EVIDENCE_DISPUTE_STATUS_UNKNOWN',
        'Impossibile verificare automaticamente l\u2019assenza di contestazioni: richiesta conferma manuale.',
        false,
      ),
    );
  }

  const metadataSlug = typeof facts.metadata?.product_slug === 'string'
    ? facts.metadata.product_slug.trim()
    : '';
  if (metadataSlug) {
    if (metadataSlug !== expectedSlug) {
      issues.push(
        issue(
          'EVIDENCE_PRODUCT_MISMATCH',
          `Il pagamento risulta riferito al prodotto "${metadataSlug}", non a "${expectedSlug}".`,
          true,
        ),
      );
    }
  } else {
    issues.push(
      issue(
        'EVIDENCE_PRODUCT_UNVERIFIED',
        'Il pagamento non riporta il riferimento di prodotto: richiesta conferma manuale.',
        false,
      ),
    );
  }

  if (expectedPriceId && facts.priceId) {
    if (facts.priceId !== expectedPriceId) {
      issues.push(
        issue(
          'EVIDENCE_PRICE_MISMATCH',
          'Il prezzo del pagamento non corrisponde a quello configurato per il prodotto.',
          true,
        ),
      );
    }
  } else if (expectedPriceId && !facts.priceId) {
    issues.push(
      issue(
        'EVIDENCE_PRICE_UNVERIFIED',
        'Prezzo del pagamento non determinabile: richiesta conferma manuale.',
        false,
      ),
    );
  }

  if (facts.amountPaid === null) {
    issues.push(issue('EVIDENCE_AMOUNT_MISSING', 'Importo pagato non determinabile.', true));
  } else if (expectedAmountInCents !== null && facts.amountPaid !== expectedAmountInCents) {
    issues.push(
      issue(
        'EVIDENCE_AMOUNT_MISMATCH',
        `Importo non allineato al listino: atteso ${formatCents(expectedAmountInCents)}, pagato ${formatCents(facts.amountPaid)}.`,
        false,
      ),
    );
  }

  const blockingIssues = issues.filter((i) => i.blocking);
  const requiresAcknowledgment = issues.filter((i) => !i.blocking).map((i) => i.code);

  return {
    ok: blockingIssues.length === 0,
    issues,
    blockingIssues,
    requiresAcknowledgment,
    normalized: {
      reference,
      amountTotal: facts.amountPaid,
      currency: facts.currency,
      paidAt: facts.paidAt,
      customerEmail: facts.customerEmail,
      chargeId: facts.chargeId,
      linkedPurchaseId: facts.linkedPurchaseId ?? null,
    },
  };
}

export const OFF_PLATFORM_REQUIRED_NOTE_LENGTH = 20;

export interface OffPlatformInput {
  reference: string;
  note: string | null | undefined;
  attestation: boolean;
}

/**
 * L'evidenza off-platform non è verificabile automaticamente:
 * richiede attestazione esplicita e una nota descrittiva.
 */
export function evaluateOffPlatformEvidence(input: OffPlatformInput): EvidenceVerdict {
  const issues: EvidenceIssue[] = [];
  const reference = (input.reference ?? '').trim();
  const note = (input.note ?? '').trim();

  if (reference.length === 0) {
    issues.push(issue('EVIDENCE_MISSING_REFERENCE', 'Riferimento di pagamento mancante.', true));
  }
  if (!input.attestation) {
    issues.push(
      issue(
        'EVIDENCE_ATTESTATION_REQUIRED',
        'È necessaria l\u2019attestazione dell\u2019amministratore sul pagamento ricevuto.',
        true,
      ),
    );
  }
  if (note.length < OFF_PLATFORM_REQUIRED_NOTE_LENGTH) {
    issues.push(
      issue(
        'EVIDENCE_NOTE_REQUIRED',
        `Descrivi l\u2019evidenza verificata (almeno ${OFF_PLATFORM_REQUIRED_NOTE_LENGTH} caratteri).`,
        true,
      ),
    );
  }

  const blockingIssues = issues.filter((i) => i.blocking);
  return {
    ok: blockingIssues.length === 0,
    issues,
    blockingIssues,
    requiresAcknowledgment: issues.filter((i) => !i.blocking).map((i) => i.code),
    normalized: {
      reference,
      amountTotal: null,
      currency: null,
      paidAt: null,
      customerEmail: null,
      chargeId: null,
      linkedPurchaseId: null,
    },
  };
}

export interface MirroredConsent {
  source: 'STRIPE_METADATA' | 'NONE';
  termsVersion: string | null;
  digitalWithdrawalVersion: string | null;
  acceptedAt: string | null;
}

/** Copia i consensi registrati nei metadata della sessione di checkout Stripe. */
export function mirrorConsentFromMetadata(metadata: Record<string, string> | null | undefined): MirroredConsent {
  const meta = metadata ?? {};
  const termsVersion = typeof meta.consent_terms_v === 'string' && isValidConsentVersion(meta.consent_terms_v)
    ? meta.consent_terms_v
    : null;
  const digitalWithdrawalVersion =
    typeof meta.consent_digital_withdrawal_v === 'string' && isValidConsentVersion(meta.consent_digital_withdrawal_v)
      ? meta.consent_digital_withdrawal_v
      : null;
  const rawAcceptedAt = typeof meta.consent_at === 'string' ? meta.consent_at : null;
  const acceptedAt =
    rawAcceptedAt && !Number.isNaN(new Date(rawAcceptedAt).getTime()) ? rawAcceptedAt : null;

  if (!termsVersion && !digitalWithdrawalVersion && !acceptedAt) {
    return { source: 'NONE', termsVersion: null, digitalWithdrawalVersion: null, acceptedAt: null };
  }
  return { source: 'STRIPE_METADATA', termsVersion, digitalWithdrawalVersion, acceptedAt };
}

export function formatCents(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}
