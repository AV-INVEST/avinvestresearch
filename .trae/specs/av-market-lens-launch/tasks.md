# Piano di implementazione: AV Market Lens

Mappa ogni Acceptance Criterion → task atomici, ordinati per dipendenza, con priorità e Test Requirement locali.

---

## Task 1: Configurazione base (siteConfig + pricing + .env.example)
- **Priorità**: high
- **Dipendenze**: nessuna
- **AC coperti**: AC1, AC2, AC3
- **Descrizione**:
  1. Aggiungere `marketLens` a `src/config/siteConfig.ts` con slug, title, price, features, note, description.
  2. Aggiornare `siteConfig.navigation` per includere `'AV Market Lens' → '/#market-lens'`.
  3. Aggiornare `src/lib/stripe/pricing.ts`: estendere `ResolvedProduct['slug']` union, aggiungere entry `'market-lens'` in PRODUCT_ALLOWLIST.
  4. Aggiornare `.env.example`:
     - aggiungere `STRIPE_PRICE_AV_MARKET_LENS=` dopo gli altri price
     - aggiungere il mancante `STRIPE_PRICE_AV_RESEARCH_CLUB=`
     - sostituire `VERCEL_BLOB_READ_WRITE_TOKEN` con `BLOB_READ_WRITE_TOKEN` nella sezione private storage
  5. Aggiornare `siteConfig.legal.extendedDisclaimer`? — NO, AC14 è separato.
- **Modifiche file**:
  - `src/config/siteConfig.ts`
  - `src/lib/stripe/pricing.ts`
  - `.env.example`
- **TR locali**:
  - **rule**: `tsc --noEmit` non riporta errori di tipo per `marketLens` e nuova union slug.
  - **rule**: `resolveProduct('market-lens')` in playground locale restituisce `{ amountInCents: 3990, billingMode: 'one_time' }` quando env valorizzata.
  - **rule**: `.env.example` diff contiene esattamente le 3 modifiche richieste (2 nuove price + 1 rename token).
- **Completion Evidence**: link alle righe modificate, output typecheck parziale.

---

## Task 2: Prisma schema + migration consenso digitale
- **Priorità**: high
- **Dipendenze**: Task 1
- **AC coperti**: AC7
- **Descrizione**:
  1. Modificare `prisma/schema.prisma` aggiungendo a `Purchase`:
     - `consentTermsVersion String? @db.VarChar(32)`
     - `consentDigitalWithdrawalVersion String? @db.VarChar(32)`
     - `consentAcceptedAt DateTime?`
  2. Eseguire `prisma migrate dev --create-only --name add_consent_fields_to_purchase` per generare SQL senza applicarlo.
  3. Verificare che la migration SQL sia corretta (3 colonne nullable su Purchase).
- **Modifiche file**:
  - `prisma/schema.prisma`
  - `prisma/migrations/YYYYMMDDHHMMSS_add_consent_fields_to_purchase/migration.sql` (nuovo)
- **TR locali**:
  - **rule**: `prisma generate` non riporta errori.
  - **rule**: Migration file SQL contiene 3 `ALTER TABLE "Purchase" ADD COLUMN` con i tipi corretti.
- **Completion Evidence**: path migration creata, output prisma validate.

---

## Task 3: Aggiornamento webhook e syncPurchase per consenso
- **Priorità**: high
- **Dipendenze**: Task 2
- **AC coperti**: AC6 (parte server side)
- **Descrizione**:
  1. Aggiornare `SyncPurchaseInput` in `src/lib/stripe/purchase-sync.ts` per includere i 3 campi consenso opzionali.
  2. Aggiornare la funzione `syncPurchase` per salvare questi 3 campi in create/update.
  3. Aggiornare `metadataFromSession` per estrarre `consent_terms_v`, `consent_digital_withdrawal_v`, `consent_at` dalla session metadata e convertirli in tipi Prisma.
  4. Aggiornare `handleCheckoutSessionCompleted` e `handleAsyncPaymentSucceeded` in `src/app/api/stripe/webhook/route.ts` per leggere i metadata consenso e passarli a `syncPurchase`.
