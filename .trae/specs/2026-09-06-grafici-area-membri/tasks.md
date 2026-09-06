# Tasks: correzione grafici mobile + area membri

Spec file: `.trae/specs/2026-09-06-grafici-area-membri/spec.md`

---

## Task 1: sistemare CandlestickShowcase (grafici mobile + box interno)

**Priority**: high
**Status**: pending
**AC parenti**: AC1, AC2, AC3, AC4, AC5, R1

**Obiettivo**: aspect ratio mobile adeguato, rimuovere box enorme, spostare descrizione fuori, ottimizzare padding/annotazioni.

**Modifiche** (tutte dentro `src/components/visuals/CandlestickShowcase.tsx`):
- Togliere interamente il div `pointer-events-none absolute left-3 top-3` che contiene "SCENARIO · label" e il summary (linee ~720-752).
- Gestire aspect ratio responsive:
  - `md` e oltre → `aspect-[16/9]` (come adesso).
  - `< md` → `aspect-[4/3]` (es. `aspect-[4/3] max-md:aspect-[4/3]` + opzionalmente `max-md:min-h-[300px]` per sicurezza).
- Verificare e raffinare le annotazioni SVG esistenti:
  - Font size eventualmente sceso a 9px su mobile se troppo grandi; ma cercare di mantenerle leggibili.
  - Considerare di rimuovere opzionalmente l'annotazione meno prioritaria per scena (es. su Bull rimuovere CONTINUAZIONE o un zone label) se a 320px si accavallano; farlo tramite un subset condizionato su `reduced` o tramite width detection se serve.
- Blocco descrizione fuori dal grafico:
  - Il testo `current.description` è già mostrato sopra i pulsanti scenario (div `max-w-2xl min-w-0`). Rafforzarlo: spostare o replicare `current.summary` o una breve intestazione (sotto forma di piccolo paragrafo non bordo, non card enorme) es. `<p className="eyebrow mt-3">Scenario: {current.label}</p>` nel blocco testuale sopra, SENZA bordo e senza box enorme.
  - Evitare ridondanza: se summary e description sono molto simili, mostrarne una sola versione compatta.
- Ottimizzazioni padding/spacing su mobile:
  - GlassCard `p-2 max-sm:p-2.5` o mantenere `p-3 sm:p-5` ma ridurre `mt-5` interni a `max-sm:mt-3`.
  - SVG inner padding `p-2 max-sm:p-2.5` invece di `p-3 sm:p-4`.
- Responsive bottoni scenario mobile:
  - grid-cols-3 gap-1 (o 1.5) con `px-1 py-2` su `max-sm`.
  - Verificare 320px: testi non troncati in modo brutale; se troppo lunghi abbreviarli ulteriormente mantenendo `shortLabel` ("Rialzista", "Ribassista", "Laterale") e usare `text-[11px] max-sm:text-[11px]` se necessario.
- Controlli ←/→ pallini e illustrativa:
  - Flex wrap già abilitato; verificare che a 320px tutti siano dentro. Se non ci stanno ordinare diversamente o ridurre gap.
- Scroll orizzontale: dopo modifiche, testare `scrollWidth <= clientWidth` su ogni breakpoint.

**Test Requirements (TR locali)**:
- Rule TR1.1: grep `SCENARIO ·` in CandlestickShowcase dopo le modifiche restituisce 0 occorrenze nel markup di rendering (potrebbero esserci commenti vecchi ma non nel JSX ritornato).
- Rule TR1.2: nel JSX il chart container ha classi `aspect-[16/9]` e `max-md:aspect-[4/3]` (o equivalente media query) e `max-md:min-h-[300px]`.
- Rule TR1.3: 3 pulsanti grid-cols-3 sono visibili e con `min-w-0` o equivalente.
- Rubric TR1.4 (R1 soglia 3/4): resa mobile a 320/390 ispezionata visivamente (schermate o simulazione) → candele ben visibili, etichette non sovrapposte in modo fastidioso.

---

## Task 2: sistemare middleware + redirect callback area-membri

**Priority**: high
**Status**: pending
**AC parenti**: AC6, AC7, AC8, R3

**File**: `src/middleware.ts`, `src/app/area-membri/page.tsx`, eventualmente `src/app/login/page.tsx`.

