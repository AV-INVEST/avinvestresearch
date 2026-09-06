# Spec: correzione grafici mobile + area membri AV-INVEST RESEARCH

- Spec language: Italian
- Repository root: `C:\Users\viva_\OneDrive\Desktop\AVINVEST`
- Last updated: 2026-09-06

## 1. Problema, obiettivi e non-obiettivi

### Problema A - sezione grafici mobile
La sezione CandlestickShowcase (3 scenari Rialzista/Ribassista/Laterale) su mobile (320-430px) presenta:
- Grafico schiacciato verticalmente per aspect ratio 16:9 fisso su tutte le larghezze; altezza reale insufficiente (~180px a 320px).
- Enorme box informativo HTML "SCENARIO · TREND X" + descrizione che copre la maggior parte dell'area grafica su mobile, nascondendo candele e annotazioni.
- Candele microscopiche o coperte dal box di testo.
- Pulsanti scenario, pallini carosello, dicitura illustrativa e frecce non sono stati testati specificamente per tutti i breakpoint 320/360/375/390/430.

### Problema B - area membri incompleta e bug auth
L'area membri esiste come route minima ma:
- Middleware matcher `/area-membri/:path*` NON include `/area-membri` (root senza trailing path), quindi la protezione middleware non copre la route principale.
- `area-membri/page.tsx` reindirizza a `/login` SENZA `callbackUrl`, quindi dopo login Google non torna all'origine.
- Navbar mostra sempre "Accedi" anche per utente autenticato; non diventa "AREA MEMBRI".
- Dashboard minima: card placeholder con "In preparazione"; mancano Panoramica, I miei percorsi, Profilo e sicurezza, Assistenza, navigazione desktop/mobile.
- Persistenza utenti: strategia `jwt` senza database adapter; nessun sistema di ordini/enrollment/corsi acquistati.
- Danger zone di eliminazione account: non implementata; non è possibile dichiarare "account eliminato" se non esiste persistenza.
- Architettura lezioni/moduli/video YouTube: assente.
- Callback redirect auth: il default è `/area-membri`, ma i flussi non sono verificati end-to-end.

### Obiettivi
1. **Grafici**: mantenere resa desktop valida; su mobile aspect ratio ~4:3 o altezza 300-380px; rimuovere il grande box interno e usare solo piccole etichette SVG contestuali; spostare la descrizione scenario FUORI dal grafico (sopra o sotto).
2. **Auth & middleware**: proteggere `/area-membri` e `/area-membri/*`; redirect con callbackUrl; navbar dinamica (Accedi ↔ Area membri); flusso login/logout verificato.
3. **Dashboard membri**: shell premium (nero + verde neon, stile trading terminal) con Panoramica realistica (zero progressi inventati), I miei percorsi con stato bloccato di default (nessun entitlement automatico), Profilo e sicurezza, navigazione responsive, Danger Zone reale in funzione della persistenza attuale.
4. **Sicurezza**: tutti i controlli lato server; JWT e nessun DB → non concedere corsi; non simulare eliminazione account falsa.
5. **Verifiche finali**: typecheck, lint, build OK; responsive 320/360/375/390/430/768/1024/1440; zero overflow orizzontale; test login/logout/redirect.

### Non-obiettivi
- NON implementare Stripe, Prisma, Supabase o DB adapter in questa spec (se non richiesto esplicitamente da utente).
- NON inserire video, corsi, recensioni, progressi o acquisti inventati.
- NON modificare credenziali OAuth Google; NON ripristinare link diretto a `/api/auth/signin/google`.
- NON toccare cookie banner, footer, navbar oltre a quanto necessario per Area membri.
- NON ri-aggiungere MobileBottomBar persistente.
- NON usare `--legacy-peer-deps` o `--force`.

## 2. Requisiti funzionali (FR)

### FR1 - Mobile aspect ratio grafici
- Desktop: `aspect-ratio 16/9` invariato.
- Mobile (< 768px): aspect ratio vicino a 4:3 OPPURE altezza minima 300px (massimo tra i due, a garanzia di leggibilità candele).
- Verificare che a 320px il grafico abbia area disegno sufficiente.

