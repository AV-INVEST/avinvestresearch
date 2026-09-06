# AV-INVEST RESEARCH - Aggiornamento SEO, UI e Asset

## Overview
- **Summary**: Aggiornamento completo di 10 aree del progetto: sezione testimonianze, sezione metodo, testi provvisori area membri, foto fondatore, logo/favicon/anteprime social, SEO tecnica, pagine SEO pubbliche, dati strutturati JSON-LD, ottimizzazione prestazioni, predisposizione Google Search Console.
- **Purpose**: Migliorare la SEO organica, la qualità percepita delle sezioni critiche, l'identità visiva e le performance, rispettando tutti i vincoli tecnici e contenutistici esistenti.
- **Target Users**: Utenti finali (desktop e mobile), motori di ricerca (Google), crawler social (OpenGraph, Twitter Card).

## Goals
- Aggiungere stelle decorative alle testimonianze con animazione e risparmio moto; ridurre altezza card.
- Rimozione rombi sezione "Il metodo", allineamento icona+numero top, linea di collegamento solo desktop.
- Eliminare tutti i testi provvisori ("in allestimento", "in preparazione", ecc.) dall'area membri e pagina login.
- Sostituire sagoma con foto Andrea convertita in WebP, ottimizzata per next/image.
- Generare favicon (AV simbolo), icon.png, apple-icon.png, opengraph-image e twitter-image dal logo sorgente.
- Implementare SEO tecnica completa: robots, sitemap, lingue, canonical, noindex su pagine private, h1 singolo, gerarchia heading.
- Creare 5 pagine SEO pubbliche (guide, formazione-finanziaria, analisi-tecnica, gestione-del-rischio, psicologia-del-trading) con contenuti originali e metadata propri.
- Aggiungere JSON-LD valido: Organization, WebSite, Person, BreadcrumbList, Course.
- Ottimizzare prestazioni (next/image, lazy loading, aspect ratio, server components).
- Predisporre GOOGLE_SITE_VERIFICATION in .env.example e metadata.
- Commit finale su main con tutti i controlli superati.

## Non-Goals
- Non modificare autenticazione, cookie manager, prezzi corsi, Stripe, logica di rischio.
- Non aggiungere dipendenze npm (evitare --legacy-peer-deps o --force).
- Non aggiungere Review o AggregateRating nei dati strutturati.
- Non promesse di rendimento, performance inventate o qualifiche inesistenti.
- Non duplicare metadata o asset esistenti (integrare, non clonare).
- Non toccare MobileBottomBar (già rimosso in sessioni precedenti).
- Non servire il PNG sorgente di Andrea nella build finale.

