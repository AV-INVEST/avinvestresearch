# AV-INVEST RESEARCH - Entitlements, Admin CMS, Course Experience, Research Club - Product Requirements Document

## Overview
- **Summary**: Estendere l'integrazione Stripe con CTAs consapevoli della proprieta e protezione anti-duplicato, aggiungere un pannello admin CMS per la gestione di lezioni e contenuti, implementare l'esperienza corso con progresso persistito e sorgenti video protette, e preparare la sezione Research Club per documenti/PDF.
- **Purpose**: Risolvere l'incongruenza tra proprieta corso visualizzata (area membri) e CTA di acquisto mostrata in homepage, consentire la pubblicazione di contenuti senza deploy, e porre le basi per le prossime feature (Trading Lab lessons, Research Club abbonamenti) mantenendo zero-trust e sicurezza server-side.
- **Target Users**: Proprietario del sito (admin Google), acquirenti dei percorsi, visitatori non autenticati.

## Goals
- G1: CTA coerenti (homepage, sezione corsi, area membri, lesson viewer) basate esclusivamente sulla proprieta verificata server-side da Purchase `succeeded`.
- G2: Blocco server-side di acquisti duplicati, riuso di sessioni Stripe aperte, gestione di pending webhook UI con retry limitato.
- G3: Pannello admin protetto, accessibile solo tramite email Google configurata server-side, per creare/modificare/ordinare/pubblicare lezioni con draft/preview.
- G4: Esperienza corso DB-backed: player responsive, elenco lezioni numerato, progresso per utente/lezione, resume, prev/next, mobile-first.
- G5: Sorgenti video con boundary provider: YouTube validato per testing (branding onesto, no anti-sharing), boundary Bunny Stream protetto con token a vita breve, stato non configurato onesto.
- G6: Seed iniziale di 10 lezioni Foundations (draft, senza video) idempotente e non distruttivo.
- G7: Sezione Research Club admin (solo metadati e draft) con report onesto di storage privato mancante; nessun abbonamento attivato.
- G8: Nessun dato utente/acquisto esistente viene cancellato o resettato.

## Non-Goals
- NG1: Modifica di prezzi, Price ID Stripe, Managed Payments, tasse, configurazione webhook esistente.
- NG2: Implementazione abbonamenti Stripe o pubblicazione subscriber Research Club (solo preparazione metadata/draft admin).
- NG3: Conferma accesso da parametri URL `checkout=success` o `session_id`; solo webhook `checkout.session.completed` sblocca l'accesso.
- NG4: Attivazione di Bunny Stream o altri provider pagati senza approvazione e configurazione esplicita.
- NG5: Rimozione delle regole di rimborso/revoca esistenti (soglia 1 cent per revoca).
- NG6: Assegnazione ruoli o autorizzazioni lato client; admin esclusivamente server-side.
- NG7: Fabricazione di URL video, durate, o dati di completamento non esistenti.

## Background & Context
### Stato attuale osservato
- `Courses.tsx` + `CourseCheckoutButton.tsx`: Bottone client "Acquista ora" sempre visibile, nessun check ownership server-side. Se Foundations e gia acquistato, la homepage mostra ancora "Acquista ora" mentre "I miei percorsi" lo mostra disponibile.
- `entitlements.ts`: Restituisce solo `locked/available/completed` da Purchase `succeeded`, senza stato di pending pagamento, senza progresso reale da DB.
- `pricing.ts`: Allowlist server-side con slug -> Price ID mapping (sicurezza corretta).
- `checkout/route.ts`: Crea sessioni senza controllare esistenza di acquisto riuscito o sessione in sospeso; possibile doppio click -> doppia sessione -> doppio pagamento.
- `purchase-sync.ts` + `webhook/route.ts`: Idempotenza StripeEvent e syncPurchase con upsert su checkoutSessionId (corretto). Non gestisce lo stato pending di una Purchase creata prima del webhook.
- `data/courses.ts`: Lezioni e moduli hardcoded con array vuoti; nessun contenuto persistito.
- `LessonViewer.tsx`: Player YouTube + note, ma nessun elenco lezioni, nessun progresso persistito, nessun resume.
- Schema Prisma attuale: `User`, `StripeEvent`, `Purchase`. Mancano: `Course`, `Module`, `Lesson`, `LessonProgress`, `ResearchDoc`, modello/dati per ruolo admin.
- Auth: Solo Google OAuth via Auth.js v5; ruoli admin assenti.

