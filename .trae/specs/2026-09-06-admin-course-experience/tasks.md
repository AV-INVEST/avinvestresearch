# AV-INVEST RESEARCH - Entitlements, Admin CMS, Course Experience - Implementation Plan

## Task 1: Estendere schema Prisma (migrazione additiva) e generazione client
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Aggiungere modelli `Course`, `Module`, `Lesson`, `LessonProgress`, `ResearchDoc` a `prisma/schema.prisma` mantenendo intatti `User`, `Purchase`, `StripeEvent`.
  - Enum: `VideoSourceType` (YOUTUBE, BUNNY_STREAM, NONE), `ContentStatus` (DRAFT, PUBLISHED), `StorageProvider` (BUNNY_STORAGE, S3, VERCEL_BLOB, NONE).
  - Unique constraints: Course.slug, Module(courseId,slug), Lesson(moduleId,slug), LessonProgress(userEmail,lessonId), ResearchDoc.slug.
  - FKs: Module.courseId -> Course.id, Lesson.moduleId -> Module.id, LessonProgress.lessonId -> Lesson.id, LessonProgress.userEmail -> User.email.
  - Creare migrazione con `prisma migrate dev --name add_course_content_progress_research` e deploy metadata. Non fare reset.
  - `prisma generate`.
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-8, AC-9, AC-14 (dipendono tutti dallo schema)
- **Test Requirements**:
  - `rule` TR-1.1: Migrazione applicata senza errori; prisma db pull su Neon restituisce tutti i nuovi modelli; vecchi modelli intatti. Evidence: Log `prisma migrate dev` + elenco tabelle.
  - `rule` TR-1.2: Purchase e User non hanno subito `DROP COLUMN` o modifiche distruttive. Evidence: confronto migration.sql con schema esistente.
- **Notes**: Usare `DATABASE_URL_UNPOOLED` come `directUrl`.

## Task 2: Seed idempotente Foundations (1 modulo + 10 lezioni DRAFT)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Creare `src/lib/db/seed-course-content.ts` o script in `scripts/seed-courses.mjs`.
  - Upsert Course `foundations` e `trading-lab` (slugs noti).
  - Per foundations: crea 1 Modulo "Fondamenti di analisi tecnica" (slug `fondamenti-analisi-tecnica`, order 0).
  - Inserisci 10 lezioni DRAFT con slug deterministici, titolo e descrizione esattamente come da spec. `videoSourceType=NONE`.
  - Idempotenza: usa `upsert` su slug unico per corso/modulo/lezione; per update aggiorna solo se i campi non sono mai stati editati (opzionalmente: flag `seeded` o semplice controllo che se esiste gia skip). Il requisito chiave e NON sovrascrivere edit admin. Strategia piu sicura: `createMany` con `skipDuplicates: true` per le lezioni dopo upsert corso/modulo.
  - Aggiungere npm script `"seed:courses": "node scripts/seed-courses.mjs"` o equivalente TS tramite ts-node o modulo server importato.
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-2.1: Prima esecuzione seed -> 1 modulo + 10 lezioni DRAFT per foundations. Query `Lesson.count({where:{module:{course:{slug:'foundations'}}}})` = 10.
  - `rule` TR-2.2: Modifico manualmente titolo di lezione 1 con query diretta. Rieseguo seed. Titolo non torna al valore originale. `SELECT title FROM "Lesson" WHERE slug='partire-da-zero'` = titolo modificato.
- **Notes**: Verranno utilizzati slug come `partire-da-zero`, `investire-o-trading`, etc. derivati dai titoli.

