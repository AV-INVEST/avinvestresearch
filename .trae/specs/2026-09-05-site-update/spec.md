# Spec: aggiornamento AV‑INVEST RESEARCH sito pubblico

- Spec language: Italian
- Repository root: `C:\Users\viva_\OneDrive\Desktop\AVINVEST`
- Last updated: 2026-09-05

## 1. Problema, obiettivi e non‑obiettivi

### Problema
Il sito AV‑INVEST RESEARCH in Next.js 15 (pubblico, senza auth / pagamenti / DB attivi) presenta:
- Em dash (U+2014) non conformi alle preferenze typografiche.
- Link alle sezioni homepage spezzati quando si naviga da pagine legali (`/disclaimer#percorsi` invece di `/#percorsi`), titolo sezione coperto dalla navbar fissa.
- Pulsante "Accedi" con destinazione `#accesso` inesistente.
- Prezzi placeholder (€497 / €897) non aggiornati ai nuovi valori di lancio.
- Label dei pulsanti Calendly non uniformi.
- Nessuna visualizzazione grafica premium a candele giapponesi per scenari di mercato educativi.
- Nessuna sezione con risultati storici verificati del portafoglio pubblico AV‑INVEST.
- Nessuna sezione feedback anonimo pubblico.
- Nessun cookie manager primo‑party; Cookie Policy non precisa i cookie effettivamente usati.
- Pagine legali contengono banner "Bozza / Richiede revisione legale" e placeholder "DA COMPLETARE", quindi inidonee a sito pubblico in produzione.
- Social link inutilizzati (X, YouTube) che andrebbero rimossi mantenendo solo LinkedIn e Instagram.
- Necessità di test cross‑size finale (320/360/390/768/desktop) e commit/push su `origin/main`.

### Obiettivi
- Preservare identità visiva (black + neon green), struttura, contenuti pubblici italiani, animazioni leggere.
- Applicare tutte le 13 modifiche richieste in modo consistente tra configurazione, componenti, pagine e metadata.
- Rendere il sito tecnicamente pronto per Vercel deploy (TS/lint/build passano 0 errori).

### Non‑obiettivi
- Non implementare Stripe, Supabase, auth, email, pagamenti reali, API live di trading.
- Non ridisegnare la homepage da zero.
- Non aggiungere librerie pesanti (chart libs, Three.js, CMP commerciali).
- Non menzionare marchi terzi (es. eToro) per dati copia / performance.

## 2. Requisiti funzionali (FR)

1. **Em dash removal**: Sostituire ogni U+2014 in testi utente, config, metadata, pagine legali con `-` (hyphen). Verifica finale: 0 occorrenze in repo.
2. **Navigazione & anchor**: i link a sezioni homepage sono `/#percorsi`, `/#research-club`, `/#metodo`, `/#chi-sono`, `/#faq`. Homepage sections con `scroll-margin-top` sufficiente a evitare che la navbar fissa copra il titolo.
3. **Accedi behind flag**: Rimuovere "Accedi" dalla navbar pubblica se `memberAreaEnabled: false`. Flag centralizzato in siteConfig.
4. **Prezzi corsi**: AV Foundations = €297; AV Trading Lab = €497. Uniformare in config, cards, ogni occorrenza. Ortografia "AV Foundations" (non "AV Foundation").
5. **Pulsanti prenotazione call**: Testo visibile uniforme `PRENOTA UNA CALL`. Nessuna variante "CALL ME" mostrata all'utente. Responsive a 320/360/390/tablet/desktop senza overlap, clip o overflow orizzontale. URL Calendly rimane centralizzato.
6. **Candlestick showcase**: 3 scenari SVG/CSS custom (rialzista, ribassista, laterale), auto‑switch ~4.5s, tabs/dot manuali, swipe‑friendly, pausa interazione, `prefers-reduced-motion`, nessun overflow orizzontale, label illustrativa, integrazione naturale vicino sezione Metodo.
7. **Risultati storici**: sezione "Un metodo costruito sui risultati" con config centralizzata: 2024‑dal 9 luglio (+14,13%), 2025 anno completo (+33,88%), 138 copier attuali, capitale in copia fascia $300K‑$1M, data rilevazione 5/09/2026. Counters leggeri se animati. Disclaimer prominente come richiesto.
8. **Feedback**: carousel mobile‑first, 4 testimonianze esatte, autore anonimo "Feedback pubblico di un investitore", manuale + auto, no layout shift, RRM, neon‑soft.
9. **Cookie manager**: CMP primo partito leggero, 3 bottoni stessa prominenza ("Accetta tutti"/"Rifiuta non necessari"/"Personalizza"), 4 categorie (Necessari sempre on, Preferenze, Analitici, Marketing). Salvataggio versione + timestamp + categorie in `localStorage`, focus trap, Escape, riapribile da footer "Gestisci cookie", nessun script opzionale prima del consenso, tabella cookie accurata in Cookie Policy.
10. **Pagine legali pulite**: Rimuovere banner bozza/placeholder "da compilare". Aggiungere "Ultimo aggiornamento: 5 settembre 2026". Non inventare P.IVA/indirizzo/CF reali. Centralizzare legal identity. Guard tecnico: `checkoutEnabled = false` finché tutti i campi legal identity obbligatori sono popolati. Disclaimer finanziario esplicito su tutti i punti richiesti.
11. **Social**: mantenere LinkedIn (andreavivace) e Instagram (avinvestresearch). Rimuovere X/Twitter e YouTube da config, metadata, footer, icone, arrays.
12. **Mobile & a11y test**: 320/360/390/768/desktop. No horizontal scroll, no overlapping, booking CTA leggibili, caroselli e cookie panel nel viewport, nav funziona da ogni route, focus visibili, dialog a11y, RRM rispettato, ogni link a destinazione valida.
13. **Final validation + deploy**: 0 U+2014 residui, tsc, lint, build OK, test routes, commit descrittivo, push a origin/main.