### Vincoli del progetto ereditati
- Zero-trust pricing: Price ID e importi solo server-side.
- Sblocco accesso SOLO via webhook confermato.
- Email normalization (trim + lowercase) per tutte le query.
- Zero em-dash (—, –).
- Migrazioni additive Prisma, nessun reset utenti/acquisti.
- DIRECT_URL richiesto per migrazioni su Neon/Vercel pooled.
- UI esclusivamente in italiano.
- Design system: black/neon-green, dark, mobile-first, trading-terminal aesthetic.

## Functional Requirements

### FR-1: Entitlement lookup arricchito (pending, not-started / in-progress / completed)
- `getEntitlements(userId?, email?)` oltre a Purchase `succeeded` deve:
  - Includere Purchase `pending` recenti (createAt < 2h) con flag `paymentPending: boolean`.
  - Calcolare `progressPct: number` e `latestLessonSlug` / `latestLessonHref` per ogni corso da tabella `LessonProgress`.
  - Restituire per corso uno stato semantico: `locked | owned_not_started | owned_in_progress | owned_completed | payment_pending`.
  - Nessun dato personalizzato nel layout condiviso o in pagine cacheabili.

### FR-2: CTA purchase-aware su homepage, sezione corsi, area membri, viewer
- Server-side render per ogni contesto che mostra il CTA di un corso:
  - `locked`: Visualizza "Acquista ora" (via CourseCheckoutButton esistente ma reso condizionalmente).
  - `payment_pending`: Visualizza "Stiamo confermando il pagamento" (messaggio statico, nessun CTA acquisto).
  - `owned_not_started`: CTA "Inizia il percorso" -> link a prima lezione pubblicata del corso. Badge "Il corso e tuo".
  - `owned_in_progress`: CTA "Riprendi la lezione" -> link a `latestLessonHref`. Badge "Il corso e tuo".
  - `owned_completed`: CTA "Rivedi il percorso" -> link a prima lezione o overview. Badge "Il corso e tuo".
- Stato di caricamento ownership: Mentre il server calcola gli entitlements, non mostrare alcun bottone acquistabile (placeholder disabilitato o skeletton).
- Trading Lab rimane acquistabile anche se Foundations e posseduto.

### FR-3: Pending payment UI con bounded retry
- Dopo redirect a `/area-membri?checkout=success&session_id=XXX`:
  - Server-side ignora `session_id` per concedere accesso; usa solo webhook.
  - Se esiste Purchase `pending` per quell'utente + slug o checkoutSessionId, mostra banner "Stiamo confermando il pagamento".
  - Retry client-side con polling limitato: max 6 tentativi ogni 5 sec, poi link a manual refresh e assistenza.
  - Nessuna concessione di accesso basata su successo URL.

### FR-4: Protezione duplicato checkout + riuso sessioni
- Endpoint `POST /api/stripe/checkout`:
  - Prima della creazione: controlla se esiste gia una Purchase `succeeded` per userEmail + productSlug. Se si -> 409 con messaggio e link a area membri.
  - Controlla se esiste una Purchase `pending` creata < 24h per userEmail + productSlug con checkoutSessionId valorizzato. Se si, recupera la sessione da Stripe (se `status=open`) e restituisci il suo URL invece di crearne una nuova.
  - Prima di creare nuova sessione, crea preventivamente una Purchase `status=pending` nel DB con checkoutSessionId generato? No: crea la sessione Stripe e solo dopo salva Purchase pending. Usa transazione o lock per gestire concorrenza doppio-click.
  - Client-side: CourseCheckoutButton gia disabilita durante loading; lato server per sicurezza aggiungere controllo anche con lock atomico Prisma (unique constraint composito o operazione idempotente).

