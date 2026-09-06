# Integrazione Stripe - Product Requirements Document

## Overview
- **Summary**: Integrazione completa Stripe in modalita test per AV-INVEST Research, con checkout one-shot di due prodotti (AV Foundations 297 EUR IVA inclusa, AV Trading Lab 497 EUR IVA inclusa), webhook verificato, database PostgreSQL e gestione diritti di accesso nell'area membri.
- **Purpose**: Abilitare pagamenti sicuri e tracciabili, concedere l'accesso ai corsi esclusivamente dopo conferma server-side, e gestire rimborsi con revoca automatica.
- **Target Users**: Visitatori che acquistano i corsi; membri autenticati con Google che vedono i propri acquisti.

## Goals
- Checkout Stripe server-side protetto da sessione Auth.js, con allowlist Price ID server-side.
- Webhook Stripe verificato tramite firma, idempotente, che concede/revoca accessi.
- Database PostgreSQL (Prisma) con persistenza di utenti, acquisti, eventi Stripe.
- Area membri che legge gli entitlements dal DB, sblocca corsi acquistati, mostra sezione "Acquisti e fatturazione".
- Zero segreti nel client; zero fiducia in dati provenienti dal browser.

## Non-Goals
- Implementare il player video o i moduli delle lezioni (verra fatto dopo).
- Modificare sezioni del sito estranee a Stripe, acquisti e area membri (es. Hero, Method, Testimonials).
- Implementare abbonamenti ricorrenti (solo one-shot).
- Modificare la logica Auth.js o il flusso Google login oltre allo stretto necessario.
- Toccare Stripe customer portal, fatture avanzate o IVA split nel frontend.

## Background & Context
- Stack esistente: Next.js 15.5.25 (App Router), TypeScript, Tailwind, Auth.js v5 beta.32 con Google provider, JWT session.
- Nessun database attualmente configurato; DATABASE_URL e DIRECT_URL sono placeholder in `.env.example`.
- `lib/entitlements.ts` restituisce attualmente `buildLockedEntitlements()` (tutto bloccato).
- `config/siteConfig.ts` definisce i due corsi con `available: false` e pulsanti disabilitati in `sections/Courses.tsx` ("DISPONIBILE PROSSIMAMENTE").
- Variabili Vercel esistenti: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_AV_FOUNDATIONS`, `STRIPE_PRICE_AV_TRADING_LAB`.
- Webhook endpoint dichiarato: `https://avinvestresearch.com/api/stripe/webhook`.
- Prodotti one-shot, IVA gia inclusa nel prezzo del Price ID Stripe (non calcolata nel frontend).

## Functional Requirements