## Task 3: Admin guard server-only e middleware /admin
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - In `.env.example` aggiungere `ADMIN_GOOGLE_EMAILS=owner@gmail.com`.
  - Creare `src/lib/auth/admin.ts`:
    - `getAdminEmailsEnv(): string[]` -> legge `ADMIN_GOOGLE_EMAILS`, split CSV, trim+lowercase.
    - `isAdminEmail(email: string | null | undefined): boolean`.
    - `async isAdminUser(session: Session | null): Promise<boolean>` -> normalize + controllo.
  - Estendere `middleware.ts` matcher con `/admin/:path*`. Implementare un middleware custom o lasciare che la pagina di layout `/admin/layout.tsx` faccia il check (middleware puo redirect a login e il layout risponde 403 se isAdmin false).
  - Layout protetto `src/app/admin/layout.tsx`:
    - `export const dynamic = 'force-dynamic'`.
    - Check auth() + isAdminUser. Se non admin: render `<div>403 Accesso riservato.</div>` e status 403.
    - Navigazione admin minima: Dashboard, Percorsi, Research Club.
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-3.1: curl a `/admin` anonimo -> 302 a login. curl con sessione non admin -> 403. curl con sessione admin email in env -> 200.
  - `rule` TR-3.2: `ADMIN_GOOGLE_EMAILS` non presente in `process.env` -> tutti gli utenti sono considerati non admin.
- **Notes**: Nessun ruolo nel DB. Check solo env per minimizzare superficie.

## Task 4: Arricchire entitlements (pending + stato semantico + progresso da DB)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - Rifattorizzare `src/lib/entitlements.ts`:
    - Tipo `CourseStatus` esteso: `locked | payment_pending | owned_not_started | owned_in_progress | owned_completed`.
    - In `loadPurchases`: includere anche `status='pending'` con createdAt recente (filtro a 2h per transienti).
    - Calcolare `progressPct`: se owned, aggregare media LessonProgress completati su lezioni PUBLISHED del corso. Formula: `num completed lessons / num published lessons * 100` (oppure piu preciso: media progressPct per lezione, a scelta).
    - Calcolare `latestLessonSlug`, `latestLessonHref`: ultima LessonProgress.lastWatchedAt > lezione piu avanzata per order non completata.
    - Aggiungere `anyPending: boolean` a EntitlementsState.
  - Tutte le nuove query Prisma: condizione `where: { lesson: { status: 'PUBLISHED' } }` per progresso (NON contare DRAFT).
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-5, AC-15
- **Test Requirements**:
  - `rule` TR-4.1: Utente con una Purchase `pending` per foundations <2h -> status `payment_pending`.
  - `rule` TR-4.2: Utente owned, 0 lezioni pubblicate -> owned_not_started.
  - `rule` TR-4.3: Utente owned, 1 lezione published con progresso 50% -> owned_in_progress e latestLessonHref corretto.
- **Notes**: Aggiungere cache in-memory per richiesta? Meglio no per consistenza; va bene forza dinamico.