### FR-5: Admin authorization (server-only config)
- Variabile ambiente `ADMIN_GOOGLE_EMAILS` (CSV di email normalizzate, es: `admin1@gmail.com,admin2@gmail.com`).
- Funzione server-only `isAdminUser(session)` che confronta `normalizeEmail(session.user.email)` con la lista.
- Middleware per `/admin/:path*` con auth check + admin check.
- Tutte le pagine, le Route Handler e le Server Action sotto `/admin` ripetono il controllo server-side per difesa in profondita.
- Nessun role salvato nel DB User in questa fase per evitare surface di assignement pubblico; solo confronto env.

### FR-6: Prisma schema esteso (migrazione additiva)
Aggiungere modelli (non distruttivo, nessuna modifica a User/Purchase/StripeEvent):
- **Course**: `id cuid PK`, `slug String unique`, `title String`, `subtitle String?`, `description String?`, `order Int`, `createdAt`, `updatedAt`. Pre-popolati foundations e trading-lab via seed.
- **Module**: `id cuid PK`, `courseId FK Course`, `slug String`, `title String`, `description String?`, `order Int`, `createdAt`, `updatedAt`. Unique(courseId, slug).
- **Lesson**: `id cuid PK`, `moduleId FK Module`, `slug String`, `title String`, `description String? (Text)`, `durationMin Int?`, `videoSourceType Enum(YOUTUBE, BUNNY_STREAM, NONE)`, `youtubeVideoId String?`, `bunnyVideoId String?`, `bunnyLibraryId String?`, `status Enum(DRAFT, PUBLISHED)` default DRAFT, `order Int`, `createdAt`, `updatedAt`. Unique(moduleId, slug). Index(courseId via module, status, order).
- **LessonProgress**: `id cuid PK`, `userEmail String`, `lessonId FK Lesson`, `progressPct Int default 0`, `lastPositionSec Int default 0`, `completed Boolean default false`, `completedAt DateTime?`, `lastWatchedAt DateTime?`, `createdAt`, `updatedAt`. Unique(userEmail, lessonId). FK userEmail -> User.email.
- **ResearchDoc**: `id cuid PK`, `slug String unique`, `title String`, `description String? (Text)`, `publicationDate DateTime?`, `storageProvider Enum(BUNNY_STORAGE, S3, VERCEL_BLOB, NONE)` default NONE, `storageObjectKey String?`, `storageBucket String?`, `pdfFileName String?`, `pdfFileSizeBytes Int?`, `status Enum(DRAFT, PUBLISHED)` default DRAFT, `createdAt`, `updatedAt`. Index(status, publicationDate DESC).

### FR-7: Admin CMS Gestione contenuti
- `/admin`: Dashboard con due tab "Percorsi formativi" e "Research Club (preparazione)".
- **Percorsi formativi**:
  - Lista corsi (foundations, trading-lab). Click corso -> lista moduli. Click modulo -> lista lezioni ordinata.
  - Per lezione: form con title, description (textarea), durationMin, videoSourceType (select: NONE / YOUTUBE), youtubeVideoId (input, validato con regex Youtube id sicuro, no iframe HTML arbitrario).
  - Note admin su YouTube: "Test temporaneo. Limiti: branding YouTube visibile, condivisione non bloccabile, cookie necessari. Per produzione usare Bunny Stream protetto."
  - Azioni: Salva bozza, Anteprima (apre la lesson viewer in un tab in modalita preview solo per admin), Pubblica / Riporta in bozza.
  - Rioridina: Drag-and-drop semplice o bottoni "Sposta su/giu" con aggiornamento campo `order`.
  - Sostituzione video: cambiare youtubeVideoId non resetta l'identity della lezione ne il progresso studenti.
  - Stati chiari di salvataggio: salvataggio ok (verde), errore (rosso con messaggio).
- **Preview admin**: Gli endpoint delle lezioni accettano un query param `preview=1` + richiesta admin per mostrare lezioni DRAFT al proprietario.
- Ricerche: No, visualizza e modifica DB diretto.

