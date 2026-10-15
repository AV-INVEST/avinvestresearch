'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { isAdminSession } from '@/lib/auth/admin';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { resolveProduct, productTitleBySlug } from '@/lib/stripe/pricing';
import { isManualGrantsEnabled } from '@/lib/entitlements-grants';
import { verifyStripeEvidence } from '@/lib/stripe/manual-grant-verification';
import { evaluateOffPlatformEvidence } from '@/lib/admin/manual-grant-evidence';
import { Prisma } from '@prisma/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REVALIDATE_PATH = '/admin/accessi';

export interface ManualGrantActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  details?: string[];
  requiresAcknowledgment?: string[];
  createdSlugs?: string[];
  skippedSlugs?: string[];
  grantId?: string;
}

type EvidenceTypeValue =
  | 'STRIPE_CHECKOUT_SESSION'
  | 'STRIPE_PAYMENT_INTENT'
  | 'STRIPE_INVOICE'
  | 'OFF_PLATFORM';

export interface VerifiedGrantInput {
  targetEmail: string;
  productSlug: string;
  evidenceType: EvidenceTypeValue;
  evidenceReference: string;
  acknowledgment?: string[];
  offPlatformNote?: string;
  offPlatformAttestation?: boolean;
  adminNote?: string;
}

export interface ComplimentaryGrantInput {
  targetEmail: string;
  productSlugs: string[];
  reason: string;
  reasonNote?: string;
  adminNote?: string;
  confirmed: boolean;
  termsAcknowledged: boolean;
}

async function requireAdminActor(): Promise<{ ok: boolean; email?: string; error?: string }> {
  try {
    const session = await auth().catch(() => null);
    if (!session?.user?.email) return { ok: false, error: 'Autenticazione richiesta.' };
    if (!isAdminSession(session as any)) return { ok: false, error: 'Accesso non autorizzato.' };
    const email = normalizeEmail(session.user.email) ?? session.user.email;
    return { ok: true, email };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Errore autorizzazione.' };
  }
}

function isEmailLike(value: string): boolean {
  return value.length > 0 && value.length <= 254 && EMAIL_RE.test(value);
}

function oneTimeProduct(slug: string) {
  const product = resolveProduct(slug);
  if (!product || product.billingMode !== 'one_time') return null;
  return product;
}

function jsonWarnings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
}

function toRow(row: {
  id: string;
  userEmail: string;
  productSlug: string;
  kind: string;
  status: string;
  evidenceType: string | null;
  evidenceReference: string | null;
  evidenceAmountTotal: number | null;
  evidenceCurrency: string | null;
  evidenceCustomerEmail: string | null;
  linkedPurchaseId: string | null;
  consentSource: string;
  consentTermsVersion: string | null;
  consentDigitalWithdrawalVersion: string | null;
  consentAcceptedAt: Date | null;
  grantedBy: string;
  grantedAt: Date;
  reason: string | null;
  reasonNote: string | null;
  adminNote: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokeReason: string | null;
  evidenceWarnings: unknown;
}) {
  return {
    id: row.id,
    userEmail: row.userEmail,
    productSlug: row.productSlug,
    productTitle: productTitleBySlug(row.productSlug),
    kind: row.kind as 'PAID_VERIFIED' | 'COMPLIMENTARY',
    status: row.status as 'ACTIVE' | 'REVOKED',
    evidenceType: row.evidenceType,
    evidenceReference: row.evidenceReference,
    evidenceAmountTotal: row.evidenceAmountTotal,
    evidenceCurrency: row.evidenceCurrency,
    evidenceCustomerEmail: row.evidenceCustomerEmail,
    linkedPurchaseId: row.linkedPurchaseId,
    consentSource: row.consentSource,
    consentTermsVersion: row.consentTermsVersion,
    consentDigitalWithdrawalVersion: row.consentDigitalWithdrawalVersion,
    consentAcceptedAt: row.consentAcceptedAt ? row.consentAcceptedAt.toISOString() : null,
    grantedBy: row.grantedBy,
    grantedAt: row.grantedAt.toISOString(),
    reason: row.reason,
    reasonNote: row.reasonNote,
    adminNote: row.adminNote,
    verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
    verifiedBy: row.verifiedBy,
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
    revokedBy: row.revokedBy,
    revokeReason: row.revokeReason,
    warnings: jsonWarnings(row.evidenceWarnings),
  };
}