- **Modifiche file**:
  - `src/lib/stripe/purchase-sync.ts`
  - `src/app/api/stripe/webhook/route.ts`
- **TR locali**:
  - **rule**: Typecheck passa senza errori.
  - **rule**: `syncPurchase` upsert include i 3 nuovi campi nel Prisma data payload.
- **Completion Evidence**: righe modificate.

---

## Task 4: Sezione homepage MarketLens.tsx + integrazione page.tsx
- **Priorità**: high
- **Dipendenze**: Task 1
- **AC coperti**: AC4, AC5
- **Descrizione**:
  1. Creare `src/components/sections/MarketLens.tsx`:
     - `id="market-lens"` e `aria-labelledby="ml-heading"`
     - Hero con GlassCard e immagine prodotto (usare immagine esistente in assets, posizionare con Next.js Image se possibile, o `<img>` semplice se in /assets)
     - 6 box feature con icone lucide: Trend, Livelli chiave, Volatilità, Sessioni, Contesto giornaliero, Setup evidenziati
     - Box "Ricevi dopo l'acquisto": Pine Script + Guida PDF
     - Prezzo 39,90 € + info una tantum
     - Componente `MarketLensCheckoutButton` (creato nel Task 6; per ora renderizzare un placeholder o importarlo dopo Task 6)
     - Disclaimer breve
  2. Importare e montare in `src/app/page.tsx`: `<Positioning />`, POI `<MarketLens />`, POI `<Courses />`.
  3. Verificare che `siteConfig.navigation` (già modificato in Task 1) appaia nella navbar pubblica.
- **Modifiche file**:
  - `src/components/sections/MarketLens.tsx` (nuovo)
  - `src/app/page.tsx`
- **TR locali**:
  - **rule**: Elemento con `id="market-lens"` presente nel DOM della homepage (verifica build).
  - **rubric** Responsive (0-2, soglia ≥1): su viewport 375px la sezione non scrolla orizzontalmente, CTA leggibile.
  - **rule**: Ordine sezione Positioning → MarketLens → Courses confermato.
- **Completion Evidence**: preview screenshot / output di compilazione.

---

## Task 5: Estensione checkout route product-aware + consenso server
- **Priorità**: high
- **Dipendenze**: Task 1, Task 2, Task 3
- **AC coperti**: AC6 (server validate), AC8
- **Descrizione**:
  1. Aggiornare payload interface `CheckoutPayload` in `src/app/api/stripe/checkout/route.ts` per accettare opzionalmente `consent_terms_version`, `consent_digital_withdrawal_version`, `consent_accepted_at`.
  2. Validazione server: se `slug === 'market-lens'`, rifiuta HTTP 400 se anche uno dei 3 campi consenso è mancante/vuoto/diverso dalle versioni attese.
  3. `resolveBaseUrl` invariato, ma `successUrl` e `cancelUrl` diventano product-aware:
     - `market-lens` → success `/area-membri/prodotti?...`, cancel `/#market-lens?...`
     - sottoscrizioni → come oggi
     - altri one-time → come oggi
  4. Nel metadata Stripe della checkout session, includere i 3 campi consenso per `market-lens`.
  5. Aggiornare `ownedRedirectResponse` per `slug=market-lens` → `redirectTo: '/area-membri/prodotti'` (mantenere `'/area-membri/percorsi'` per i corsi).
- **Modifiche file**:
  - `src/app/api/stripe/checkout/route.ts`
- **TR locali**:
  - **rule**: POST con `{slug: 'market-lens'}` SENZA campi consenso → risposta HTTP 400.
  - **rule**: POST con `{slug: 'market-lens', ...consent}` → `successUrl` inizia con `.../area-membri/prodotti`.
  - **rule**: POST `{slug: 'foundations'}` → success URL invariato `/area-membri...`.
- **Completion Evidence**: snippet di test curl / build verificata.

---