## 3. Requisiti non funzionali (NFR)

- **Performance**: Solo animazioni SVG/CSS/opacity/transform; caroselli senza layout shift; < 110 kB first load JS condiviso (stesso ordine di grandezza dell'attuale).
- **Accessibility**: WCAG 2.1 AA friendly; contrasto testo; focus visibili; dialogs focus trap + Escape + aria; auto‑play caroselli con pause on hover/focus/interaction e RRM OFF.
- **Responsive**: 320+ min width, mobile first, safe area considerata per barra bottom.
- **Maintainability**: Tutte le variabili di contenuto (prezzi, social, performance, legal date, feature flag) in `siteConfig.ts`.
- **Security**: Nessuna API key né endpoint live introdotti. Nessun fallback a `--force` o `--legacy-peer-deps`.
- **Legal guard**: checkout e segnali disabilitati; testo esplicito "non segnali / non consulenza".

## 4. Accettazione (Acceptance Criteria)

Regola (oggettiva binaria):

- **AC1**: Repository grep U+2014 restituisce 0 occorrenze in codice e testi.
- **AC2**: Ogni link a homepage sections nel DOM è un hash path assoluto `/#id`; non esistono `href="#percorsi"` o `href="#metodo"` in navbar/footer/mobile bar.
- **AC3**: Ogni section id homepage ha `scroll-margin-top >= 96px` (o classe equivalente).
- **AC4**: "Accedi" non è presente nella navbar pubblica quando `memberAreaEnabled=false`; il flag esiste.
- **AC5**: in siteConfig `courses.foundations.price === 297`, `tradingLab.price === 497`; tutte le cards renderizzano tali importi formattati.
- **AC6**: Tutti i button/anchor verso Calendly nel contenuto pubblico hanno testo visibile contenente esattamente `PRENOTA UNA CALL` (nessuna occorrenza visibile `CALL ME`).
- **AC7**: Component candlestick presenta 3 scenari, auto change ~4.5s, tabs cliccabili, pausa on hover/interaction, `prefers-reduced-motion` disabilita auto play, nessun `document.documentElement.scrollWidth > clientWidth` su 320‑420px.
- **AC8**: Sezione performance ha i 4 valori esatti, date label corrette, fascia $300K‑$1M, disclaimer esatto come da requisito.
- **AC9**: Testimonial carousel contiene le 4 citazioni identiche; autore anonimo esatto; pulsanti manuali + auto; no CLS.
- **AC10**: Cookie banner è mostrato al primo render senza consenso salvato; 3 bottoni; categories 4 con Necessari disabled checked; riapri da footer; Escape chiude; focus trap; `localStorage` salva `{version, timestamp, categories}`.
- **AC11**: Cookie Policy contiene tabella dei cookie con entry reali (consent cookie + eventualmente solo quelli effettivamente usati); niente entry inventate.
- **AC12**: Privacy, Termini, Disclaimer, Cookie non hanno più banner "Bozza" o placeholder "[...] DA COMPLETARE"; data ultimo aggiornamento presente.
- **AC13**: Feature guard `checkoutEnabled` è calcolata da legal identity e in default build restituisce `false`; `courses.*.available` rimangono `false`.
- **AC14**: siteConfig social contiene solo `linkedin` e `instagram` con i nuovi URL; footer e metadata non rendono più X/YouTube.
- **AC15**: Test manuale/script a 320/360/390/768: nessun layout overflow, overlapping o testo clippato.
- **AC16**: `npm run typecheck`, `npm run lint`, `npm run build` passano 0 errori.
- **AC17**: Commit creato con messaggio descrittivo e push a `origin/main`.

Rubric (valutativa, soglia >= 3/4):

- **R1 – Coerenza visiva (0‑4)**: l'estetica nera + neon green, lo spacing, la gerarchia e l'atmosfera trading terminal sono preservate; nuove sezioni sembrano native.
- **R2 – Responsive e mobile UX (0‑4)**: 320–390px leggibili senza pinch orizzontale; CTA e caroselli fruibili col pollice.
- **R3 – Accessibilità (0‑4)**: focus states, keyboard nav, dialogs, contrasto e RRM applicati consistentemente.
- **R4 – Maintainability & legal safety (0‑4)**: config centralizzata, guard tecniche checkout presente, nessun claim o nome di marchi non autorizzati.

## 5. Constraints & Assunzioni

- No dipendenze nuove non essenziali.
- Nessun testo inglese nel contenuto utente (variabili e codice restano inglesi).
- Nessuna connessione a sistemi esterni (no API key nel repo).
- Assunzione: i 4 feedback sono pubblici e anonimizzabili come richiesto.
- Assunzione: i dati performance sono pubblici e non richiedono attribuzioni eToro.