export async function listManualGrants(): Promise<{
  ok: boolean;
  error?: string;
  grants: ReturnType<typeof toRow>[];
}> {
  const guard = await requireAdminActor();
  if (!guard.ok) return { ok: false, error: guard.error, grants: [] };
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non configurato.', grants: [] };
  try {
    const rows = await prisma.manualGrant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return { ok: true, grants: rows.map(toRow) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore caricamento accessi.',
      grants: [],
    };
  }
}

export async function listManualGrantEvents(): Promise<{
  ok: boolean;
  error?: string;
  events: Array<{
    id: string;
    action: string;
    actorEmail: string;
    targetEmail: string;
    productSlug: string;
    kind: string | null;
    detail: string;
    createdAt: string;
  }>;
}> {
  const guard = await requireAdminActor();
  if (!guard.ok) return { ok: false, error: guard.error, events: [] };
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non configurato.', events: [] };
  try {
    const rows = await prisma.manualGrantEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return {
      ok: true,
      events: rows.map((row) => ({
        id: row.id,
        action: row.action,
        actorEmail: row.actorEmail,
        targetEmail: row.targetEmail,
        productSlug: row.productSlug,
        kind: row.kind,
        detail: row.detail ? JSON.stringify(row.detail) : '',
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore caricamento registro.',
      events: [],
    };
  }
}

export async function createVerifiedManualGrant(
  input: VerifiedGrantInput,
): Promise<ManualGrantActionResult> {
  const guard = await requireAdminActor();
  if (!guard.ok) return { ok: false, error: guard.error };
  const actor = guard.email as string;
  if (!isManualGrantsEnabled()) {
    return {
      ok: false,
      error: 'Accessi manuali disattivati. Imposta MANUAL_GRANTS_ENABLED=true per procedere.',
    };
  }
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non configurato.' };

  const targetEmail = normalizeEmail(input.targetEmail);
  if (!targetEmail || !isEmailLike(targetEmail)) {
    return { ok: false, error: 'Inserisci un indirizzo email valido del destinatario.' };
  }

  const product = oneTimeProduct(input.productSlug);
  if (!product) return { ok: false, error: 'Seleziona un prodotto una tantum valido.' };

  const evidenceReference = (input.evidenceReference ?? '').trim();
  const acknowledged = new Set((input.acknowledgment ?? []).map((code) => String(code)));

  let canonicalBase: string;
  let snapshot: Record<string, unknown>;
  let warnings: string[] = [];
  let consentSource: 'STRIPE_METADATA' | 'ADMIN_ATTESTATION' | 'NONE' = 'NONE';
  let consentTermsVersion: string | null = null;
  let consentDigitalWithdrawalVersion: string | null = null;
  let consentAcceptedAt: Date | null = null;
  let amountTotal: number | null = null;
  let currency: string | null = null;
  let paidAt: Date | null = null;
  let customerEmail: string | null = null;

  if (input.evidenceType === 'OFF_PLATFORM') {
    const verdict = evaluateOffPlatformEvidence({
      reference: evidenceReference,
      note: input.offPlatformNote,
      attestation: input.offPlatformAttestation === true,
    });
    if (!verdict.ok) {
      return {
        ok: false,
        error: 'Verifica non superata.',
        details: verdict.blockingIssues.map((issue) => issue.message),
      };
    }
    canonicalBase = `OFF_PLATFORM:${evidenceReference}`;
    snapshot = {
      type: 'off_platform',
      reference: evidenceReference,
      note: (input.offPlatformNote ?? '').trim(),
      attestedAt: new Date().toISOString(),
    };
    consentSource = 'ADMIN_ATTESTATION';
    consentAcceptedAt = new Date();
    warnings = [
      'Evidenza off-platform: verificata tramite attestazione manuale, non verificabile automaticamente su Stripe.',
    ];
  } else {
    const result = await verifyStripeEvidence({
      kind: input.evidenceType,
      reference: evidenceReference,
      expectedSlug: product.slug,
    });
    if (!result.verdict) {
      return {
        ok: false,
        error: result.error ?? 'Verifica del pagamento non riuscita.',
      };
    }
    if (!result.verdict.ok) {
      return {
        ok: false,
        error: 'Verifica non superata: il pagamento presenta problemi bloccanti.',
        details: result.verdict.blockingIssues.map((issue) => issue.message),
      };
    }
    const pending = result.verdict.requiresAcknowledgment.filter((code) => !acknowledged.has(code));
    if (pending.length > 0) {
      return {
        ok: false,
        error: 'Alcuni controlli richiedono una conferma esplicita.',
        requiresAcknowledgment: pending,
        details: result.verdict.issues
          .filter((issue) => pending.includes(issue.code))
          .map((issue) => issue.message),
      };
    }
    canonicalBase = result.canonicalKeyBase ?? `${input.evidenceType}:${evidenceReference}`;
    snapshot = result.snapshot ?? {};
    warnings = result.verdict.issues
      .filter((issue) => !issue.blocking && acknowledged.has(issue.code))
      .map((issue) => issue.message);
    consentSource = result.consent?.source === 'STRIPE_METADATA' ? 'STRIPE_METADATA' : 'NONE';
    consentTermsVersion = result.consent?.termsVersion ?? null;
    consentDigitalWithdrawalVersion = result.consent?.digitalWithdrawalVersion ?? null;
    consentAcceptedAt = result.consent?.acceptedAt ? new Date(result.consent.acceptedAt) : null;
    amountTotal = result.facts?.amountPaid ?? null;
    currency = result.facts?.currency ?? null;
    paidAt = result.facts?.paidAt ? new Date(result.facts.paidAt) : null;
    customerEmail = normalizeEmail(result.facts?.customerEmail) ?? null;
  }

  try {
    const existingEvidence = await prisma.manualGrant.findFirst({
      where: { evidenceKey: canonicalBase },
      select: { id: true, status: true },
    });
    if (existingEvidence) {
      return {
        ok: false,
        error:
          'Questa evidenza di pagamento è già stata utilizzata per un accesso manuale. Riattiva il grant esistente oppure usa un\'evidenza diversa.',
      };
    }

    const activeKey = `${targetEmail}:${product.slug}`;
    const existingActive = await prisma.manualGrant.findFirst({
      where: { activeKey },
      select: { id: true },
    });
    if (existingActive) {
      return {
        ok: false,
        error: 'Esiste già un accesso attivo per questo destinatario e prodotto.',
      };
    }

    const ownershipEmail = customerEmail ?? targetEmail;
    const linkedPurchase = await prisma.purchase.findFirst({
      where: { userEmail: ownershipEmail, productSlug: product.slug, status: 'succeeded' },
      select: { id: true },
    });

    const created = await prisma.$transaction(async (tx) => {
      const grant = await tx.manualGrant.create({
        data: {
          userEmail: targetEmail,
          productSlug: product.slug,
          kind: 'PAID_VERIFIED',
          status: 'ACTIVE',
          activeKey,
          evidenceKey: canonicalBase,
          evidenceType: input.evidenceType,
          evidenceReference: evidenceReference || null,
          linkedPurchaseId: linkedPurchase?.id ?? null,
          evidenceAmountTotal: amountTotal,
          evidenceCurrency: currency,
          evidencePaidAt: paidAt,
          evidenceCustomerEmail: customerEmail,
          evidenceSnapshot: snapshot as Prisma.InputJsonValue,
          evidenceWarnings:
            warnings.length > 0 ? (warnings as Prisma.InputJsonValue) : Prisma.DbNull,
          verifiedAt: new Date(),
          verifiedBy: actor,
          consentSource,
          consentTermsVersion,
          consentDigitalWithdrawalVersion,
          consentAcceptedAt,
          grantedBy: actor,
          adminNote: (input.adminNote ?? '').trim() || null,
        },
        select: { id: true },
      });
      await tx.manualGrantEvent.create({
        data: {
          grantId: grant.id,
          action: 'CREATED',
          actorEmail: actor,
          targetEmail,
          productSlug: product.slug,
          kind: 'PAID_VERIFIED',
          detail: {
            evidenceType: input.evidenceType,
            evidenceKey: canonicalBase,
            evidenceReference,
            amountTotal,
            currency,
            acknowledged: Array.from(acknowledged),
            warnings,
          } as Prisma.InputJsonValue,
        },
      });
      return grant;
    });

    revalidatePath(REVALIDATE_PATH);
    return { ok: true, grantId: created.id, message: 'Accesso manuale attivato.' };
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return {
        ok: false,
        error: 'Accesso duplicato: esiste già un grant attivo o la stessa evidenza è già stata usata.',
      };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore durante l\'attivazione dell\'accesso.',
    };
  }
}

export async function createComplimentaryManualGrant(
  input: ComplimentaryGrantInput,
): Promise<ManualGrantActionResult> {
  const guard = await requireAdminActor();
  if (!guard.ok) return { ok: false, error: guard.error };
  const actor = guard.email as string;
  if (!isManualGrantsEnabled()) {
    return {
      ok: false,
      error: 'Accessi manuali disattivati. Imposta MANUAL_GRANTS_ENABLED=true per procedere.',
    };
  }
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non configurato.' };

  if (input.confirmed !== true) {
    return { ok: false, error: 'Conferma esplicitamente l\'attivazione dell\'accesso omaggio.' };
  }
  if (input.termsAcknowledged !== true) {
    return {
      ok: false,
      error: 'Conferma di aver informato il destinatario dei Termini e della Privacy Policy.',
    };
  }

  const targetEmail = normalizeEmail(input.targetEmail);
  if (!targetEmail || !isEmailLike(targetEmail)) {
    return { ok: false, error: 'Inserisci un indirizzo email valido del destinatario.' };
  }

  const allowedReasons = ['amico', 'collaboratore', 'tester', 'promozione', 'altro'];
  const reason = (input.reason ?? '').trim().toLowerCase();
  if (!allowedReasons.includes(reason)) {
    return { ok: false, error: 'Seleziona una motivazione valida per l\'omaggio.' };
  }
  const reasonNote = (input.reasonNote ?? '').trim();
  if (reason === 'altro' && reasonNote.length < 5) {
    return { ok: false, error: 'Specifica la motivazione (almeno 5 caratteri) per l\'opzione "Altro".' };
  }

  const requested = Array.from(
    new Set((input.productSlugs ?? []).map((slug) => String(slug).trim()).filter(Boolean)),
  );
  if (requested.length === 0) {
    return { ok: false, error: 'Seleziona almeno un prodotto da sbloccare.' };
  }
  for (const slug of requested) {
    if (!oneTimeProduct(slug)) {
      return { ok: false, error: `Prodotto non valido per un accesso omaggio: ${slug}.` };
    }
  }

  const createdSlugs: string[] = [];
  const skippedSlugs: string[] = [];

  try {
    for (const slug of requested) {
      const activeKey = `${targetEmail}:${slug}`;
      const existingActive = await prisma.manualGrant.findFirst({
        where: { activeKey },
        select: { id: true },
      });
      if (existingActive) {
        skippedSlugs.push(slug);
        continue;
      }
      await prisma.$transaction(async (tx) => {
        const grant = await tx.manualGrant.create({
          data: {
            userEmail: targetEmail,
            productSlug: slug,
            kind: 'COMPLIMENTARY',
            status: 'ACTIVE',
            activeKey,
            evidenceKey: null,
            consentSource: 'ADMIN_ATTESTATION',
            consentAcceptedAt: new Date(),
            grantedBy: actor,
            reason,
            reasonNote: reasonNote || null,
            adminNote: (input.adminNote ?? '').trim() || null,
          },
          select: { id: true },
        });
        await tx.manualGrantEvent.create({
          data: {
            grantId: grant.id,
            action: 'CREATED',
            actorEmail: actor,
            targetEmail,
            productSlug: slug,
            kind: 'COMPLIMENTARY',
            detail: {
              reason,
              reasonNote: reasonNote || null,
              termsAcknowledged: true,
            } as Prisma.InputJsonValue,
          },
        });
      });
      createdSlugs.push(slug);
    }

    revalidatePath(REVALIDATE_PATH);

    if (createdSlugs.length === 0) {
      return {
        ok: false,
        error: 'Nessun accesso creato: il destinatario possiede già un accesso attivo per i prodotti selezionati.',
        skippedSlugs,
      };
    }
    return {
      ok: true,
      createdSlugs,
      skippedSlugs,
      message:
        skippedSlugs.length > 0
          ? `Accesso omaggio attivato per ${createdSlugs.length} prodotti. Già attivi: ${skippedSlugs.length}.`
          : `Accesso omaggio attivato per ${createdSlugs.length} prodotti.`,
    };
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return {
        ok: false,
        error: 'Accesso duplicato rilevato durante il salvataggio. Ricarica e riprova.',
        createdSlugs,
        skippedSlugs,
      };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore durante l\'attivazione dell\'omaggio.',
      createdSlugs,
      skippedSlugs,
    };
  }
}

export async function revokeManualGrant(
  id: string,
  reason?: string,
): Promise<ManualGrantActionResult> {
  const guard = await requireAdminActor();
  if (!guard.ok) return { ok: false, error: guard.error };
  const actor = guard.email as string;
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non configurato.' };

  const grantId = (id ?? '').trim();
  if (!grantId) return { ok: false, error: 'Accesso non specificato.' };

  try {
    const existing = await prisma.manualGrant.findUnique({
      where: { id: grantId },
      select: { id: true, status: true, userEmail: true, productSlug: true, kind: true },
    });
    if (!existing) return { ok: false, error: 'Accesso non trovato.' };
    if (existing.status === 'REVOKED') return { ok: false, error: 'Questo accesso è già revocato.' };

    const revokeReason = (reason ?? '').trim() || null;

    await prisma.$transaction(async (tx) => {
      await tx.manualGrant.update({
        where: { id: existing.id },
        data: {
          status: 'REVOKED',
          activeKey: null,
          revokedAt: new Date(),
          revokedBy: actor,
          revokeReason,
        },
      });
      await tx.manualGrantEvent.create({
        data: {
          grantId: existing.id,
          action: 'REVOKED',
          actorEmail: actor,
          targetEmail: existing.userEmail,
          productSlug: existing.productSlug,
          kind: existing.kind,
          detail: { revokeReason } as Prisma.InputJsonValue,
        },
      });
    });

    revalidatePath(REVALIDATE_PATH);
    return { ok: true, message: 'Accesso revocato.' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore durante la revoca.',
    };
  }
}

export async function reactivateManualGrant(id: string): Promise<ManualGrantActionResult> {
  const guard = await requireAdminActor();
  if (!guard.ok) return { ok: false, error: guard.error };
  const actor = guard.email as string;
  if (!isManualGrantsEnabled()) {
    return {
      ok: false,
      error: 'Accessi manuali disattivati. Imposta MANUAL_GRANTS_ENABLED=true per procedere.',
    };
  }
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non configurato.' };

  const grantId = (id ?? '').trim();
  if (!grantId) return { ok: false, error: 'Accesso non specificato.' };

  try {
    const existing = await prisma.manualGrant.findUnique({
      where: { id: grantId },
      select: { id: true, status: true, userEmail: true, productSlug: true, kind: true },
    });
    if (!existing) return { ok: false, error: 'Accesso non trovato.' };
    if (existing.status === 'ACTIVE') return { ok: false, error: 'Questo accesso è già attivo.' };

    const activeKey = `${existing.userEmail}:${existing.productSlug}`;
    const conflict = await prisma.manualGrant.findFirst({
      where: { activeKey },
      select: { id: true },
    });
    if (conflict) {
      return {
        ok: false,
        error: 'Esiste già un altro accesso attivo per questo destinatario e prodotto.',
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.manualGrant.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          activeKey,
          revokedAt: null,
          revokedBy: null,
          revokeReason: null,
        },
      });
      await tx.manualGrantEvent.create({
        data: {
          grantId: existing.id,
          action: 'REACTIVATED',
          actorEmail: actor,
          targetEmail: existing.userEmail,
          productSlug: existing.productSlug,
          kind: existing.kind,
          detail: Prisma.JsonNull,
        },
      });
    });

    revalidatePath(REVALIDATE_PATH);
    return { ok: true, message: 'Accesso riattivato.' };
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return { ok: false, error: 'Esiste già un altro accesso attivo per questo destinatario e prodotto.' };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore durante la riattivazione.',
    };
  }
}