### FR2 - Rimozione box enorme interno al grafico
- Rimuovere completamente il div HTML `pointer-events-none absolute left-3 top-3 ...` che mostra "SCENARIO · label.toUpperCase()" + summary.
- Mantenere solo le annotazioni SVG compatte già presenti (SUPPORTO, RESISTENZA, BREAKOUT/BREAKDOWN, RETEST, CONTINUAZIONE, zone) e, se serve, ridurre ulteriormente il padding/font.
- Su mobile nascondere opzionalmente 1-2 annotazioni meno critiche per evitare sovrapposizioni (es. se scena laterale SUPPORTO e RESISTENZA bastano).

### FR3 - Descrizione scenario fuori dal grafico
- La descrizione estesa (`current.description`) e l'intestazione scenario DEVONO apparire fuori dal chart container: o nel blocco già esistente SOPRA i bottoni scenario (va già bene per la parte testuale ma va rafforzata come testo unico invece del duplicato dentro il grafico), O in un piccolo blocco subito SOTTO il grafico, prima dei controlli.
- Nessun bordo enorme; card esterna ridotta di padding/spacing su mobile.

### FR4 - Ottimizzazioni CandlestickShowcase mobile
- Padding outer GlassCard: su mobile <= `p-3` (già impostato ma verificare elementi interni).
- Bottoni Rialzista/Ribassista/Laterale su mobile: tutte e tre dentro il contenitore, larghezze equilibrate (grid-cols-3 gap-1 o minore se serve), testo sempre dentro, min-h-[44px] per hit-area.
- Frecce ←/→ e pallini carosello: nessun wrap strano, restano dentro viewport 320-430px.
- Dicitura "Rappresentazione a scopo illustrativo": su mobile può andare a capo senza rompere layout.
- Zero `scrollWidth > clientWidth` su 320/360/375/390/430.

### FR5 - Verifica middleware e route protetta
- `middleware.ts` matcher deve includere SIA `/area-membri` (root) SIA `/area-membri/:path*`.
- Utente NON autenticato che visita `/area-membri` o sottopagine → redirect a `/login?callbackUrl=/area-membri` (o path originale).
- `/api/auth`, `/login`, `/_next/*`, asset statici NON devono mai essere protetti dal middleware (verificare esclusioni).
- Nessun loop di redirect per utente autenticato.

### FR6 - Redirect e callback
- `area-membri/page.tsx` quando manca sessione → `redirect(\`/login?callbackUrl=${encodeURIComponent('/area-membri')}\`)`.
- `LoginCard` e `login/page.tsx` passano già `callbackUrl || '/area-membri'` a `signIn('google', { callbackUrl })`; mantenere e verificare che funzioni.
- Dopo logout da area membri → redirect a `/`.
- Navbar: pulsante "Accedi" se sessione assente; link o dropdown "AREA MEMBRI" + logout se sessione presente. (Navbar è client component → usare wrapper con `useSession` o route/segnaposto che renderizza una variante server-side.)

### FR7 - Shell area membri (responsive)
- Header area membri: logo AV-INVEST cliccabile → `/`; link "Torna al sito"; avatar Google; nome + email; pulsante LOGOUT evidente.
- Desktop nav (orizzontale o sidebar minimale non invadente): Panoramica, I miei percorsi, Profilo e sicurezza, Assistenza.
- Mobile nav: tab-compatte o menu a scheda (nessuna sidebar).
- Nessuna barra CTA commerciale persistente in fondo.

### FR8 - Pagina Panoramica (server-side)
- Server component con sessione server.
- Saluto personalizzato con nome.
- Stato account ("Account attivo" o simile).
- Numero percorsi disponibili: 0 se nessun entitlement, oppure numero reale da sistema (in assenza DB → 0).
- Progresso complessivo: 0 se nessun dato (mostrare empty state, NON valori inventati).
- Ultima attività: data ultimo accesso se disponibile (JWT non la traccia facilmente → niente se non disponibile).
- Pulsante "Riprendi ultimo contenuto": solo se esiste LAST contenuto davvero (altrimenti NON renderizzare).
- Empty state elegante: "Non hai ancora acquistato alcun percorso" + CTA "Scopri i percorsi" → `/#percorsi`.