### FR-8: Esperienza corso (lesson viewer + elenco)
- Source di verita: Prisma Course/Module/Lesson (published only per utenti normali; DRAFT visibile in preview solo ad admin).
- Percorsi page `/area-membri/percorsi`: Per ogni corso owned click "Inizia/Riprendi" -> navigazione a ultima lezione o prima.
- Lesson page `/area-membri/corsi/[course]/[module]/[lesson]`:
  - Layout responsive: Desktop player sx + elenco dx. Mobile player top + elenco sotto.
  - Player grande 16:9, adattivo, mantenendo YouTubeEmbed esistente (cookie gating) e aggiungendo boundary per Bunny (se configurato).
  - Elenco lezioni numerato (1. Nome, 2. Nome,...) con stati: active (corrente, neon highlight), completed (check verde + barrato), locked (solo se corso non owned, altrimenti tutte le lezioni di un owned corso sono accessibili).
  - Pulsanti Precedente / Successivo basati sull'ordine.
  - Resume: Quando un utente apre una lezione per la quale esiste `lastPositionSec > 10s`, auto seek del player (YouTube se API o timestamp in URL `?start=X`). Per YouTube usare `?start=X` nell'URL embed.
  - Progresso: Aggiornamento `LessonProgress` via Server Action o Route Handler `/api/course/progress` con:
    - Auth richiesta.
    - Validazione ownership corso prima di salvare.
    - Validazione `progressPct in [0,100]`, `lastPositionSec >= 0`, `durationMin bound`.
    - Debounce/throttling: max 1 write ogni 15s per utente+lezione per evitare write eccessivi.
    - Mark completed automatico quando progressPct >= 95 (configurabile).
  - Prev/next disabilitati ai bordi (prima lezione: prev invisibile; ultima lezione: "Hai completato il percorso!").

### FR-9: Video source boundaries (YouTube + Bunny + None)
- **YouTube**:
  - Admin salva `youtubeVideoId`. Validazione lato server: solo caratteri `[A-Za-z0-9_-]{6,}` (regex id standard).
  - Warning chiaro in pagina admin: "YouTube: branding e logo visibili, condivisione possibile, cookie terzi necessari. Nessuna protezione anti-sharing. Adatto solo per testing."
  - Embed come oggi: `youtube-nocookie.com/embed/<ID>?rel=0&start=<SEC>`.
- **Bunny Stream boundary**:
  - Modulo `lib/video/bunny.ts` con:
    - Check configurazione: `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_LIBRARY_ID`. Se assenti -> restituisce oggetto stato "unconfigured".
    - `isBunnyConfigured() -> boolean`.
    - `generateSignedPlaybackToken(videoId: string, ttlSec: number = 3600) -> Promise<string>` (JWT-like signed token Bunny).
    - Route Handler `/api/course/video/[lessonId]/playback`:
      - Verifica auth + ownership corso (o admin preview).
      - Se Bunny non configurato: 503 + messaggio onesto "Provider video non configurato".
      - Genera token a vita breve e restituisce URL playback Bunny firmato.
  - UI Player: switch su `videoSourceType`; per BUNNY mostrare placeholder "Video protetto" + caricamento dinamico URL firmato, e se non configurato fallback onesto stato non pronto.
  - Report setup richiesto: in file README o spec, riportare step Bunny Stream: creare library, caricare video, API key read+write, costi approssimativi.
- **NONE (lezione draft senza video)**:
  - Player placeholder "Video non ancora disponibile" come YouTubeEmbed oggi per undefined id, ma con messaggio adeguato se amministratore.

### FR-10: Seed Foundations lezioni (10 lezioni draft)
- Script `scripts/seed-lessons.mjs` o modulo server `lib/db/seed-foundations.ts` eseguibile via npm script.
- Idempotente:
  - Se esiste gia una Lesson con `slug = parte-da-zero` per foundations -> salta.
  - Non aggiorna campi modificati da admin.
- Crea un singolo modulo "AV Foundations - Modulo 1" oppure lezioni flat in un modulo "Principi base". Decisione: 1 solo modulo chiamato "Fondamenti di analisi tecnica" contenente 10 lezioni.
- Contenuti esatti come richiesto (titolo + descrizione), `videoSourceType=NONE`, status=DRAFT.

