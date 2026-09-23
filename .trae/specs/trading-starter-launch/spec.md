# Spec — Integrazione Prodotto AV Trading Starter

## Problema
Aggiungere un nuovo prodotto digitale one-time "AV Trading Starter" al progetto AV-INVEST Research riutilizzando l'architettura esistente di AV Market Lens, senza reinventare pattern e senza alterare il comportamento dei prodotti esistenti (Market Lens, Research Club, corsi Foundations/Trading Lab).

## Utenti e obiettivi
- **Utenti finali**: principianti che cercano materiale educativo entry-level su grafici, trend, livelli e gestione del rischio a €9,90 una tantum.
- **Admin**: possibilità di caricare/sostituire il PDF privato del prodotto da pannello admin.
- **Obiettivo primario**: lancio di un prodotto entry-level chiaramente distinguibile e funzionalmente coerente con lo stack esistente.

## Non-goals
- Nessun refactor generale del codice esistente.
- Nessuna modifica al comportamento di AV Market Lens, Research Club o dei corsi formativi (Foundations/Trading Lab).
- Nessuna modifica al pricing o architetturale fuori dallo scope indicato.
- Nessun commit/push.
- Nessuna nuova migration a meno di requisiti imprescindibili.

---

## Requisiti funzionali

### F1 — Prodotto e Pricing
- Slug prodotto: `trading-starter`
- Nome: `AV Trading Starter`
- Claim: `Capire i mercati da zero`
- Prezzo: €9,90 one-time (amountInCents: 990)
- Billing mode: `one_time`
- Aggiunto a PRODUCT_ALLOWLIST in [pricing.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/lib/stripe/pricing.ts) con:
  - envKey: `STRIPE_PRICE_AV_TRADING_STARTER`
  - slug: `trading-starter`
  - title: `AV Trading Starter`
  - amountInCents: 990
  - currency: EUR
  - billingMode: one_time
- Aggiornato tipo `ResolvedProduct['slug']` union type per includere `trading-starter`.
- Price ID reale: `price_1UInQCEBXXQk4TaCn6hpBiKs` caricato da env `STRIPE_PRICE_AV_TRADING_STARTER`.
- Contenuto: 1 PDF privato scaricabile.

### F2 — Homepage
- Sezione compatta premium nella homepage, **PRIMA di AV Market Lens.
- Tema: Dark AV-INVEST (nero/verde/bianco).
- Dimensione chiaramente più piccola di Market Lens (entry-level, compatto).
- Copy breve: guida per principianti su grafici, trend, livelli e gestione del rischio.
- Mostra prezzo €9,90 una tantum + CTA "Scarica la guida".
- Deve risultare chiaramente percepito come prodotto entry-level rispetto a Market Lens.
- Gestisce gli stati di entitlement: locked / payment_pending / owned (con redirect coerente con Market Lens).
- Stato owned: badge "Nel tuo account" + link a /area-membri/prodotti.
- Stato payment_pending: badge "Pagamento in corso" + pulsante resume checkout.
- Stato locked: CTA principale.