## Task 6: MarketLensCheckoutButton + modale consenso client
- **Priorità**: high
- **Dipendenze**: Task 4, Task 5
- **AC coperti**: AC6 (parte client), AC4 (CTA)
- **Descrizione**:
  1. Creare `src/components/sections/MarketLensCheckoutButton.tsx` come client component (pattern analogo a `CourseCheckoutButton` ma aggiungendo modale).
  2. Creare la modale consenso con 2 checkbox NON preselezionate, label con link a `/termini` e `/disclaimer`.
  3. Bottone "Procedi al pagamento" abilitato solo quando entrambe le checkbox sono checked.
  4. Al click di "Procedi":
     - leggere versione consenso costante
     - generare timestamp ISO locale
     - inviare tutto a `/api/stripe/checkout` insieme a `slug: 'market-lens'`
     - redirect a URL Stripe restituito
  5. Gestire 409 (già posseduto) → redirect a `/area-membri/prodotti`.
  6. Gestire 401 → redirect a `/login?callbackUrl=/#market-lens`.
  7. Montare il bottone nella sezione `MarketLens.tsx`.
- **Modifiche file**:
  - `src/components/sections/MarketLensCheckoutButton.tsx` (nuovo)
  - `src/components/sections/MarketLens.tsx` (aggiunta import e rendering bottone)