### FR-11: Research Club admin preparation
- Modello ResearchDoc (vedi FR-6).
- Pannello `/admin/research`:
  - Lista documenti ordinati per publicationDate DESC.
  - Form: title, slug (auto-generato o editabile), description, publicationDate (date picker), status DRAFT/PUBLISHED.
  - Upload PDF placeholder:
    - Campo "Carica PDF" che tenta upload, ma se nessuno storage provider e configurato (nessuna env di storage):
      - **Non fake success**: mostra messaggio esplicito "Storage privato non configurato. PDF non salvato. Configura una delle seguenti env: BUNNY_STORAGE_* o VERCEL_BLOB_READ_WRITE_TOKEN o AWS S3.".
    - Se configurato: validazione MIME type `application/pdf`, dimensione max 25MB, salva nel storage e scrive `storageProvider/ObjectKey/Bucket/FileName/Size`.
  - Anteprima: Link preview visibile solo ad admin.
  - Nessuna pagina pubblica di Research Club ancora attiva.
  - Nessun abbonamento Stripe attivato.
  - Course ownership NON sblocca ResearchDoc (separazione netta).

### FR-12: Storage boundary per Research PDF
- Modulo `lib/storage/private-storage.ts`:
  - Env check:
    - Vercel Blob: `VERCEL_BLOB_READ_WRITE_TOKEN`.
    - Bunny Storage: `BUNNY_STORAGE_API_KEY`, `BUNNY_STORAGE_ZONE_NAME`, `BUNNY_STORAGE_REGION`.
    - S3: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION`.
  - Se nessuna env presente: `getStorageStatus() -> { configured: false, requiredEnv: [...] }`.
  - Upload e Read URL signed a vita breve (se supportato).
  - Validazione MIME type e size.

## Non-Functional Requirements
- **NFR-1 (Zero-trust)**: Nessun Price ID, slug autorizzato o URL video protetto esposto in codice client o sorgenti scaricabili.
- **NFR-2 (Sicurezza CTA)**: Nessun componente client decide autonomamente se un corso e owned; decisione presa server-side e passata come prop non modificabile.
- **NFR-3 (DB Safety)**: Ogni migrazione Prisma e additiva. Nessun `prisma migrate reset` su produzione. Nessun DROP TABLE o TRUNCATE.
- **NFR-4 (Performance progress)**: Write progresso throttled a 15s per utente+lezione. Read di entitlement con query singole joinate dove possibile.
- **NFR-5 (Cache safety)**: Pagine che mostrano CTAs personalizzate devono usare `export const dynamic = 'force-dynamic'` o cookie/headers per evitare shared cache. Layout generali non contengono stato utente.
- **NFR-6 (Mobile)**: Esperienza corso responsive: breakpoint 320/360/375/390/430/768/1024. Lezione lista sotto il player < 768px. Nessun horizontal overflow.
- **NFR-7 (Type Safety)**: Passaggio `tsc --noEmit` senza errori. Passaggio `next build` senza errori.
- **NFR-8 (Lingua)**: Tutta UI e contenuti in italiano corretto, nessun em-dash (usa `-` standard).

## Constraints
- **Technical**:
  - Stack fissato: Next.js 15, Auth.js v5 (Google), Prisma 5, PostgreSQL, Stripe SDK, Tailwind, Lucide React, Sharp.
  - NO nuove dipendenze non essenziali (es: no DnD library pesante; usa arrow buttons per riordino, oppure implementazione custom leggera).
  - NO `--legacy-peer-deps`, NO `--force` installazioni.
  - Tutte le rotte admin/corso devono avere `force-dynamic` per evitare cache.
- **Business**:
  - Prezzi, Price ID Stripe, Managed Payments, tax, webhook invariati.
  - Nessun cambio refund/revoca rules.
  - Research Club abbonamenti: NON attivare.
- **Dependencies**:
  - `DATABASE_URL` e `DATABASE_URL_UNPOOLED` devono essere configurati per migrazioni.
  - `AUTH_GOOGLE_ID/SECRET` e `AUTH_SECRET` gia richiesti.
  - Admin attivabile solo con `ADMIN_GOOGLE_EMAILS`.
  - Bunny Stream: `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_LIBRARY_ID` opzionali (boundary).
  - Private storage PDF: env specifiche opzionali (boundary).

## Assumptions
- A1: Il proprietario usa Google OAuth. La sua email viene inserita in `ADMIN_GOOGLE_EMAILS` per bootstrap amministratore.
- A2: Foundations e Trading Lab sono gli unici due corsi per questo ciclo. Seed crea lezioni solo per Foundations.
- A3: Per progresso YouTube, il resume viene implementato aggiungendo `?start=X` all'URL iframe.
- A4: Per test video admin puo usare un qualsiasi URL YouTube pubblico di sua proprieta. Non forniamo URL finti.
- A5: Non e necessario un server di rendering video custom; ci affidiamo a provider.

## Open Questions
- [ ] **Reso confermato**: Il proprietario conferma che l'email amministratore e `avinvestresearch@gmail.com` (da inserire in `ADMIN_GOOGLE_EMAILS`)? Oppure altra email? *Nota: nel setup spec indichiamo che va valorizzata la env, non hardcodiamo.*
- [ ] **Research Club storage**: Preferenza storage per PDF? Vercel Blob (integrato, pay-as-you-go), Bunny Storage (stesso provider Stream), o S3?
- [ ] **Costo Bunny Stream approvato?**: Prima di attivazione, da verificare budget per banda/video transcoding. *Non attiviamo in questo ciclo.*

---

## Acceptance Criteria

### AC-1: Owned Foundations CTA nasconde "Acquista ora" e mostra "Inizia/Riprendi"
- **Type**: `rule`
- **Given**: Utente autenticato che ha Purchase `succeeded` per foundations nel DB.
- **When**: Visita homepage `/`, sezione `/#percorsi`, `/area-membri`, `/area-membri/percorsi`.
- **Then**: In ogni contesto il CTA per Foundations mostra "Inizia il percorso" o "Riprendi la lezione" con link a una lezione, NON "Acquista ora"; il badge "Il corso e tuo" e presente.
- **Pass Condition**: Ispezione DOM e server props. Nessun `<button>`/`<Link>` con testo "Acquista ora" per foundations quando owned.
- **Evidence**: Screenshot + logs SSR entitlements.