- **FR-1 Checkout auth-gated**: Click sul pulsante di un corso richiede autenticazione Google; utente anonimo viene rediretto a `/login` con `callbackUrl` che punta alla sezione prodotti.
- **FR-2 Checkout Session server-side**: Route `POST /api/stripe/checkout` che accetta solo `{ slug: 'foundations' | 'trading-lab' }` dal body; mappa slug a Price ID tramite allowlist server-side (usa `STRIPE_PRICE_AV_FOUNDATIONS` / `STRIPE_PRICE_AV_TRADING_LAB`); estrae email dalla sessione Auth.js; crea Stripe Checkout Session con `mode: 'payment'`, `invoice_creation: { enabled: true, invoice_data: {} }`, success URL `/area-membri`, cancel URL `/#percorsi`.
- **FR-3 Redirect Checkout**: Dopo la creazione della sessione, il client viene rediretto a `session.url` (Stripe hosted page). Non viene usato Stripe.js nel bundle client per la creazione della sessione.
- **FR-4 Pulsanti corsi abilitati**: Sostituire "DISPONIBILE PROSSIMAMENTE" con etichetta "Pagamento unico - IVA inclusa" e pulsante attivo "Acquista ora".
- **FR-5 Webhook firma obbligatoria**: `POST /api/stripe/webhook` legge il raw body, verifica la firma con `STRIPE_WEBHOOK_SECRET`, rifiuta qualsiasi payload non firmato.
- **FR-6 Webhook eventi gestiti**: Gestisce `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`.
- **FR-7 Concessione accesso**: Solo su `checkout.session.completed` o `async_payment_succeeded`, dopo aver validato il pagamento sul server, crea/aggiorna un record `Purchase` con stato `succeeded` e garantisce che l'utente veda il corso sbloccato.
- **FR-8 Revoca per rimborso**: Su `charge.refunded`, se il rimborso e totale (importo rimborsato >= importo addebitato - tolleranza 1 cent), imposta lo stato acquisto a `refunded` e revoca l'accesso al corso. Rimborso parziale: aggiorna campo `refunded_amount` ma NON revoca accesso; aggiungi nota.
- **FR-9 Idempotenza webhook**: Tabella `StripeEvent` con `event_id` UNIQUE. Prima di processare un evento, controlla se gia esiste; se esiste, risposta 200 senza riprocessare.
- **FR-10 Persistenza utenti**: Tabella `User` con `email` UNIQUE (normalizzata lowercase), `google_id`, `name`, `image`. Associazione 1:N con `Purchase`.
- **FR-11 Persistenza acquisti**: Tabella `Purchase` con: `user_email`, `product_slug`, `checkout_session_id` (UNIQUE), `customer_id`, `payment_intent_id`, `invoice_id`, `amount_total`, `currency`, `status`, `purchased_at`, `refunded_at`, `refunded_amount`, `invoice_hosted_url`, `invoice_pdf_url`.
- **FR-12 Entitlements da DB**: `getEntitlements(userId)` cerca gli acquisti `succeeded` dell'utente per email e marca i corsi corrispondenti come `available` (oppure `locked` se non acquistato o refundato).
- **FR-13 Sezione Acquisti e fatturazione**: Nell'area profilo (`/area-membri/profilo`) o in una nuova sezione dedicata accessibile dalla navbar, mostra tabella/lista degli acquisti: prodotto, importo formattato, data acquisto, stato, link alla ricevuta Stripe (hosted invoice URL o PDF) quando disponibile.
- **FR-14 Risposta checkout non valido**: Slug prodotto non valido, sessione assente o prezzo non mappabile restituiscono 400/401 senza creare sessione Stripe.
- **FR-15 Redirect successo non sbloccante**: L'utente che torna su `/area-membri` dopo un checkout riuscito vede il corso sbloccato perche i diritti arrivano dal DB (popolato dal webhook), non dal redirect di successo. Se il webhook non e ancora arrivato, il corso risulta ancora bloccato fino a conferma.
- **FR-16 Variabili .env.example**: Aggiornare `.env.example` con `STRIPE_PRICE_AV_FOUNDATIONS` e `STRIPE_PRICE_AV_TRADING_LAB`, e le variabili Prisma/DB gia presenti; nessun valore reale.

## Non-Functional Requirements

- **NFR-1 Sicurezza segreti**: Nessun Price ID, nessuna Stripe key o secret nel client bundle. Le rotte API sono route.ts lato server. Il componente client puo chiamare solo il body `{ slug }`.
- **NFR-2 Normalizzazione email**: Le email vengono normalizzate con `.trim().toLowerCase()` prima di qualsiasi lookup o scrittura.
- **NFR-3 Logging pulito**: Non stampare `STRIPE_SECRET_KEY`, firme o payload interi nei log. Solo ID (event_id, pi_id, cs_id) e messaggi sintetici.
- **NFR-4 Responsive**: I nuovi elementi UI (pulsanti acquisto, sezione fatturazione) mantengono la grafica esistente, responsive e coerente (dark, neon green, GlassCard).
- **NFR-5 Stati UX**: Loading, errore e annullamento devono essere chiari nel client del checkout.
- **NFR-6 Typecheck e lint**: Il progetto deve passare `npm run typecheck` e `npm run lint` senza errori.
- **NFR-7 Build**: `npm run build` deve completare senza errori.
- **NFR-8 No legacy-peer-deps / --force**: Installazione `stripe` e `prisma` + `@prisma/client` senza flag di forza.

## Constraints
- **Tecnici**:
  - Database PostgreSQL compatibile Vercel/Neon (no SQLite, no file, no memory, no mock).
  - ORM: Prisma (consolidato per Neon/Vercel).
  - Stripe SDK Node.js `stripe` server-side.
  - Route handler Next.js App Router (`src/app/api/stripe/...`).
  - Tutte le decisioni di prezzo, prodotto e stato pagamento sul server.
- **Business**:
  - Due soli prodotti: foundations (297 EUR) e trading-lab (497 EUR); IVA gia inclusa nel Price Stripe.
  - Prodotti one-shot (pagamento unico).
  - Accesso ai corsi solo dopo conferma webhook; MAI dopo il solo redirect di successo.
  - Revoca automatica accesso in caso di rimborso totale.
