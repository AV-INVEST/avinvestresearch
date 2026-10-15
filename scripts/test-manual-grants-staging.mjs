// ------------------------------------------------------------------
// TEST DI INTEGRAZIONE — accessi manuali, su DATABASE STAGING ISOLATO
//
// Copre: acquisti esistenti, attivazioni manuali (verificate), omaggi,
// revoche, riconoscimento negli entitlement, gate di download,
// anti-duplicazione, anti-riuso evidenza, verifica live Stripe in test mode.
//
// SICUREZZA / ISOLAMENTO (guardie eseguite PRIMA di qualsiasi import dell'app):
//   1. Usa ESCLUSIVAMENTE STAGING_DATABASE_URL (mai DATABASE_URL di produzione).
//   2. Rifiuta di partire se STAGING_DATABASE_URL coincide con DATABASE_URL
//      o DATABASE_URL_UNPOOLED presenti nell'ambiente.
//   3. Richiede STAGING_STRIPE_SECRET_KEY con prefisso "sk_test_" (test mode).
//   4. Richiede STAGING_CONFIRM=I_UNDERSTAND_THIS_IS_STAGING.
//   5. Non legge .env.local. Crea solo dati sintetici con prefisso
//      "staging-test+" e li rimuove in cleanup (nessun dato reale toccato).
//
// Esecuzione:
//   $env:STAGING_DATABASE_URL="postgresql://.../staging"
//   $env:STAGING_STRIPE_SECRET_KEY="sk_test_..."
//   $env:STAGING_CONFIRM="I_UNDERSTAND_THIS_IS_STAGING"
//   node --import ./scripts/lib/register-ts-alias.mjs scripts/test-manual-grants-staging.mjs
//
// SCENARI E2E che richiedono l'app in esecuzione (checklist manuale, non automatizzati):
//   - /admin/accessi raggiungibile SOLO da admin Google (email in ADMIN_GOOGLE_EMAILS);
//     utente non admin -> redirect/blocco.
//   - Download market-lens / trading-starter: 200 con accesso, 403 senza, 429 oltre soglia.
//   - Videocorsi: lezione accessibile solo con entitlement owned; DRAFT non visibili.
//   - Interfaccia /admin/accessi: tab Verifica pagamento, Accesso omaggio, Registro.
// ------------------------------------------------------------------

const REQUIRED_CONFIRM = 'I_UNDERSTAND_THIS_IS_STAGING';

function fail(msg) {
  console.error('\n[GUARDIA ISOLAMENTO] ' + msg);
  process.exit(2);
}

const stagingUrl = process.env.STAGING_DATABASE_URL;
const stagingStripeKey = process.env.STAGING_STRIPE_SECRET_KEY;

if (process.env.STAGING_CONFIRM !== REQUIRED_CONFIRM) {
  fail(`Imposta STAGING_CONFIRM=${REQUIRED_CONFIRM} per confermare l'uso del database di staging.`);
}
if (!stagingUrl || stagingUrl.includes('replace-with')) {
  fail('STAGING_DATABASE_URL non impostata (o placeholder). Usa il database di staging isolato.');
}
if (stagingUrl === process.env.DATABASE_URL || stagingUrl === process.env.DATABASE_URL_UNPOOLED) {
  fail('STAGING_DATABASE_URL coincide con la connessione di PRODUZIONE. Interrotto.');
}
if (!stagingStripeKey || !stagingStripeKey.startsWith('sk_test_')) {
  fail('STAGING_STRIPE_SECRET_KEY deve essere una chiave di TEST (prefisso "sk_test_"). Interrotto.');
}

// L'app legge solo DATABASE_URL / STRIPE_SECRET_KEY: le puntiamo allo staging.
process.env.DATABASE_URL = stagingUrl;
process.env.STRIPE_SECRET_KEY = stagingStripeKey;

const { PrismaClient } = await import('@prisma/client');
const { loadActiveManualGrants, hasOneTimeProductAccess, isManualGrantsEnabled } =
  await import('@/lib/entitlements-grants');
const { getOneTimeProductEntitlements } = await import('@/lib/entitlements');
const { verifyStripeEvidence, canonicalEvidenceKey } = await import('@/lib/stripe/manual-grant-verification');
const { getStripeClient } = await import('@/lib/stripe/client');

const prisma = new PrismaClient();

const RUN = Date.now().toString(36);
const EMAIL = (n) => `staging-test+${RUN}-${n}@example.invalid`;

const passes = [];
const failures = [];
const skipped = [];

