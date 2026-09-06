# AV-INVEST RESEARCH - Aggiornamento SEO, UI e Asset — Implementation Plan

## Task 1: Sezione Testimonianze - stelle decorative e altezza card
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Importare `Star` da lucide-react in `Testimonials.tsx`.
  - Aggiungere una riga di 5 stelle (aria-hidden) sopra ogni citazione nel blockquote, dimensione ~16-18 px (h-4 w-4 o h-[18px] w-[18px]), colore verde neon con drop-shadow/glow (es. `text-av-green` + `drop-shadow-[0_0_4px_rgba(0,255,106,0.55)]`).
  - Animazione breve al cambio slide (fade-in o translate breve con `opacity + translate-y` transition 300-400ms), rispettando `reduced` (no transition).
  - Ridurre padding interni blockquote (es. `p-4 sm:p-5` invece di `p-5 sm:p-7`), mt-6 tra citazione e autore -> `mt-4 sm:mt-5`.
  - Rimuovere ogni eventuale spazio verticale eccessivo.
  - Confermare: nessun testo "5/5", nessun rating, nessuna label "recensione".
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-1.1: Le 5 `Star` sono presenti nel JSX, hanno `aria-hidden="true"`, dimensione 16-18px, classe `text-av-green` e drop-shadow/glow visivo.
  - `rule` TR-1.2: Padding blockquote ridotto rispetto a `p-5 sm:p-7` (obiettivo -20% altezza approssimativa). Grep per "5/5" in Testimonials.tsx = 0 match.
  - `rule` TR-1.3: Animazione di transition collegata al flag `reduced` (se reduced allora nessuna transition opacity/transform sulle stelle o sul blockquote).
  - `rubric` TR-1.4: Qualità responsive mobile testimonianze; scale 1-5; anchors 1=overflow 3=ok 5=perfetto; threshold >= 4; evidence screenshot mobile.

## Task 2: Sezione "Il metodo" - rimozione rombi e linea desktop-only
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - In `Method.tsx` rimuovere completamente il blocco condizionale con rombo ruotato (`.absolute -right-3 top-10 z-10 rotate-45 ...`) e ogni suo riferimento.
  - Allineare icona e numero nella parte superiore della card: mantenere flex justify-between oppure affiancare icona+numero in una riga top (decidere in base al look; purché non ci siano disallineamenti).
  - Assicurare 3 card simmetriche e stessa altezza: usare `h-full` sulle GlassCard e `auto-rows-fr` o classi Tailwind.
  - Linea orizzontale già presente con `hidden md:block`: mantenerla ma verificare che sia **dietro** le card (assegnare z-index: linea `z-0`, cards wrapper `relative z-10`).
  - Mobile: linea e decorazioni completamente rimosse.
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-2.1: Grep "rotate-45" in Method.tsx restituisce 0 risultati.
  - `rule` TR-2.2: La linea orizzontale ha classe `hidden md:block`; il grid wrapper ha `relative z-10` per posizionare cards sopra la linea.
  - `rubric` TR-2.3: Simmetria e allineamento 3 card; scale 1-5; anchors 1=disallineate 3=decent 5=stessa altezza e allineate perfette; threshold >= 4.

## Task 3: Rimozione testi provvisori area membri e login
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - In `LoginCard.tsx`: rimuovere `<li>` con frase "L'area membri è in fase di allestimento... in lavorazione". Lasciare solo l'item Privacy Policy. Sistemare mt-3/spazi per evitare buchi.
  - In `MemberAreaCard.tsx`: nei 3 panels (Materiale didattico, Research, Community) cambiare `status: 'In preparazione'` con qualcosa di neutro e non provvisorio, oppure rimuovere del tutto i badge di stato se non hanno senso. Preferenza: rimuovere i badge di stato (e la loro riga UI) per non introdurre nuove diciture "work in progress" mascherate. Valutare: se togliamo i badge, togliamo anche l'icona da badge (p.icon) — lasciare title e description.
  - Verificare altre occorrenze con `grep -rn "allestimento\|preparazione\|lavorazione\|bozza\|demo" src/` (escludendo path di test o file interni che non sono UI).
  - Controllare area-membri/page.tsx e sub-pages per testi simili.
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-3.1: Grep `allestimento\|preparazione\|lavorazione\|bozza\|demo` in `src/` restituisce 0 match in file che producono output UI visibile. (Escludere match interni a dati privati se non renderizzati.)
  - `rule` TR-3.2: LoginCard.tsx sezione Note ha singolo li solo per Privacy Policy; nessun secondo bullet. Spazi padding/mt coerenti (nessun grande gap).
  - `rule` TR-3.3: MemberAreaCard.tsx 3 cards panels NON hanno badge con "In preparazione" o sinonimi.