**Modifiche**:
- `middleware.ts`:
  - matcher deve coprire sia `/area-membri` (root) sia `/area-membri/:path*`. Soluzione: `matcher: ['/area-membri', '/area-membri/:path*']`.
  - Confermare: `auth as default` + runtime nodejs. Middleware next-auth per convenzione deve fare redirect a login con callback.
- `src/app/area-membri/page.tsx`:
  - Oggi: `redirect('/login')` → cambiare in `redirect(\`/login?callbackUrl=${encodeURIComponent('/area-membri')}\`)`.
  - Aggiungere la medesima logica per qualunque path visitato (se in futuro ci saranno sottopagine, creare un helper che usa `headers().get('x-next-route')` o `pathname` del request; per adesso la root basta).
- Verificare che `/login` già passi callbackUrl a LoginCard (oggi sì).

**TR locali**:
- Rule TR2.1: `matcher` array contiene esattamente 2 entry o un espressione equivalente che includa la root.
- Rule TR2.2: area-membri page redirect anonimo contiene `callbackUrl=` non `redirect('/login')` nudo.
- Rule TR2.3: dopo login con callback, la URL finale è `/area-membri` (verifica con runtime test in dev se disponibile, o analisi statica + flusso).

---

## Task 3: navbar dinamica (Accedi ↔ Area membri)

**Priority**: high
**Status**: pending
**AC parenti**: AC9, R3

**File**: `src/components/layout/Navbar.tsx` e nuovo componente wrapper se necessario.

**Vincolo attuale**: Navbar è `'use client'` e non usa useSession. next-auth 5 beta fornisce `useSession` da `next-auth/react`. Il provider `<SessionProvider>` di solito deve wrappare l'app in layout. Verificare se c'è già. Al momento non c'è (layout non lo importa).

**Piano**:
- In `src/app/layout.tsx`: aggiungere un SessionProvider client wrapper importato da un file componente `'use client'` (es. `src/components/auth/SessionProvider.tsx`) che monta `<SessionProvider>` da `next-auth/react`. Non si può mettere direttamente in layout.tsx perché è server.
- Attenzione: il wrapping deve essere solo dentro CookieProvider (o fuori) senza rompere il resto.
- In Navbar.tsx:
  - Importare `useSession` da `next-auth/react`.
  - Direttamente (o tramite un subcomponent NavAuth):
    - `const { data: session, status } = useSession()`;
    - Loading → fallback a link "Accedi" statico per evitare layout shift.
    - Se `session?.user` → link a `/area-membri` con testo "Area membri" (magari con icona User o avatar se disponibile).
    - Else → link a `/login` con testo "Accedi".
  - Lo stesso vale per mobile menu (dentro mobile menu).

**TR locali**:
- Rule TR3.1: `useSession` è usato nel file Navbar o in un suo child diretto incluso.
- Rule TR3.2: `SessionProvider` è incluso nel layout root (non nel server component direttamente, ma tramite wrapper client).
- Rule TR3.3: mobile menu aggiorna anchor text in base alla sessione.
- Rubric TR3.4 (R3 soglia 3): nessun layout shift al mount; navbar è coerente con lo stato sessione dopo hydration.

---

## Task 4: creare shell area membri + 4 viste (Panoramica, Percorsi, Profilo, Assistenza)

**Priority**: high
**Status**: pending
**AC parenti**: AC10, AC11, R2

**Nuove route sotto `app/area-membri/`**:
```
app/area-membri/
 ├─ page.tsx                    → Panoramica
 ├─ percorsi/
 │   └─ page.tsx                → I miei percorsi
 ├─ profilo/
 │   └─ page.tsx                → Profilo e sicurezza + Danger Zone
 ├─ assistenza/
 │   └─ page.tsx                → Assistenza (minimo: form di contatto mailto)
 └─ layout.tsx                  → Shell area membri (header + nav responsive + logout + torna al sito)
```
Creare inoltre:
- `src/components/members/SessionProvider.tsx` oppure riutilizzare quello creato nel task 3.
- `src/components/members/MemberShell.tsx` oppure direttamente dentro `app/area-membri/layout.tsx`.
- `src/lib/entitlements.ts` → funzione `getEntitlements(userId?): Promise<{courses: Record<string, {status: 'locked'|'available'|'completed', progress: 0, purchasedAt: null}>}>` che per default ritorna tutto locked. Preparata per un futuro hook Stripe/DB.
- `src/data/courses.ts` → struttura: Course[] con { slug, title, description, modules: Module[] }, Module: { slug, title, lessons: Lesson[] }, Lesson: { slug, title, description, durationMin, youtubeId?, completedFlag (se mai usato) }. Slug solo per AV Foundations e Trading Lab; youtubeId opzionale e vuoto per default (nessun video falso).

