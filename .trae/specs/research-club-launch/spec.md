# Spec: AV Research Club — lancio abbonamento mensile pagato

**Data:** 07/09/2026
**Lingua:** Italiano (UI copy), inglese per codice/commenti interni
**Stack esistente:** Next.js 15 App Router, React 19, TypeScript, Prisma + Neon Postgres, Auth.js (Google), Stripe, Vercel, Vercel Blob (BLOB_READ_WRITE_TOKEN già configurato in ENV)

---

## 1. Problema e obiettivo

L'utente vuole lanciare **AV Research Club** come prodotto commerciale reale in abbonamento ricorrente. Oggi la sezione pubblica mostra "PROSSIMAMENTE" e "IN ARRIVO - TI TERREMO AGGIORNATO" (bottone disabilitato). I modelli Prisma e lo skeleton admin esistono già ma sono incompleti:

- Nessun modello `Subscription` ricorrente nel DB.
- `STRIPE_PRICE_AV_RESEARCH_CLUB` esiste in ENV ma non è consumato da nessuna parte.
- Stripe checkout usa `mode: 'payment'` solo per prodotti one-time (Foundations/Trading Lab).
- Webhook Stripe gestisce solo 4 eventi; servono subscription + invoice.
- `@vercel/blob` NON è installato in `package.json`; la libreria `src/lib/storage/index.ts` rileva `BLOB_READ_WRITE_TOKEN` ma `authorizePdfRead` è uno stub che restituisce `INTERNAL`. L'upload fisico non viene eseguito (DIRECT_PUT è segnaposto).
- `ResearchDoc` usa `publicationDate` (data impostabile dall'admin). Serve un campo semantico `publishedAt` per la rotazione (data effettiva di passaggio a PUBLISHED).
- Admin CMS manca di: delete manuale, rotazione automatica 12 doc PUBLISHED, gestione reale del Blob.
- Non esiste una pagina membro Research Club, un portale cliente Stripe, né un endpoint PDF protetto.

**Obiettivo:** trasformare Research Club in un prodotto abbonabile funzionante end-to-end, senza rompere Foundations/Trading Lab.

**Non obiettivi (espliciti):**
- Non riscrivere l'infrastruttura di pagamento esistente.
- Non introdurre nuovi provider pagati.
- Non hardcodare Price ID Stripe.
- Non toccare Stripe core / logica di rischio (linea guida memoria utente).
- Non fare reset distruttivo del DB o push non migrato.
- Non toccare funzionalità non correlate.

---

## 2. Utenti e percorsi

| Utente | Cosa vede / può fare |
|---|---|
| **Visitatore non autenticato** | Home → sezione Research Club: prezzo 19,90 €/mese, CTA "ENTRA NEL RESEARCH CLUB" → redirect a login con callback |
| **Utente autenticato NON abbonato** | Come sopra ma CTA va diretto a checkout Stripe (subscription) + fallback a upgrade state in pagina membro |
| **Utente con RC ACTIVE** | CTA pubblica → dashboard RC membro. Accesso PDF protetto. Card profilo "Abbonamento attivo". |
| **Utente con RC cancel_at_period_end=true** | Accesso consentito FINO a `currentPeriodEnd`. Dashboard visibile. Stato: "Rinnovo automatico disattivato". |
| **Utente con RC ENDED / PAYMENT_FAILED irreversibile** | CTA pubblica → riabbonati. Pagina RC → upgrade state. |
| **Admin** | `/admin/research`: crea/salva/pubblica/elimina doc + upload PDF Vercel Blob. Rotazione 12 automatica su publish. |

---

## 3. Requisiti funzionali

### 3.1 Prisma / Database
- Aggiungere modello `Subscription` (minimo, non over-ingegnerizzato):
  - FK a utente (userEmail).
  - `product`: enum o stringa fissa `AV_RESEARCH_CLUB` (unico prodotto ricorrente oggi).
  - `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`.
  - `status`: attivo/cancellato/scaduto/pagamento fallito (usare enum nativo o stringa controllata).
  - `cancelAtPeriodEnd` (Boolean), `currentPeriodEnd` (DateTime?), `latestInvoicePaidAt`, `paymentProblem` flag/date.
  - `createdAt`, `updatedAt`.
  - Unique su `stripeSubscriptionId` + indice su `(userEmail, product, status)` per lookup entitlement.
- Aggiungere a `ResearchDoc` campo `publishedAt DateTime?` (data effettiva di azione Pubblica; default null per le righe esistenti, valorizzato a `now()` quando si passa a PUBLISHED per la prima volta o se repubblicato e nullo). **NON rinominare** `publicationDate` (campo libero admin), usarlo come fallback display, ma ordinamento e rotazione 12 usano `publishedAt` (con fallback a `publicationDate` come fallback se publishedAt null, altrimenti createdAt).
- Migrazione Prisma additiva SOLO: `prisma migrate dev --create-only` + nome appropriato. NESSUN db push in produzione.

### 3.2 Stripe Pricing (pricing.ts)
- Estendere tipo `ResolvedProduct` (slugs: `'foundations' | 'trading-lab' | 'research-club'`).
- Aggiungere `billingMode: 'one_time' | 'subscription'` a `ResolvedProduct` e a PRODUCT_ALLOWLIST.
- Entry 'research-club': envKey=`STRIPE_PRICE_AV_RESEARCH_CLUB`, title='AV Research Club', amountInCents=1990, currency='EUR', billingMode='subscription'.
- `resolveProduct` e `productTitleBySlug` devono gestire il nuovo slug.
- Aggiornare `computeCheckoutEnabled` per includere anche `STRIPE_PRICE_AV_RESEARCH_CLUB` come "non bloccante" (i corsi one-time devono continuare a funzionare anche se RC env manca in locale).

### 3.3 Stripe Checkout (route.ts)
- Il flusso esistente `mode:'payment'` **non viene toccato** per foundations/trading-lab.
- Introdurre branching su `resolved.billingMode === 'subscription'`:
  - `mode: 'subscription'` per research-club.
  - `line_items[0].price = resolved.priceId`.
  - `currency = eur`, `tax_behavior_handling`.
  - Non usare `invoice_creation.enabled` (non ammesso in subscription mode; Stripe genera invoice automaticamente).
  - Success/cancel URL identici (area-membri per successo; #research-club per cancel).
  - Metadata: `product_slug`, `user_email`, `billing_mode=subscription`.
- **Duplicate prevention** (solo per subscription): prima di creare la sessione, interrogare `Subscription` per `(userEmail, product=AV_RESEARCH_CLUB, status in [ACTIVE, CANCEL_AT_PERIOD_END, PAST_DUE se ancora grace])`. Se attivo o in cancel-at-period-end → HTTP 409 con `redirectTo: '/area-membri/research-club'` + messaggio "Hai gia un abbonamento Research Club attivo."
- Mantieni lock in-memory `inFlightByKey` già esistente.

### 3.4 Stripe Webhook (route.ts + purchase-sync.ts OR new subscription-sync.ts)
- Firma già verificata; idempotenza `StripeEvent` già in place.
- **Aggiungere** case a switch esistente:
  - `checkout.session.completed`: distinguere `mode === 'subscription'` vs `payment`. Per subscription: estrarre `subscription`, `customer`, associare a utente via metadata, salvare record Subscription (status iniziale). Non chiamare `syncPurchase` per subscription.
  - `customer.subscription.created`: upsert Subscription by stripeSubscriptionId → set status/currentPeriodEnd/cancelAtPeriodEnd.
  - `customer.subscription.updated`: sync campi status, cancelAtPeriodEnd, currentPeriodEnd, stripePriceId (eventuale downgrade/upgrade), eventuale paymentProblem se status === 'past_due'.
  - `customer.subscription.deleted`: segna Subscription come ENDED / CANCELLED / currentPeriodEnd = max(now, currentPeriodEnd).
  - `invoice.paid`: se subscriptionId → aggiorna latestInvoicePaidAt, se status era 'past_due' riattiva ad ACTIVE, refresh currentPeriodEnd da invoice.
  - `invoice.payment_failed`: se subscriptionId → marca paymentProblem flag + timestamp. NON disattivare accesso subito (Stripe gestisce grace period; regola entitlement: blocco SOLO quando subscription status non è active/trialing pastDue e currentPeriodEnd superato).
- Verificare che tutti i 9 eventi inviati da Dashboard abbiano handler o `default: break` safe.
- **Non toccare** handler esistenti per one-time (charge.refunded, async payment succeeded/failed).

### 3.5 Entitlement RC
- Nuovo helper server-side `hasActiveResearchClub(userEmail)` in `src/lib/entitlements.ts` (o nuovo file):
  - Lookup Subscription `(userEmail, product=AV_RESEARCH_CLUB)`.
  - Stato `ACTIVE` / `TRIALING` → accesso SI.
  - Stato `CANCEL_AT_PERIOD_END` ma `now < currentPeriodEnd` → accesso SI.
  - Stato `PAST_DUE` ma `now < currentPeriodEnd` → accesso SI (grace).
  - `paymentProblem = true` ma ancora nel periodo → accesso SI, ma UI mostra banner.
  - Tutti gli altri casi (ended, canceled + periodo finito, nessun record) → accesso NO.
- Estendere tipo `EntitlementsState` per includere `researchClub: {...}`.

### 3.6 Customer Portal
- Endpoint server-only (route o server action) `/api/stripe/customer-portal` (in actions profilo o route file):
  - Autenticazione obbligatoria.
  - Deriva `stripeCustomerId` da Subscription o Purchase dell'utente (mai accettare dal client).
  - `stripe.billingPortal.sessions.create({ customer, return_url: baseUrl + '/area-membri/profilo' })`.
  - Redirect 303 all'URL di Stripe.
  - Configurazione portal = quella di Stripe Dashboard (lato codice solo return URL + customer).
- Nel profilo membro, card "AV Research Club" con:
  - Stato badge (Attivo / Rinnovo disattivato / Problema pagamento / Scaduto).
  - Prezzo 19,90 €/mese.
  - Prossimo rinnovo o data fine accesso DD/MM/YYYY.
  - Pulsante `[GESTISCI ABBONAMENTO]` → POST a endpoint portal (no client-side fetch).
  - Se scaduto / nessun abbonamento: pulsante secondario → CTA a checkout.

### 3.7 Ricerca Admin CMS (/admin/research)
- Completare implementazioni esistenti senza duplicare UI:
  1. **Install @vercel/blobs**: no, `@vercel/blob` SDK.
  2. **Implementare `preparePdfUpload` reale**:
     - Se provider = VERCEL_BLOB → chiama `put(storageKey, ReadableStream/Buffer, { access: 'private', token: token, contentType: 'application/pdf', addRandomSuffix: false })` tramite SDK.
     - Oppure meglio: pattern client-upload-safe con signed URL? Vercel Blob `put({access:'private'})` può essere fatto server-side ricevendo il file FormData.
     - Soluzione più sicura: upload diretto server-side. Il client manda il file via multipart/form-data a server action `uploadResearchPdfAction(id, formData)`; server:
       - requireAdmin()
       - valida MIME = application/pdf, extension .pdf, size ≤ 25MB
       - se vecchio storageObjectKey esiste → `del(oldKey)` prima (o dopo successo, a scelta con fallback in caso di errore).
       - `const blob = await put(storageKey, formData.get('file'), { access: 'private', contentType: 'application/pdf' })`
       - salva `storageObjectKey = blob.pathname` (o `blob.url`? Usare pathname per sicurezza).
       - marca in ResearchDoc: storageProvider=VERCEL_BLOB, storageObjectKey, pdfFileName, pdfFileSizeBytes.
  3. **Implementare `authorizePdfRead`**:
     - Provider VERCelBlob: `const dl = await download(storageObjectKey)`; restituire `signedUrl?` tramite funzione o redirect streaming.
     - Alternativa safe: route handler `/api/research/[id]/pdf` che streamma direttamente `Body` di `download()` senza esporre URL firmato al client.
  4. **Publish action**: quando passa a PUBLISHED, valorizzare `publishedAt = now()` se null. Subito dopo: contare quanti ResearchDoc hanno status=PUBLISHED. Se `count > 12`:
     - Trova il più vecchio per `publishedAt DESC` (quindi il 13° con offset 12).
     - Elimina blob: `del(old.storageObjectKey)` → wrap try/catch per non fallire publish (se del fallisce logga warning ma commit publish).
     - Elimina record ResearchDoc.
     - Fallimento cleanup = NESSUN rollback del documento nuovo. Log + surfacing warning nella UI admin (messaggio "Attenzione: cleanup automatica non riuscita. Cancella manualmente i documenti in eccesso.").
  5. **Bozze NON contano**: query count deve filtrare `status === 'PUBLISHED'`.
  6. **Delete manuale**: Aggiungere icona `Trash2` a ogni riga lista admin + nella pagina editor. Conferma: "Eliminare definitivamente questa ricerca e il relativo PDF?" → YES procedi:
     - requireAdmin()
     - get doc by id
     - if storageObjectKey → `del(key)` try/catch (se fallisce: ERRORE chiaro admin; opzionale non cancellare DB se Blob non viene cancellato per evitare orfani).
     - delete doc DB.
     - revalidatePaths.

### 3.8 Vercel Blob — PDF protection
- **Nessun URL pubblico permanente**: tutti i file `access: 'private'`.
- Accesso member: route server `/api/research-pdf/[id]` (o `/api/research/[id]/pdf`):
  - Autentica (auth()).
  - Verifica `hasActiveResearchClub(email)` → 403 se no.
  - Lookup ResearchDoc by id → 404 se non esiste o DRAFT (non abbonato vede solo PUBLISHED; admin può usare preview con ?preview=1).
  - Se ok: streamma contenuto `await download(doc.storageObjectKey)` → ritorno `new NextResponse(body, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${safeName}"`, 'Cache-Control': 'private, max-age=0' } })`.
  - **Non fare** redirect a signed URL di Vercel Blob (pericolo leak). Meglio streammare tramite server.

### 3.9 Pagina membro Research Club (`/area-membri/research-club`)
- Autenticazione obbligatoria.
- Se entitlement RC NO → mostra upgrade state: titolo RC, 19,90 €/mese, breve lista benefici, CTA → checkout Stripe subscription.
- Se entitlement SI → dashboard premium:
  - Header con badge "WEEKLY RESEARCH" stile gold.
  - Griglia card responsive (mobile-first).
  - Ordine: publishedAt DESC (nuove prima).
  - Ogni card: categoria badge, titolo, descrizione breve, data pubblicazione DD/MM/YYYY, indicatore "PDF", CTA "APRI RICERCA" → link diretto alla route /api/research-pdf/[id] (o a pagina wrapper che mostra iframe).
  - Design: sfondo black, AV green, accenti GOLD controllati per RC.
  - Admin: vedere anche DRAFT (stesso pattern ?preview=1 o solo lista admin).

### 3.10 Public Research Club section
- Aggiornare `siteConfig.researchClub`:
  - `badge: 'AV RESEARCH CLUB'`.
  - `badge: ...` rinominato a `badge: 'SUBSCRIPTION'` o campo `priceMonthly: 19.90`.
- Aggiornare `components/sections/ResearchClub.tsx`:
  - Rimuovere `disabled` + "IN ARRIVO".
  - Badge "AV RESEARCH CLUB" con accenni GOLD (testo o bordo gold chiaro).
  - Mostrare prezzo "19,90 € / mese" prominentemente.
  - CTA reale `ENTRA NEL RESEARCH CLUB`:
    - Server component condizionale: se sessione assente → login+callback. Se autenticato ma no entitlement → /api/stripe/checkout (POST con slug research-club). Se entitlement → /area-membri/research-club.
  - Microcopy secondario: "Disdici quando vuoi. In caso di disdetta, l'accesso resta attivo fino alla fine del periodo già pagato."
  - Accenti GOLD controllati: gradienti, border gold per badge/CTA.

### 3.11 CTA intelligenti (header / home links)
- DOVE ci sono link "Research Club":
  - Pubblica sezione #research-club: come sopra.
  - Header nav link → `/area-membri/research-club` se autenticato, altrimenti `#research-club`.
  - Implementa helper server `getResearchClubCtaTarget(session)` per riuso.