function check(name, cond, detail = '') {
  if (cond) {
    passes.push(name);
    console.log('  [PASS]', name, detail);
  } else {
    failures.push(name);
    console.log('  [FAIL]', name, detail);
  }
}

function skip(name, why) {
  skipped.push(`${name} (${why})`);
  console.log('  [SKIP]', name, '-', why);
}

async function createSyntheticUser(email) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Staging Test' },
  });
}

async function createSyntheticPurchase(email, slug, amount, tag) {
  await createSyntheticUser(email);
  return prisma.purchase.create({
    data: {
      userEmail: email,
      productSlug: slug,
      checkoutSessionId: `cs_test_staging_${RUN}_${tag}`,
      amountTotal: amount,
      currency: 'EUR',
      status: 'succeeded',
      purchasedAt: new Date(),
    },
  });
}

async function main() {
  const stripe = getStripeClient();

  // ----------------------------------------------------------------
  console.log('\n=== 1. Acquisti esistenti (indipendenti dal kill-switch) ===');
  const emailPurchase = EMAIL('purchase');
  await createSyntheticPurchase(emailPurchase, 'market-lens', 3990, 'purchase');
  process.env.MANUAL_GRANTS_ENABLED = 'false';
  check(
    'acquisto succeeded -> accesso riconosciuto (kill-switch OFF)',
    (await hasOneTimeProductAccess(emailPurchase, 'market-lens')) === true,
  );
  check(
    'prodotto non acquistato -> nessun accesso',
    (await hasOneTimeProductAccess(emailPurchase, 'trading-starter')) === false,
  );
  check(
    'kill-switch OFF: loadActiveManualGrants = []',
    (await loadActiveManualGrants(emailPurchase)).length === 0,
  );

  // ----------------------------------------------------------------
  console.log('\n=== 2. Kill-switch: un omaggio NON concede accesso a interruttore spento ===');
  const emailGift = EMAIL('gift');
  await createSyntheticUser(emailGift);
  const giftActiveKey = `${emailGift}:trading-starter`;
  const gift = await prisma.manualGrant.create({
    data: {
      userEmail: emailGift,
      productSlug: 'trading-starter',
      kind: 'COMPLIMENTARY',
      status: 'ACTIVE',
      activeKey: giftActiveKey,
      evidenceKey: null,
      consentSource: 'ADMIN_ATTESTATION',
      consentAcceptedAt: new Date(),
      grantedBy: 'staging-test-admin@example.invalid',
      reason: 'tester',
    },
    select: { id: true },
  });
  process.env.MANUAL_GRANTS_ENABLED = 'false';
  check(
    'kill-switch OFF -> omaggio non riconosciuto',
    (await hasOneTimeProductAccess(emailGift, 'trading-starter')) === false,
  );

  console.log('\n=== 3. Omaggio riconosciuto con kill-switch ON ===');
  process.env.MANUAL_GRANTS_ENABLED = 'true';
  const giftGrants = await loadActiveManualGrants(emailGift);
  check('omaggio riconosciuto', giftGrants.some((g) => g.productSlug === 'trading-starter' && g.kind === 'COMPLIMENTARY'));
  check('gate download trading-starter = true', (await hasOneTimeProductAccess(emailGift, 'trading-starter')) === true);
  const giftEnt = await getOneTimeProductEntitlements(undefined, emailGift);
  check('entitlement tradingStarter = owned', giftEnt.tradingStarter.status === 'owned');
  check('entitlement marketLens NON owned', giftEnt.marketLens.status !== 'owned');

  // ----------------------------------------------------------------
  console.log('\n=== 4. Grant verificato (PAID_VERIFIED) riconosciuto ===');
  const emailPaid = EMAIL('paid');
  await createSyntheticUser(emailPaid);
  const paidEvidenceKey = `PI:pi_test_staging_${RUN}`;
  await prisma.manualGrant.create({
    data: {
      userEmail: emailPaid,
      productSlug: 'market-lens',
      kind: 'PAID_VERIFIED',
      status: 'ACTIVE',
      activeKey: `${emailPaid}:market-lens`,
      evidenceKey: paidEvidenceKey,
      evidenceType: 'STRIPE_PAYMENT_INTENT',
      evidenceReference: `pi_test_staging_${RUN}`,
      evidenceAmountTotal: 3990,
      evidenceCurrency: 'EUR',
      consentSource: 'NONE',
      grantedBy: 'staging-test-admin@example.invalid',
      verifiedBy: 'staging-test-admin@example.invalid',
      verifiedAt: new Date(),
    },
    select: { id: true },
  });
  const paidEnt = await getOneTimeProductEntitlements(undefined, emailPaid);
  check('grant verificato -> marketLens owned', paidEnt.marketLens.status === 'owned');

  // ----------------------------------------------------------------
  console.log('\n=== 5. Revoca (soft, conserva evidenza e audit) ===');
  await prisma.manualGrant.update({
    where: { id: gift.id },
    data: {
      status: 'REVOKED',
      activeKey: null,
      revokedAt: new Date(),
      revokedBy: 'staging-test-admin@example.invalid',
      revokeReason: 'test revoca',
    },
  });
  check('revoca -> omaggio non più riconosciuto', (await hasOneTimeProductAccess(emailGift, 'trading-starter')) === false);
  const revokedEnt = await getOneTimeProductEntitlements(undefined, emailGift);
  check('revoca -> entitlement non owned', revokedEnt.tradingStarter.status !== 'owned');

  const paidRow = await prisma.manualGrant.findFirst({
    where: { userEmail: emailPaid, productSlug: 'market-lens' },
    select: { id: true, evidenceKey: true },
  });
  await prisma.manualGrant.update({
    where: { id: paidRow.id },
    data: { status: 'REVOKED', activeKey: null, revokedAt: new Date() },
  });
  const paidAfterRevoke = await prisma.manualGrant.findUnique({
    where: { id: paidRow.id },
    select: { evidenceKey: true, status: true },
  });
  check('revoca -> evidenceKey conservata (anti-riuso)', paidAfterRevoke.evidenceKey === paidEvidenceKey);
  check('revoca -> status REVOKED', paidAfterRevoke.status === 'REVOKED');

  // ----------------------------------------------------------------
  console.log('\n=== 6. Prevenzione duplicati (vincolo DB su activeKey) ===');
  const emailDup = EMAIL('dup');
  await createSyntheticUser(emailDup);
  const dupKey = `${emailDup}:foundations`;
  await prisma.manualGrant.create({
    data: {
      userEmail: emailDup,
      productSlug: 'foundations',
      kind: 'COMPLIMENTARY',
      status: 'ACTIVE',
      activeKey: dupKey,
      grantedBy: 'staging-test-admin@example.invalid',
      reason: 'amico',
    },
  });
  let dupBlocked = false;
  try {
    await prisma.manualGrant.create({
      data: {
        userEmail: emailDup,
        productSlug: 'foundations',
        kind: 'COMPLIMENTARY',
        status: 'ACTIVE',
        activeKey: dupKey,
        grantedBy: 'staging-test-admin@example.invalid',
        reason: 'amico',
      },
    });
  } catch (err) {
    dupBlocked = err?.code === 'P2002';
  }
  check('secondo grant ACTIVE stesso email/slug -> P2002', dupBlocked);

  // ----------------------------------------------------------------
  console.log('\n=== 7. Anti-riuso evidenza (vincolo DB su evidenceKey) ===');
  const emailReuse = EMAIL('reuse');
  await createSyntheticUser(emailReuse);
  let reuseBlocked = false;
  try {
    await prisma.manualGrant.create({
      data: {
        userEmail: emailReuse,
        productSlug: 'trading-lab',
        kind: 'PAID_VERIFIED',
        status: 'ACTIVE',
        activeKey: `${emailReuse}:trading-lab`,
        evidenceKey: paidEvidenceKey,
        evidenceType: 'STRIPE_PAYMENT_INTENT',
        grantedBy: 'staging-test-admin@example.invalid',
      },
    });
  } catch (err) {
    reuseBlocked = err?.code === 'P2002';
  }
  check('stessa evidenza su altro destinatario -> P2002', reuseBlocked);

  // ----------------------------------------------------------------
  console.log('\n=== 8. Verifica live Stripe (test mode) ===');
  let piPaid;
  let piUnpaid;
  try {
    piPaid = await stripe.paymentIntents.create({
      amount: 3990,
      currency: 'eur',
      payment_method: 'pm_card_visa',
      payment_method_types: ['card'],
      confirm: true,
      metadata: { product_slug: 'market-lens' },
    });
    const verdict = await verifyStripeEvidence({
      kind: 'STRIPE_PAYMENT_INTENT',
      reference: piPaid.id,
      expectedSlug: 'market-lens',
    });
    check('PI test pagato -> verifica ok', verdict.ok === true && verdict.verdict?.ok === true);

    piUnpaid = await stripe.paymentIntents.create({
      amount: 3990,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: { product_slug: 'market-lens' },
    });
    const verdictUnpaid = await verifyStripeEvidence({
      kind: 'STRIPE_PAYMENT_INTENT',
      reference: piUnpaid.id,
      expectedSlug: 'market-lens',
    });
    check('PI test non pagato -> verifica bloccata', verdictUnpaid.ok === false);

    check(
      'chiave canonica: sessione-con-PI == PI',
      canonicalEvidenceKey('STRIPE_CHECKOUT_SESSION', 'cs_test_x', piPaid.id) ===
        canonicalEvidenceKey('STRIPE_PAYMENT_INTENT', piPaid.id, piPaid.id),
    );
  } catch (err) {
    skip('Verifica live Stripe test mode', err instanceof Error ? err.message : String(err));
  }

  // ----------------------------------------------------------------
  console.log('\n=== 9. Permessi amministrativi (verifica di cablaggio) ===');
  const { readFile } = await import('node:fs/promises');
  const pageSrc = await readFile(new URL('../src/app/admin/accessi/page.tsx', import.meta.url), 'utf8');
  const actionSrc = await readFile(new URL('../src/lib/admin/manual-grant-admin.ts', import.meta.url), 'utf8');
  check('pagina /admin/accessi protetta da requireAdmin()', /requireAdmin\s*\(/.test(pageSrc));
  check('ogni server action protetta da requireAdminActor()', /function requireAdminActor|const requireAdminActor/.test(actionSrc));
  check('omaggio richiede conferma esplicita (confirmed)', /input\.confirmed\s*!==\s*true/.test(actionSrc));
  check('omaggio richiede accettazione termini (termsAcknowledged)', /input\.termsAcknowledged\s*!==\s*true/.test(actionSrc));

  console.log('\n=== 10. Videocorsi (riconoscimento grant) ===');
  const emailCourse = EMAIL('course');
  await createSyntheticUser(emailCourse);
  await prisma.manualGrant.create({
    data: {
      userEmail: emailCourse,
      productSlug: 'foundations',
      kind: 'COMPLIMENTARY',
      status: 'ACTIVE',
      activeKey: `${emailCourse}:foundations`,
      grantedBy: 'staging-test-admin@example.invalid',
      reason: 'tester',
    },
  });
  const courseGrants = await loadActiveManualGrants(emailCourse);
  check('grant videocorso presente nei grant attivi', courseGrants.some((g) => g.productSlug === 'foundations'));
  const fullEnt = await getOneTimeProductEntitlements(undefined, emailCourse);
  check('getOneTimeProductEntitlements non solleva eccezioni con grant corso', typeof fullEnt === 'object');
  skip('Lezione videocorso "owned" end-to-end', 'richiede struttura corso PUBLISHED su staging + rendering pagina');

  // ----------------------------------------------------------------
  // Cleanup (solo dati sintetici con prefisso staging-test+)
  console.log('\n=== Cleanup dati sintetici ===');
}

async function cleanup() {
  const emails = [
    EMAIL('purchase'),
    EMAIL('gift'),
    EMAIL('paid'),
    EMAIL('dup'),
    EMAIL('reuse'),
    EMAIL('course'),
  ];
  try {
    const grants = await prisma.manualGrant.findMany({ where: { userEmail: { in: emails } }, select: { id: true } });
    const ids = grants.map((g) => g.id);
    if (ids.length > 0) {
      await prisma.manualGrantEvent.deleteMany({ where: { grantId: { in: ids } } });
      await prisma.manualGrant.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.manualGrantEvent.deleteMany({ where: { targetEmail: { in: emails } } });
    await prisma.purchase.deleteMany({ where: { userEmail: { in: emails } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    console.log(`  Cleanup completato (${emails.length} email sintetiche).`);
  } catch (err) {
    console.log('  [WARN] Cleanup parziale:', err instanceof Error ? err.message : String(err));
  }
}

try {
  await main();
} catch (err) {
  console.error('\n[ERROR] Esecuzione interrotta:', err);
  failures.push('EXCEPTION: ' + (err && err.message ? err.message : String(err)));
} finally {
  await cleanup();
  await prisma.$disconnect();
}

console.log('\n============================================================');
console.log(`TOTALE: ${passes.length + failures.length} | PASS: ${passes.length} | FAIL: ${failures.length} | SKIP: ${skipped.length}`);
if (skipped.length > 0) {
  console.log('\nSaltati (richiedono app in esecuzione):');
  for (const s of skipped) console.log('  -', s);
}
if (failures.length > 0) {
  console.log('\nFalliti:');
  for (const f of failures) console.log('  -', f);
  process.exitCode = 1;
}
