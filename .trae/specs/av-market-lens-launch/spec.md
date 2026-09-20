# Specifica: AV Market Lens

## Problema
Aggiungere al progetto esistente **AV Market Lens**, un prodotto digitale one-time (Pine Script TradingView + guida PDF) venduto a €39,90, rispettando rigorosamente architettura, auth, Stripe, Prisma, design system e pattern già presenti nel repository. Nessun redesign di componenti esistenti, nessuna landing page pubblica separata.

## Utenti
1. **Visitatore non autenticato**: vede la sezione homepage, legge FAQ, accede al login prima dell'acquisto.
2. **Utente autenticato**: può acquistare Market Lens dopo aver espresso il consenso digitale, riceve accesso ai download privati, vede il prodotto in area membri e in fatturazione.
3. **Amministratore**: può caricare/sostituire i file Pine Script e PDF tramite pannello admin dedicato.

## Obiettivi
1. Vendere AV Market Lens one-time €39,90 dalla homepage (sezione dedicata dopo Positioning, prima di Courses).
2. Consegnare dopo pagamento riuscito: file Pine Script + guida PDF, entrambi PRIVATI (Vercel Blob `access: 'private'`), scaricabili solo da account con Purchase `productSlug="market-lens"` e `status=succeeded`.
3. Gestire il consenso digitale obbligatorio (2 checkbox non preselezionate) prima di creare la sessione Stripe, con persistenza timestamp+versione sia in Prisma che in metadata Stripe.
4. Integrare Market Lens in: area membri (pagina prodotti + card panoramica), profilo/fatturazione, nav, admin, FAQ, pagine legali.
5. Zero regressioni su corsi, Research Club, billing, admin, auth, download PDF esistenti del Research Club.

## Non-goal
- Non creare landing page pubblica separata per Market Lens (solo sezione nella homepage).
- Non creare un CMS generico o tabella `ProductAsset` in Prisma (storage key fisse).
- Non modificare il sistema PDF del Research Club.
- Non aggiungere nuovi pacchetti npm frontend non indispensabili.
- Non creare seconda istanza auth o secondo sistema di fatturazione.
- Non promettere profitti, win rate o risultati di trading nel copy o nel codice.

---

## Requisiti funzionali

### 1. Configurazione prodotto
- **rule** `siteConfig.marketLens` deve contenere: `slug: "market-lens"`, `price: 39.9`, `currency: "EUR"`, `title: "AV Market Lens"`, feature list per 6 box, copy e notes.
- **rule** `src/lib/stripe/pricing.ts` union `ResolvedProduct['slug']` deve includere `'market-lens'`; entry nella `PRODUCT_ALLOWLIST` con `envKey: 'STRIPE_PRICE_AV_MARKET_LENS'`, `amountInCents: 3990`, `billingMode: 'one_time'`.
- **rule** `.env.example` deve includere `STRIPE_PRICE_AV_MARKET_LENS=` e il mancante `STRIPE_PRICE_AV_RESEARCH_CLUB=`; inoltre correggere il mismatch sostituendo `VERCEL_BLOB_READ_WRITE_TOKEN` con `BLOB_READ_WRITE_TOKEN` (coerente con `src/lib/storage/index.ts` che legge `BLOB_READ_WRITE_TOKEN`).
- **rule** La funzione `productTitleBySlug('market-lens')` deve restituire `'AV Market Lens'`.

### 2. Sezione homepage
- **rule** Creare `src/components/sections/MarketLens.tsx` con anchor `id="market-lens"`.
- **rule** Inserire la sezione in `src/app/page.tsx` IMMEDIATAMENTE dopo `<Positioning />` e PRIMA di `<Courses />`.
- **rule** Aggiungere `{ label: 'AV Market Lens', href: '/#market-lens' }` a `siteConfig.navigation` (prima di 'Percorsi' o in posizione coerente).
- **rubric** Fedeltà al design system (scala 0-2, soglia ≥1): `GlassCard`, gradient, glow effects, `btn-primary`, eyebrow tag, `heading-lg` per titoli, responsive mobile-first.
- **rule** Contenuto sezione:
  - eyebrow + titolo prodotto + sottotitolo
  - hero prodotto con immagine (assets `av-market-lens.png` già presenti in `/assets`)
  - 6 box feature: Trend, Livelli chiave, Volatilità, Sessioni, Contesto giornaliero, Setup evidenziati
  - box "Ricevi dopo l'acquisto": Pine Script + Guida PDF
  - prezzo 39,90 € una tantum, badge "Pagamento unico · IVA inclusa"
  - CTA acquisto (MarketLensCheckoutButton)
  - disclaimer breve (nessun segnale, nessuna promessa, strumento educativo)