**Dettagli**:
- **Layout**: server component o client? Meglio: layout.tsx è server, header con nome utente può essere importato come componente figlio che legge la sessione (ma in app router il layout riceve children; usare una inner section). Alternativa: layout è server, usa `const session = await auth();` e renderizza nome/email/avatar direttamente; sidebar/tab sono html statici che linkano a sottopagine; logout via form server action.
- **Nav**:
  - Desktop: orizzontale top (subnav) o sidebar sinistra a larghezza fissa < 220px (preferisco subnav orizzontale per non perdere spazio).
  - Mobile: links a scheda dentro header (max 2 righe) oppure select.
- **Panoramica**:
  - Saluto Ciao {name}.
  - Stato account: Account attivo (badge verde).
  - Statistiche: `N. percorsi disponibili: 0`, `Progresso complessivo: 0%`, `Ultima attività: Non disponibile`.
  - CTA: "Scopri i percorsi" → `/#percorsi`. (Non renderizzare "Riprendi ultimo contenuto" perché non esiste last content vero.)
- **I miei percorsi**:
  - Render 2 card da siteConfig + 1 "Presto disponibile" per prodotti futuri.
  - Status locked: badge rosso/grigio. Pulsante: "Scopri i percorsi" → `/#percorsi`.
  - Data acquisto: non mostrarla (null in entitlement).
  - Messaggio empty se nessuno disponibile: "Non hai ancora acquistato alcun percorso" + CTA.