### FR9 - Pagina I miei percorsi
- Card modulari per AV Foundations, AV Trading Lab (da siteConfig) e placeholder per prodotti futuri.
- Ogni card mostra: titolo, descrizione breve (da config), STATO (disponibile / bloccato / completato). Default: `bloccato` in assenza di sistema ordini.
- Avanzamento reale: 0% o N/A se bloccato. NON inventare %.
- Pulsante: se disponibile → "Continua il percorso"; se bloccato → "Scopri i percorsi" → `/#percorsi`; se completato → "Rivedi percorso".
- Data acquisto: renderizzare SOLO se disponibile in un dato sorgente reale; altrimenti omettere.
- Utente senza acquisti → messaggio vuoto + CTA a home.
- Sistema entitlement: creare astrazione pulita (es. modulo `src/lib/entitlements.ts`) che per default nega tutti i corsi, pronta per futuri hook Stripe/DB.

### FR10 - Architettura lezioni modulare
- Struttura file di dati centralizzata (es. `src/data/courses.ts`): array di corsi, moduli, lezioni con titolo, descrizione, durata, youtubeId, flag completato, progresso, materiali futuri.
- Componente lesson shell server-protected: riceve `courseSlug/moduleSlug/lessonSlug` e carica da dati centralizzati.
- Embed YouTube:
  - dominio `youtube-nocookie.com`;
  - lazy loading (iframe `loading="lazy"`);
  - `title` accessibile;
  - consenso cookie marketing/analitici prima del caricamento se previsto dal CMP (integrare con CookieConsent);
  - anteprima con pulsante play prima del consenso o prima di click;
  - responsive 16:9;
  - `allowFullScreen`.
- Route lezioni protette lato server.
- NON aggiungere video finti; file dati contiene struttura ma valori solo se/quando realmente disponibili (slugs definiti, youtubeId opzionale).

### FR11 - Profilo e sicurezza
- Dati utente da sessione: nome, email, avatar, provider "Google".
- Data creazione account: JWT non la traccia di default → renderizzare "Non disponibile" o omettere.
- Link a Privacy Policy (`/privacy`).
- Riapri preferenze cookie (hook al CookieConsent esistente).
- Logout da tutte le sessioni: con JWT NON è tecnicamente supportato lato server senza DB. Mostrare un messaggio esplicito e invece offrire solo logout locale, oppure NON mostrare il pulsante (scelta più onesta).

### FR12 - Danger Zone eliminazione account
- Stato attuale: sessione `jwt` senza adapter e senza DB. Nessun utente persistente.
- Regola: NON creare pulsante falso "Elimina account" con messaggio di successo falso.
- Due opzioni (scegliere la più onesta e implementabile senza DB):
  - Opzione A (preferita): flusso "Richiedi eliminazione" → apertura email `mailto:avinvestresearch@gmail.com` con oggetto e corpo precompilati. Spiegazione chiara: "Al momento non viene conservato un profilo persistente oltre alla sessione Google; per richiedere la cancellazione di eventuali dati futuri o tracce invia una email".
  - Opzione B: aggiungere DB adapter + Prisma in questo ciclo (solo se richiesto; non fare di default).
- Conferma con digitazione `ELIMINA` solo nel caso di eliminazione server-side VERA.

### FR13 - Verifica navbar accedi/area-membri
- Sessione assente → "Accedi" → `/login`.
- Sessione presente → "Area membri" → `/area-membri` (eventualmente con avatar).
- Dato che Navbar è client component, realizzare un wrapper o una variante che usa `useSession` da next-auth/react + fallback a link statico se sessione non caricata.

## 3. Requisiti non funzionali (NFR)

- **Sicurezza**: Tutti i controlli di autorizzazione lato server. Route area-membri e sottopagine sono server component con `auth()` check. Nessun dato sensibile esposto al client.
- **Performance**: Animazioni solo SVG/opacity/transform; nessun Three.js o video background; embed YouTube caricato lazy e solo dopo consenso/click.
- **A11y**: contrasto adeguato; focus visibili; tastiera; label per bottoni grafici; RRM (prefers-reduced-motion) rispettato; `title` e `aria-label` sugli iframe.
- **Responsive**: 320/360/375/390/430/768/1024/1440 px. Zero overflow orizzontale in ogni breakpoint.
- **Tipografia**: zero U+2014 (em dash) in testi utente; usare `-`.
- **No fake**: nessun testo "bozza"/"demo"/"da completare"; nessun progresso o acquisto inventato.
- **Maintainability**: centralizzare entitlement, dati corsi, routing in moduli/file separati riutilizzabili.

