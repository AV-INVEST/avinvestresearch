# Tasks — AV Trading Starter Integration

Priority legend: `high` = block downstream, `medium` = parallelizzabile, `low` = optional/finishing.

## Task 1: Product Allowlist + Site Config
- **ID**: T1
- **Priority**: high
- **Dipendenze**: nessuna
- **Status**: pending
- **AC coperti**: AC-R1, AC-R2, AC-R3
- **File da modificare**:
  - [pricing.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/lib/stripe/pricing.ts) — aggiungi `trading-starter` a PRODUCT_ALLOWLIST, estendi ResolvedProduct union type.
  - [siteConfig.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/config/siteConfig.ts) — aggiungi oggetto `tradingStarter` con slug, title, tagline, description, price=9.9, currency='EUR', notes.
- **Regole di Test (TR)**:
  - TR-R1: TypeScript compila senza errori dopo la modifica dei tipi.
  - TR-R2: `resolveProduct({slug:'trading-starter'})` se env presente → restituisce amountInCents=990 e billingMode=one_time.

---

## Task 2: Entitlements Extension
- **ID**: T2
- **Priority**: high
- **Dipendenze**: T1
- **Status**: pending
- **AC coperti**: AC-R13
- **File da modificare**:
  - [entitlements.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/lib/entitlements.ts) — aggiungi `TradingStarterStatus` (locked/payment_pending/owned), interfaccia `TradingStarterEntitlement`, campo `tradingStarter` in `EntitlementsState` + `DEFAULT_ENTITLEMENT_STATE` + `buildLockedEntitlements()`, aggiorna `getEntitlements()` per leggere productSlug=`trading-starter` da Purchase e impostare status, purchasedAt, createdAt.