export async function recheckManualGrantEvidence(id: string): Promise<ManualGrantActionResult> {
  const guard = await requireAdminActor();
  if (!guard.ok) return { ok: false, error: guard.error };
  const actor = guard.email as string;
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non configurato.' };

  const grantId = (id ?? '').trim();
  if (!grantId) return { ok: false, error: 'Accesso non specificato.' };

  try {
    const existing = await prisma.manualGrant.findUnique({
      where: { id: grantId },
      select: {
        id: true,
        status: true,
        userEmail: true,
        productSlug: true,
        kind: true,
        evidenceType: true,
        evidenceReference: true,
      },
    });
    if (!existing) return { ok: false, error: 'Accesso non trovato.' };
    if (
      !existing.evidenceType ||
      existing.evidenceType === 'OFF_PLATFORM' ||
      !existing.evidenceReference
    ) {
      return {
        ok: false,
        error: 'Riverifica automatica non disponibile per questa evidenza.',
      };
    }

    const result = await verifyStripeEvidence({
      kind: existing.evidenceType,
      reference: existing.evidenceReference,
      expectedSlug: existing.productSlug,
    });
    if (!result.verdict) {
      return { ok: false, error: result.error ?? 'Verifica non riuscita.' };
    }

    const blockingMessages = result.verdict.blockingIssues.map((issue) => issue.message);
    const acknowledgeMessages = result.verdict.issues
      .filter((issue) => !issue.blocking)
      .map((issue) => issue.message);
    const warnings = [...blockingMessages, ...acknowledgeMessages];
    const mustRevoke = !result.verdict.ok;

    await prisma.$transaction(async (tx) => {
      await tx.manualGrant.update({
        where: { id: existing.id },
        data: {
          evidenceSnapshot: (result.snapshot ?? {}) as Prisma.InputJsonValue,
          evidenceWarnings: warnings.length > 0 ? (warnings as Prisma.InputJsonValue) : Prisma.DbNull,
          evidenceAmountTotal: result.facts?.amountPaid ?? null,
          evidenceCurrency: result.facts?.currency ?? null,
          verifiedAt: new Date(),
          verifiedBy: actor,
          ...(mustRevoke
            ? {
                status: 'REVOKED' as const,
                activeKey: null,
                revokedAt: new Date(),
                revokedBy: actor,
                revokeReason: 'Riverifica automatica: ' + blockingMessages.join(' '),
              }
            : {}),
        },
      });
      await tx.manualGrantEvent.create({
        data: {
          grantId: existing.id,
          action: mustRevoke ? 'REVOKED' : 'EVIDENCE_RECHECKED',
          actorEmail: actor,
          targetEmail: existing.userEmail,
          productSlug: existing.productSlug,
          kind: existing.kind,
          detail: { warnings } as Prisma.InputJsonValue,
        },
      });
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      ok: true,
      message: mustRevoke
        ? 'Riverifica: problemi bloccanti rilevati, accesso revocato automaticamente.'
        : 'Riverifica completata: nessun problema bloccante.',
      details: warnings,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore durante la riverifica.',
    };
  }
}