## Background & Context
- Progetto Next.js 15.5.25 / React 19, TypeScript, Tailwind, Lucide, Auth.js v5 beta.
- Lingua sito: italiano, tema trading-terminal scuro con accenti neon verde (#00ff6a).
- Esiste già `siteConfig.url = 'https://avinvestresearch.com'`, email `avinvestresearch@gmail.com`.
- Asset sorgenti esistenti: `assets/andrea-founder-source.png` e `assets/av-invest-logo.png`.
- Em dash (U+2014) già assenti dal codice attuale (verifica grep ok).
- Nessun `--legacy-peer-deps` o `--force` accettabile in produzione.

## Functional Requirements

### FR-1: Sezione Testimonianze (5 stelle decorative)
- Sopra ogni citazione aggiungere 5 icone `Star` di Lucide, ~16-18 px, colore verde neon con glow leggero.
- Animazione breve di comparsa/transizione al cambio testimonianza.
- Rispettare `prefers-reduced-motion` (no animazioni se attivo).
- Stelle esclusivamente decorative: ARIA `aria-hidden="true"` o presentational.
- Nessun testo "5/5". Nessuna dicitura "valutazione" o "recensione acquisto".
- Nessun JSON-LD Review o AggregateRating aggiunto.
- Altezza card ridotta del 20-25% rispetto all'attuale; riduzione spazi verticali interni.
- Mantenere citazione, autore anonimo, frecce, indicatori e auto-rotazione esistenti.
- Responsive mobile verificato (nessun overflow orizzontale, 320-430 px).

### FR-2: Sezione "Il metodo"
- Rimuovere completamente i rombi (diamanti ruotati) accanto ai numeri 01/02/03.
- Allineare icona e numero entrambi nella parte superiore di ogni card (stessa riga o area top).
- Le 3 card restano simmetriche e stessa altezza (`h-full` / grid auto-rows).
- Linea di collegamento orizzontale: solo da `md:` in su, molto sottile, posizionata dietro le card (`z-0` / `z-10`).
- Mobile (sotto `md`): linea e decorazioni di collegamento completamente rimosse.

### FR-3: Rimozione testi provvisori area membri
- Rimuovere da LoginCard.tsx la frase: "L'area membri è in fase di allestimento... in lavorazione."
- Lasciare soltanto la nota Privacy Policy nel box "Note" di LoginCard.
- Sistemare spazi verticali dopo la rimozione (nessun vuoto eccessivo).
- Rimuovere/aggiornare tutti i testi "In preparazione" in MemberAreaCard.tsx (status labels).
- Sostituire con label neutre tipo "Coming soon" o rimuovere del tutto i badge di stato se non pertinenti, senza introdurre nuovi testi provvisori.
- Verificare assenza di: "in allestimento", "in preparazione", "in lavorazione", "bozza", "demo" in tutta `src/` (grep finale).

### FR-4: Foto fondatore Andrea
- Sorgente: `assets/andrea-founder-source.png`.
- Convertire in WebP, qualità indicativa 82-86.
- Salvare output: `public/images/andrea-founder.webp`.
- Usare `next/image` (componente Image di Next) con `width`, `height`, `sizes`.
- Applicare `object-cover` e un `object-position` appropriato (volto e busto visibili, es. `object-center` o `50% 20%` se serve crop verticale).
- Alt text: `"Andrea Vivace, fondatore di AV-INVEST Research"`.
- Card esistente mantenuta, con leggero bordo neon verde.
- Comparsa graduale (fade-in) e hover discreto (nessun disturbo al volto).
- Nessuna scritta o effetto sovrapposto sul viso.
- Ritaglio ottimizzato sia su desktop (aspetto ~4:5 attuale) sia mobile.
- Verificare che nella build finale NON venga servito il PNG sorgente (non copiare in public/).

### FR-5: Logo, favicon e anteprime social
- Sorgente: `assets/av-invest-logo.png`.
- **Favicon.ico**: ricavare solo simbolo "AV" (testo completo illeggibile in tab). Sfondo nero, colori originali, margini corretti. Formato multi-size 16/32/48 px. Destinazione: `src/app/favicon.ico`.
- **icon.png**: 512x512, simbolo AV centrato, sfondo nero, colori originali. Destinazione: `src/app/icon.png`.
- **apple-icon.png**: 180x180, simbolo AV, sfondo nero. Destinazione: `src/app/apple-icon.png`.
- **opengraph-image.png**: 1200x630. Sfondo nero/antracite. Logo AV-INVEST nitido. Glow verde leggero. Titolo: `AV-INVEST RESEARCH`. Sottotitolo: `Formazione finanziaria, analisi e metodo.`. Contenuti centrati, marginati dai bordi. Destinazione: `src/app/opengraph-image.png`.
- **twitter-image.png**: 1200x630, stesso design opengraph. Destinazione: `src/app/twitter-image.png`.
- Rimuovere favicon generiche o vecchie esistenti che causano conflitti (controllare public/ e app/).
- Aggiornare metadata globali in `layout.tsx`:
  - `metadataBase: new URL('https://avinvestresearch.com')` (già presente ma confermare URL assoluto corretto)
  - canonical homepage: `https://avinvestresearch.com` (assoluto, non `/`)
  - locale: `it_IT` (per OG)
  - site name: `AV-INVEST RESEARCH`
  - Open Graph type: `website`
  - Twitter Card: `summary_large_image`
  - Immagini OG e Twitter: puntare ai nuovi file generati con URL assoluti.
- Non creare un secondo manifest se esiste già; integrare icone in manifest esistente (se presente).

### FR-6: SEO Tecnica
- `src/app/robots.ts`: rules completi. User-agent `*`: allow `/`, disallow esplicito: `/login`, `/area-membri*`, `/api/*`, callback OAuth, checkout/success/cancel, URL con parametri. Sitemap e host come ora.
- `src/app/sitemap.ts`: solo pagine pubbliche e indicizzabili. **Escludere**: `/login`, `/area-membri`, `/api`, OAuth callbacks, checkout/success/cancel, parametri. Aggiungere le 5 nuove pagine SEO.
- Lingua HTML: `it` (attualmente `it-IT`, standardizzare secondo spec SEO oppure mantenere `it-IT` ma coerente; preferire `it-IT` a layout, OG locale `it_IT` per schema).
- Title e description unici per ogni pagina pubblica (aggiornare se deboli).
- Canonical assoluti su ogni pagina (es. `https://avinvestresearch.com/privacy`, non `/privacy`).
- Un solo `<h1>` per pagina (verificare Hero, login, area-membri, nuove pagine).
- Gerarchia corretta h2 > h3 (non salti).
- Anchor link a sezioni: `scroll-margin-top` già presente; verificare che tutti i link interni `/#sezione` funzionino senza sovrapposizione navbar.
- Link interni con testo descrittivo (no "Clicca qui").
- Pagine private: `/login`, `/area-membri`, `/area-membri/*`: `noindex, nofollow` nel loro export metadata.
- Pagine pubbliche (home, legali, nuove SEO): `index, follow`.
- Homepage metadata:
  - Title: `AV-INVEST Research | Formazione finanziaria e analisi tecnica`
  - Description: `Formazione finanziaria, analisi tecnica e gestione del rischio per comprendere i mercati e prendere decisioni più consapevoli.`
- No keyword stuffing, no meta keywords tag, no promesse di rendimento.
- Redirect coerente www ↔ non-www: predisporre configurazione (tramite next.config.ts `redirects()` se self-hosted, o dipende da Vercel; documentare che su Vercel il dominio principale imposta il redirect).
- Pagina 404 utile: `not-found.tsx` (creare se non esiste) con navigazione e link a home e/o guide.

### FR-7: Pagine SEO pubbliche
Creare 5 nuove pagine nella cartella `src/app/`:
1. `/guide` (indice guida)
2. `/formazione-finanziaria`
3. `/analisi-tecnica`
4. `/gestione-del-rischio`
5. `/psicologia-del-trading`

Ogni pagina deve avere:
- Contenuto originale e realmente utile (non copiato, non dati inventati).
- Preciso intento di ricerca (es. "cos'è l'analisi tecnica", "gestione del rischio trading").
- Export metadata proprio: title, description, canonical (assoluto), openGraph, twitter.
- Un solo `<h1>`.
- Sezioni ordinate con h2/h3.
- Link interni a guide correlate.
- CTA discreta verso i percorsi formativi (link a `/#percorsi`).
- Disclaimer educativo pertinente.
- Design nero + verde neon, coerente con il sito.
- JSON-LD `BreadcrumbList` in ogni pagina interna.
- JSON-LD `Course` **solo** se la pagina descrive un corso (es. una delle pagine specifiche potrebbe includerlo se citiamo corsi effettivi, altrimenti evitare).
- Breadcrumb UI non obbligatoria ma BreadcrumbList JSON-LD sì.
- Aggiungere link "Guide" nel footer (sezione Navigazione o nuova sezione) o discretamente nella navbar mobile/desktop senza saturare.

### FR-8: Dati strutturati JSON-LD
Aggiungere `<script type="application/ld+json">` coerenti con i contenuti visibili.

- **Organization** (in layout.tsx o componente globale):
  - name: `AV-INVEST Research`
  - url: `https://avinvestresearch.com`
  - email: `avinvestresearch@gmail.com`
  - sameAs: LinkedIn `https://www.linkedin.com/in/andreavivace/`, Instagram `https://www.instagram.com/avinvestresearch/`
  - logo: URL assoluto del logo (simbolo 512x512 o logo OG).
- **WebSite** in homepage con name, url, (opzionali inSearchAction se non abbiamo search).
- **Person** per Andrea Vivace (nella sezione About o layout globale, ma coerente con dati visibili: nome, titolo Founder, sameAs LinkedIn, email di contatto organizzativo non personale).
- **BreadcrumbList**: in ogni pagina interna SEO, nelle pagine legali, ecc.
- **Course**: solo nelle pagine che descrivono realmente corsi (es. la home sezione corsi o pagina /guide se descrive fondamenti; NON in pagine non attinenti). Usare dati da `siteConfig.courses.*` reali (price, provider = Organization).

Non aggiungere:
- address, telephone, partita IVA (non esistono).
- rating, recensioni, aggregateRating, review.

### FR-9: Prestazioni
- Tutte le immagini usano `next/image` con `width` e `height` espliciti (non `fill` senza aspect ratio quando evitabile).
- Formati WebP (Andrea foto) / mantenere PNG per logo ove necessario ma dimensioni note.
- Aspect ratio esplicito o `sizes` coerente per evitare CLS.
- Immagini above the fold (Hero, sezioni prime): `priority={true}`.
- Immagini secondarie (foto Andrea, testimonianze icone, logo piccolo, footer, ecc.): lazy loading (default di next/image).
- Ridurre JS client non necessario: preferire Server Components ove possibile (verificare se alcuni `'use client'` possono essere evitati nelle nuove pagine SEO).
- Animazioni: CSS/SVG leggere, no Three.js, no video.
- Video iframe (YouTubeEmbed): caricamento solo dopo interazione utente (o `loading="lazy"` e `iframe` non in above the fold).
- Font: `display: 'swap'` già attivo su Inter e Space Grotesk; confermare.
- LCP (hero heading o hero image se aggiunta), CLS (aspect ratio), INP (event handlers leggeri).
- Rimuovere asset o dipendenze npm inutilizzati se trovati (non per forza disinstallare se borderline).
- Mantenere l'aspetto attuale del sito.

### FR-10: Google Search Console
- In `.env.example` aggiungere riga `GOOGLE_SITE_VERIFICATION=` (senza valore).
- In `src/app/layout.tsx` metadata: aggiungere `verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined }`.
- Non inserire token reali nel repo.
- Nel resoconto finale, istruzioni per:
  1. Aggiungere la variabile su Vercel (Project Settings → Environment Variables, Production, key: GOOGLE_SITE_VERIFICATION, value: meta-tag google-site-verification content).
  2. Verificare dominio via record DNS TXT (alternativa al meta tag: spiegare entrambi, ma il code path implementa il meta tag).
  3. Inviare `https://avinvestresearch.com/sitemap.xml` nella Search Console.
  4. Richiedere indicizzazione pagine principali: URL Inspection → Request Indexing.

## Non-Functional Requirements
- NFR-1: Responsive mobile (320px, 360px, 375px, 390px, 430px, 768px, Desktop) — zero overflow orizzonti.
- NFR-2: Zero caratteri U+2014 (em dash) / U+2013 (en dash) nei testi visibili pubblici. Usare solo `-`.
- NFR-3: `npm run typecheck` — zero errori.
- NFR-4: `npm run lint` — zero errori.
- NFR-5: `npm run build` — successo completo.
- NFR-6: `/robots.txt` status 200; `/sitemap.xml` status 200.
- NFR-7: Favicon e immagini social non restituiscono 404.
- NFR-8: JSON-LD valido (validator schema.org o simile concettualmente).
- NFR-9: Nessun link interno rotto.
- NFR-10: Nessun duplicato di metadata o asset tra vecchi e nuovi file.
- NFR-11: Nessun dato sensibile o token nel repository.

## Constraints
- **Tecnici**: Next.js App Router, TypeScript strict, Tailwind, Lucide. Nessuna nuova dipendenza. `node_modules` esistenti.
- **Business**: Non modificare autenticazione, prezzi, cookie, Stripe, logica rischio.
- **Contenutistici**: Lingua IT, nessuna promessa di rendimento, nessun rating strutturato.
- **Dipendenze**: Asset sorgenti `assets/*.png` già presenti; non devono finire in public/ direttamente (solo loro derivati ottimizzati).
- **Operativi**: Commit e push finali su `main` dopo tutti i controlli.

## Assumptions
- `public/` cartella: se non esiste, verrà creata per `images/andrea-founder.webp`.
- `not-found.tsx` non esiste e va creato.
- Nessun manifest web app attualmente; evitare di crearne uno a meno che Next.js non lo generi automaticamente.
- Le 5 stelle Lucide sono disponibili in `lucide-react` già installato.
- Per la generazione di PNG/ICO/WebP: usare strumenti linee comando (sharp se già disponibile o Node.js builtin?). Assunzione: useremo un approccio Node-based o manuale (verremo a capo con uno script ad-hoc che usa canvas? Oppure, vincolo: se npm non consente installazioni, approccio: Node con `sharp`? Ma sharp non è installato. Assunzione: per consegna usiamo un piccolo script Node `node:` built-in non richiede npm? Alternative: usare `convert` da imagemagick se disponibile? Oppure: assumiamo che l'assistente possa usare librerie installabili in un task temporaneo ma poi rimosse? **Soluzione safer**: scrivere uno script che usa `node:` built-in + output placeholder in un primo momento, e poi raffinare con canvas se non disponibile. Meglio ancora: installare `sharp` come devDependency temporanea, generare gli asset, poi lasciare sharp in devDependencies se non pesa, oppure istruzioni. Assumiamo per spec che genereremo file validi, anche se tramite script Node custom con `sharp` installato provvisoriamente o nativo.)

## Open Questions
- [x] Dominio finale confermato: `https://avinvestresearch.com` da siteConfig.
- [x] Email confermata: `avinvestresearch@gmail.com`.
- [ ] Generazione ICO multi-size: se `sharp` non è disponibile, si può usare un tool locale. Assunzione: usare uno script Node; in mancanza di librerie grafiche, produrre PNG e rinominare, ma `favicon.ico` vero richiede formato ICON. Alternativa: creare un unico PNG 48x48 e nominarlo .ico? Non è standard. Decisione: scriveremo uno script che usa `sharp` come devDependency temporanea; se l'ambiente non consente, useremo strategia fallback (png rinominato + spec aggiornata). — Chiuso: procedere con script Node; se sharp non disponibile, generare comunque file "buoni" a dimensione fissa con approccio semplificato (o installare sharp).

## Acceptance Criteria

### AC-1: Stelle testimonianze e altezza card
- **Type**: `rule`
- **Given**: Sezione testimonianze renderizzata
- **When**: L'utente vede la testimonianza attiva
- **Then**: 5 icone Star Lucide (16-18 px) appaiono sopra la citazione con colore verde e glow; stelle sono aria-hidden; nessun testo "5/5"; l'altezza totale della card interna blockquote è ridotta almeno 20% rispetto all'originale; preferenze `prefers-reduced-motion: reduce` disattiva le animazioni.
- **Pass Condition**: Visivamente ispezionabile + grep per Star importato; altezza approssimativa calcolabile da CSS padding/margin; grep "5/5" assente; aria-hidden presente.
- **Evidence**: Screenshot diff, grep output.

### AC-2: Sezione metodo senza rombi, linea desktop-only
- **Type**: `rule`
- **Given**: Metodo section visualizzata
- **When**: Sotto breakpoint `md` (mobile)
- **Then**: Nessun rombo, nessuna linea di collegamento visibile.
- **Pass Condition**: Elementi rombo (rotate-45 con border-r border-t) assenti o `display: none` sempre; linea `absolute` ha classi `hidden md:block`.
- **Evidence**: Ispettione CSS classi, screenshot mobile/desktop.
- **Additional (rubrica)**: Allineamento icona+numero top e card simmetriche — valutazione qualità.

### AC-3: Testi provvisori rimossi
- **Type**: `rule`
- **Given**: src/ esistente
- **When**: Eseguiamo `grep -r "in allestimento\|in preparazione\|in lavorazione\|bozza\|demo" src/`
- **Then**: Nessun match in file visibili all'utente (LoginCard, MemberAreaCard, area membri page, ecc.).
- **Pass Condition**: Grep returna 0 match OPPURE match solo in commenti interni o variabili non visualizzate (ma idealmente zero).
- **Evidence**: Output grep nel task.

### AC-4: Foto Andrea WebP + next/image
- **Type**: `rule`
- **Given**: Sezione About caricata
- **When**: Richiediamo la pagina
- **Then**: Immagine in `public/images/andrea-founder.webp` servita con `next/image` (tag `<img>` ottimizzato nel DOM), `object-cover`, alt text corretto, nessun PNG sorgente nel `public/`.
- **Pass Condition**: File esiste; DOM contiene next/image; alt text exact match; `public/` non contiene il PNG sorgente.
- **Evidence**: `ls public/images/` + ispettore DOM alt text.

### AC-5: Favicon e social image 200 OK
- **Type**: `rule`
- **Given**: Build avviata o dev server
- **When**: Richiediamo `/favicon.ico`, `/icon.png`, `/apple-icon.png`, `/opengraph-image.png`, `/twitter-image.png`
- **Then**: Status 200 e dimensioni approssimativamente corrette (almeno non 0 byte).
- **Pass Condition**: 5 file esistenti e risposta HTTP 200.
- **Evidence**: `ls src/app/` per PNG; HTTP check via curl o build output.

### AC-6: Metadata globali corretti
- **Type**: `rule`
- **Given**: Rendering homepage
- **When**: Ispettioniamo `<head>`
- **Then**: `metadataBase` URL assoluta, canonical assoluta `https://avinvestresearch.com`, OG type `website`, OG locale `it_IT`, OG image e Twitter image sono i nuovi file generati, site name corretto.
- **Pass Condition**: Valori exact match nel `<meta>` e `<link rel="canonical">`.
- **Evidence**: Head HTML snippet.

### AC-7: Robots e Sitemap corretti
- **Type**: `rule`
- **Given**: Endpoint `/robots.txt` e `/sitemap.xml`
- **When**: Accediamo
- **Then**: robots disallow login, area-membri, api; sitemap include home, legali, 5 nuove pagine SEO; non include login, area-membri, api.
- **Pass Condition**: Contenuto file verificato.
- **Evidence**: Output testuali di robots.ts e sitemap.ts evaluation.

### AC-8: noindex su pagine private
- **Type**: `rule`
- **Given**: Pagine `/login` e `/area-membri`
- **When**: Controlliamo il loro `<meta name="robots">`
- **Then**: `noindex, nofollow`.
- **Pass Condition**: Export metadata della pagina include robots.index=false e follow=false.
- **Evidence**: Sorgente pagina.

### AC-9: Pagina 404 utile presente
- **Type**: `rule`
- **Given**: URL inesistente richiesto
- **When**: Risposta Next.js
- **Then**: Viene mostrato `not-found.tsx` con navigazione home + guida, status 404.
- **Pass Condition**: File `src/app/not-found.tsx` esiste.
- **Evidence**: `ls src/app/not-found.tsx`.

### AC-10: 5 nuove pagine SEO pubbliche
- **Type**: `rule`
- **Given**: App buildata
- **When**: Navighiamo a `/guide`, `/formazione-finanziaria`, `/analisi-tecnica`, `/gestione-del-rischio`, `/psicologia-del-trading`
- **Then**: Ognuna restituisce 200, ha 1 h1, metadata proprio con title/description/canonical assoluto, link alle guide correlate, CTA verso percorsi, disclaimer, JSON-LD BreadcrumbList.
- **Pass Condition**: 5 file `page.tsx` esistenti, ispezione metadata.
- **Evidence**: File listing + head metadata.

### AC-11: JSON-LD Organization + WebSite + Person
- **Type**: `rule`
- **Given**: Homepage head
- **When**: Cerchiamo `<script type="application/ld+json">`
- **Then**: Troviamo Organization (nome, url, email, sameAs, logo), WebSite (name, url), Person (Andrea Vivace, sameAs LinkedIn o pertinente). Nessun Review/AggregateRating.
- **Pass Condition**: Script JSON validi sintatticamente, chiavi presenti.
- **Evidence**: Snippet JSON-LD.

### AC-12: Google Site Verification env + metadata
- **Type**: `rule`
- **Given**: `.env.example` e `layout.tsx`
- **When**: Ispezioniamo
- **Then**: `.env.example` contiene `GOOGLE_SITE_VERIFICATION=` (senza valore); layout metadata.verification.google = process.env.GOOGLE_SITE_VERIFICATION.
- **Pass Condition**: Grep entrambi match esatti.
- **Evidence**: Output grep.

### AC-13: Passano typecheck, lint, build
- **Type**: `rule`
- **Given**: Progetto completo
- **When**: `npm run typecheck && npm run lint && npm run build`
- **Then**: Exit code 0 per tutti e tre.
- **Pass Condition**: Comandi eseguiti e output finale senza errori.
- **Evidence**: Terminal output nei Completion Evidence.

### AC-14: Zero em-dash e zero link rotti
- **Type**: `rubric`
- **Dimension**: Pulizia contenuti / link
- **Scale**: 1-5
- **Anchors**: 1 = em-dash o link rotti presenti; 3 = nessun em-dash ma link borderline; 5 = zero em-dash (U+2014/U+2013) in tutti i file .tsx/.ts e link interni navigabili.
- **Pass Threshold**: >= 5
- **Evidence**: Grep output e click-through link.

### AC-15: Qualità responsive mobile
- **Type**: `rubric`
- **Dimension**: Mobile layout fidelity 320-430 px
- **Scale**: 1-5
- **Anchors**: 1 = overflow orizzontale o elementi tagliati; 3 = piccoli padding problem ma leggibile; 5 = perfetto a 320, 360, 375, 390, 430, 768, desktop; zero overflow orizzontali; tutte CTA accessibili.
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot / descrizione breakpoint.