- **Regole di Test (TR)**:
  - TR-R1: TypeScript compila senza errori.
  - TR-R2: Purchase succeeded trading-starter → status owned + purchasedAt valorizzato.
  - TR-R3: Purchase pending trading-starter → status payment_pending.
  - TR-R4: Nessun Purchase → status locked.
  - TR-R5: Purchase refunded non viene preso in carico da loadPurchases (status=succeeded è l'unico per owned).

---

## Task 3: Storage per Trading Starter PDF
- **ID**: T3
- **Priority**: high
- **Dipendenze**: T1
- **Status**: pending
- **AC coperti**: AC-R11
- **File da modificare**:
  - [storage/index.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/lib/storage/index.ts) — aggiungi:
    - `TRADING_STARTER_STORAGE_KEYS = { pdf: 'products/av-trading-starter/AV-Trading-Starter.pdf' } as const`
    - `TRADING_STARTER_SIZE_LIMITS = { pdf: 25 * 1024 * 1024 } as const`
    - tipo `TradingStarterKind = keyof typeof TRADING_STARTER_STORAGE_KEYS`
    - `getTradingStarterStorageKey(kind)`
    - `getTradingStarterStream(kind)` — riusa pattern di `getMarketLensStream` ma con storage key trading-starter
    - `serverUploadTradingStarter(kind, data, opts)` — riusa pattern di `serverUploadMarketLens` (pdf solo type application/pdf, check size, Vercel Blob put private, same key overwrite, allowOverwrite:true)
- **Regole di Test (TR)**:
  - TR-R1: storage key pdf esatta `products/av-trading-starter/AV-Trading-Starter.pdf`
  - TR-R2: size limit pdf = 25 MB.
  - TR-R3: TypeScript compila.

---

## Task 4: Sezione Homepage TradingStarter + Checkout Button
- **ID**: T4
- **Priority**: high
- **Dipendenze**: T1, T2
- **Status**: pending
- **AC coperti**: AC-R4, parte AC-V2
- **File da creare/modificare**:
  - Crea [components/sections/TradingStarter.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/components/sections/TradingStarter.tsx) — sezione compatta premium (dimensione circa 50-60% di Market Lens, meno padding, layout compatto), tema nero/verde/bianco, eyebrow "ENTRY-LEVEL · GUIDA PDF", titolo "AV Trading Starter", claim + copy breve principianti grafici trend livelli rischio, prezzo 9,90€ una tantum, CheckCircle notes list, CTA "Scarica la guida". Usa `resolveTradingStarterEntitlement` come pattern di MarketLens. Stati owned/pending/locked.
  - Crea [components/sections/TradingStarterCheckoutButton.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/components/sections/TradingStarterCheckoutButton.tsx) — pattern identico a MarketLensCheckoutButton ma slug='trading-starter', prezzo label 9,90€, CTA "Acquista a 9,90 €", anchor `/#trading-starter` per login redirect, consenso digitale termini e recesso.
  - Modifica [app/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/page.tsx) — importa TradingStarter e inseriscilo TRA Positioning e MarketLens (ordine corretto: Positioning → **TradingStarter** → MarketLens).
- **Regole di Test (TR)**:
  - TR-R1: TypeScript compila.
  - TR-R2: Ordine render homepage corretto: Positioning, TradingStarter, MarketLens.
  - TR-R3: Stato owned → redirect /area-membri/prodotti.
  - TR-R4: Stato pending → resume pulsante.
  - TR-Rubrica: AC-V2 ≥2.

---

## Task 5: Stripe Checkout Route + Success/Cancel Redirects
- **ID**: T5
- **Priority**: high
- **Dipendenze**: T1
- **Status**: pending
- **AC coperti**: AC-R5
- **File da modificare**:
  - [api/stripe/checkout/route.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/api/stripe/checkout/route.ts):
    - Estendi `ownedRedirectResponse` union type per includere `trading-starter`, redirect `/area-membri/prodotti` come market-lens.
    - `resolveBaseUrl` e `successPath`: aggiungi caso trading-starter → `/area-membri/prodotti`.
    - `cancelPath`: aggiungi caso trading-starter → `/#trading-starter`.
    - `createPendingPurchase`: `createPendingPurchase` con trading-starter e consenso digitale (come market-lens).
    - metadata Stripe: aggiungi consenso versioni per trading-starter (stessi pattern market-lens).
- **Regole di Test (TR)**:
  - TR-R1: checkout slug=trading-starter → successUrl include /area-membri/prodotti?checkout=success.
  - TR-R2: cancelUrl → /#trading-starter?checkout=cancelled.
  - TR-R3: already owned → 409 redirect /area-membri/prodotti.
  - TR-R4: consenso digitale controllo per trading-starter come market-lens.

---

## Task 6: Endpoint Download Protetto
- **ID**: T6
- **Priority**: high
- **Dipendenze**: T2, T3
- **Status**: pending
- **AC coperti**: AC-R7, AC-R8, AC-R9, AC-R10
- **File da creare**:
  - Crea [app/api/products/trading-starter/download/route.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/api/products/trading-starter/download/route.ts) (non serve [kind], singolo pdf):
    - auth check → 401 se non autenticato.
    - userEmail normalizzato → 400 se assente.
    - isAdmin check: se admin, skippa rate limit e skip purchase check.
    - rate limit: `checkAndConsumeDownload(userEmail, [{ scope: 'trading-starter', resourceKey: 'pdf', windowSizeMinutes: 60, maxCount: 3 }])`; se bloccato → 429 + Retry-After + Cache-Control private/no-store.
    - non admin → check Purchase productSlug=trading-starter status=succeeded → 403 se non trovato.
    - `getTradingStarterStream('pdf')` → stream, content-type application/pdf, filename AV-Trading-Starter.pdf, Content-Disposition attachment, Cache-Control private no-store no-cache must-revalidate, X-Content-Type-Options nosniff.
- **Regole di Test (TR)**:
  - TR-R1: no auth → 401.
  - TR-R2: auth + no Purchase → 403.
  - TR-R3: auth + Purchase succeeded → 200 stream pdf.
  - TR-R4: 4 download stessa finestra 60min non admin → 429 + Retry-After.
  - TR-R5: admin → 4 download non riceve 429.
  - TR-R6: header Cache-Control contiene private e no-store.

---

## Task 7: Pagina Admin Upload Trading Starter
- **ID**: T7
- **Priority**: high
- **Dipendenze**: T3
- **Status**: pending
- **AC coperti**: AC-R12
- **File da creare/modificare**:
  - Crea [app/admin/trading-starter/actions.ts](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/admin/trading-starter/actions.ts) — 'use server', `uploadTradingStarterFile(formData)`: requireAdmin, tipo file pdf, size ≤25MB, mime application/pdf, contentLength check, `serverUploadTradingStarter('pdf', buffer, { contentType: 'application/pdf', fileName, contentLength })`, revalidate path /admin/trading-starter e /area-membri/prodotti.
  - Crea [app/admin/trading-starter/trading-starter-upload-form.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/admin/trading-starter/trading-starter-upload-form.tsx) — client upload form pattern identico a market-lens-upload-form (dropzone, progress, error, success).
  - Crea [app/admin/trading-starter/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/admin/trading-starter/page.tsx) — pagina admin, auth check + admin check, GlassCard + status file presenza + upload form single PDF, note operative chiave storage `products/av-trading-starter/AV-Trading-Starter.pdf`.
- **Regole di Test (TR)**:
  - TR-R1: non admin → 404 notFound().
  - TR-R2: non auth → redirect login.
  - TR-R3: TypeScript compila.

---

## Task 8: Area Membri / I miei prodotti Trading Starter
- **ID**: T8
- **Priority**: high
- **Dipendenze**: T2, T6
- **Status**: pending
- **AC coperti**: AC-R13, AC-R14
- **File da modificare**:
  - [components/products/DownloadButton.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/components/products/DownloadButton.tsx) — estendi KIND_ENDPOINT con tipo `trading-starter-pdf` endpoint `/api/products/trading-starter/download`, KIND_FILENAME_HINT 'AV-Trading-Starter.pdf', KIND_ICON FileText. Oppure opzione più chiara: aggiungi tipo separato (oppure crea wrapper semplice). Soluzione pulita: estendi Kind union type a 'indicator' | 'guide' | 'trading-starter-pdf'.
  - [area-membri/prodotti/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/area-membri/prodotti/page.tsx) — aggiungi card TradingStarter DOPO MarketLens (o PRIMA? entry level va prima — ordine corretto: TradingStarter card → MarketLens card). Card pattern identica a MarketLens: stato badge locked/payment_pending/owned, owned mostra data acquisto + DownloadButton kind='trading-starter-pdf' label "Scarica la guida PDF" subLabel "Guida PDF per principianti".
- **Regole di Test (TR)**:
  - TR-R1: card TradingStarter visibile in /area-membri/prodotti.
  - TR-R2: owned → data acquisto + pulsante download.
  - TR-R3: payment_pending → resume pulsante.
  - TR-R4: locked → link a /#trading-starter.
  - TR-R5: TypeScript compila.

---

## Task 9: Pagine Legali
- **ID**: T9
- **Priority**: medium
- **Dipendenze**: T1
- **Status**: pending
- **AC coperti**: AC-R15, AC-R16, AC-R17
- **File da modificare**:
  - [termini/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/termini/page.tsx):
    - Sez 1 lista ambiti applicazione → aggiungi bullet "Acquisto one-time AV Trading Starter".
    - Sez 2 lista servizi → aggiungi bullet "AV Trading Starter: prodotto digitale one-time venduto con pagamento a tantum che include il download di una guida PDF privata riservata al solo account che ha completato l'acquisto. Materiale esclusivamente educativo/informativo: non costituisce consulenza finanziaria, non raccomandazione, non segnale operativo, non promessa di risultati. Licenza personale/non trasferibile e divieto di condivisione/rivendita."
    - Sez 11 (Market Lens o dopo Market Lens sezione): aggiungi sezione 11bis "12. AV Trading Starter: guida PDF one-time" con dettagli natura educativa, licenza, divieto condivisione, recesso escluso per fornitura immediata (stessi pattern Market Lens recesso art.59).
  - [disclaimer/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/disclaimer/page.tsx):
    - Dopo sez 10 (Market Lens marker) o prima sez 11 → sez "10bis. AV Trading Starter: materiale educativo PDF" — testo specifico: "AV Trading Starter è una guida PDF educativa venduta come prodotto digitale one-time. Il contenuto ha natura esclusivamente formativa, illustrativa e informativa e NON costituisce in alcun modo: consulenza finanziaria personalizzata, raccomandazione di investimento, segnale operativo di acquisto/vendita, suggerimento di strategia, promessa di rendimento o garanzia di risultati. L'utente assume ogni responsabilità per decisioni autonome sui mercati."
    - Aggiorna ultimo paragrafo ambito di applicazione per includere esplicitamente AV Trading Starter.
  - [components/sections/FAQ.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/components/sections/FAQ.tsx) — aggiungi 3 FAQ:
    1. "Cos'è AV Trading Starter?" → guida PDF entry-level principianti grafici, trend, livelli, gestione del rischio, materiale educativo, non segnali.
    2. "Cosa ricevo esattamente dopo l'acquisto di AV Trading Starter?" → 1 PDF guida privato dall'area membri "I miei prodotti", account autorizzato, nessun link pubblico, nessun altro file.
    3. "AV Trading Starter è un segnale di acquisto o vendita?" → No. Assolutamente no. È solo materiale educativo/informativo, nessun consiglio personalizzato.
  - [privacy/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/privacy/page.tsx):
    - Verifica se testi richiedono citazione esplicita: Sez 2 ambito di applicazione e Sez 4.A finalità trattamento — se già nominati AV Market Lens, aggiungere AV Trading Starter negli stessi bullet in coppia (es. "Acquisto one-time del prodotto digitale AV Market Lens e AV Trading Starter").
- **Regole di Test (TR)**:
  - TR-R1: Termini contiene AV Trading Starter e clausole educativo + non trasferibile.
  - TR-R2: Disclaimer contiene sezione AV Trading Starter.
  - TR-R3: FAQ contiene ≥2 domande Trading Starter.
  - TR-Rubrica: AC-V3 ≥2.

---

## Task 10: Admin Navbar / Layout Link
- **ID**: T10
- **Priority**: low
- **Dipendenze**: T7
- **Status**: pending
- **AC coperti**: N/D (facilitazione admin)
- **File da verificare/modificare**: Eventualmente aggiungi link a /admin/trading-starter nell'admin layout o pagina principale admin. Verifica [admin/layout.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/admin/layout.tsx) o [admin/page.tsx](file:///C:/Users/viva_/Desktop/AVINVESTRESEARCH/src/app/admin/page.tsx).
- **Regole di Test (TR)**: TypeScript compila.

---

## Task 11: Verifica Finale (TypeCheck)
- **ID**: T11
- **Priority**: high
- **Dipendenze**: T1-T9 completati
- **Status**: pending
- **AC coperti**: AC-R19
- **Azione**:
  1. Esegui `npm run typecheck`.
  2. Se errori, correggi minimal edit.
  3. Riporta risultato finale.
- **Regole di Test (TR)**:
  - TR-R1: tsc exit code 0. Nessun errore TypeScript.