### F3 — Backend / Stripe
- slug `trading-starter` nella product allowlist (F1 già copre).
- Utilizza flusso checkout esistente `/api/stripe/checkout` (nessuna sola rotta, nessuna nuova architettura nuova):
  - redirect post-checkout di successo → `/area-membri/prodotti` come Market Lens (stessa esperienza "I miei prodotti".
  - redirect post-checkout cancellato → `/#trading-starter` (hash anchor sezione homepage).
  - Acquisto associato all'account autenticato.
  - Controllo already-succeeded pre-checkout (409 + redirect a /area-membri/prodotti se già acquistato).
  - Consenso digitale (stessi pattern di Market Lens: termini + recesso per contenuti digitali, versione v1.
- Webhook Stripe `checkout.session.completed` e `async_payment_succeeded`/failed` gestiti tramite `syncPurchase` esistente: productSlug=trading-starter è già un known slug quindi l
  che `isKnownProductSlug` lo riconosce.
- Refund: `charge.refunded` → `applyChargeRefund` aggiorna lo status Purchase a `refunded` → l'entitlement logic già funziona automaticamente perché `loadPurchases` seleziona solo `succeeded` e `pending` recenti → l'accesso è revocato al prossimo controllo (regola.

### F4 — Entitlement / Area Membri
- In "I miei prodotti" aggiungere card AV Trading Starter.
- Stati: locked / payment_pending / owned.
- Se owned → mostra data acquisto + pulsante download PDF.
- Se payment_pending → messaggio e pulsante resume checkout.
- Se locked → link alla sezione homepage `/#trading-starter.
- Aggiunto tipo `TradingStarterEntitlement` e campo `tradingStarter` in `EntitlementsState` e `DEFAULT_ENTITLEMENT_STATE` e `buildLockedEntitlements()`.
- Aggiornata `getEntitlements()` per leggere da Purchase productSlug=trading-starter.

### F5 — Storage / Admin
- Storage Vercel Blob PRIVATO, chiave fissa: `products/av-trading-starter/AV-Trading-Starter.pdf
- Nessun URL pubblico permanente.
- Max PDF 25 MB.
- Pagina admin `/admin/trading-starter` per caricare/sostituire il PDF.
- Riuso pattern di `/admin/market-lens` (stesso stile upload form, action, riutilizzo `requireAdmin`, riutilizzo storage lib).
- Aggiunte a storage lib costanti e funzioni `TRADING_STARTER_STORAGE_KEYS`, `TRADING_STARTER_SIZE_LIMITS`, `getTradingStarterStream`, `serverUploadTradingStarter`, tipo `TradingStarterKind` (solo `pdf`).

### F6 — Endpoint Download Protetto
- Endpoint: `/api/products/trading-starter/download/route.ts (o / kind non necessario, singolo endpoint singolo file: PDF)
- Auth obbligatoria (401 se non autenticato).
- Verifica Purchase productSlug=trading-starter status=succeeded per userEmail normalizzato (403 se non trovato).
- Admin bypass (se `isAdminSession` non necessità di Purchase check).
- Rate limit: max 3 download ogni 60 minuti / account tramite `checkAndConsumeDownload` esistente, scope `trading-starter`, resourceKey `pdf`.
- HTTP 429 + header `Retry-After` + messaggio rate limit + `Cache-Control: private, no-store`.
- Risposta stream PDF: Content-Type application/pdf, Content-Disposition attachment filename AV-Trading-Starter.pdf, Cache-Control private/no-store/no-cache/must-revalidate, X-Content-Type-Options nosniff.
- `Cache-Control: private, no-store` in risposta (anche successo.

### F7 — Legale
Aggiornare SOLO dove necessario:
- **Termini** ([termini/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/termini/page.tsx)):
  - Aggiungere bullet "Acquisto one-time AV Trading Starter" nella sezione "1. Oggetto e ambito".
  - Aggiungere "AV Trading Starter" nella lista servizi sez 2.
  - Aggiungere nuova sezione (o aggiunta sez 11 esistente sezione prodotto one-time per AV Trading Starter: natura educativo/informativo, non consulenza, licenza personale/non trasferibile, divieto condivisione/rivendita.
- **Disclaimer** ([disclaimer/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/disclaimer/page.tsx)):
  - Aggiungere sezione AV Trading Starter: materiale esclusivamente educativo/informativo, non consulenza finanziaria, non raccomandazione, non segnale operativo e non promessa di risultati.
  - Aggiornare ultimo paragrafo ambito di applicazione.
- **FAQ** ([FAQ.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/components/sections/FAQ.tsx)):
  - Aggiungere 2-3 domande: cos'è, cosa ricevi esattamente dopo acquisto, dov'è dopo il file, è un segnale?
- **Privacy** ([privacy/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/privacy/page.tsx)):
  - Aggiornare SOLO se il testo attuale richiede la citazione esplicita del nuovo prodotto (vedere ambito applicazione sez 2 e forse sez 3.2 dati di acquisto e sez 4.A — se nominativo esplicito prodotti).

## Requisiti non-funzionali
- **NFR1 — Riutilizzo pattern esistenti di Market Lens (nessuna nuova architettura).
- **NFR2 — Compatibilità TypeScript strictness: tutto il codice compila senza errori tsc.
- **NFR3 — Privacy dei dati: tutti i file protetti serviti solo da rotte server, nessun URL pubblico.
- **NFR4 — Accessibilità: WAI-ARIA, tag semantici, focus visible, ecc. pattern esistenti.
- **NFR5 — Rate limiter riutilizzato esistente.
- **NFR6 — Admin bypass correttamente implementato.

## Assunzioni
- Price ID Stripe `price_1UInQCEBXXQk4TaCn6hpBiKs` è già creato sul dashboard Stripe e associato al prodotto AV Trading Starter.
- Env `STRIPE_PRICE_AV_TRADING_STARTER` sarà settata dall'admin dopo il deploy (non è compito nostro settarla).
- Nessuna migration necessaria (Purchase table già esiste productSlug è di tipo string libero, nessun constraint enum limitato).
- Vercel Blob già configurato per altri prodotti (BLOB_READ_WRITE_TOKEN disponibile).

## Criteri di Accettazione (AC)

### AC Regole (oggettivamente verificabili)
AC-R1. Lo slug `trading-starter` è presente in PRODUCT_ALLOWLIST e risolve il product con envKey corretta e amountInCents=990.
AC-R2. `isKnownProductSlug('trading-starter')` restituisce true.
AC-R3. `resolveProduct('trading-starter')` restituisce il prodotto con billingMode=one_time e title corretto quando env presente.
AC-R4. Homepage contiene una sezione TradingStarter inserita PRIMA di `<MarketLens />` nel file page.tsx.
AC-R5. Checkout `slug trading-starter redirect di successo a /area-membri/prodotti?checkout=success.
AC-R6. Refund pieno di un Purchase trading-starter (status=refunded) → l'utente NON ha status locked (non owned).
AC-R7. Endpoint download restituisce 401 senza auth, 403 senza Purchase succeeded, 200 con entitlement corretto con auth + Purchase succeeded.
AC-R8. Endpoint download restituisce 429 + Retry-After > 0 dopo 4 download nella stessa finestra 60min per stesso account (non admin).
AC-R9. Admin può bypass download 4 download entro 60min non riceve 429.
AC-R10. Endpoint download header Cache-Control contiene private e no-store.
AC-R11. Storage key esatta `products/av-trading-starter/AV-Trading-Starter.pdf`.
AC-R12. PDF upload admin page esiste /admin/trading-starter e richiede admin auth.
AC-R13. "I miei prodotti" mostra card TradingStarter con stati locked/payment_pending/owned.
AC-R14. `owned` mostra data acquisto e pulsante download.
AC-R15. Termini contengono esplicitamente AV Trading Starter come materiale educativo non consulenza, licenza non trasferibile, divieto condivisione.
AC-R16. Disclaimer menziona AV Trading Starter.
AC-R17. FAQ contiene almeno 2 domande su Trading Starter.
AC-R18. Nessun file Market Lens o Research Club modificati nel loro comportamento funzionale (stessi test, stessi output).
AC-R19. `npm run typecheck` passa senza errori.

### Criteri valutativi (rubriche)
AC-V1. **Coerenza architetturale (0-2)**:
  - 2: tutti i nuovi moduli (se homepage, admin, download, entitlements) seguono esattamente i pattern di Market Lens.
  - 1: alcuni piccole differenze stilistiche ma leggere non impattano funzionalmente.
  - 0: pattern inventati ex novo non coerenti.
  - Soglia: ≥2.
AC-V2. **Qualità UI sezione homepage entry-level (0-2):
  - 2: sezione compatta premium, chiaramente più piccola di Market Lens, risulta entry-level.
  - 1: sezione presente ma dimensioni quasi uguale a Market Lens.
  - 0: sezione confusionaria o troppo grande.
  - Soglia: ≥2.
AC-V3. **Completezza legale (0-2):
  - 2: Termini, Disclaimer, FAQ e Privacy aggiornati correttamente e coerentemente con pattern esistenti.
  - 1: almeno 3 su 4 corretti.
  - 0: più di 1 documento legale incompleto.
  - Soglia: ≥2.