## 4. Acceptance Criteria

Regole (oggettive binarie):

- **AC1** (grafici): il div overlay "SCENARIO · TREND" non è più presente nel DOM di CandlestickShowcase; dentro al grafico ci sono solo etichette SVG.
- **AC2** (grafici): su viewport < 768px il chart container ha aspect ratio 4:3 OPPURE altezza calcolata >= 300px (verificare con ispeziona elemento).
- **AC3** (grafici): 320/360/375/390/430 → `document.documentElement.scrollWidth <= clientWidth`.
- **AC4** (grafici): testo descrizione scenario è fuori dal chart container (sopra o sotto).
- **AC5** (grafici): 3 pulsanti scena su mobile sono tutti dentro il contenitore e cliccabili senza scroll orizzontale.
- **AC6** (middleware): matcher include `/area-membri` e `/area-membri/:path*`.
- **AC7** (middleware): anonimo su `/area-membri` → redirect verso `/login?callbackUrl=...`; NON 404, NOTH senza loop.
- **AC8** (callback): dopo login Google con callback `/area-membri` si atterra su `/area-membri`.
- **AC9** (navbar): navbar mostra "Area membri" (o icona + nome) quando sessione esiste; "Accedi" altrimenti.
- **AC10** (dashboard): Panoramica renderizza saluto con nome utente reale della sessione.
- **AC11** (entitlement): per default AV Foundations e Trading Lab sono `bloccato`; nessun entitlement automatico per account Google.
- **AC12** (danger): pulsante "Elimina account" NON simula cancellazione falsa; flusso onesto (mailto o delete vero se DB).
- **AC13** (lesson arch): esiste file `src/data/courses.ts` (o equivalente) con struttura tipo Course/Module/Lesson; componente Lesson legge da li.
- **AC14** (youtube embed): usa `youtube-nocookie.com`, `loading="lazy"`, attributo `title`, responsive 16:9, fullscreen consentito.
- **AC15** (a11y): tutte le page/nuovi componenti superano ispezione tab/focus; nessun elemento label-less.
- **AC16** (no fake): grep `bozza|da completare|demo` (case insensitive) nei file utente restituisce 0 (a parte commenti codice).
- **AC17** (no em-dash): grep `—` in src restituisce 0 occorrenze.
- **AC18** (build/lint/tsc): `npm run typecheck`, `npm run lint`, `npm run build` tutti con exit 0.

Rubriche (soglia >= 3/4):

- **R1 - qualità visuale grafici mobile (0-4)**: candele leggibili, etichette SVG non si sovrappongono, descrizione fuori chiara, estetica coerente con la home.
- **R2 - UX area membri (0-4)**: shell elegante, navigazione intuitiva mobile/desktop, sicurezza percepita (nero/verde neon, nessun elemento commerciale fuori luogo).
- **R3 - correttezza auth flusso (0-4)**: anonimo bloccato, login torna a callback, logout funziona, navbar riflette stato, nessun loop.
- **R4 - onesta implementazione (0-4)**: nessun finto progresso, nessun entitlement fasullo, danger zone veritiera, disclaimer chiari dove mancano dati.

## 5. Constraints & Assunzioni

- Stack attuale: Next.js 15.5.25, React 19, next-auth 5 beta 32, JWT session strategy, NESSUN DB.
- Auth provider: Google OAuth solo; credenziali da env.
- Nessuna modifica a OAuth client ID/secret.
- Assunzione: l'utente non vuole introdurre Prisma/Postgres in questo ciclo salvo esplicita approvazione; in assenza, JWT-only è il vincolo e le feature dipendenti (elimina account multi-sessione, data creazione, history accessi) saranno onestamente dichiarate non disponibili con flussi fallback.
- Assunzione: non esistono ancora ordini o pagamenti Stripe attivi; l'entitlement per default è zero.
- Contenuti italiani, lingua codice inglese.
- Deploy via Vercel, branch `main`.