### AC-2: Trading Lab rimane acquistabile per chi ha solo Foundations
- **Type**: `rule`
- **Given**: Utente con solo Foundations succeeded.
- **When**: Controlla il CTA per trading-lab in homepage.
- **Then**: Il CTA e "Acquista ora" e attivo.
- **Pass Condition**: Checkout per trading-lab si avvia correttamente.
- **Evidence**: Test funzionale via UI.

### AC-3: Server rifiuta secondo pagamento stesso corso
- **Type**: `rule`
- **Given**: Utente con Foundations gia succeeded.
- **When**: Invia `POST /api/stripe/checkout` con `slug=foundations`.
- **Then**: Riceve HTTP 409 con body `{ error, redirectToAreaMembri? }`.
- **Pass Condition**: curl/axios test ottiene 409.
- **Evidence**: Log response e status code.

### AC-4: Richieste concorrenti checkout non creano sessioni multiple
- **Type**: `rule`
- **Given**: Utente autenticato, nessun acquisto corso.
- **When**: Due POST a /api/stripe/checkout simultanei stesso slug stesso utente.
- **Then**: Una sola sessione Stripe viene creata (o le due richieste ricevono lo stesso session URL o seconda 409 pending).
- **Pass Condition**: Nel DB esiste UNA sola Purchase per quella coppia email+slug.
- **Evidence**: Query DB + Stripe dashboard log.

### AC-5: Pending payment confirmation mostra banner e non sblocca da URL
- **Type**: `rule`
- **Given**: Utente torna da Stripe a `/area-membri?checkout=success&session_id=cs_test_xxx` ma webhook non e ancora arrivato (Purchase `pending`).
- **When**: La pagina viene renderizzata; inoltre si manipola l'URL aggiungendo `?grantAccess=foundations` (simulazione client-side).
- **Then**: Viene mostrato banner "Stiamo confermando il pagamento" e CTA disabilitato; qualsiasi manipolazione URL param non cambia stato owned.
- **Pass Condition**: Nessun link a lezione del corso prima di webhook.
- **Evidence**: Screenshot banner, controllo che entitlements restitusice `payment_pending` non `owned_in_progress`.