- **rule** Copy semplice e comprensibile ai principianti. Nessuna promessa di profitto, win rate o risultati.

### 3. Consenso digitale pre-checkout
- **rule** Prima di chiamare `/api/stripe/checkout` per `slug=market-lens`, il client deve mostrare una modale con 2 checkbox OBBLIGATORIE e NON preselezionate:
  1. "Ho letto e accetto i Termini e condizioni d'uso e il Disclaimer finanziario." (link a `/termini` e `/disclaimer`)
  2. "Richiedo espressamente la fornitura immediata del contenuto digitale e riconosco che, in tale caso, perderò il diritto di recesso dal contratto ai sensi e per gli effetti dell'art. 59 del D.Lgs. 206/2005 (Codice del Consumo) e della normativa applicabile."
- **rule** Le checkbox devono essere validate client-side: bottone "Procedi al pagamento" disabilitato finché entrambe non sono spuntate.
- **rule** Server-side: la route `/api/stripe/checkout`, quando `slug=market-lens`, RIFIUTA con HTTP 400 se NON riceve i campi `consent_terms_version` e `consent_digital_withdrawal_version` e `consent_accepted_at` nel payload.
- **rule** I consensi devono essere salvati:
  - nei metadata della Stripe Checkout Session (`consent_terms_v`, `consent_digital_withdrawal_v`, `consent_at`)
  - nella tabella `Purchase` Prisma tramite due nuove colonne + migration
- **rule** Versione consenso hardcoded: `TERMS_CONSENT_VERSION = "v1.0"`, `DIGITAL_WITHDRAWAL_CONSENT_VERSION = "v1.0"`. Il timestamp è quello del server.

### 4. Checkout redirect product-aware
- **rule** Per `slug=market-lens`:
  - `successUrl` → `/area-membri/prodotti?checkout=success&session_id={CHECKOUT_SESSION_ID}`
  - `cancelUrl` → `/#market-lens?checkout=cancelled`
  - Se già posseduto (Purchase succeeded) → redirect `/area-membri/prodotti` (HTTP 409 `redirectTo`)
- **rule** Il comportamento di `foundations`, `trading-lab` e `research-club` NON deve cambiare.

### 5. Prisma migration consenso digitale
- **rule** Aggiungere a `Purchase` nel `schema.prisma`:
  - `consentTermsVersion String? @db.VarChar(32)`
  - `consentDigitalWithdrawalVersion String? @db.VarChar(32)`
  - `consentAcceptedAt DateTime?`
- **rule** Creare migration file in `prisma/migrations/YYYYMMDDHHMMSS_add_consent_fields_to_purchase/migration.sql` (usare `prisma migrate dev --create-only`).
- **rule** Il webhook Stripe (`checkout.session.completed` e `async_payment_succeeded`) deve leggere i metadata Stripe e salvare le colonne consenso nel Purchase durante `syncPurchase`.

### 6. Area membri prodotti
- **rule** Creare pagina `/area-membri/prodotti` (protetta da auth esistente via middleware).
- **rule** Aggiungere voce nav nell'area membri: `{ href: '/area-membri/prodotti', label: 'I miei prodotti', Icon: Package }` al NAV di `area-membri/layout.tsx`.
- **rule** Entitlement Market Lens (stati):
  - `locked`: nessun Purchase o Purchase failed/refunded/pending vecchio
  - `payment_pending`: Purchase `status=pending` creato meno di 2h fa
  - `owned`: Purchase `status=succeeded` per `productSlug=market-lens`
- **rule** Stato `payment_pending`: mostrare banner di conferma in corso e componente `PendingPaymentRefresher`.
- **rule** Stato `owned`: card AV Market Lens con data acquisto e due CTA:
  - "Scarica indicatore" → POST/GET a `/api/products/market-lens/download/indicator`
  - "Scarica guida PDF" → POST/GET a `/api/products/market-lens/download/guide`