- **Profilo**:
  - Avatar, nome, email, provider Google.
  - Data creazione account: "Non disponibile (sessione JWT senza persistenza)".
  - Link Privacy Policy.
  - Pulsante "Gestisci preferenze cookie" → (integrare con il gestore cookie esistente: creare un trigger che apre il banner; o se non esposto pubblicare link a `/cookie` che esiste già).
  - Pulsante logout singolo: disponibile (signOut).
  - Logout "da tutte le sessioni": NON renderizzare (JWT non lo consente) o renderizzare con tooltip "Funzione non disponibile per sessione JWT; esci da Google per invalidare tutte le sessioni".
  - Danger Zone: sezione "Eliminazione dati e account" → spiegazione onesta: "Al momento non conserviamo un profilo persistente. La sessione Google attiva può essere chiusa con il pulsante LOGOUT. Per richiedere la cancellazione di eventuali dati futuri o tracce, scrivi a avinvestresearch@gmail.com." + pulsante/link `mailto:avinvestresearch@gmail.com?subject=Richiesta%20eliminazione%20dati&body=Ciao%20AV-INVEST%2C%0A%0AVorrei%20richiedere%20l%27eliminazione%20dei%20miei%20dati.%0A%0AEmail%3A%20...`. Nessuna digitazione ELIMINA (perché non c'è delete server-side vero).

**TR locali**:
- Rule TR4.1: esistono 4 pagine (Panoramica, Percorsi, Profilo, Assistenza) e 1 layout area-membri.
- Rule TR4.2: `getEntitlements` ritorna locked per default per AV Foundations e Trading Lab; nessun course è available automaticamente.
- Rule TR4.3: Panoramica NON mostra "Riprendi ultimo contenuto" (non esiste un last contenuto vero).
- Rule TR4.4: Danger Zone non ha un pulsante falso "Elimina account" che dice "account eliminato" senza DB.
- Rule TR4.5: esistono `src/data/courses.ts` e `src/lib/entitlements.ts` con struttura richiesta.
- Rubric TR4.6 (R2 soglia 3): shell area membri ha estetica coerente (nero/verde neon), mobile ottimo, desktop chiaro.

---

## Task 5: architettura lezioni + lesson page + YouTube embed

**Priority**: medium
**Status**: pending
**AC parenti**: AC13, AC14

**Route**: `app/area-membri/corsi/[courseSlug]/[moduleSlug]/[lessonSlug]/page.tsx` (server component protetto).

**Componenti**:
- `src/components/members/LessonViewer.tsx` (client, gestisce consenso YouTube e click play).
- `src/components/members/YouTubeEmbed.tsx` → lazy iframe + anteprima.
- `src/data/courses.ts` già creato in task 4.

**YouTubeEmbed requisiti**:
- url `https://www.youtube-nocookie.com/embed/${id}`.
- `loading="lazy"`.
- `title` = titolo della lezione + " - Video YouTube".
- `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`.
- `allowFullScreen`.
- Wrapper responsive: `aspect-video` (16:9).
- Se CMP cookie marketing/analitici non accettati: non caricare iframe; mostrare invece pannello "Questo contenuto richiede il consenso ai cookie analitici/marketing. Abilita dalle preferenze cookie o continua cliccando Play per caricare il video (con conferma)".
- Se youtubeId è mancante: messaggio "Video non ancora disponibile".
- **Anteprima**: anche se consenso dato, caricare iframe solo dopo click su un overlay "Play" per leggerezza; oppure usare `loading=lazy` e montare iframe direttamente solo quando youtubeId c'è e consenso c'è. Preferito: overlay play → click monta iframe. Così si evitano hit a YouTube senza interazione e rispettano GDPR per casi borderline.

**Route lesson**:
- Server-side: `const session = await auth(); if (!session) redirect(...)`.
- Carica da `getCourseStructure(courseSlug)`.
- Trova modulo e lezione; 404 se non esiste.
- Renderizza LessonViewer con dati lezione.
- Pagine precedenti/successive se esistono (LINK a lezioni vicine, ma non se bloccate).
- Tutto protetto; nessun contenuto leak a anonimo.

**TR locali**:
- Rule TR5.1: route lesson 404 per slug non esistenti.
- Rule TR5.2: anonimo → redirect a login.
- Rule TR5.3: iframe usa `youtube-nocookie.com`, `loading="lazy"`, `title`, `allowFullScreen`.
- Rule TR5.4: default courses data non ha youtubeId popolato (nessun video inventato), oppure se popolato sono placeholder di test che si vedono solo in sviluppo e non frutto di dati fasulli (in questo caso lasciare vuoto è meglio).
- Rubric TR5.5 (R2/R4 soglia 3): architettura pulita, dati centralizzati e futuri modifiche a corsi/lezioni non toccano il componente grafico ma solo il file dati.

---

## Task 6: validazione (typecheck, lint, build, responsive test, overflow, auth flow)

**Priority**: high (bloccante consegna)
**Status**: pending
**AC parenti**: AC18, AC3, R3, R1

**Piano**:
1. Prima `npm run typecheck`, `npm run lint`.
2. Poi `npm run build`.
3. Run `npm run dev` (se possibile) e test visivo:
   - breakpoint 320, 360, 375, 390, 430, 768, 1024, 1440.
   - `document.documentElement.scrollWidth > clientWidth`? → NO.
   - Controllo visivo 3 scenari candele.
   - Test navbar anonimo/loggato.
   - Test middleware: curl anonimo `GET /area-membri` deve redirect (302/303) a `/login?callbackUrl=...`.
   - (Se OAuth configurato nel dev: test login Google → atterraggio a `/area-membri` → logout → redirect home.)
4. Fix any lint/build errors se trovati.

**TR locali**:
- Rule TR6.1: typecheck exit 0.
- Rule TR6.2: lint exit 0.
- Rule TR6.3: build exit 0.
- Rule TR6.4: overflow test script/manuale 320-430 → scrollWidth <= clientWidth.
- Rule TR6.5 (se possibile): middleware test (curl o fetch) anonimo → redirect header `Location` contiene `login?callbackUrl=`.

---

## Task 7: commit e push main + report finale

**Priority**: high
**Status**: pending

**Passaggi**:
- `git status` → verificare modifiche sono quelle attese.
- `git add ...` tutti i file.
- `git commit -m "feat: mobile charts redesign + full members area shell + auth guards"` (messaggio chiaro in inglese).
- `git push origin main`.

Se non è configurato remote, riportare l'output di git remote -v e errore push nel report.

Nel report finale includere:
1. Causa precisa per cui area membri non era visibile (bug middleware matcher + callback mancante + navbar statica).
2. Elenco dei file modificati e creati.
3. Descrizione correzioni mobile grafici.
4. Stato reale persistenza (JWT-only, nessun DB adapter, nessun entitlement, nessun acquisto).
5. Migrazioni DB: nessuna.
6. Risultati typecheck/lint/build.
7. Hash commit e stato push.

**TR locali**:
- Rule TR7.1: commit creato.
- Rule TR7.2: push OK o errore documentato esattamente.