## Task 4: Installazione strumento generazione asset e script Node
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Verificare se `sharp` è disponibile. Se non installato, installarlo come devDependency (`npm i -D sharp`) — è un tool standard per immagini e non appesantisce bundle client. Qualora l'ambiente rifiutasse installazione, procedere con approccio fallback (placeholder neri con canvas se disponibile o manuale; MA sharp è preferito).
  - Creare script `scripts/generate-assets.mjs` (cartella `scripts/`) con:
    - Parte A: da `assets/av-invest-logo.png` ritagliare o isolare il simbolo "AV" (assunzione: il logo è AV+testo; nel dubbio: usare crop e resize centrando il simbolo o l'intero logo se AV non è separabile. Se il logo sorgente è gia "AV+testo" e non possiamo separare: produrre versioni quadrate centrate e fare in modo che nella favicon 16px il testo sia illeggibile, ma il simbolo sia riconoscibile). Implementare robustezza.
    - Generare:
      - `src/app/favicon.ico` — tramite sharp è possibile convertire in ICO? Sharp NON produce ICO nativo. Alternativa: creare un PNG 48x48 valido e scriverlo come ICO tramite concatenazione header ICON. Implementare writer ICON base (PNG embedded) che supporta 16/32/48 come 3 PNG incapsulati oppure usare strategia: un solo PNG 48x48 e scrivere header ICON minimo (spesso funziona). Per spec: implementa formato ICON minimo valido con 1 entry a 48x48 e rinuncia a multi-size se troppo complesso, ma garantisci file valido.
      - `src/app/icon.png` 512x512, sfondo nero (#050705), simbolo/logo centrato, padding 10-15%.
      - `src/app/apple-icon.png` 180x180, stesso design.
      - `src/app/opengraph-image.png` 1200x630, sfondo nero/antracite (#070a07), logo AV-INVEST (intero) centrato top, glow verde leggero (draw o drop shadow), titolo `AV-INVEST RESEARCH` font bold bianco, sottotitolo `Formazione finanziaria, analisi e metodo.` grigio chiaro, tutti centrati, padding laterale ~120 px.
      - `src/app/twitter-image.png` 1200x630, identico a opengraph.
  - Parte B: conversione foto Andrea in WebP (task 5): include lo stesso script oppure uno separato? Mettiamo funzione nello stesso script.
- **Acceptance Criteria Addressed**: AC-5 (preparazione), AC-4 (conversione foto Andrea)
- **Test Requirements**:
  - `rule` TR-4.1: Script `scripts/generate-assets.mjs` eseguibile (`node scripts/generate-assets.mjs`) produce 6 file: 5 in `src/app/` + 1 in `public/images/`.
  - `rule` TR-4.2: Le dimensioni di opengraph-image e twitter-image sono esattamente 1200x630; icon.png 512x512; apple-icon.png 180x180. (Leggi con sharp `metadata()` nello script dopo la generazione e stampa a video.)
  - `rule` TR-4.3: `public/images/andrea-founder.webp` esiste e formato è `webp`, qualità 82-86 (passata a sharp come opzione).

## Task 5: Sezione About - foto Andrea con next/image
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4 (deve esistere il WebP)
- **Description**:
  - In `About.tsx`: importare `Image` da `next/image`.
  - Sostituire il div sagoma User con componente `Image`:
    - src: `/images/andrea-founder.webp`
    - alt: `"Andrea Vivace, fondatore di AV-INVEST Research"` (exact string)
    - aspect-[4/5] mantenuto per il contenitore (l'immagine riempie).
    - Applicare className `object-cover` e decidere `object-position`: es. `object-[50%_15%]` o `object-top` o `object-center` per conservare viso. Valutare dopo generazione WebP.
    - `sizes`: desktop max ~420px di larghezza effettiva (col 5/12 = ~45% di max-w-7xl circa w=768px, quindi 380px circa, sm: ~2/3 mobile, quindi (max-width: 1023px) 100vw, altrimenti 380px => `(max-width: 1023px) 100vw, 380px`).
    - `priority`: no (About è below the fold dopo Hero, Positioning, Courses, Method, Candlestick, Performance, ResearchClub — lasciare lazy di default).
  - Aggiungere animazione fade-in: `opacity-0 animate-fade-in` (se classe esiste in globals.css oppure `animate-fade-in-up [animation-delay:100ms]`). Aggiungere hover discreto (es. `hover:scale-[1.02] transition-transform duration-500`).
  - Mantenere card con border neon verde.
  - Verificare che testo e overlay non coprano volto (la barra inferiore "Founder · AV-INVEST Research" rimane; assicurarsi che sia sotto il busto).
  - Confermare: `assets/andrea-founder-source.png` **non** è in `public/`.
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-5.1: About.tsx usa `next/image` (import Image from 'next/image') e alt text esatto.
  - `rule` TR-5.2: DOM finale `<img>` ha `src` contenente `andrea-founder.webp`, classe `object-cover`, non ha testo o elementi sovrapposti sul volto oltre alla barra footer che copre la parte bassa del busto.
  - `rule` TR-5.3: `ls public/` NON contiene `andrea-founder-source.png` (asset sorgente).

## Task 6: Metadata globali e integrazione favicon
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4 (favicon e social image generate)
- **Description**:
  - In `src/app/layout.tsx`, aggiornare export `metadata`:
    - `metadataBase: new URL('https://avinvestresearch.com')` (verificare che non sia già presente — al momento c'è `siteConfig.url` che è lo stesso; ok, ma non cambiare la variabile, bensì assicurare che siteConfig.url sia usato esattamente).
    - `alternates.canonical`: homepage deve essere assoluto `https://avinvestresearch.com` invece di `'/'`.
    - `openGraph.locale`: `'it_IT'` (al momento `siteConfig.locale` è `'it-IT'`; convertire o hardcodare — OG vuole `it_IT` con underscore).
    - `openGraph.type: 'website'` (già presente, confermare).
    - `openGraph.siteName: siteConfig.name` (già presente).
    - Immagini OG e Twitter: sostituire `siteConfig.ogImage = '/og.png'` (non più valida) con i percorsi file-based metadata di Next.js `/opengraph-image` e `/twitter-image`. In metadata.openGraph.images usare `[{ url: '/opengraph-image.png', width: 1200, height: 630, alt: siteConfig.name }]` con URL assoluti costruiti da metadataBase (oppure Next.js risolve relativamente a metadataBase).
    - `twitter.card: 'summary_large_image'` (già presente).
    - Aggiungere `verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined }` — richiede anche task 11.
    - Homepage title e description: aggiornare title.default a `'AV-INVEST Research | Formazione finanziaria e analisi tecnica'` e description a `'Formazione finanziaria, analisi tecnica e gestione del rischio per comprendere i mercati e prendere decisioni più consapevoli.'`
    - Title template: mantenere `%s - AV-INVEST RESEARCH` ma riflettere il nuovo name.
  - Rimuovere vecchio `/og.png` o file favicon conflittuali: verificare public/ per file che possano sovrascrivere.
  - Lingua `<html lang>`: mantenere `it-IT` (standard Next.js + corretto per attributo lang BCP47; OG locale `it_IT` è distinto).
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-6.1: In metadata openGraph.locale === 'it_IT', canonical homepage assoluto, title/description aggiornati.
  - `rule` TR-6.2: metadata.openGraph.images punta a opengraph-image.png 1200x630 e twitter.images a twitter-image.png.
  - `rule` TR-6.3: metadata.verification.google presente ma se env var non c'è è undefined (non stringa vuota).

## Task 7: SEO tecnica - robots, sitemap, noindex privati, 404
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None (ma sitemap deve includere nuove pagine quindi dopo task 8 in ordine di esecuzione — sitemap.ts aggiornato dopo creazione pagine, ma robots può essere fatto prima)
- **Description**:
  - Aggiornare `src/app/robots.ts`:
    - Disallow lista: `/login`, `/area-membri`, `/area-membri/*`, `/api/*`, callbacks (`/api/auth/*` già coperto da `/api/*`), checkout paths (se esistessero: `/checkout/*`, `/success`, `/cancel` — disallow per sicurezza anche se pagine non esistono).
    - Allow `/`.
  - Aggiornare `src/app/sitemap.ts`:
    - Base URL `https://avinvestresearch.com`.
    - Includere: home, `/privacy`, `/cookie`, `/termini`, `/disclaimer`, `/guide`, `/formazione-finanziaria`, `/analisi-tecnica`, `/gestione-del-rischio`, `/psicologia-del-trading`.
    - Escludere: `/login`, `/area-membri`, `/api/*`, parametri, callback.
    - Priorità appropriate: home 1.0, nuove guide 0.7-0.8, legali 0.3-0.5.
  - Aggiungere `export const metadata: Metadata = { ... robots: { index: false, follow: false } }` a:
    - `src/app/login/page.tsx`
    - `src/app/area-membri/page.tsx`
    - `src/app/area-membri/layout.tsx` (oppure in ogni sub-page: valutare se metadata su layout si eredita — Sì in Next App Router. Mettere in layout area-membri così protegge tutte le sotto-pagine.)
  - Pagine pubbliche (legali, nuove guide, home): confermare index:true/follow:true (non serve esplicitarlo se metadata lo eredita correttamente).
  - Creare `src/app/not-found.tsx`: pagina 404 con layout coerente, logo, messaggio chiaro, link a Home e a /guide, CTA minore a /#percorsi. Usare componenti esistenti (Navbar? No, not-found fuori da root layout? — Verificare: `not-found.tsx` dentro app/ usa root layout automaticamente in Next.js 13+, quindi Navbar e Footer ci sono già. Quindi solo un `<section>` con titolo "Pagina non trovata", testo, 2 link.)
  - Canonical: aggiornare ogni pagina legali (privacy, cookie, termini, disclaimer) e nuove guide (task 8) ad avere canonical **assoluti** (es. `https://avinvestresearch.com/privacy`). Attualmente alcuni usano `alternates: { canonical: '/privacy' }` — correggere in URL completo.
- **Acceptance Criteria Addressed**: AC-7, AC-8, AC-9
- **Test Requirements**:
  - `rule` TR-7.1: robots.ts disallow include tutti i path richiesti; sitemap include 10 pagine (home + 4 legali + 5 nuove guide); non include login/area-membri.
  - `rule` TR-7.2: login/page.tsx e area-membri/layout.tsx hanno metadata robots `index:false, follow:false` (controllabile leggendo il file).
  - `rule` TR-7.3: `src/app/not-found.tsx` esiste, ha 1 h1 chiaro, link a `/` e a `/guide`.
  - `rule` TR-7.4: Pagine legali e nuove guide hanno canonical in metadata come URL assoluti (https://...).

## Task 8: 5 Pagine SEO pubbliche
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None (parallelizzabile con 1-3)
- **Description**:
  - Creare cartelle e file:
    - `src/app/guide/page.tsx` (indice guida, h1 "Guide di formazione finanziaria", link a ciascuna guida)
    - `src/app/formazione-finanziaria/page.tsx`
    - `src/app/analisi-tecnica/page.tsx`
    - `src/app/gestione-del-rischio/page.tsx`
    - `src/app/psicologia-del-trading/page.tsx`
  - Ogni pagina:
    - Server Component (niente `'use client'` a meno di stretta necessità — preferire niente).
    - layout condiviso (root layout già c'è): Navbar/Footer automatici.
    - Struttura: `<section class="pt-28 pb-20 sm:pt-32 sm:pb-24">` + `container-page` + layout a max-w-3xl o simile per readability.
    - H1 unico e preciso.
    - H2 con intenti di ricerca tipo "Cos'è...", "Perché è importante...", "I principi chiave...", "Errori comuni da evitare...".
    - Testi originali, non copiati, onesti, senza qualifiche inventate.
    - Link interni con anchor testuali (es. "scopri la guida all'analisi tecnica") verso le altre guide.
    - CTA discreta bottom: link a `/#percorsi` con stile btn-secondary o link-underline.
    - Disclaimer educativo breve in box arrotondato (simile a FAQ o glasscard) e riferirsi al disclaimer esteso `/disclaimer`.
    - Metadata proprio: title, description (150-160 chars, IT), canonical assoluto, openGraph, twitter.
    - JSON-LD BreadcrumbList: 1 entry = "Home" > "Guide" > "Titolo guida" a seconda della pagina.
    - `/guide` è una index page: lista card delle 4 guide specialistiche con preview 2-3 righe, link, e BreadcrumbList Home > Guide.
  - Aggiungere link "Guide" nella sezione Navigazione del Footer (Footer.tsx). Prima dei legali o come nuova voce.
  - Opzionale: nella navbar desktop non aggiungere saturazione. Mobile anche opzionale. Preferenza: solo footer.
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rule` TR-8.1: Esistono 5 file `page.tsx` nelle rispettive cartelle.
  - `rule` TR-8.2: Ogni pagina ha export metadata con title, description, canonical assoluto https://avinvestresearch.com/...
  - `rule` TR-8.3: Ogni pagina ha ESATTAMENTE 1 `<h1>` (grep in file tsx singolo).
  - `rule` TR-8.4: Ogni pagina contiene link a guide correlate o home + CTA verso `/#percorsi` + disclaimer educativo.
  - `rule` TR-8.5: Ogni pagina contiene script JSON-LD `<script type="application/ld+json">` con @type BreadcrumbList e itemListElement validi.
  - `rule` TR-8.6: Footer.tsx ha voce "Guide" che linka a `/guide` nella sezione Navigazione o nuova sezione.

## Task 9: Dati strutturati JSON-LD
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8 (Breadcrumb già iniziato), Task 6 per logo URL
- **Description**:
  - Creare nuovo componente `src/components/seo/StructuredData.tsx` (Server Component o ritorno markup direttamente in layout).
  - Generare questi script, aggiunti in `app/layout.tsx` dentro `<head>` (o come children in layout perché Next mette i script children in body? — NO: `<script>` in `<head>` va messo dentro l'export metadata? No, JSON-LD si inserisce come `<script>` JSX nel body/head. Meglio: componente `<StructuredDataGlobal />` aggiunto nel root layout all'interno dell'`<html>` o del body, come primo elemento o accanto ai `<main>`; i motori leggono anche nel body).
  - **Organization**:
    - @type Organization
    - name: AV-INVEST Research
    - url: https://avinvestresearch.com
    - email: avinvestresearch@gmail.com
    - logo: @type ImageObject, url: URL assoluto a `/icon.png` o `/opengraph-image.png` (logo ufficiale — preferire icona 512 se rappresenta il logo).
    - sameAs: [linkedin, instagram]
  - **WebSite**:
    - @type WebSite
    - name: AV-INVEST RESEARCH
    - url: https://avinvestresearch.com
    - (opzionale inLanguage it-IT)
  - **Person**:
    - @type Person
    - name: Andrea Vivace
    - jobTitle: Fondatore
    - worksFor: @id Organization
    - sameAs: LinkedIn Andreavivace
    - Affiliazione a Organization
  - **Course**:
    - Aggiungere JSON-LD Course DUE volte (1 per corso) nella home o dove le card corsi sono renderizzate — oppure dentro `Courses.tsx` (client component? Courses.tsx attualmente NON è 'use client'! — Controllare: in `Courses.tsx` leggere — attualmente è Server Component dato che non inizia con 'use client'. Posso aggiungere un componente figlio dentro Courses che stampa JSON-LD (o direttamente script).
    - Usare dati da siteConfig.courses.foundations e tradingLab: name, description, provider Organization, offers @type Offer con price / priceCurrency EUR, availability https://schema.org/PreOrder oppure BackOrder (dato che available è false al momento).
  - Assicurare validità sintattica JSON, nessuna virgola finale.
  - Confermare: nessun Review/AggregateRating da nessuna parte.
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `rule` TR-9.1: JSON-LD Organization presente nel markup con name, url, email, logo, sameAs.
  - `rule` TR-9.2: JSON-LD WebSite e Person presenti.
  - `rule` TR-9.3: JSON-LD Course (2 entries) presenti nella home (o dove corsi renderizzati) con campi name, description, provider, offers/price/priceCurrency.
  - `rule` TR-9.4: Grep per `AggregateRating` o `Review` nei file generati restituisce 0.

## Task 10: Ottimizzazione performance (LCP/CLS/INP, next/image priority, lazy)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4, 5, 6
- **Description**:
  - **Hero immagini** (HeroChartSVG è SVG inline — ok; NeonBeams e GridBackground sono SVG/HTML — non contribuiscono a LCP immagine ma il testo heading è LCP. Ottenere: heading è già priority con animate fade.)
  - Immagini next/image priority:
    - Hero: se c'è Immagine? Attualmente Hero non ha immagini, è tutto SVG. Se aggiungiamo niente, ok.
    - Logo Navbar: piccolo; non above the fold di priorità alta (ma il componente Navbar ha logo SVG inline, non image — ok).
    - Foto Andrea è below the fold (dopo ~7 sezioni), NON mettere priority (lazy default = ottimo).
    - Corsi: nessuna immagine.
    - CandlestickShowcase: tutto SVG — ok.
  - Verificare `YouTubeEmbed`: NON caricare iframe finché l'utente non interagisce (click "Play" placeholder). Implementare se YouTubeEmbed già NON lo fa — leggere il componente.
  - Rivedere uso `'use client'`: nuove pagine SEO devono essere Server Components; LoginCard e Testimonials e Method sono già client per useState. Non c'è molto da tagliare.
  - `aspect ratio`:
    - About foto aspect-[4/5] già nel contenitore e next/image con fill dentro — verificare che layout CLS sia zero (non shift). Se usiamo fill serve `position: relative` sul parent (c'è).
  - Audit finale: togliere asset inutilizzati? Non ci sono npm superflui evidenti.
- **Acceptance Criteria Addressed**: Implicito in NFR (performance è requisito non funzionale ma senza AC diretto; includiamo in NFR e verifiche finali)
- **Test Requirements**:
  - `rule` TR-10.1: Immagine Andrea NON ha priority (assenza esplicita o default). Nessuna immagine below the fold ha priority.
  - `rule` TR-10.2: YouTubeEmbed (se esiste e caricato) NON esegue render iframe prima dell'interazione (placeholder con onClick).
  - `rubric` TR-10.3: Assenza CLS evidente (aspect ratio coerenti); scale 1-5; threshold >= 4.

## Task 11: Google Site Verification
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None (può essere fatto in parallelo ma l'effetto è in layout.tsx già citato in task 6 — assicurarsi sia integrato)
- **Description**:
  - `.env.example`: aggiungere riga `GOOGLE_SITE_VERIFICATION=` alla fine.
  - Confermare che in layout.tsx metadata.verification.google = process.env.GOOGLE_SITE_VERIFICATION (vedere task 6).
  - NON aggiungere nessun valore vero nel file.
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-11.1: `.env.example` contiene stringa `GOOGLE_SITE_VERIFICATION=` e il valore è vuoto.
  - `rule` TR-11.2: `layout.tsx` nel metadata esportato contiene `verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined }` (o equivalente) e non hardcorda un valore.

## Task 12: Audit contenuti - em-dash, canonical assoluti, heading gerarchia
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8 (tutte le pagine esistono)
- **Description**:
  - Grep finale per `—` (U+2014) e `–` (U+2013) in `src/` e `.env.example`, `README.md`. Sostituire con `-` standard se trovati.
  - Verificare ogni pagina pubblica: UN SOLO h1. Elenco: home (Hero h1 id="hero-heading"), login (Accedi all'area membri — h1 presente 1), area-membri layout o overview, guide/*, legali (privacy, termini, cookie, disclaimer: leggere i file LegalLayout e le pagine per conferma h1).
  - Gerarchia heading: h2 > h3 > p. Nessun salto h1→h3 senza h2.
  - Scroll-margin-top: le sezioni in homepage hanno `scroll-mt-28`; i link a `/#metodo` funzionano. Verificare che se le nuove pagine hanno anchor link, abbiano scroll-margin.
  - Link interni: testo descrittivo. Nessun "Clicca qui".
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `rule` TR-12.1: Grep per caratteri U+2014/U+2013 in src/ restituisce 0.
  - `rule` TR-12.2: Ogni file pagina pubblica ha ESATTAMENTE 1 elemento `<h1>` (conteggio per file).
  - `rule` TR-12.3: Nessun elemento `<h3>` è fratello o figlio diretto di `<h1>` senza un `<h2>` intermediario (approssimabile con grep o ispezione visuale).

## Task 13: Esecuzione typecheck, lint, build + fix errori
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1-12 completati
- **Description**:
  - Eseguire: `npm run typecheck`
  - Eseguire: `npm run lint`
  - Eseguire: `npm run build`
  - Riparare ogni errore.
- **Acceptance Criteria Addressed**: AC-13
- **Test Requirements**:
  - `rule` TR-13.1: I 3 comandi terminano con exit code 0.
  - `rule` TR-13.2: Nessun warning bloccante in fase di build per immagini o metadata.

## Task 14: Commit e push su main con messaggio convenzionale
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 13 (tutti i verdi)
- **Description**:
  - `git add -A` (o specifico file).
  - Verificare che `assets/andrea-founder-source.png` e `assets/av-invest-logo.png` siano tracciati o meno? — Sono già nell'albero? Sono già nel repo (assets/). Verificare git status prima di commit. Se ci sono file nuovi in public/ e src/app/ vanno aggiunti.
  - Commit message:
    ```
    feat: aggiornamento SEO, UI testimonianze/metodo, asset logo+foto, pagine guida, JSON-LD e GSC readiness

    - Testimonianze: 5 stelle Lucide decorative, altezza card ridotta ~20-25%,
      rispetto prefers-reduced-motion, senza rating strutturato
    - Sezione Metodo: rimossi rombi, linea desktop-only dietro cards
    - Rimossi testi provvisori "in allestimento/preparazione/lavorazione"
    - Foto Andrea convertita in WebP + next/image object-cover
    - Favicon (AV simbolo), icon 512, apple-touch 180, OG e Twitter image 1200x630
    - SEO tecnica: robots disallow, sitemap 10 URL pubbliche, noindex su
      login/area-membri, canonical assoluti, homepage title+description,
      pagina 404 not-found
    - 5 nuove pagine SEO: /guide, /formazione-finanziaria, /analisi-tecnica,
      /gestione-del-rischio, /psicologia-del-trading con BreadcrumbList JSON-LD
    - JSON-LD: Organization, WebSite, Person, Course x2
    - Performance: next/image sizes, lazy default below-fold, YouTube placeholder
    - GOOGLE_SITE_VERIFICATION predisposta in env e metadata
    - Audit em-dash, heading hierarchy, scroll-margin, link descrittivi
    - typecheck / lint / build verdi
    ```
  - `git push origin main` (se upstream è corretto).
- **Acceptance Criteria Addressed**: Consegna
- **Test Requirements**:
  - `rule` TR-14.1: `git status` dopo commit = working tree pulito (eccetto forse scripts e node_modules ignorati).
  - `rule` TR-14.2: Ultimo messaggio commit contiene summary di tutte le aree.
