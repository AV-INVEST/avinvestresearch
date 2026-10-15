// ------------------------------------------------------------------
// TEST UNITARI — logica pura di verifica evidenza accessi manuali
// Nessun database, nessuna rete: solo dati sintetici.
//
// Esecuzione:
//   node --import ./scripts/lib/register-ts-alias.mjs scripts/test-manual-grants-unit.mjs
// ------------------------------------------------------------------
import {
  evaluateEvidence,
  evaluateOffPlatformEvidence,
  mirrorConsentFromMetadata,
  isValidConsentVersion,
  formatCents,
  OFF_PLATFORM_REQUIRED_NOTE_LENGTH,
} from '@/lib/admin/manual-grant-evidence';
import { canonicalEvidenceKey } from '@/lib/stripe/manual-grant-verification';

const passes = [];
const failures = [];

function check(name, cond, detail = '') {
  if (cond) {
    passes.push(name);
    console.log('  [PASS]', name, detail);
  } else {
    failures.push(name);
    console.log('  [FAIL]', name, detail);
  }
}

function hasIssue(verdict, code) {
  return verdict.issues.some((i) => i.code === code);
}

function facts(overrides = {}) {
  return {
    reference: 'cs_test_synthetic_001',
    status: 'paid',
    amountPaid: 29700,
    currency: 'EUR',
    paidAt: '2026-01-01T00:00:00.000Z',
    customerEmail: 'cliente.sintetico@example.com',
    priceId: 'price_foundations',
    metadata: { product_slug: 'foundations' },
    refundedAmount: 0,
    disputed: false,
    chargeId: 'ch_test_synthetic_001',
    linkedPurchaseId: null,
    ...overrides,
  };
}

function base(overrides = {}) {
  return {
    kind: 'STRIPE_CHECKOUT_SESSION',
    facts: facts(),
    expectedSlug: 'foundations',
    expectedAmountInCents: 29700,
    expectedCurrency: 'EUR',
    expectedPriceId: 'price_foundations',
    ...overrides,
  };
}