## Task 5: Server rendering CTA purchase-aware (Courses.tsx, percorsi page, ecc.)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - Rendere `src/components/sections/Courses.tsx` un componente ibrido: invece di renderizzare sempre CourseCheckoutButton (client), calcolare ownership server-side.
    - Strategia: creare un wrapper Server Component `src/components/sections/CoursesWithEntitlements.tsx` (o usare data fetching nella pagina e passarlo come prop a Courses).
    - `page.tsx` (home) e server component. Importare e usare `auth()` + `getEntitlements` nella home (export dynamic = 'force-dynamic' se necessario? Meglio si per evitare cache condivisa). Passare entitlements come prop a `<Courses entitlements={...} />`.
  - Aggiornare firma di `Courses`: `function Courses({ entitlements }: ...)`.
  - Per ogni corso in Courses, calcolare il CTA corretto:
    - Locked -> render `CourseCheckoutButton`.
    - Payment pending -> render `<div class="pending-payment-banner">Stiamo confermando il pagamento...</div>` con NO button acquisto.
    - Owned_* -> render Link a `latestLessonHref` o prima lezione. Testo: Inizia/Riprendi/Rivedi. Badge: `<span class="owned-badge">Il corso e tuo</span>`.
  - Aggiornare `percorsi/page.tsx`: il bottone "Continua il percorso" attualmente disabilitato (`disabled` hardcoded) va reso Link attivo a href corretto. Testo dinamico Inizia/Riprendi/Rivedi.
  - Aggiornare layout generale se serve, ma evitare inserire dati personalizzati in `/app/layout.tsx`.
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-15
- **Test Requirements**:
  - `rule` TR-5.1: Utente owned foundations -> screenshot `/` sezione percorsi: Foundations NON ha bottone acquista, ha badge e link Inizia/Riprendi. Trading Lab ha ancora Acquista.
  - `rule` TR-5.2: Stato caricamento: quando entitlements sono `undefined` (se c'e un wrapper suspense) -> render placeholder non cliccabile, non bottone.
- **Notes**: Home va resa `force-dynamic` perche contiene CTAs personalizzati. Valutare se spostare la sezione courses in un route segment `force-dynamic` se preferibile.

## Task 6: Checkout anti-duplicato e pending reuse
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (per eventuale Purchase `pending` reuse), Task 4
- **Description**:
  - Modificare `src/app/api/stripe/checkout/route.ts` (sempre POST):
    1. Step 1: Post auth + resolveProduct.
    2. Step 2: Check esistente Purchase succeeded per userEmail+productSlug. Se trovato -> 409 `{ error: 'Hai gia acquistato questo corso.', redirectTo: '/area-membri/percorsi' }`.
    3. Step 3: Check esistente Purchase pending per userEmail+productSlug con createdAt < 24h e checkoutSessionId valorizzato. Se trovato: usare `stripe.checkout.sessions.retrieve(sessionId)`; se session.status === 'open' -> restituisci `{ url: session.url, reused: true }`. Altrimenti prosegui.
    4. Step 4: Per gestire concorrenza doppio click: usare una `Promise` lock in-memory per la stessa email+slug durante la richiesta? Meglio Prisma transaction con `create` di una entry di lock temporanea? Semplice: aggiungere unique constraint? No, Purchase puo avere piu pending storici se falliti. Alternativa: `Prisma.Transaction` e controllare in `SERIALIZABLE`. Oppure usare una tabella temporanea o chiave unica fittizia. La soluzione piu pragmatica: creare la Purchase con status=pending PRIMA di chiamare Stripe (con checkoutSessionId = 'pending_' + unique) ma no, checkoutSessionId deve essere univoco e reale. Soluzione effettiva:
       - Usare un in-memory cache Map `processingKey = email + ':' + slug` con setTimeout 20s. Nel periodo di lock, seconda richiesta restituisce 409. Questo protegge da doppio click simultaneo stesso server.
       - Inoltre, lato server, dopo la creazione della sessione Stripe, salvare Purchase status=pending con checkoutSessionId. In questo modo il check Step 3 blocca le successive.
    5. Dopo stripe.checkout.sessions.create: salvare Purchase status=pending (prima del webhook). Nota: il webhook successivamente fara upsert su checkoutSessionId aggiornando a succeeded.
  - Modificare `CourseCheckoutButton.tsx` client: riceve risposta 409 -> mostra messaggio invece di errore generico, e opzionalmente redirect a /area-membri. Se 409 pending reuse: redirect automatico allo URL reuse.
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `rule` TR-6.1: POST doppio simultaneo stesso client stesso slug -> una 200 con url, altra 409 o 200 con reused.
  - `rule` TR-6.2: POST corso gia succeeded -> 409 e messaggio.
- **Notes**: Il lock in-memory non funziona tra piu istanze serverless su Vercel edge; ma il DB check Step 2 e Step 3 sono la vera garanzia. Lock in-memory solo per UX doppio click locale.

## Task 7: Pending payment banner e bounded retry in area-membri
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4, Task 5
- **Description**:
  - Area membri overview page `/area-membri/page.tsx`:
    - Legge `searchParams` (se Next 15 consente da page.tsx server: si, `page({ searchParams })`). Se `checkout === 'success'`: ignora per sicurezza.
    - Se entitlements riporta `courses[slug].status === payment_pending`: mostra banner prominent.
  - Client-side component `PendingPaymentPoller.tsx`:
    - Mount quando pending. Polling a `/api/entitlements/me` (nuova route) o `/api/auth/session` ma serve lo stato. Soluzione: creare endpoint `GET /api/entitlements/me` che restituisce `EntitlementsState` serializzato. Auth richiesto.
    - Polling: max 6 volte ogni 5000 ms. Dopo 6 volte: messaggio "La conferma puo richiedere alcuni minuti. Torna piu tardi o contatta assistenza." + link refresh.
    - Quando polling vede che lo stato non e piu pending -> ricarica la pagina (router.refresh()).
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-7.1: Polling count <= 6. Network tab: 6 richieste max, poi si ferma.
  - `rule` TR-7.2: Manipolare URL con `?checkout=success&grantAccess=own_it` -> il banner appare solo se Purchase DB e davvero pending.
- **Notes**: `GET /api/entitlements/me` deve essere `force-dynamic` e auth required.

## Task 8: Admin CMS Dashboard - Percorsi e Lezioni CRUD + riordino
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3
- **Description**:
  - Pagine:
    - `/admin/page.tsx` -> Dashboard (riepilogo: N. lezioni pubblicate/draft per corso, link a sezioni).
    - `/admin/corsi/page.tsx` -> Lista corsi (2 entry).
    - `/admin/corsi/[courseSlug]/page.tsx` -> Lista moduli del corso + lista lezioni per modulo (tabella, card, o lista ordinata).
    - `/admin/corsi/[courseSlug]/lezioni/[lessonId]/page.tsx` -> Editor della lezione.
    - Creare modulo (`/admin/corsi/[courseSlug]/moduli/new`) -> puo essere inline o button che crea modulo default "Nuovo modulo".
  - CRUD lezione:
    - Campi: `title` (required), `slug` (autogenerato, modificabile una sola volta), `description` (textarea), `durationMin` (number nullable), `videoSourceType` (YOUTUBE | NONE, BUNNY_STREAM in questa fase solo disabled o selezionabile ma mostra "non configurato").
    - `youtubeVideoId`: input text. Validazione lato server Action: regex `^[A-Za-z0-9_-]{6,}$`. Messaggio errore se non valido.
    - Pulsanti: "Salva bozza" (status=DRAFT), "Pubblica" (status=PUBLISHED), "Anteprima" (apre `/area-membri/corsi/.../lezione?preview=1` in new tab).
    - Stato salvataggio: toast verde/rosso.
  - Riordino: Bottoni freccia su/giu per ogni lezione (non richiede libreria drag drop). Aggiorno `order` campo con Prisma transaction swap.
  - Sostituzione video: edit `youtubeVideoId` + salva. L'id lezione NON cambia.
  - Tutti i salvataggi via Server Actions (preferibile per sicurezza) o Route Handler `/api/admin/lessons/[id]` con check admin.
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-8, AC-13
- **Test Requirements**:
  - `rule` TR-8.1: Creo lezione, salvo bozza, pubblico. DB: status corretto.
  - `rule` TR-8.2: Modifico titolo + cambio ordine con altra. Ri-leggo lista: ordine nuovo.
  - `rule` TR-8.3: Submit youtubeId = `<iframe>` -> errore validazione server-side, dato NON salvato.
- **Notes**: Per slug auto: funzione `slugify` custom semplicissima su title.

## Task 9: Preview lezione per admin (?preview=1) e lesson viewer DB-backed con elenco
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 8
- **Description**:
  - Sostituire l'uso di `data/courses.ts` (moduli/lezioni) con query Prisma nella pagina lesson e percorsi. Tenere i metadati del corso (titolo, descrizione) ancora in siteConfig o migrare a DB? Opzione sicura: migrare tutto a DB ma mantenere siteConfig come fallback per la homepage pricing. Preferibile: usare DB per moduli/lezioni solo dentro area membri e admin. Homepage continua a usare siteConfig per descrizioni e prezzi (zero-trust pricing richiede configurazione statica lato server pricing.ts quindi ok).
  - Pagina lesson route:
    - Nuovo file: `src/app/area-membri/corsi/[courseSlug]/page.tsx` (overview corso) oppure saltiamo direttamente al viewer. Decisione: mantenere struttura esistente `/corsi/[corso]/[modulo]/[lezione]`. Se il corso non ha lezioni pubblicate: empty state onesto "Nessuna lezione pubblicata. Torna piu tardi."
    - `getServerSide`: auth + entitlements ownership check. Poi query DB: Module + Lesson ordinati per `order`. Per ogni lezione, se admin e `preview=1`: includi DRAFT; altrimenti solo PUBLISHED.
    - Passare lista completa a nuovo client `LessonViewerEnhanced`.
  - Nuovo componente `LessonViewerEnhanced` (client):
    - Layout responsive (vedi AC-10).
    - Player top, lesson list sidebar/bottom.
    - Prev/next buttons.
    - Lesson list: click su un item -> router.push. Active: corrente. Completed: LessonProgress.completed=true.
    - Per admin: badge "DRAFT" se e il caso.
  - Reso compatibile con YouTubeEmbed esistente.
- **Acceptance Criteria Addressed**: AC-10, AC-12
- **Test Requirements**:
  - `rule` TR-9.1: Admin richiama con `?preview=1` lezione DRAFT -> visibile. Utente standard no.
  - `rule` TR-9.2: Breakpoint 360px: lezione lista sotto player, larghezza 100% viewport, no overflow.
- **Notes**: Considerare spostare LessonViewer in nome diverso per non rompere.

## Task 10: Progress tracking (Route Handler + throttling + resume)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 9
- **Description**:
  - Route: `POST /api/course/progress` (force-dynamic, auth required):
    - Body JSON: `{ lessonId: string, progressPct?: number, lastPositionSec?: number }`.
    - Controlli:
      1. Utente autenticato.
      2. Utente owner del corso (tramite entitlements o query diretta).
      3. Lesson PUBLISHED (oppure DRAFT e admin preview).
      4. progressPct tra 0 e 100, lastPositionSec >=0.
    - Throttling DB: nella tabella LessonProgress c'e `updatedAt`. Ultimo aggiornamento < 15 secondi fa: SKIP write (restituisci 200 `{ skipped: true, throttled: true }`).
    - Upsert LessonProgress: se progressPct >= 95 -> completed=true, completedAt=now.
    - Risposta 200 `{ ok: true, saved: boolean }`.
  - Client: in `LessonViewerEnhanced`:
    - Per YouTube iframe, dato che non abbiamo JS API control senza caricare youtube iframe API (cosa pesante), usare una soluzione semplice:
      - Ogni 20s o quando l'utente clicca next, chiama `/api/course/progress` con stima progresso (in base al tempo di visualizzazione dalla apertura? Meglio usare URL parameter `?start=X` per resume ma per il tracking richiedere un mark esplicito o usare `postMessage` dall'iframe? Opzione pragmatica:
        - Tracciare `lastPositionSec` usando un pulsante "Segna come visto" + aggiornamento al cambio lezione.
        - Oppure usare l'`YouTube IFrame Player API` caricamento asincrono (aumenta JS ma piu preciso).
      - Decisione: implementare sia un pulsante manuale "Segna come completata" (affidabile) che tracking automatico leggero con setInterval ogni 20s che salva `lastPositionSec` approssimativo e progressPct sulla base di durationMin noto (se durationMin settato).
      - Resume: quando si apre la pagina, se `lessonProgress.lastPositionSec > 15` e YouTubeId c'e, appendere `&start=<lastPositionSec>` all'URL dell'iframe YouTube.
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `rule` TR-10.1: Chiamate consecutive a /progress con intervallo 1s: solo 1 write ogni 15s. Verificare `updatedAt` differenza >= 14s.
  - `rule` TR-10.2: progressPct = 96 -> LessonProgress.completed=true nella prossima write non throttled.
  - `rule` TR-10.3: YouTube iframe src contiene `&start=45` se progresso salvato con 45s.
- **Notes**: Non usare librerie YouTube player; mantenere leggero.

## Task 11: Video provider boundary (Bunny Stream stub + YouTube warning admin)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8, Task 9
- **Description**:
  - Creare `src/lib/video/bunny-stream.ts`:
    - `isBunnyConfigured() -> boolean` (check env BUNNY_STREAM_API_KEY, BUNNY_STREAM_LIBRARY_ID).
    - Interfaccia e funzioni stub: `generateSignedPlaybackUrl(videoId: string, ttlSec = 3600): Promise<string | null>`. Se non configurato return null.
    - Le funzioni riportano la struttura della firma (HMAC o JWT Bunny) ma non si attivano finche non sono presenti env.
  - Aggiungere in `.env.example`: `BUNNY_STREAM_API_KEY=`, `BUNNY_STREAM_LIBRARY_ID=`.
  - Pannello admin lezione: sezione "Configurazione Video Provider". Warning giallo/testo esplicito per YouTube. Per Bunny Stream se non configurato mostra box grigio: "Bunny Stream non configurato. Per abilitare inserisci API KEY e LIBRARY ID. Costi stimati: consultare Bunny.net pricing (storage + banda transcoding).".
  - Route Handler `GET /api/course/video/[lessonId]/playback`:
    - Verifica ownership e PUBLISHED.
    - If source = BUNNY_STREAM and bunny configured -> genera signed URL e `return NextResponse.json({ url: signed })`.
    - If not configured -> 503 `{ error: 'Bunny Stream non configurato', setup: ['BUNNY_STREAM_API_KEY', 'BUNNY_STREAM_LIBRARY_ID'] }`.
    - If source = YOUTUBE -> 400 'usa direct YouTube embed'.
  - Documentazione interna: creare sezione in `.env.example` commentata con step richiesti per Bunny Stream activation.
- **Acceptance Criteria Addressed**: AC-13
- **Test Requirements**:
  - `rule` TR-11.1: GET /api/course/video/lesson-id/playback lesson YOUTUBE -> 400.
  - `rule` TR-11.2: GET /api/course/video/lesson-id/playback lesson BUNNY e env NON settate -> 503 + lista env.
- **Notes**: NON implementare firma Bunny HMAC reale senza che il proprietario approvi costi; solo struttura boundary e messaggi onesti.

## Task 12: Research Club admin metadata + PDF upload boundary (NON abilitare pubblicazione/sub)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1, Task 3
- **Description**:
  - Creare `src/lib/storage/private-storage.ts`:
    - `getStorageStatus()` -> configured boolean, requiredEnv array, availableProvider.
    - Check:
      - Vercel Blob: process.env.VERCEL_BLOB_READ_WRITE_TOKEN
      - Bunny Storage: BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_REGION
      - S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION
    - `uploadPdf(buffer: Buffer, filename: string, size: number)`: se configured non fa nulla di reale o se c'e Vercel Blob carica usando `@vercel/blob`. Attenzione: `@vercel/blob` non e in package.json. Per questa task: **non aggiungere dipendenze**. Implementare solo status check e ritorno errore.
  - `/admin/research/page.tsx`:
    - Lista ResearchDocs ordinati per publicationDate desc.
    - Form editor per nuovo documento: title, slug, description, publicationDate, status (DRAFT/PUBLISHED).
    - Upload PDF: sezione file input -> submit a Route `POST /api/admin/research/[id]/upload`.
    - Lato handler:
      - Check admin auth.
      - Parse FormData -> file.
      - Validazione MIME type (solo `application/pdf`, controllare anche magic numbers primi 4 byte %PDF-).
      - Size <= 25MB.
      - If storage NOT configured: save ResearchDoc ma con storageProvider=NONE e storageObjectKey=NULL. Return 422 UI message "Storage privato NON configurato. Il file non e stato salvato. Per abilitare configura: ...".
      - NO fake success.
  - Aggiungere in `.env.example`:
    ```
    # Private storage (per Research Club PDF)
    # Vercel Blob: VERCEL_BLOB_READ_WRITE_TOKEN (abilitato dal dashboard Vercel)
    # Bunny Storage: BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_REGION
    # AWS S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION
    ```
  - **Non creare** pagine pubbliche Research Club ne abbonamenti.
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `rule` TR-12.1: Upload senza storage env. Messaggio esplicito. DB record ResearchDoc con storageProvider=NONE.
  - `rule` TR-12.2: Upload file non-PDF (JPEG rename). Validazione fallisce, messaggio "Formato non valido: solo PDF".
- **Notes**: NON installare pacchetti di storage senza consenso.

## Task 13: Aggiornare CourseCheckoutButton client e banner pending
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 5, Task 6, Task 7
- **Description**:
  - `CourseCheckoutButton`:
    - Mantieni caricamento sessione auth.
    - Alla risposta 409 con `redirectTo`: auto redirect via `window.location.assign(payload.redirectTo)`.
    - Messaggi di stato in italiano.
    - Nessun em-dash.
- **Acceptance Criteria Addressed**: AC-3, AC-6 (UI)
- **Test Requirements**:
  - `rule` TR-13.1: 409 response -> redirect automatico a /area-membri/percorsi.
- **Notes**: Piccolo refactor.

## Task 14: Validazione build, lint, typecheck + test funzionali manuali
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1..13
- **Description**:
  - Eseguire:
    1. `npm run typecheck` (tsc --noEmit).
    2. `npm run lint`.
    3. `npm run build` con build completa.
  - Test manuali puntuali (almeno):
    - AC-1 Scenario: login con account che ha foundations succeeded. Verifica CTA in 3 pagine.
    - AC-3 scenario: curl POST /api/stripe/checkout due volte per stesso corso. Primo 200, secondo 409.
    - AC-5 scenario: creare una Purchase pending manual in DB; visitare area-membri; banner presente.
    - AC-6 scenario: login admin e non admin; pagina admin accesso.
    - AC-7 scenario: crea/salva/pubblica/riordina.
    - AC-10 scenario: viewport resize 360px e 1280px; layout.
    - AC-14 scenario: research upload senza storage; messaggio.
- **Acceptance Criteria Addressed**: AC-16, AC-17, AC-18
- **Test Requirements**:
  - `rule` TR-14.1: typecheck 0 errori.
  - `rule` TR-14.2: build exit code 0.
  - `rubric` TR-14.3: Estetica admin + experience corso. Scala 1-5. Anchors 1/3/5 come da AC-17. Soglia >=4. Evidence: screenshot + descrizione.
  - `rubric` TR-14.4: Completezza report (AC-18). Scala 1-5. Soglia >=4.
- **Notes**: Registrare risultati in Completion Evidence.

## Task 15: Preparazione report finale (env richiesti, admin bootstrap, non-configurati, testati)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 14
- **Description**:
  - Redazione report finale con:
    - Elenco env richiesti (nomi, NON valori!) suddivisi per ambito: Auth, DB, Stripe, Admin, Video, Storage.
    - Passaggi bootstrap amministratore: "1) Setta env ADMIN_GOOGLE_EMAILS con la tua email Google. 2) Login sul sito. 3) Visita /admin."
    - Cosa e stato testato (punti del Task 14) e evidenze.
    - Cosa e boundary non configurato: Bunny Stream, Private Storage PDF. Env necessarie per ognuno.
    - Ricerche Club: Nessun abbonamento attivato. Nessuna pubblicazione subscriber.
    - Note di sicurezza: zero-trust mantenuto. Nessun ruolo client-side.
- **Acceptance Criteria Addressed**: AC-18
- **Test Requirements**:
  - `rubric` TR-15.1: Report. Scala 1-5. Soglia >=4.
- **Notes**: Report come risposta finale nel dialogo (file non creato, risposta testuale come da istruzioni No proattivi file md a meno che non richiesti: l'utente vuole un report nella risposta quindi va bene).