---

## 4. Requisiti non funzionali

### Sicurezza
- Server Actions per admin: `requireAdmin()` (pattern esistente in `course-admin.ts`).
- Accesso PDF: doppia verifica server (auth + entitlement).
- Chiavi Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) solo lato server; `'use server'` o route file.
- Portale Cliente: `stripeCustomerId` MAI dal client; sempre derivato da DB via email sessione.
- Vercel Blob: MAI fidarti di `storageObjectKey` fornito dal client senza lookup DB ownership.

### Build / TS
- `tsc --noEmit` deve passare.
- `next build` deve passare (produzione).
- Nessun `@ts-ignore` / `any` cast.
- Nessun optional chain a tappeto dove non serve.

### Idiomaticità
- Riuso pattern `GlassCard`, chip, buttons esistenti (btn-primary/ghost, shadow-glow-green-sm).
- Copy UI in italiano, data format `it-IT`.
- Accenti gold: definire in tailwind config se non esistono (es. `av-gold` / `av-gold-deep`).

### Test (da eseguire realmente ove possibile)
Vedi sezione 16 della richiesta utente. Per ogni punto documentare cosa è stato eseguito in locale (Stripe TEST mode) e cosa richiede Stripe Dashboard reale (Portal config).

---

## 5. Dipendenze e assunzioni

