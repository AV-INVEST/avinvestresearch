/**
 * Tipi e costanti condivisi tra le server action degli accessi manuali e i
 * componenti client del pannello /admin/accessi.
 *
 * Non contiene direttive 'use server': può essere importato anche dal bundle client.
 */

export const COMPLIMENTARY_REASONS = [
  { value: 'amico', label: 'Amico' },
  { value: 'collaboratore', label: 'Collaboratore' },
  { value: 'tester', label: 'Tester' },
  { value: 'promozione', label: 'Promozione' },
  { value: 'altro', label: 'Altro' },
] as const;

export type ComplimentaryReason = (typeof COMPLIMENTARY_REASONS)[number]['value'];

export const EVIDENCE_TYPE_OPTIONS = [
  { value: 'STRIPE_CHECKOUT_SESSION', label: 'Checkout Session Stripe' },
  { value: 'STRIPE_PAYMENT_INTENT', label: 'PaymentIntent Stripe' },
  { value: 'STRIPE_INVOICE', label: 'Fattura Stripe (bonifico)' },
  { value: 'OFF_PLATFORM', label: 'Pagamento off-platform (attestazione)' },
] as const;

export type EvidenceTypeValue = (typeof EVIDENCE_TYPE_OPTIONS)[number]['value'];

export const ONE_TIME_PRODUCTS = [
  { slug: 'foundations', title: 'AV Foundations' },
  { slug: 'trading-lab', title: 'AV Trading Lab' },
  { slug: 'market-lens', title: 'AV Market Lens' },
  { slug: 'trading-starter', title: 'AV Trading Starter' },
] as const;

export interface ManualGrantRow {
  id: string;
  userEmail: string;
  productSlug: string;
  productTitle: string;
  kind: 'PAID_VERIFIED' | 'COMPLIMENTARY';
  status: 'ACTIVE' | 'REVOKED';
  evidenceType: string | null;
  evidenceReference: string | null;
  evidenceAmountTotal: number | null;
  evidenceCurrency: string | null;
  evidenceCustomerEmail: string | null;
  linkedPurchaseId: string | null;
  consentSource: string;
  consentTermsVersion: string | null;
  consentDigitalWithdrawalVersion: string | null;
  consentAcceptedAt: string | null;
  grantedBy: string;
  grantedAt: string;
  reason: string | null;
  reasonNote: string | null;
  adminNote: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
  warnings: string[];
}

export interface ManualGrantEventRow {
  id: string;
  action: string;
  actorEmail: string;
  targetEmail: string;
  productSlug: string;
  kind: string | null;
  detail: string;
  createdAt: string;
}