### AC-6: Solo admin configurato puo accedere /admin
- **Type**: `rule`
- **Given**: Env `ADMIN_GOOGLE_EMAILS=proprietario@gmail.com`.
- **When**: 1) Utente non autenticato va in /admin. 2) Utente Google email diversa va in /admin. 3) Proprietario autenticato va in /admin.
- **Then**: 1) Redirect login. 2) HTTP 403 Forbidden con messaggio. 3) Dashboard visibile.
- **Pass Condition**: Solo caso 3 restituisce 200 e contenuto admin.
- **Evidence**: Test con account diversi.

### AC-7: Admin puo creare, salvare bozza, pubblicare, riordinare lezione Foundations
- **Type**: `rule`
- **Given**: Admin autenticato, foundations esistente con modulo.
- **When**: Crea nuova lezione, salva in bozza, pubblica, cambia ordine con altra lezione.
- **Then**: La lezione viene salvata; query DB restituisce status corretto e ordine aggiornato; utenti non admin non vedono lezione DRAFT.
- **Pass Condition**:
  - `status=DRAFT` -> non appare in lista lezione a utenti standard.
  - `status=PUBLISHED` -> appare.
  - `order` dopo riordino e corretto.
  - `id` della lezione rimane lo stesso (no cancellazione+ricreazione).
- **Evidence**: Screenshot admin UI + query prisma studio.

### AC-8: Sostituzione video preserva identita e progresso
- **Type**: `rule`
- **Given**: Lezione esistente con studenti che hanno progresso.
- **When**: Admin modifica youtubeVideoId e salva.
- **Then**: Lesson.id rimane lo stesso; LessonProgress non viene cancellato.
- **Pass Condition**: Query `LessonProgress` per `lessonId` ha stesso conteggio prima/dopo.
- **Evidence**: Conteggio righe pre/post update.

### AC-9: Seed 10 lezioni foundations idempotente e non distruttivo
- **Type**: `rule`
- **Given**: DB vuoto o con modifiche admin gia presenti.
- **When**: Si esegue lo script seed due volte.
- **Then**: Dopo prima esecuzione: 1 modulo + 10 lezioni DRAFT. Dopo seconda: conteggio identico; nessun campo modificato da admin viene sovrascritto.
- **Pass Condition**: `count(*)` di lezioni foundations=10 entrambe le volte.
- **Evidence**: Log script + query DB.

### AC-10: Player lesson viewer responsive e lista lezioni corretta
- **Type**: `rule`
- **Given**: Corso owned, 3+ lezioni PUBLISHED.
- **When**: Si naviga a lezione 2.
- **Then**:
  - Desktop (>=1024px): Player a sinistra o sopra, elenco a destra.
  - Mobile (<768px): Player in alto, elenco sotto.
  - Elenco: numerato 1,2,3,... con lezione 2 active (neon), 1 completed se progress >=95 o manuale.
  - Prev -> lezione 1, Next -> lezione 3.
- **Pass Condition**: Ispettore CSS a 360px, 768px, 1280px: nessun overflow, layout corretto.
- **Evidence**: Screenshot ai breakpoint.

### AC-11: Progresso lezione salvato e resume funzionante
- **Type**: `rule`
- **Given**: Utente owned, lezione con video YouTube pubblicata, lastPositionSec=45 salvato in LessonProgress.
- **When**: Ritorna sulla lezione.
- **Then**:
  - Iframe YouTube contiene `?start=45` o equivalente auto-seek.
  - Il progresso viene aggiornato via API con throttling (non 1000 write/min).
  - `completed=true` quando progress >= 95%.
- **Pass Condition**: Network tab mostra max 1 POST ogni 15s. Query DB restituisce progresso salvato.
- **Evidence**: Network trace + DB row.