**Già soddisfatte:**
- `STRIPE_PRICE_AV_RESEARCH_CLUB` configurato in Vercel ENV (utente conferma).
- `BLOB_READ_WRITE_TOKEN` configurato.
- Stripe Dashboard: 9 eventi webhook inviati (elenco utente).
- Prodotto Stripe RC creato: 19,90 €/mese ricorrente.

**Da installare:**
- `@vercel/blob` SDK (mancante in package.json).

**Assunzioni / Aperte:**
- Portal Stripe: user dovrà probabilmente abilitare il Customer Portal in Dashboard e configurare "cancel at period end" come comportamento di cancellazione predefinito. Lo segnaliamo nel report finale.
- Testing webhook in locale: richiede `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Se CLI non disponibile, testiamo solo logica handler con chiamate simulate manual via `scripts/test-research-club.mjs` (opzionale).
- `publishedAt` per i record ResearchDoc esistenti: se null, in query di ordinamento usiamo COALESCE(publishedAt, publicationDate, createdAt). Valorizzato la prossima volta che si passa a PUBLISHED.

---

## 6. Criteri di Accettazione (AC)

### AC Rule (binario pass/fail)

| ID | Regola |
|---|---|
| AC-R-01 | `siteConfig.researchClub.badge` non contiene "PROSSIMAMENTE" o "IN ARRIVO". |
| AC-R-02 | Homepage sezione RC mostra prezzo `19,90 € / mese` e CTA cliccabile "ENTRA NEL RESEARCH CLUB". |
| AC-R-03 | `resolveProduct('research-club')` estrae `priceId` da `process.env.STRIPE_PRICE_AV_RESEARCH_CLUB` e restituisce `billingMode === 'subscription'`. |
| AC-R-04 | Checkout RC: chiamata a `/api/stripe/checkout` con slug `research-club` produce sessione Stripe con `mode === 'subscription'`, line_items.price === prezzo RC. |
| AC-R-05 | Duplicate prevention: utente con Subscription RC attiva (o cancel-at-period-end) riceve HTTP 409 + redirectTo instead of nuova sessione. |
| AC-R-06 | Checkout Foundations/Trading Lab rimane `mode: 'payment'` — regressione 0. |
| AC-R-07 | Webhook handler ha case per i 9 eventi; 5 eventi subscription/invoice vengono elaborati e aggiornano DB in modo idempotente grazie a StripeEvent.unique. |
| AC-R-08 | `customer.subscription.deleted` marca RC accesso come terminato (non rimuove prima di currentPeriodEnd in caso di cancel_at_period_end). |
| AC-R-09 | `invoice.payment_failed` NON rimuove accesso finché `now < currentPeriodEnd`. |
| AC-R-10 | Modello Prisma `Subscription` creato e migrazione additiva generata; nessun model/dato esistente cancellato. |
| AC-R-11 | Campo `ResearchDoc.publishedAt` aggiunto e valorizzato su publish action. |
| AC-R-12 | `hasActiveResearchClub` = true per status ACTIVE/TRIALING e per CANCEL_AT_PERIOD_END con now < currentPeriodEnd; = false per ended/canceled+scaduto. |
| AC-R-13 | Portale Cliente: endpoint server genera sessione Stripe con `customer` derivato da DB (NO client input). |
| AC-R-14 | Profilo membro visualizza card RC con stato corretto e data prossimo rinnovo / fine accesso. |
| AC-R-15 | Upload PDF admin: file viene realmente salvato in Vercel Blob (access: private), non solo metadati. |
| AC-R-16 | Accesso PDF membro: route server autentica + verifica entitlement → streamma contenuto. Richiesta non autenticata → 401. Non abbonato → 403. Doc DRAFT → 404 (non admin). |
| AC-R-17 | Publish 13° documento PUBLISHED → viene rimosso il più vecchio per publishedAt (12 restano). |
| AC-R-18 | N bozze qualsiasi non attivano cleanup (12 PUBLISHED + 5 DRAFT = 0 cleanup). |
| AC-R-19 | Delete manuale admin rimuove SIA blob che DB record. Fallimento Blob delete → errore chiaro admin, non lascia orfani. |
| AC-R-20 | Pagina `/area-membri/research-club` mostra upgrade state se non abbonato, dashboard PUBLISHED se abbonato. |
| AC-R-21 | CTA RC pubbliche: se entitlement SI → redirect dashboard instead of checkout. |
| AC-R-22 | `tsc --noEmit` passa. |
| AC-R-23 | `next build` passa. |
| AC-R-24 | Migrazione Prisma eseguibile senza errori in locale (dev DB). |
| AC-R-25 | `computeCheckoutEnabled` ritorna ancora true per RC mancante ma corsi OK. |

### AC Rubric (valutazione qualità)

| ID | Dimensione | Scala (0-2) | Soglia |
|---|---|---|---|
| AC-U-01 | **Accenti GOLD appropriati**: usati con parsimonia per distinguere RC; sito principale resta black/green. | 0=tutto gold invasivo / 1=visibili ma moderati / 2=perfetto equilibrio premium identità AV mantenuta | ≥ 1.5 |
| AC-U-02 | **Usabilità admin**: upload publish delete chiari, senza passaggi extra (cover image ecc). | 0=confuso / 1=accettabile / 2=lineare, feedback sempre chiari | ≥ 1.5 |
| AC-U-03 | **Mobile responsiveness** (simulato) del nuovo membro dashboard e profilo card (320px-Desktop). | 0=layout rotto / 1=leggibile ma non ottimizzato / 2=mobile-first, ottimo | ≥ 1.5 |
| AC-U-04 | **Error handling** (non swallow): messaggi chiari per upload falliti, Blob delete falliti, checkout errori 409. Nessun try/catch che nasconde errore root. | 0=errori silenti / 1=ok tranne 1 caso / 2=tutti i path d'errore emettono messaggio utile senza leak chiavi | ≥ 1.5 |
| AC-U-05 | **Modello Subscription** minimale ma sufficiente per tutti gli use case; non over-engineering. | 0=campi insufficienti o ridondanza eccessiva / 1=sufficiente / 2=esattamente il minimo necessario | ≥ 1.5 |

---

## 7. Criteri di Chiusura Finale (Report Utente)

A conclusione, fornire un report come da sezione 19 della richiesta, ivi inclusi commit SHA, push status e configurazione Stripe Dashboard manuale residua.