function run() {
  console.log('\n=== A. Pagamento coerente (nessun problema) ===');
  {
    const v = evaluateEvidence(base());
    check('checkout session paid -> ok', v.ok === true);
    check('checkout session paid -> nessun bloccante', v.blockingIssues.length === 0);
    check('checkout session paid -> nessun acknowledgment', v.requiresAcknowledgment.length === 0);
    check('normalized.amountTotal propagato', v.normalized.amountTotal === 29700);
  }
  {
    const v = evaluateEvidence(base({ kind: 'STRIPE_PAYMENT_INTENT', facts: facts({ status: 'succeeded' }) }));
    check('payment intent succeeded -> ok', v.ok === true);
  }
  {
    const v = evaluateEvidence(base({ kind: 'STRIPE_INVOICE', facts: facts({ status: 'paid' }) }));
    check('invoice paid -> ok', v.ok === true);
  }

  console.log('\n=== B. Bloccanti: stato / valuta / importo ===');
  {
    const v = evaluateEvidence(base({ facts: facts({ status: 'unpaid' }) }));
    check('stato non pagato -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_NOT_PAID'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ status: null }) }));
    check('stato mancante -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_STATUS_MISSING'));
  }
  {
    const v = evaluateEvidence(base({ kind: 'STRIPE_PAYMENT_INTENT', facts: facts({ status: 'processing' }) }));
    check('PI non succeeded -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_NOT_PAID'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ currency: null }) }));
    check('valuta mancante -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_CURRENCY_MISSING'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ currency: 'USD' }) }));
    check('valuta diversa -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_CURRENCY_MISMATCH'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ amountPaid: null }) }));
    check('importo mancante -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_AMOUNT_MISSING'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ reference: '   ' }) }));
    check('riferimento mancante -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_MISSING_REFERENCE'));
  }

  console.log('\n=== C. Bloccanti: rimborsi / contestazioni / prodotto / prezzo ===');
  {
    const v = evaluateEvidence(base({ facts: facts({ refundedAmount: 1500 }) }));
    check('rimborso parziale -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_REFUNDED'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ refundedAmount: Number.POSITIVE_INFINITY }) }));
    check('rimborso totale -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_REFUNDED'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ disputed: true }) }));
    check('contestazione -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_DISPUTED'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ metadata: { product_slug: 'trading-lab' } }) }));
    check('prodotto diverso -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_PRODUCT_MISMATCH'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ priceId: 'price_altro' }) }));
    check('prezzo diverso -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_PRICE_MISMATCH'));
  }

  console.log('\n=== D. Non bloccanti: richiedono conferma esplicita admin ===');
  {
    const v = evaluateEvidence(base({ facts: facts({ refundedAmount: null }) }));
    check('rimborso non verificabile -> acknowledgment', v.ok === true && hasIssue(v, 'EVIDENCE_REFUND_STATUS_UNKNOWN'));
    check('rimborso non verificabile -> codice in requiresAcknowledgment', v.requiresAcknowledgment.includes('EVIDENCE_REFUND_STATUS_UNKNOWN'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ disputed: null }) }));
    check('contestazione non verificabile -> acknowledgment', v.ok === true && hasIssue(v, 'EVIDENCE_DISPUTE_STATUS_UNKNOWN'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ metadata: {} }) }));
    check('prodotto non verificabile -> acknowledgment', v.ok === true && hasIssue(v, 'EVIDENCE_PRODUCT_UNVERIFIED'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ priceId: null }) }));
    check('prezzo non verificabile -> acknowledgment', v.ok === true && hasIssue(v, 'EVIDENCE_PRICE_UNVERIFIED'));
  }
  {
    const v = evaluateEvidence(base({ facts: facts({ amountPaid: 29701 }) }));
    check('importo non allineato al listino -> acknowledgment', v.ok === true && hasIssue(v, 'EVIDENCE_AMOUNT_MISMATCH'));
  }
  {
    const v = evaluateEvidence(base({ expectedPriceId: null, facts: facts({ priceId: null }) }));
    check('prezzo atteso assente -> nessun problema prezzo', !hasIssue(v, 'EVIDENCE_PRICE_UNVERIFIED') && !hasIssue(v, 'EVIDENCE_PRICE_MISMATCH'));
  }

  console.log('\n=== E. Evidenza off-platform (attestazione admin) ===');
  {
    const v = evaluateOffPlatformEvidence({
      reference: 'BONIFICO-2026-001',
      note: 'Bonifico ricevuto sul conto aziendale, verificato manualmente.',
      attestation: true,
    });
    check('off-platform completo -> ok', v.ok === true && v.blockingIssues.length === 0);
  }
  {
    const v = evaluateOffPlatformEvidence({ reference: 'BONIFICO-1', note: 'x'.repeat(30), attestation: false });
    check('off-platform senza attestazione -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_ATTESTATION_REQUIRED'));
  }
  {
    const v = evaluateOffPlatformEvidence({ reference: 'BONIFICO-1', note: 'corta', attestation: true });
    check('off-platform nota corta -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_NOTE_REQUIRED'));
  }
  {
    const v = evaluateOffPlatformEvidence({
      reference: 'BONIFICO-1',
      note: 'x'.repeat(OFF_PLATFORM_REQUIRED_NOTE_LENGTH),
      attestation: true,
    });
    check('off-platform nota di lunghezza limite -> ok', v.ok === true);
  }
  {
    const v = evaluateOffPlatformEvidence({ reference: '  ', note: 'x'.repeat(30), attestation: true });
    check('off-platform riferimento mancante -> bloccante', v.ok === false && hasIssue(v, 'EVIDENCE_MISSING_REFERENCE'));
  }

  console.log('\n=== F. Consensi ===');
  check('isValidConsentVersion v1', isValidConsentVersion('v1') === true);
  check('isValidConsentVersion v1.2', isValidConsentVersion('v1.2') === true);
  check('isValidConsentVersion 1 (rifiutato)', isValidConsentVersion('1') === false);
  check('isValidConsentVersion v1.2.3 (rifiutato)', isValidConsentVersion('v1.2.3') === false);
  check('isValidConsentVersion null (rifiutato)', isValidConsentVersion(null) === false);
  {
    const c = mirrorConsentFromMetadata({
      consent_terms_v: 'v2',
      consent_digital_withdrawal_v: 'v1',
      consent_at: '2026-01-01T10:00:00.000Z',
    });
    check('consenso completo -> STRIPE_METADATA', c.source === 'STRIPE_METADATA' && c.termsVersion === 'v2');
  }
  {
    const c = mirrorConsentFromMetadata({ consent_terms_v: 'invalido', consent_at: 'non-una-data' });
    check('consenso invalido -> NONE', c.source === 'NONE');
  }
  {
    const c = mirrorConsentFromMetadata(null);
    check('metadata assenti -> NONE', c.source === 'NONE' && c.termsVersion === null);
  }

  console.log('\n=== G. Anti-riuso evidenza (chiave canonica) ===');
  check(
    'sessione senza PI -> tipo:riferimento',
    canonicalEvidenceKey('STRIPE_CHECKOUT_SESSION', 'cs_test_1') === 'STRIPE_CHECKOUT_SESSION:cs_test_1',
  );
  check(
    'sessione con PI -> collassa su PI',
    canonicalEvidenceKey('STRIPE_CHECKOUT_SESSION', 'cs_test_1', 'pi_test_1') === 'PI:pi_test_1',
  );
  check(
    'payment intent con stesso PI -> stessa chiave (riuso bloccato)',
    canonicalEvidenceKey('STRIPE_PAYMENT_INTENT', 'pi_test_1', 'pi_test_1') ===
      canonicalEvidenceKey('STRIPE_CHECKOUT_SESSION', 'cs_test_1', 'pi_test_1'),
  );
  check(
    'fattura con PI -> stessa chiave',
    canonicalEvidenceKey('STRIPE_INVOICE', 'in_test_1', 'pi_test_1') === 'PI:pi_test_1',
  );
  check('formatCents', formatCents(29700) === '297.00 EUR');
}

try {
  run();
} catch (err) {
  console.error('\n[ERROR] Esecuzione interrotta:', err);
  failures.push('EXCEPTION: ' + (err && err.message ? err.message : String(err)));
}

console.log('\n============================================================');
console.log(`TOTALE: ${passes.length + failures.length} | PASS: ${passes.length} | FAIL: ${failures.length}`);
if (failures.length > 0) {
  console.log('\nFalliti:');
  for (const f of failures) console.log('  -', f);
  process.exitCode = 1;
}