### AC-12: Autorizzazioni server-side per contenuti protetti
- **Type**: `rule`
- **Given**:
  - Utente non autenticato.
  - Utente autenticato NON owner del corso.
  - Utente owner.
- **When**: Chiamano `GET /area-membri/corsi/.../lezione` e `POST /api/course/progress`.
- **Then**:
  - Non autenticato: redirect login o 401.
  - Non owner: 403 Forbidden o redirect a /area-membri con messaggio.
  - Owner: 200, contenuto completo, progresso salvato.
- **Pass Condition**: HTTP status code e contenuto atteso.
- **Evidence**: curl/UI test per ogni caso.

### AC-13: YouTube video ID validato e boundary Bunny onesto
- **Type**: `rule`
- **Given**:
  - Admin tenta di salvare youtubeVideoId = `"><script>alert(1)</script>` o `malicious payload`.
  - Admin tenta di salvare youtubeVideoId = `dQw4w9WgXcQ` (valido sintatticamente).
  - Bunny env NON configurato.
- **When**: Submit form e richiesta playback.
- **Then**:
  - Id malevolo rifiutato lato server con errore validazione.
  - Id valido salvato correttamente; embed mostra warning di branding in admin page.
  - Playback Bunny richiesta restituisce 503 stato non configurato, nessun iframe vuoto o URL pubblico.
- **Pass Condition**: DB non contiene script; messaggio 503 restituito.
- **Evidence**: Response body e DB contents.

### AC-14: Research Club upload restituisce onesto non-configurato
- **Type**: `rule`
- **Given**: Nessuna env storage configurata.
- **When**: Admin tenta upload PDF da pannello Research.
- **Then**: Messaggio esplicito: "Storage privato non configurato. PDF NON salvato. Configura ENV: X, Y, Z." Nessun DB save di storageObjectKey.
- **Pass Condition**: ResearchDoc rimane con `storageProvider=NONE` e messaggio UI chiaro.
- **Evidence**: Screenshot messaggio + query DB.

### AC-15: Purchased Foundations dopo navigation/reload rimane coerente
- **Type**: `rule`
- **Given**: Utente owned Foundations.
- **When**: Hard reload `/`, navigate a `/area-membri`, navigate back a `/` via Link.
- **Then**: In ogni pagina Foundations mostra CTA owned appropriato, mai "Acquista ora".
- **Pass Condition**: 3 visite consecutive -> stato coerente.
- **Evidence**: Screenshot multi-pagina.

### AC-16: Build e typecheck passano
- **Type**: `rule`
- **Given**: Codice committato.
- **When**: `npm run typecheck && npm run build`.
- **Then**: Entrambi i comandi terminano con exit code 0.
- **Pass Condition**: `tsc --noEmit` 0 errori; `next build` 0 errori.
- **Evidence**: Terminal output.

### AC-17: Aesthetic nero/neon e UX minima
- **Type**: `rubric`
- **Dimension**: Qualita visiva del sistema admin e dell'esperienza corso, coerente col design system esistente.
- **Scale**: 1-5
- **Anchors**:
  - 1 = Layout rotto, colori fuori brand, UX confusionaria.
  - 3 = Funzionale ma incoerente con le sezioni esistenti; minori disallineamenti.
  - 5 = Indistinguibile per stile dal resto del sito; dark, neon accenti, spaziature coerenti, zero elementi densi tipo SAP.
- **Pass Threshold**: >= 4
- **Evidence**: Confronto visivo con `/area-membri` esistente e `GlassCard`.

### AC-18: Report onesto di config mancanti e setup steps
- **Type**: `rubric`
- **Dimension**: Completezza del report finale su env richieste, step admin bootstrap, provider non configurati.
- **Scale**: 1-5
- **Anchors**:
  - 1 = Env nomi non documentati, passaggi vaghi.
  - 3 = Env elencati ma senza spiegazione di scopo.
  - 5 = Report chiaro: ogni env con nome (non valori!), ruolo, perche serve; step bootstrap admin in 3 righe; cosa e attivo vs cosa e boundary non configurato.
- **Pass Threshold**: >= 4
- **Evidence**: Report finale testuale.