- **TR locali**:
  - **rule**: Checkbox non sono preselezionate inizialmente (verifica React state).
  - **rule**: Bottone Procedi è `disabled` se almeno una checkbox non checkata.
  - **rule**: Payload fetch include i 3 campi consenso + slug.
  - **rubric** Accessibilità (0-2, soglia ≥1): modale con `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap base.
- **Completion Evidence**: codice componenti.

---

## Task 7: Estensione entitlements per Market Lens
- **Priorità**: high
- **Dipendenze**: Task 1, Task 2
- **AC coperti**: AC9 (logica entitlement), AC10 (card in panoramica)
- **Descrizione**:
  1. In `src/lib/entitlements.ts`:
     - aggiungere tipi `MarketLensStatus = 'locked' | 'payment_pending' | 'owned'` e `MarketLensEntitlement { status, purchasedAt: Date|null, message, entitlement }`
     - aggiungere `marketLens: MarketLensEntitlement` a `EntitlementsState` e `DEFAULT_ENTITLEMENT_STATE`
     - in `loadPurchases` e `getEntitlements`, processare anche `productSlug='market-lens'` per determinare lo stato (succeeded → owned, pending recente → payment_pending, altri → locked)
  2. Aggiornare `buildLockedEntitlements` per includere stato locked di default.
- **Modifiche file**:
  - `src/lib/entitlements.ts`
- **TR locali**:
  - **rule**: Con Purchase succeeded → `state.marketLens.status === 'owned'`.
  - **rule**: Senza Purchase → `'locked'`.
  - **rule**: Con Purchase pending creato <2h → `'payment_pending'`.
  - **rule**: Typecheck passa.
- **Completion Evidence**: righe modificate.

---

## Task 8: Pagina /area-membri/prodotti + nav area membri
- **Priorità**: high
- **Dipendenze**: Task 7
- **AC coperti**: AC9
- **Descrizione**:
  1. In `src/app/area-membri/layout.tsx`: aggiungere al NAV `{ href: '/area-membri/prodotti', label: 'I miei prodotti', Icon: Package }`. Importare `Package` da lucide-react (già installato).
  2. Creare `src/app/area-membri/prodotti/page.tsx`:
     - Server Component, redirect a login se non autenticato (come `/area-membri/research-club`).
     - Ottenere entitlements via `getEntitlements`.
     - Renderizzare stato locked / payment_pending / owned con UI coerente al design system.
     - `owned`: due bottoni client-component che inviando richiesta POST/GET alle route download.
- **Modifiche file**:
  - `src/app/area-membri/layout.tsx`
  - `src/app/area-membri/prodotti/page.tsx` (nuovo)
- **TR locali**:
  - **rule**: Rotta protetta: non autenticato → redirect login.
  - **rule**: Stato owned mostra due CTA download; stato pending mostra banner + PendingPaymentRefresher; stato locked mostra CTA a /#market-lens.
  - **rule**: Voce nav "I miei prodotti" presente.
- **Completion Evidence**: path file creati, righe modificate.

---

## Task 9: Card Market Lens nella Panoramica area membri
- **Priorità**: medium
- **Dipendenze**: Task 7, Task 8
- **AC coperti**: AC10
- **Descrizione**:
  1. In `src/app/area-membri/page.tsx`: aggiungere una GlassCard per AV Market Lens, pattern analogo alla card Research Club ma one-time.
  2. Mostrare entitlement status, data acquisto, CTA condizionali.
- **Modifiche file**:
  - `src/app/area-membri/page.tsx`
- **TR locali**:
  - **rule**: Card presente e leggibile sia owned che locked.
  - **rule**: CTA owned → `/area-membri/prodotti`.
- **Completion Evidence**: righe modificate.

---

## Task 10: Storage helper generico + route download API
- **Priorità**: high
- **Dipendenze**: Task 1, Task 7
- **AC coperti**: AC11
- **Descrizione**:
  1. Estendere `src/lib/storage/index.ts`:
     - aggiungere helper `getMarketLensStream(kind: 'indicator' | 'guide')` che mappa alle chiavi fisse e usa `@vercel/blob get {access: 'private'}`.
     - aggiungere helper `marketLensServerUpload(kind, data, contentType)` per upload admin.
     - aggiungere vincoli dimensione MIME.
  2. Creare `src/app/api/products/market-lens/download/indicator/route.ts`:
     - metodo GET
     - auth + purchase check succeeded
     - stream con header text/plain + attachment AV-Market-Lens.pine
     - Cache-Control private,no-store
  3. Creare `src/app/api/products/market-lens/download/guide/route.ts`:
     - come sopra ma application/pdf + attachment AV-Market-Lens-Guida.pdf
- **Modifiche file**:
  - `src/lib/storage/index.ts`
  - `src/app/api/products/market-lens/download/indicator/route.ts` (nuovo)
  - `src/app/api/products/market-lens/download/guide/route.ts` (nuovo)
- **TR locali**:
  - **rule**: GET senza cookie auth → HTTP 401.
  - **rule**: GET auth senza Purchase succeeded → HTTP 403.
  - **rule**: Headers `Content-Type` e `Content-Disposition` corretti.
  - **rule**: Chiavi storage fisse `products/av-market-lens/indicator.pine` e `products/av-market-lens/guide.pdf`.
- **Completion Evidence**: path file creati, righe codice.

---

## Task 11: Pagina admin /admin/market-lens + nav admin
- **Priorità**: high
- **Dipendenze**: Task 10
- **AC coperti**: AC12
- **Descrizione**:
  1. In `src/app/admin/layout.tsx`: aggiungere NAV `{ href: '/admin/market-lens', label: 'AV Market Lens', Icon: Eye }`.
  2. Creare `src/app/admin/market-lens/page.tsx`:
     - Server Component, auth admin come altri pannelli.
     - Due form upload (uno per Pine, uno per PDF).
     - Server Actions o route interne per upload a path fissi con dimensioni limite (2MB Pine, 25MB PDF).
     - Messaggio stato onesto se BLOB_READ_WRITE_TOKEN non configurato.
     - Dopo upload, mostrare file info (size, contentType, timestamp).
- **Modifiche file**:
  - `src/app/admin/layout.tsx`
  - `src/app/admin/market-lens/page.tsx` (nuovo)
  - opzionale `src/app/admin/market-lens/actions.ts` (nuovo) se si usano Server Actions.
- **TR locali**:
  - **rule**: Pannello visibile solo a admin (non admin: 403 o redirect).
  - **rule**: Limiti dimensione: Pine >2MB rifiutato; PDF >25MB rifiutato.
  - **rule**: Upload usa `addRandomSuffix: false` e path fissi.
- **Completion Evidence**: path file, codice upload.

---

## Task 12: Integrazione fatturazione profilo + "Apri prodotto" opzionale
- **Priorità**: medium
- **Dipendenze**: Task 1, Task 2
- **AC coperti**: AC13
- **Descrizione**:
  1. Verificare che `productTitleBySlug('market-lens')` già funzioni (da Task 1 dovrebbe restituire 'AV Market Lens').
  2. In `src/app/area-membri/profilo/page.tsx`: nella card di ogni billing row di tipo `purchase` AND `productSlug === 'market-lens'` AND `status === 'succeeded'`, aggiungere opzionalmente un link/button "Apri prodotto" che punta a `/area-membri/prodotti` — inserirlo assieme ai bottoni ricevuta, senza alterare il resto.
- **Modifiche file**:
  - `src/app/area-membri/profilo/page.tsx`
- **TR locali**:
  - **rule**: Purchase market-lens con status succeeded mostra il titolo 'AV Market Lens'.
  - **rule**: Link "Apri prodotto" opzionale presente solo per market-lens succeeded.
- **Completion Evidence**: righe modificate.

---

## Task 13: Aggiornamenti pagine legali
- **Priorità**: medium
- **Dipendenze**: Task 1
- **AC coperti**: AC14
- **Descrizione**:
  1. `/termini`:
     - ampliare l'elenco servizi in Sezione 1/2 per includere "Acquisto one-time di AV Market Lens (indicatore Pine Script TradingView + guida PDF)".
     - aggiungere una nuova sezione "6. Prodotti digitali one-time: AV Market Lens e diritto di recesso" con: licenza personale/non trasferibile; divieto condivisione/rivendita/sublicenza/pubblicazione codice Pine; fornitura immediata e recesso; TradingView servizio terzo.
  2. `/disclaimer`:
     - aggiungere una sezione specifica dopo la sezione "Nessun consiglio personalizzato" o come sezione autonoma che spieghi la natura non-consulenziale di Market Lens marker/alert.
  3. `/privacy`:
     - sezione 2 Ambito di applicazione: aggiungere "Acquisto di AV Market Lens (prodotto digitale one-time)".
     - sezione 3 Dati di acquisto: aggiungere riferimento allo stato licenza e ai consensi per recesso/digitale.
- **Modifiche file**:
  - `src/app/termini/page.tsx`
  - `src/app/disclaimer/page.tsx`
  - `src/app/privacy/page.tsx`
- **TR locali**:
  - **rule**: Build Next.js passa (nessun errore JSX/TS).
  - **rubric** Completeness (0-2, soglia ≥1): leggo tutti e 3 i file e tutti i punti chiave Market Lens sono presenti.
- **Completion Evidence**: righe modificate per ogni file.

---

## Task 14: Nuove FAQ Market Lens
- **Priorità**: medium
- **Dipendenze**: Task 1
- **AC coperti**: AC15
- **Descrizione**:
  1. In `src/components/sections/FAQ.tsx`, aggiungere 5 entry in coda (o in posizione coerente) alle FAQ esistenti, con copy semplice e chiaro che non promette risultati.
- **Modifiche file**:
  - `src/components/sections/FAQ.tsx`
- **TR locali**:
  - **rule**: 5 nuove entry presenti in `faqs` array.
  - **rule**: Domande esattamente: Cos'è? Cosa ricevo? Dove trovo i file? Serve TradingView? È un segnale?
- **Completion Evidence**: righe aggiunte.

---

## Task 15: Verifica qualità e regressioni
- **Priorità**: high
- **Dipendenze**: Task 1-14 completati
- **AC coperti**: AC16, AC17, AC18
- **Descrizione**:
  1. Eseguire `npm run typecheck` → deve passare (exit 0).
  2. Eseguire `npm run build` → deve passare (exit 0).
  3. Analisi rapida regressioni:
     - checkout route per foundations/trading-lab/research-club: i redirect non devono puntare a prodotti (verifica codice).
     - Research Club PDF download route `/api/research-pdf/[id]/route.ts` non modificata.
     - admin corsi e admin research non modificati.
  4. Preparare report finale con: file creati/modificati, migration creata, env da aggiungere su Vercel, lista test manuali.
- **Modifiche file**: nessuna (solo report verbale).
- **TR locali**:
  - **rule**: `npm run typecheck` exit 0.
  - **rule**: `npm run build` exit 0.
  - **rule**: Nessun file esistente fuori scope ha subito modifiche semantiche (git diff sanity).
- **Completion Evidence**: output comandi, lista file, summary verbale utente.
