# Tasks: lancio AV Research Club

**Spec associata:** `spec.md`
**Ordine di dipendenze:** Task 1 → Task 2/3 → Task 4/5/6/7/8/9/10/11 → Task 12 → Task 13 (Review)

Ogni task ha:
- **AC padre** (criteri di accettazione coperti)
- **TR locali** (rule: pass/fail osservabile; rubric: valutazione qualità)
- **Files da toccare**
- **Nota implementativa**

---

## Task 1: Prisma schema + migrazione (Subscription + publishedAt)

**Dipendenze:** nessuna
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-10, AC-R-11

**Files:**
- Modifica: `prisma/schema.prisma`
- Nuova: `prisma/migrations/20260907_*_add_subscription_and_published_at/migration.sql`

**Implementazione:**
1. Aggiungere enum `SubscriptionStatus` { ACTIVE, PAST_DUE, CANCELED, ENDED, INCOMPLETE, TRIALING } (o ridotto a 4 essenziali).
2. Aggiungere `SubscriptionProduct` enum { AV_RESEARCH_CLUB } oppure stringa controllata.
3. Modello `Subscription`:
   - `id String @id @default(cuid())`
   - `userEmail String @db.VarChar(255)` + index
   - `product SubscriptionProduct @default(AV_RESEARCH_CLUB)`
   - `stripeCustomerId String? @db.VarChar(255)`
   - `stripeSubscriptionId String @unique @db.VarChar(255)`
   - `stripePriceId String? @db.VarChar(255)`
   - `status SubscriptionStatus @default(INCOMPLETE)`
   - `cancelAtPeriodEnd Boolean @default(false)`
   - `currentPeriodEnd DateTime?`
   - `latestInvoicePaidAt DateTime?`
   - `paymentProblem Boolean @default(false)`
   - `paymentProblemAt DateTime?`
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`
   - `@@unique([userEmail, product])` opzionale o solo indice (utente potrebbe avere più RC abbonamenti nel tempo, ma vogliamo 1 attivo per product; quindi rendere unique userEmail+product).
   - Relazione user: `user User? @relation(fields: [userEmail], references: [email])`
4. A ResearchDoc aggiungere `publishedAt DateTime?` + `@@index([status, publishedAt(sort: Desc)])`.
5. Eseguire: `prisma migrate dev --create-only --name add_subscription_and_published_at` per generare file SQL senza applicare.

**TR (rule):**
- **TR-R-1.1**: `prisma validate` passa.
- **TR-R-1.2**: `prisma migrate dev` applica senza errori sul DB dev locale.
- **TR-R-1.3**: La migration NON contiene DROP TABLE o ALTER che distruggono dati Purchase/User/ResearchDoc esistenti.
- **TR-R-1.4**: `Subscription.stripeSubscriptionId` è UNIQUE.
- **TR-R-1.5**: `ResearchDoc.publishedAt` è nullable (default NULL per record esistenti).

---

## Task 2: Install @vercel/blob + implementazione storage reale

**Dipendenze:** Task 1 (opzionale, ma prima di usare put/del nel codice serve package installato).
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-15, AC-R-16

**Files:**
- `package.json` (aggiungere `@vercel/blob`)
- `src/lib/storage/index.ts` (implementazione reale `preparePdfUpload`, `authorizePdfRead` + nuove funzioni `performPdfUpload`, `deletePdfFile`)

**Implementazione:**
1. `npm install @vercel/blob@latest` (controlla compatibilità Node 24; scegli versione stabile adatta).
2. In `src/lib/storage/index.ts`:
   - Sostituire lo stub:
     - `preparePdfUpload`: attualmente restituisce DIRECT_PUT segnaposto; mantieni l'API ma usiamola solo per le validazioni MIME/size e generazione storageKey;
     - Nuova funzione `async performPdfServerUpload(storageKey, fileBufferOrStream, { contentType })` che chiama `@vercel/blob` → `put(storageKey, data, { access: 'private', contentType: 'application/pdf', token: process.env.BLOB_READ_WRITE_TOKEN })`;
     - Nuova funzione `async deletePdfFile(storageObjectKey)` → `del(storageObjectKey)`;
     - `authorizePdfRead`: invece di stub INTERNAL, restituire un oggetto `{ ok: true, download: async () => Body }` oppure una funzione helper usata dalla route che chiama `download(key)`.
   - Mantieni backward compat: se BLOB_READ_WRITE_TOKEN non c'è, ritorna gli stessi errori UNCONFIGURED di prima.

**TR (rule):**
- **TR-R-2.1**: `@vercel/blob` appare in `dependencies` package.json.
- **TR-R-2.2**: `tsc` dopo modifiche passa.
- **TR-R-2.3**: Funzione `deletePdfFile` esportata e sicura (throws solo su errori non recuperabili).

**TR (rubric):**
- **TR-U-2.1**: Separazione tra validazioni e azioni reali (score 0-2). Soglia ≥ 1.

---

## Task 3: Estendi pricing.ts (research-club + billingMode)

**Dipendenze:** Task 1 (per type safety SubscriptionProduct non necessario).
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-03, AC-R-25

**Files:**
- `src/lib/stripe/pricing.ts`

**Implementazione:**
1. Tipo `ResolvedProduct['slug']` → `'foundations' | 'trading-lab' | 'research-club'`.
2. Aggiungere `billingMode: 'one_time' | 'subscription'` a `ResolvedProduct` e alla entry `PRODUCT_ALLOWLIST`.
3. Aggiungere entry research-club: envKey='STRIPE_PRICE_AV_RESEARCH_CLUB', amountInCents=1990, title='AV Research Club'.
4. Funzione `productTitleBySlug` aggiornata per research-club.
5. Funzione `isKnownProductSlug` ok (usa hasOwnProperty).
6. **NON toccare** `computeCheckoutEnabled` per ora; opzionalmente rendi RC non bloccante.

**TR (rule):**
- **TR-R-3.1**: `resolveProduct('research-club')` restituisce `billingMode === 'subscription'` e `priceId !== null` (se ENV presente).
- **TR-R-3.2**: `resolveProduct('foundations')` e `resolveProduct('trading-lab')` ancora `billingMode === 'one_time'`, regressione 0.
- **TR-R-3.3**: `productTitleBySlug('research-club')` → 'AV Research Club'.

---

## Task 4: Stripe Checkout — subscription mode + dup prevention

**Dipendenze:** Task 1, Task 3.
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-04, AC-R-05, AC-R-06

**Files:**
- `src/app/api/stripe/checkout/route.ts`

**Implementazione:**
1. Importa Subscription model e ricerca per userEmail + product = RC.
2. Branch `if (resolved.billingMode === 'subscription')`:
   - Check se già Subscription attiva (status ACTIVE, TRIALING, PAST_DUE con currentPeriodEnd futuro, o CANCELLED con cancelAtPeriodEnd=true e currentPeriodEnd futuro).
   - Se sì → `ownedRedirectResponse()` personalizzato con redirectTo `/area-membri/research-club` + messaggio appropriato.
   - Altrimenti crea sessione con `mode: 'subscription'`, line_items.price=resolved.priceId, **rimuovi** `invoice_creation`, lascia `billing_address_collection: 'auto'`, metadata `billing_mode: 'subscription'` oltre a slug/email.
3. Branch else: flusso esistente mode='payment' (intatto).
4. `success_url`: stesso di prima /area-membri?checkout=success. Per RC è ok.
5. `cancel_url`: /#research-club?checkout=cancelled invece di /#percorsi per RC (o lascia /#percorsi, non critico). Scegli `/cancel` redirect coerente per prodotto.

**TR (rule):**
- **TR-R-4.1**: Checkout RC → sessione mode=subscription (verificato via test su checkout TEST Stripe in fase di run; per ora tsc passa e branching corretto).
- **TR-R-4.2**: Checkout Foundations → ancora mode=payment.
- **TR-R-4.3**: Dup prevention interroga Subscription table e restituisce 409 + redirectTo corretto.

---

## Task 5: Subscription sync lib + Estendi webhook

**Dipendenze:** Task 1, Task 3, Task 4.
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-07, AC-R-08, AC-R-09

**Files:**
- Nuovo: `src/lib/stripe/subscription-sync.ts` (helper sync da eventi Stripe).
- Modifica: `src/app/api/stripe/webhook/route.ts` (nuovi case switch).
- Modifica: `src/lib/stripe/purchase-sync.ts` (opzionale, refactor minore se metadataFromSession deve riconoscere product_slug = research-club).

**Implementazione:**
1. subscription-sync.ts:
   - `ensureUser` riutilizzato da purchase-sync.
   - `upsertSubscriptionFromStripe(subscriptionStripeObject, { userEmail?, stripeCustomerId?, productOverride? })` → upsert by stripeSubscriptionId con tutti i campi status/cancelAtPeriodEnd/currentPeriodEnd/stripePriceId.
   - `markPaymentProblem(subscriptionId, flag, problemAt)`.
   - `checkoutSessionCompletedSubscription(session)` → dato checkout session.mode='subscription', estrae subscription (id) e customer, chiama upsert.
   - `invoicePaidSync(invoice)` → aggiorna latestInvoicePaidAt e ripristina status se era PAST_DUE.
   - `invoicePaymentFailed(invoice)` → flag paymentProblem.
   - `deletedSubscription(stripeSubscriptionId)` → set status=ENDED, currentPeriodEnd = subscription ended_at se presente.
2. In webhook route.ts, case switch aggiuntivi:
   - checkout.session.completed: se mode === 'subscription' → chiama subscription handler invece di syncPurchase.
   - customer.subscription.created, updated, deleted → upsert / end.
   - invoice.paid / invoice.payment_failed → sync invoice.
   - default: lascia invariato.
3. **Idempotenza**: la tabella `StripeEvent` già protegge da retry. Assicurati che anche `upsert` usi unique giusti (stripeSubscriptionId).

**TR (rule):**
- **TR-R-5.1**: Case per tutti i 9 eventi esistenti in switch. 6 nuovi eventi gestiti (checkout.session.completed con branch subscription, + 5 subscription/invoice).
- **TR-R-5.2**: Upsert usa Subscription.stripeSubscriptionId come unique.
- **TR-R-5.3**: Payment failed NON imposta currentPeriodEnd a now; lascia invariato e setta solo flag.

---

## Task 6: Entitlement RC + Profilo card + Customer Portal endpoint

**Dipendenze:** Task 1, Task 5.
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-12, AC-R-13, AC-R-14

**Files:**
- Modifica: `src/lib/entitlements.ts` (aggiungi RC entitlement getter).
- Nuovo: `src/app/api/stripe/customer-portal/route.ts` (POST, crea sessione portal).
- Modifica: `src/app/area-membri/profilo/page.tsx` (card RC prima o dopo Acquisti).

**Implementazione:**
1. entitlements.ts:
   - Tipo `ResearchClubEntitlement` { status: 'none' | 'active' | 'cancel_at_period_end' | 'payment_problem' | 'ended', subscription?: {...}, accessGranted: boolean, message: string, nextDate?: Date }.
   - Funzione `async getResearchClubEntitlement(userId?, email?)` come pattern di getEntitlements (stesso resolveUserEmail).
   - Legge Subscription più recente per RC e restituisce stato.
2. Customer portal endpoint:
   - POST route.
   - Auth required.
   - Lookup Subscription o Purchase per userEmail per estrarre stripeCustomerId (preferenza Subscription).
   - `stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url: baseUrl + '/area-membri/profilo?portal=return' })`.
   - 303 redirect oppure JSON { url }. Meglio 303.
3. Profilo page.tsx:
   - Aggiungi GlassCard "Abbonamento AV Research Club" sopra o sotto la sezione billing esistente.
   - Mostra badge attivo/cancel at period end/problema pagamento/scaduto.
   - Form POST a /api/stripe/customer-portal con bottone [GESTISCI ABBONAMENTO].
   - Se ended/none: link a checkout.

**TR (rule):**
- **TR-R-6.1**: getResearchClubEntitlement(utente con RC ACTIVE) → accessGranted=true.
- **TR-R-6.2**: getResearchClubEntitlement(utente cancelAtPeriodEnd=true, now < periodEnd) → accessGranted=true.
- **TR-R-6.3**: getResearchClubEntitlement(utente ended) → accessGranted=false.
- **TR-R-6.4**: Portal endpoint: NO stripeCustomerId dal body (verifica che accetta solo parametri non sensibili e lo deriva da sessione).

---

## Task 7: Admin Research CMS — upload reale Vercel Blob + delete manuale + publishedAt

**Dipendenze:** Task 1, Task 2 (Blob SDK).
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-15, AC-R-19, AC-R-11

**Files:**
- Modifica: `src/lib/admin/research-admin.ts` (tutte le action admin: requireAdmin già presente).
- Modifica: `src/app/admin/research/actions.ts` (nuove action: delete, upload multipart).
- Modifica: `src/app/admin/research/page.tsx` (aggiungi icona cestino a riga).
- Modifica: `src/app/admin/research/[id]/page.tsx` (aggiungi pulsante elimina con conferma).
- Modifica: `src/app/admin/research/[id]/editor-components.tsx` (PdfUploadForm: integralo per upload via multipart POST al server invece dello stub DIRECT_PUT).

**Implementazione:**
1. research-admin.ts:
   - Nuova `async deleteResearchDocAdmin(id)`:
     - requireAdmin();
     - get doc; if not exists → errore.
     - if doc.storageObjectKey → chiama `deletePdfFile(key)`; se fallisce → THROWS errore chiaro (non prosegue per evitare orfani) o logga warning a scelta? Spec dice "If Blob deletion fails: do not silently pretend deletion succeeded; show a clear admin error". Quindi: se del() throws → restituisci `{ ok:false, error }`.
     - Se delete blob ok → prisma.researchDoc.delete({ where: { id } }).
     - Revalidate paths.
   - Nuova `async uploadResearchPdfAdmin(id, formData)`:
     - requireAdmin();
     - const file = formData.get('file') as File;
     - Validazione: file?.type === 'application/pdf', size ≤ 25MB, fileName endsWith .pdf.
     - Genera storageKey come da storage lib.
     - (Opzionale: se vecchio file esiste, deletePdfFile(oldKey) prima di sostituire; oppure lascia in blob e sovrascrivi riferimento). Meglio rimuovere vecchio per costo.
     - `const blob = await performPdfServerUpload(storageKey, file.stream(), { contentType: 'application/pdf' })` (dipende firma helper creato in Task 2).
     - confirmResearchPdfUploadAdmin() esistente salva reference.
   - `setResearchDocStatusAdmin`: quando passa a PUBLISHED e publishedAt è NULL → set `publishedAt = now()`. Se c'è già publishedAt non toccare (a meno che l'admin non ripublished dopo unpublish: a scelta lasciamo invariato per mantenere data primo publish).
2. actions.ts:
   - Aggiungi `deleteResearchDocAction` con useActionState firma React 19 (2 args).
   - Aggiungi `uploadResearchPdfAction(id, formData)` per multipart upload.
3. UI PdfUploadForm: sostituisci DIRECT_PUT segnaposto con effettiva POST di file alla upload action. Rimuovi messaggio "integrazione non attiva".
4. Lista admin page: Trash2 icona con window.confirm nativo o componente client.
5. Editor page: aggiungi sezione Danger Zone con pulsante "Elimina documento" → conferma.

**TR (rule):**
- **TR-R-7.1**: `setResearchDocStatusAdmin()` passing a PUBLISHED imposta publishedAt = now() se era null.
- **TR-R-7.2**: `deleteResearchDocAdmin(id)` cancella blob + DB; se blob del fallisce ritorna ok:false.
- **TR-R-7.3**: Upload PDF realmente chiama SDK put e salva storageObjectKey restituito (verificare via DB dopo upload).

---

## Task 8: Rotazione automatica 12 PUBLISHED

**Dipendenze:** Task 1, Task 7.
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-17, AC-R-18

**Files:**
- Modifica: `src/lib/admin/research-admin.ts` (dentro a `setResearchDocStatusAdmin` o nuovo helper `enforceMaxPublishedDocs`).

**Implementazione:**
1. Subito DOPO l'update a PUBLISHED e dopo set publishedAt:
   - `count = prisma.researchDoc.count({ where: { status: 'PUBLISHED' } })`.
   - `if (count > 12)`:
     - `eccesso = count - 12`.
     - Trova i `eccesso` documenti PUBLISHED più vecchi ordinando per publishedAt ASC (NULLS LAST).
     - Per ognuno in loop: try { delete blob + delete DB } catch { logga console.warn/warning + aggiungi array di cleanup warnings }.
     - Se cleanup fallisce per alcuni, NON fare throw di grosso; ma ritorna risultato con warnings (da mostrare in admin UI se possibile; al minimo scrivi log con doc IDs che non sono stati cancellati per failure).
2. **NON** fare nulla se lo status cambiava in DRAFT (non attiva cleanup).
3. **NON** contare DRAFT (where clause chiara).

**TR (rule):**
- **TR-R-8.1**: Con 12 PUBLISHED + publish 13 → count torna a 12, il più vecchio per publishedAt rimosso.
- **TR-R-8.2**: Con 12 PUBLISHED + 5 DRAFT → publish a DRAFT non triggera nulla; trasformare un DRAFT in PUBLISHED per il 13 → si attiva cleanup 1.
- **TR-R-8.3**: Se delete del blob fallisce per l'oldest, il nuovo PUBLISHED non viene rollbackato (resta in DB).

---

## Task 9: Public RC section + siteConfig aggiornato

**Dipendenze:** Task 3 (billingMode).
**Priorità:** medium
**Status:** pending

**AC padre:** AC-R-01, AC-R-02, AC-U-01 (gold accenti)

**Files:**
- `src/config/siteConfig.ts`
- `src/components/sections/ResearchClub.tsx`
- Opzionale: `tailwind.config.ts` o globals.css per colori gold aggiuntivi (es. text-av-gold, border-av-gold, bg-av-gold/5).

**Implementazione:**
1. siteConfig:
   - `researchClub.badge = 'AV RESEARCH CLUB'`.
   - Aggiungere `researchClub.priceMonthly = 19.9` (EUR).
   - `researchClub.shortPositioning = 'Analisi e ricerche di mercato riservate ai membri, con focus su aziende, scenari, catalizzatori e rischi.'`.
   - `researchClub.features = [ ...come prima, ma rimuovere "Archivio delle ricerche" e sostituire o aggiungere esplicativo "Archivio ultimi 3 mesi (12 ricerche)" ]`.
   - Opzionalmente aggiungere `researchClub.cancelMicrocopy`.
2. Component ResearchClub:
   - Rimuovere lock e badge prossimamente grigio.
   - Badge con accenti gold: `border-av-gold/40 bg-av-gold/10 text-av-gold` (definire colori se non esistono; o usare tonalità simili a yellow ma nome gold).
   - Sostituire p description con `siteConfig.researchClub.shortPositioning` come prima frase; lasciare la seconda frase su nessun segnale.
   - Rimuovere button disabilitato IN ARRIVO.
   - Sostituire con:
     - Prezzo "19,90 € / mese" prominentemente (font-display o numeri grandi).
     - CTA vero componente server/client.
     - Sotto microcopy: "Disdici quando vuoi. In caso di disdetta, l'accesso resta attivo fino alla fine del periodo già pagato."
3. CTA behavior (aiuta task 13 ma qui solo UI):
   - CTA usa href a /login oppure un onClick che manda POST a checkout; meglio usare componente client separato `ResearchClubCta.tsx` che, dopo hydration, controlla sessione (fetch `/api/auth/session`) o usa React Server Component con auth().
   - Se facciamo Server Component: import { auth } from '@/auth' → if session → controlla entitlement (task 6) e reindirizza a /area-membri/research-club se entitlement, altrimenti POST a checkout tramite form.

**TR (rule):**
- **TR-R-9.1**: Search "PROSSIMAMENTE" e "IN ARRIVO" in ResearchClub section + siteConfig: 0 match.
- **TR-R-9.2**: Prezzo "19,90 € / mese" visibile nella sezione (verificabile ispezionando render HTML).
- **TR-R-9.3**: CTA "ENTRA NEL RESEARCH CLUB" presente e cliccabile (non disabled).

**TR (rubric):**
- **TR-U-9.1**: Accenti gold appropriati (AC-U-01). Soglia ≥ 1.5.

---

## Task 10: Protected PDF route + member helper for PDF access

**Dipendenze:** Task 2, Task 6 (entitlement).
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-16

**Files:**
- Nuovo: `src/app/api/research-pdf/[id]/route.ts` (o `/research/[id]/pdf`).

**Implementazione:**
1. Route file, GET method.
2. `dynamic = 'force-dynamic'`.
3. Passaggi:
   - `session = await auth()` → se no: 401 `{ error: 'Login richiesto' }` oppure redirect. Meglio 401 JSON.
   - `userEmail = normalizeEmail(session?.user?.email)` → no: 401.
   - `entitlement = await getResearchClubEntitlement(session.user.id, session.user.email)`.
   - `if (!entitlement.accessGranted)` → 403.
   - `id = params.id`.
   - `doc = prisma.researchDoc.findUnique({ where: { id } })` → 404 if null.
   - `if (doc.status !== 'PUBLISHED')` → admin? check `isAdminSession(session)`: se NO → 404; se SI → consenti (serve per preview admin).
   - `if (!doc.storageObjectKey)` → 404.
   - Chiama `download(doc.storageObjectKey)` da @vercel/blob.
   - Restituisci `new NextResponse(downloadBody, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${encodeURIComponent(doc.pdfFileName || doc.slug + '.pdf')}"`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=0, no-store, must-revalidate' } })`.
   - **NON** esporre URL firmato. Streamma attraverso Next.js.

**TR (rule):**
- **TR-R-10.1**: Richiesta GET senza auth → 401.
- **TR-R-10.2**: Richiesta GET autenticata senza RC entitlement → 403.
- **TR-R-10.3**: Richiesta GET autenticata entitlement SI + doc PUBLISHED → 200 Content-Type application/pdf streaming.
- **TR-R-10.4**: Doc DRAFT + non admin → 404.
- **TR-R-10.5**: Nessun URL Vercel Blob pubblico o token appare nel response (header/body/redirect non 3xx a blob URL).

---

## Task 11: Pagina membro Research Club dashboard

**Dipendenze:** Task 6, Task 10.
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-20, AC-R-21 (CTA parte qui per upgrade state).

**Files:**
- Nuovo: `src/app/area-membri/research-club/page.tsx`.
- Opzionale: aggiungere link in `area-membri/layout.tsx` nella sidebar navigation.

**Implementazione:**
1. Server component, auth required (redirect login se non autenticato).
2. Carica entitlement RC.
3. **Case NON entitlement (non abbonato / scaduto)**:
   - Upgrade state:
     - Badge gold "AV RESEARCH CLUB".
     - Titolo + sottotitolo short positioning.
     - 19,90 € / mese.
     - 4 feature card minori (stesse della home).
     - CTA button "ENTRA NEL RESEARCH CLUB" → form POST a checkout endpoint con slug research-club (oppure client component che fa fetch POST).
     - Microcopy disdetta.
4. **Case entitlement SI**:
   - Dashboard:
     - Header "AV Research Club" + badge attivo/gold.
     - Sottotitolo "Le ultime 12 ricerche pubblicate, accessibili per te."
     - Query prisma: `researchDoc.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 12 })`.
     - Griglia responsive (1 col mobile, 2/3 col tablet/desktop).
     - Ogni card (GlassCard o equivalente):
       - Badge "WEEKLY RESEARCH" (gold accento) o data numerica progressiva "#012".
       - Titolo font-display.
       - Descrizione breve (line-clamp 2/3).
       - Data pubblicazione DD/MM/YYYY.
       - Icona PDF + badge PDF.
       - CTA "APRI RICERCA" → href a `/api/research-pdf/${doc.id}` (apre PDF inline o download in base a browser).
       - Accenti gold limitati al badge categoria e sottili bordi.
5. Layout member: se usi navigation, aggiungi link "Research Club" nella nav dell'area membri.

**TR (rule):**
- **TR-R-11.1**: Non abbonato → upgrade state + CTA a checkout, Nessun doc leaked.
- **TR-R-11.2**: Abbonato attivo → lista PUBLISHED max 12 take, ordine DESC by publishedAt.
- **TR-R-11.3**: CTA "APRI RICERCA" → punta a route protetta pdf (href assolutamente corretto).

**TR (rubric):**
- **TR-U-11.1**: Mobile responsiveness dashboard. Soglia ≥ 1.5.
- **TR-U-11.2**: Accenti gold appropriati nel dashboard RC (non tutto il sito). Soglia ≥ 1.5.

---

## Task 12: CTA intelligenti + integrazione homepage

**Dipendenze:** Task 6, Task 11.
**Priorità:** medium
**Status:** pending

**AC padre:** AC-R-21, AC-R-02 (CTA in homepage).

**Files:**
- Modifica: `src/components/sections/ResearchClub.tsx` (completa CTA logica avviata in task 9).
- Modifica: `src/app/page.tsx` (opzionale se usa direttamente il componente; se componente è self-contained non serve).
- Modifica: `src/components/layout/Header.tsx` o equivalente navigation (Research Club link).

**Implementazione:**
1. Ricerca Club Header nav link:
   - Se sessione autenticata: `href="/area-membri/research-club"`.
   - Se anonimo: `href="/#research-club"`.
2. Componente CTA in ResearchClub.tsx:
   - Via Server Component (se possibile, import auth):
     - if !session → login link con callback a #research-club o /area-membri/research-club.
     - if session && accessGranted → /area-membri/research-club diretto.
     - if session && !accessGranted → form POST a /api/stripe/checkout (slug=research-club) oppure client component che fa fetch POST.
   - Se auth() dentro client component non si può, fare wrapper `ResearchClubCta.tsx` 'use client' che fetcha `/api/auth/session` + `GET /api/entitlements/rc` (opzionale nuovo endpoint piccolo) oppure appoggia a React + suspense. Scegliere la via più semplice e sicura.

**TR (rule):**
- **TR-R-12.1**: Admin o utente con RC attivo → cliccando homepage CTA non arriva a checkout ma a dashboard.
- **TR-R-12.2**: Header link "Research Club": sessione presente → /area-membri/research-club; no → `#research-club`.

---

## Task 13: Build & Validate (pre-review)

**Dipendenze:** Tasks 1-12 completati.
**Priorità:** high
**Status:** pending

**AC padre:** AC-R-22, AC-R-23, AC-R-24.

**Files:** tutti compilati.

**Azioni:**
1. `npm run typecheck` (tsc --noEmit).
2. `npm run lint`.
3. `npm run build` (next build completo + prisma generate).
4. `prisma migrate dev` se non già applicata.
5. Spot-check runtime in dev: avviare dev server; provare pagina admin/research.
6. Aprire tutti i nuovi file per ispezionare import/type errors.

**TR (rule):**
- **TR-R-13.1**: tsc 0 errori.
- **TR-R-13.2**: next build 0 errori (no fallimenti anche per route API).
- **TR-R-13.3**: Prisma migrate dev applica senza errori.

---

## Task 14: Review indipendente + Remediation

**Dipendenze:** Task 13.
**Priorità:** high
**Status:** pending

**(fase Review, non Implementation)**

---

## Task 15: Commit + Push main

**Dipendenze:** Task 14 Review passata.
**Priorità:** high
**Status:** pending

**AC padre:** Report sezione 18 GIT.

**Files:** `.trae/specs/...` inclusi.

**Commit message suggerito:**
```
feat(research-club): launch subscriptions member access and research CMS

- Add Prisma Subscription model + ResearchDoc.publishedAt (additive migration)
- Extend Stripe pricing/checkout: research-club with mode=subscription
- Handle webhook subscription & invoice events idempotently
- ResearchClub entitlement + Stripe Customer Portal in profilo
- Vercel Blob integration (real upload/delete/download with private access)
- Admin CMS: manual delete, publishedAt set, rolling 12 PUBLISHED cleanup
- Protected PDF streaming endpoint with double auth+entitlement check
- Public RC section: remove PROSSIMAMENTE, gold accents, price, live CTA
- Member RC dashboard with upgrade state + published research cards
- Smart CTA routing (active subscriber → dashboard instead of checkout)
```

TR-R-15.1: `git status` shows only expected changes.
TR-R-15.2: `git push origin main` succeeds.

---

## Appendice: Mappa Files coinvolti (prevista)

| # | File | Tipo |
|---|---|---|
| 1 | `package.json` | Modify (add @vercel/blob dep) |
| 2 | `prisma/schema.prisma` | Modify |
| 3 | `prisma/migrations/*_add_subscription_and_published_at/migration.sql` | New |
| 4 | `src/lib/stripe/pricing.ts` | Modify |
| 5 | `src/lib/stripe/client.ts` | Unchanged |
| 6 | `src/lib/stripe/purchase-sync.ts` | Light modify if needed |
| 7 | `src/lib/stripe/subscription-sync.ts` | New |
| 8 | `src/lib/storage/index.ts` | Modify |
| 9 | `src/lib/entitlements.ts` | Modify |
| 10 | `src/lib/admin/research-admin.ts` | Modify |
| 11 | `src/app/api/stripe/checkout/route.ts` | Modify |
| 12 | `src/app/api/stripe/webhook/route.ts` | Modify |
| 13 | `src/app/api/stripe/customer-portal/route.ts` | New |
| 14 | `src/app/api/research-pdf/[id]/route.ts` | New |
| 15 | `src/app/admin/research/actions.ts` | Modify |
| 16 | `src/app/admin/research/page.tsx` | Modify |
| 17 | `src/app/admin/research/[id]/page.tsx` | Modify |
| 18 | `src/app/admin/research/[id]/editor-components.tsx` | Modify |
| 19 | `src/config/siteConfig.ts` | Modify |
| 20 | `src/components/sections/ResearchClub.tsx` | Modify |
| 21 | `src/app/area-membri/profilo/page.tsx` | Modify |
| 22 | `src/app/area-membri/research-club/page.tsx` | New |
| 23 | `tailwind.config.*` o globals.css | Eventuale modify per gold tokens |