- **Dipendenze**:
  - Auth.js v5 gia configurato con Google.
  - Variabili Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_AV_FOUNDATIONS`, `STRIPE_PRICE_AV_TRADING_LAB`.
  - `DATABASE_URL` e `DIRECT_URL` (per Neon pool) devono essere aggiunti dall'utente.

## Assumptions
- I Price ID di Stripe (`STRIPE_PRICE_AV_FOUNDATIONS`, `STRIPE_PRICE_AV_TRADING_LAB`) sono gia creati nel dashboard Stripe come one-time, IVA inclusa, valuta EUR.
- La session Auth.js fornisce `session.user.email` attendibile (proveniente da Google OAuth).
- Per Neon/Vercel Postgres, `DIRECT_URL` e la connessione diretta non pooled (richiesta da Prisma per migrate).
- Il webhook Stripe e gia configurato su Vercel puntando a `/api/stripe/webhook` e firma con `STRIPE_WEBHOOK_SECRET`.

## Acceptance Criteria

### AC-1: Utente anonimo non puo iniziare il checkout
- **Type**: `rule`
- **Given**: L'utente non e autenticato.
- **When**: L'utente clicca "Acquista ora" su un corso.
- **Then**: Viene rediretto a `/login` con callbackUrl che punta alla sezione `/percorsi` o alla pagina prodotti; non viene creata alcuna Checkout Session.
- **Pass Condition**: Il codice client del pulsante chiamante o il route handler restituiscono 401 e il redirect a login avviene; analisi statica del codice conferma che il checkout richiede `await auth()`.
- **Evidence**: Ispezione route handler e del componente Courses + build log senza errori.

### AC-2: Slug non valido viene rifiutato
- **Type**: `rule`
- **Given**: Utente autenticato.
- **When**: Viene inviato POST a `/api/stripe/checkout` con `slug` non in allowlist (es. `slug: 'hacker'`).
- **Then**: Risposta 400; nessuna Checkout Session creata su Stripe.
- **Pass Condition**: Allowlist server-side (object map) limita a `foundations` e `trading-lab`; Price ID caricato da env var per ogni chiave; test manuale curl restituisce 400.
- **Evidence**: Codice allowlist in `src/lib/stripe/checkout.ts` e output curl.

### AC-3: Checkout Session valida usa email e Price ID del server
- **Type**: `rule`
- **Given**: Utente autenticato con email verificata, slug valido `foundations`.
- **When**: POST /api/stripe/checkout `{ slug: 'foundations' }`.
- **Then**: Checkout Session creata con `customer_email` (o `customer` creato) uguale alla email della sessione Auth.js; `line_items[0].price` uguale a `process.env.STRIPE_PRICE_AV_FOUNDATIONS`; `mode: 'payment'`; `invoice_creation.enabled = true`; `success_url = siteUrl + '/area-membri'`; `cancel_url = siteUrl + '/#percorsi'`.
- **Pass Condition**: Codice route handler e modulo helper mostrano questi parametri; tipo TypeScript conferma che il prezzo non arriva dal client.
- **Evidence**: Codice sorgente e, se ambiente di test disponibile, risposta della route con sessione ID e URL creati.

### AC-4: Webhook rifiuta payload senza firma valida
- **Type**: `rule`
- **Given**: `STRIPE_WEBHOOK_SECRET` impostata.
- **When**: Arriva un POST a `/api/stripe/webhook` senza header `stripe-signature` o con firma non valida.
- **Then**: Risposta 400/401 `Webhook Error: ...`; nessuna modifica al DB.
- **Pass Condition**: Il codice usa `stripe.webhooks.constructEvent` dentro try/catch e restituisce errore non 2xx.
- **Evidence**: Analisi statica del webhook route handler.

### AC-5: checkout.session.completed concede l'accesso (idempotente)
- **Type**: `rule`
- **Given**: Utente con email `x@example.com`, evento `checkout.session.completed` valido e firmato, Price ID corrispondente a foundations.
- **When**: Il webhook processa l'evento.
- **Then**: Viene creato User se non esiste; Purchase creato con `status = 'succeeded'`, `product_slug = 'foundations'` e tutti gli ID (session, payment_intent, invoice, customer); `getEntitlements` d'ora in poi restituisce foundations available.
- **Pass Condition**: Query DB conferma User + Purchase; una seconda consegna dello STESSO `event.id` restituisce 200 ma NON crea duplicati (UNIQUE su StripeEvent.event_id e Purchase.checkout_session_id).
- **Evidence**: Schema Prisma UNIQUE + codice idempotenza + risultato query post-evento.

### AC-6: charge.refunded totale revoca, parziale non revoca
- **Type**: `rule`
- **Given**: Purchase esistente con `amount_total = 29700`, status succeeded, e un `charge.refunded` che copre l'importo.
- **When**: Il webhook processa charge.refunded.
- **Then**: Caso totale: `purchase.status = 'refunded'`, `refunded_at = now`, `refunded_amount = amount_refunded`; il corso torna locked. Caso parziale (es. 10000 rimborsati su 29700): `refunded_amount` aggiornato ma status rimane `succeeded` e corso ancora available.
- **Pass Condition**: Codice soglia `amount_refunded + tolerance >= charge.amount` determina revoca; due test logici o query DB confermano lo stato.
- **Evidence**: Implementazione webhook charge.refunded e query di stato.

### AC-7: Entitlements leggono dal DB e sbloccano correttamente
- **Type**: `rule`
- **Given**: Utente `x@example.com` ha un Purchase foundations con status succeeded e nessun Purchase trading-lab.
- **When**: Viene chiamata `getEntitlements` nel render delle pagine area membri.
- **Then**: foundations ha status `available` con purchasedAt valorizzato; trading-lab ha status `locked`.
- **Pass Condition**: Implementazione `getEntitlements` interroga Prisma e mappa gli status.
- **Evidence**: Codice `lib/entitlements.ts` aggiornato e pagina /area-membri/percorsi che mostra le card con badge corretto.

### AC-8: Sezione "Acquisti e fatturazione" mostra dati e link ricevuta
- **Type**: `rule`
- **Given**: Utente con almeno un Purchase completato e `invoice_hosted_url` non null.
- **When**: Apre la sezione Acquisti e fatturazione in area membri.
- **Then**: Vede una riga per ogni acquisto: titolo prodotto, importo formattato EUR, data acquisto, badge stato, link "Apri ricevuta" che apre in nuova scheda l'hosted invoice URL o invoice PDF.
- **Pass Condition**: Pagina renderizza i dati da Prisma e il link usa `target="_blank" rel="noopener noreferrer"`.
- **Evidence**: Codice pagina + test di render con dati mockati dal DB.

### AC-9: Nessun segreto nel client bundle
- **Type**: `rule`
- **Given**: Progetto buildato.
- **When**: Si esaminano i file generati nella cartella `.next/static/chunks` e il sorgente dei componenti client.
- **Then**: Non compare nessuna stringa che inizi con `sk_` (Stripe secret key), `whsec_` (webhook secret) o i valori concreti di `STRIPE_PRICE_*`. Nel client passa solo lo slug e l'URL di redirect restituito dal server.
- **Pass Condition**: `grep` sul sorgente e sulla build non trova chiavi private; Price ID sono usati SOLO dentro file server-side (route handler, lib helper NON con "use client").
- **Evidence**: Ricerca Grep e conferma che i file che leggono env vars segrete non hanno 'use client'.

### AC-10: typecheck, lint, build passano
- **Type**: `rule`
- **Given**: Codice implementato.
- **When**: Si eseguono `npm run typecheck`, `npm run lint`, `npm run build`.
- **Then**: Tutti i comandi terminano con exit code 0.
- **Pass Condition**: Log terminali senza errori.
- **Evidence**: Output dei tre comandi.

### AC-11: Coerenza grafica e responsive
- **Type**: `rubric`
- **Dimension**: Aderenza visiva alle card esistenti (GlassCard, neon green, tipografia, spaziature) e responsiveness mobile.
- **Scale**: 1-5
- **Anchors**: 1 = layout rotto, stili non coerenti; 3 = funzionale ma disallineamenti spaziature/colori; 5 = pixel-perfect rispetto alle card Courses esistenti, responsive 320px-430px senza overflow orizzontale.
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot della sezione corsi aggiornata, della sezione fatturazione, e test responsive.

### AC-12: Architettura pulita e non invasiva
- **Type**: `rubric`
- **Dimension**: Riuso dell'architettura esistente, nessuna duplicazione di auth/componenti/route, separazione netta server vs client.
- **Scale**: 1-5
- **Anchors**: 1 = duplicazione route auth o nuovo sistema auth parallelo; 3 = funziona ma file sparsi; 5 = tutto incapsulato in `lib/stripe/*`, `lib/db/*`, API routes in `api/stripe/*`, aggiornamento minimale di Courses, entitlements e profile.
- **Pass Threshold**: >= 4
- **Evidence**: Lista file modificati e struttura cartelle.

## Open Questions
- [ ] La sezione "Acquisti e fatturazione" va aggiunta dentro `/area-membri/profilo` (come blocco aggiuntivo in fondo) o come nuova rotta dedicata `/area-membri/fatturazione` con voce nella navbar? *Decisione implementazione: aggiungere come blocco dedicato in fondo a /area-membri/profilo (senza aggiungere rotte) per minimizzare cambiamenti, a meno di non vedere spazio insufficiente.*