- **rule** Stato `locked`: CTA che porta a `/#market-lens`.
- **rule** Aggiungere card sintetica AV Market Lens nella **Panoramica** (`area-membri/page.tsx`) come fatto per Research Club: stato entitlement, CTA condizionali.

### 7. Download privati (Vercel Blob)
- **rule** Non mettere file .pine o .pdf in `/public` o GitHub.
- **rule** Storage keys FISSE (non random):
  - Pine Script → `products/av-market-lens/indicator.pine`
  - Guida PDF → `products/av-market-lens/guide.pdf`
- **rule** Due route server:
  - `/api/products/market-lens/download/indicator`
  - `/api/products/market-lens/download/guide`
- **rule** Ogni route deve:
  - autenticare l'utente (`auth()` + `normalizeEmail`) — 401 se non loggato
  - cercare Purchase `productSlug='market-lens'` `status='succeeded'` per quell'email — 403 se non trovato
  - rifiutare pending/refunded/failed — 403
  - streammare il file Vercel Blob con `{ access: 'private' }` (usare pattern da `getPdfStream` esteso per text/plain)
  - headers: `Cache-Control: private,no-store,no-cache,must-revalidate`
  - indicator: `Content-Type: text/plain; charset=utf-8`, `Content-Disposition: attachment; filename="AV-Market-Lens.pine"; filename*=UTF-8''AV-Market-Lens.pine`
  - guide: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="AV-Market-Lens-Guida.pdf"; filename*=UTF-8''AV-Market-Lens-Guida.pdf`
- **rule** Nessun URL permanente o signed URL pubblico restituito al client: tutto passa per lo stream server-side.

### 8. Admin Market Lens
- **rule** Creare pagina `/admin/market-lens` (protetta da auth admin esistente come in admin/layout).
- **rule** Aggiungere voce nav admin: `{ href: '/admin/market-lens', label: 'AV Market Lens', Icon: Eye }`.
- **rule** Due soli upload/sostituzione, senza tabella DB:
  1. Pine Script (.pine) — max 2 MB, MIME `text/plain` o `.pine` extension
  2. Guida PDF (.pdf) — max 25 MB, MIME `application/pdf`
- **rule** Upload a chiave FISSA: `products/av-market-lens/indicator.pine` e `products/av-market-lens/guide.pdf`, `access: 'private'`, `addRandomSuffix: false`.
- **rule** Stato onesto: se `BLOB_READ_WRITE_TOKEN` non è configurato mostrare messaggio "Storage privato non configurato" (pattern da Research Club admin).
- **rule** Dopo upload riuscito, mostrare timestamp ultimo aggiornamento.

### 9. Fatturazione (Profilo)
- **rule** I Purchase `productSlug=market-lens` devono apparire naturalmente nella sezione "Acquisti e fatturazione" di `/area-membri/profilo` SENZA modifiche sostanziali al layout esistente (il sistema `productTitleBySlug` e `loadBillingHistory` già includono tutti i purchase per email).
- **rubric** Usabilità del dettaglio (scala 0-2, soglia ≥1): per un Purchase `market-lens` con `status=succeeded`, aggiungere opzionalmente un link/pulsante "Apri prodotto" che punta a `/area-membri/prodotti` (nella stessa card della ricevuta).

### 10. Pagine legali
- **rule** **Termini** (`/termini`):
  - sezione oggetto/ambito: aggiungere "Acquisto di AV Market Lens (prodotto digitale one-time: indicatore Pine Script TradingView + guida PDF)" tra i servizi.
  - nuova sezione "Prodotti digitali one-time e diritto di recesso": licenza personale, non trasferibile, non condivisibile; divieto di pubblicazione/rivendita/sublicenza del codice Pine Script; fornitura immediata su richiesta dell'utente e perdita diritto di recesso; TradingView come servizio terzo indipendente.
- **rule** **Disclaimer** (`/disclaimer`): aggiungere paragrafo specifico: "AV Market Lens può evidenziare marker, livelli o alert derivanti da condizioni tecniche predefinite codificate nello script. Tali evidenziazioni NON sono raccomandazioni personalizzate, non sono istruzioni di acquisto o vendita, non sostituiscono la valutazione individuale e non garantiscono risultati di alcun tipo. L'indicatore è uno strumento di supporto all'analisi, esclusivamente per finalità educative e di studio."
- **rule** **Privacy** (`/privacy`): nella sezione ambito di applicazione e dati raccolti, aggiungere riferimento all'acquisto di AV Market Lens, allo stato licenza (owned/pending) e ai dati/consensi connessi alla fornitura del prodotto digitale e ai sensi del diritto di recesso per contenuti digitali.

### 11. FAQ
- **rule** Aggiungere 5 nuove entry alla lista `faqs` in `src/components/sections/FAQ.tsx`:
  1. Cos'è AV Market Lens?
  2. Cosa ricevo esattamente dopo l'acquisto?
  3. Dove trovo i file dopo l'acquisto?
  4. Serve un account TradingView per usare l'indicatore?
  5. AV Market Lens è un segnale di acquisto/vendita?

---

## Requisiti non funzionali
- **rule** Nessun pacchetto npm aggiuntivo sul frontend. `@vercel/blob` è già installato.
- **rule** Responsive mobile-first. Tutte le sezioni/modifiche devono essere leggibili su viewport ≥320px.
- **rule** Accessibilità: WAI-ARIA (`aria-expanded`, `aria-controls`) per modale consenso; tag semantici; `aria-live` per stati pending; focus visible.
- **rule** `npm run typecheck` deve passare senza errori.
- **rule** `npm run build` deve passare senza errori.
- **rule** Nessun commit o push automatico.

---

## Dipendenze e assunzioni
- Next.js 15 App Router, React 19, NextAuth v5 (auth.ts), Prisma 5, Stripe SDK 22, Vercel Blob 2.8, lucide-react 0.460.
- Tutti i pattern esistenti (auth, checkout route, storage, entitlements) sono stabili e non devono essere rifattorizzati.
- L'amministratore configurerà `STRIPE_PRICE_AV_MARKET_LENS` nel dashboard Stripe (creando Price one-time per il prodotto) e imposterà la env.
- I file Pine e PDF saranno caricati dall'amministratore dopo il deploy.

---

## Acceptance Criteria

| ID | Tipo | Criterio |
|---|---|---|
| AC1 | rule | `siteConfig.marketLens` esiste con slug `market-lens` e prezzo 39.9 EUR |
| AC2 | rule | `ResolvedProduct['slug']` include `'market-lens'` con amount 3990 one_time |
| AC3 | rule | `.env.example` contiene `STRIPE_PRICE_AV_MARKET_LENS=`, `STRIPE_PRICE_AV_RESEARCH_CLUB=` e usa `BLOB_READ_WRITE_TOKEN` |
| AC4 | rule | Sezione `#market-lens` presente in homepage tra Positioning e Courses, con 6 feature, copy conforme, CTA e disclaimer |
| AC5 | rule | "AV Market Lens" è nella navigation pubblica |
| AC6 | rule | Modale consenso con 2 checkbox non preselezionate, validazione client e server; metadata Stripe e colonne Prisma popolate |
| AC7 | rule | Migration Prisma aggiunge 3 colonne consenso a Purchase |
| AC8 | rule | Checkout redirect: success → `/area-membri/prodotti?checkout=success&session_id=...`; cancel → `/#market-lens?checkout=cancelled`; already-owned → `/area-membri/prodotti` |
| AC9 | rule | Pagina `/area-membri/prodotti` esiste, nav "I miei prodotti", stati locked/pending/owned |
| AC10 | rule | Card sintetica Market Lens nella Panoramica area membri |
| AC11 | rule | Route `/api/products/market-lens/download/indicator` e `/download/guide` autenticate, verificano Purchase succeeded, streammano da Blob private, intestazioni corrette |
| AC12 | rule | `/admin/market-lens` upload Pine (2MB) e PDF (25MB) a path fissi; voce nav admin |
| AC13 | rule | Purchase market-lens compare in "Acquisti e fatturazione" con titolo corretto |
| AC14 | rule | Termini, Disclaimer e Privacy aggiornati con riferimenti Market Lens |
| AC15 | rule | 5 nuove FAQ Market Lens aggiunte |
| AC16 | rule | Comportamento di corsi, Research Club, admin PDF esistenti NON modificato |
| AC17 | rule | `npm run typecheck` passa (exit 0) |
| AC18 | rule | `npm run build` passa (exit 0) |
