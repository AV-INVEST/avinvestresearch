# AV-INVEST RESEARCH

Sito web pubblico di AV-INVEST Research: formazione finanziaria, analisi tecnica e metodo operativo.

Prima fase: sito vetrina pubblico (Next.js App Router, TypeScript, Tailwind CSS). Le integrazioni (Auth, Stripe, Supabase/Postgres, email) sono strutturalmente preparate ma non implementate.

## Stack

- **Next.js 15** (App Router, RSC / Client components)
- **TypeScript 5**
- **Tailwind CSS 3**
- **Lucide React** (icone)
- Font: Inter + Space Grotesk (via `next/font/google`)

## Requisiti

- Node.js 20+ (testato su Node 22 LTS)
- npm 10+

## Installazione ed esecuzione locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Il sito sarà disponibile su `http://localhost:3000`.

## Script

| Comando              | Descrizione                                           |
| -------------------- | ----------------------------------------------------- |
| `npm run dev`        | Avvia il server di sviluppo con HMR                    |
| `npm run build`      | Build di produzione (Next.js)                          |
| `npm run start`      | Avvia il server di produzione (dopo `build`)           |
| `npm run lint`       | ESLint (preset Next.js core-web-vitals)                |
| `npm run typecheck`  | Controllo tipi TypeScript (`tsc --noEmit`)             |

## Struttura

```
src/
  app/                 # App Router (pagine, layout, metadata, sitemap, robots)
  components/
    layout/            # Navbar, Footer, MobileBottomBar
    sections/          # Sezioni homepage (Hero, Courses, Method, ...)
    visuals/           # Componenti SVG/animati decorativi
    ui/                # GlassCard, Accordion, CTAButton
    legal/             # Layout condiviso per pagine legali
  config/
    siteConfig.ts      # Configurazione centralizzata (URL, prezzi, testi legali placeholder, nav)
```

## Configurazione centralizzata

I testi, i prezzi, i link e le informazioni legali si trovano in `src/config/siteConfig.ts`. Modifica quel file per aggiornare:

- URL sito, Calendly, email contatti, social
- Prezzi e descrizioni dei corsi (`courses.foundations`, `courses.tradingLab`)
- Elementi navigazione, founder, Research Club
- Informazioni legali placeholder (`legal.*`)

Il Calendly di default è `https://calendly.com/REPLACE-ME` e viene usato da tutti i pulsanti *Call Me*.

## Note fase 1

- Nessun pagamento / Stripe: i pulsanti acquisto corsi mostrano **"DISPONIBILE PROSSIMAMENTE"**
- Nessun login / auth: il link *Accedi* è un placeholder `#accesso`
- Nessun DB / CMS: i contenuti sono hardcoded in componenti e in `siteConfig.ts`
- Pagine legali (privacy, cookie, termini, disclaimer) sono bozze marcate e richiedono revisione legale

## Accessibilità & performance

- Contrasto elevato (nero / verde neon)
- Skip-link `Salta al contenuto principale`
- Focus state visibili (outline verde)
- Accordion FAQ con `aria-expanded` / `aria-controls`
- Rispetto `prefers-reduced-motion` a livello globale e per componenti SVG animati
- Nessun orizzontal overflow, layout responsive a 360 / 390 / tablet / desktop
- SEO base: `sitemap.ts`, `robots.ts`, OpenGraph e Twitter metadata nel root layout

## Deployment (Vercel)

```bash
vercel
```

Oppure connetti la repo su Vercel: variabili d'ambiente da copiare da `.env.example` (al momento solo quelle `NEXT_PUBLIC_*` sono obbligatorie).
