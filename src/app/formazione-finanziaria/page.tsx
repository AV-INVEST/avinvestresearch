import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formazione finanziaria: le basi per iniziare | AV-INVEST Research',
  description: 'Guida alla formazione finanziaria: alfabetizzazione, bilancio famigliare, obiettivi, risparmio, strumenti e approccio consapevole ai mercati.',
  alternates: { canonical: 'https://avinvestresearch.com/formazione-finanziaria' },
  openGraph: {
    type: 'article',
    locale: 'it_IT',
    url: 'https://avinvestresearch.com/formazione-finanziaria',
    siteName: 'AV-INVEST RESEARCH',
    title: 'Formazione finanziaria: le basi per iniziare | AV-INVEST Research',
    description: 'Guida alla formazione finanziaria: alfabetizzazione, bilancio famigliare, obiettivi, risparmio, strumenti e approccio consapevole ai mercati.',
    images: [{ url: 'https://avinvestresearch.com/opengraph-image.png', width: 1200, height: 630, alt: 'AV-INVEST RESEARCH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formazione finanziaria: le basi per iniziare | AV-INVEST Research',
    description: 'Guida alla formazione finanziaria: alfabetizzazione, bilancio famigliare, obiettivi, risparmio, strumenti e approccio consapevole ai mercati.',
    images: ['https://avinvestresearch.com/twitter-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function FormazioneFinanziariaPage() {
  return (
    <>
      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 scroll-mt-28" aria-labelledby="page-heading">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">GUIDA FORMATIVA</p>
            <h1 id="page-heading" className="mt-5 heading-lg">Formazione finanziaria: le basi per decidere con consapevolezza</h1>
            <p className="mt-5 body-lg">
              La formazione finanziaria è il punto di partenza per chiunque voglia approcciarsi ai mercati con metodo.
              Non servono lauree in economia: servono chiarezza sulle proprie risorse, sugli obiettivi e sui meccanismi
              che regolano denaro, rischio e tempo.
            </p>
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="heading-md">Cos&apos;è la formazione finanziaria</h2>
                <p className="mt-3 body-lg">
                  La formazione finanziaria è l&apos;insieme di conoscenze, strumenti e abitudini che permettono di
                  gestire il denaro in modo consapevole. Non si tratta di imparare trucchi per guadagnare velocemente,
                  ma di capire concetti base e applicarli alla propria situazione personale.
                </p>
                <p className="mt-3 body-lg">
                  Include saper leggere un bilancio famigliare, comprendere la differenza tra risparmio e investimento,
                  riconoscere il ruolo dell&apos;inflazione e dei costi, e scegliere strumenti coerenti con il proprio profilo.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Perché l&apos;educazione finanziaria è fondamentale</h2>
                <p className="mt-3 body-lg">
                  Senza basi solide si rischia di prendere decisioni dettate dall&apos;emozione o da consigli generici.
                  L&apos;educazione finanziaria aiuta a ridurre l&apos;ansia legata al denaro, a evitare errori costosi
                  e a costruire un percorso che tenga conto dei tempi reali e della propria tolleranza al rischio.
                </p>
                <p className="mt-3 body-lg">
                  È un investimento su sé stessi: le competenze acquisite rimangono nel tempo e aiutano in ogni fase della vita,
                  dalla gestione dello stipendio fino alla pianificazione del futuro.
                </p>
              </div>
              <div>
                <h2 className="heading-md">I pilastri</h2>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-white sm:text-base">
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Conoscere i propri numeri: entrate, uscite, patrimoni e debiti, senza nascondere nulla.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Definire obiettivi chiari e realistici: orizzonte temporale, importi e priorità.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Capire i concetti base di interesse, inflazione, rischio e relazione rischio-rendimento.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Scegliere gli strumenti giusti per il proprio profilo, non quelli che vanno di moda.</span></li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md">Errori comuni da evitare</h2>
                <p className="mt-3 body-lg">
                  Pensare che la formazione finanziaria serva solo a chi ha grandi disponibilità, rimandare &quot;quando guadagnerò di più&quot;,
                  inseguire consigli generici sentiti in giro senza adattarli alla propria situazione, non fare un piano e
                  ignorare costi, imposte e inflazione che erodono i risultati nel tempo.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Da dove iniziare</h2>
                <p className="mt-3 body-lg">
                  Inizia facendo chiarezza sui tuoi numeri: scrivi entrate, uscite fisse e variabili, eventuali debiti e risparmi attuali.
                  Poi definisci 1-2 obiettivi concreti, con un orizzonte temporale preciso. Leggi libri o risorse serie sulle basi
                  dell&apos;educazione finanziaria, evida chi promette facili guadagni. Se decidi di approcciare i mercati, fallo con
                  piccole somme o su conto demo, per fare pratica senza pressioni, e sii paziente: la formazione dura una vita.
                </p>
              </div>
            </div>
            <div className="mt-14 rounded-2xl border border-av-line bg-av-surface/40 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">Guide correlate</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/analisi-tecnica" className="link-underline text-sm">→ Passa all&apos;analisi tecnica e alla lettura dei grafici</Link>
                <Link href="/gestione-del-rischio" className="link-underline text-sm">→ Approfondisci la gestione del capitale e del rischio</Link>
                <Link href="/psicologia-del-trading" className="link-underline text-sm">→ Scopri l&apos;importanza della disciplina e delle emozioni</Link>
                <Link href="/guide" className="link-underline text-sm">→ Torna all&apos;indice di tutte le guide</Link>
              </div>
            </div>
            <div className="mt-10 rounded-2xl border border-av-line bg-av-bg-2/50 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">Disclaimer educativo</p>
              <p className="mt-3 text-sm leading-relaxed text-av-muted sm:text-base">
                I contenuti hanno finalità esclusivamente formative e informative. Non costituiscono consulenza finanziaria personalizzata, sollecitazione all&apos;investimento o promessa di rendimento. Leggi il{' '}
                <Link href="/disclaimer" className="link-underline text-white">disclaimer completo</Link>.
              </p>
            </div>
            <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-av-green-deep/40 bg-av-green/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">Costruisci competenze con un metodo strutturato</h2>
                <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">Scopri i percorsi formativi progettati per essere progressivi e operativi.</p>
              </div>
              <Link href="/#percorsi" className="btn-primary shadow-glow-green-sm whitespace-nowrap">Scopri i percorsi</Link>
            </div>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avinvestresearch.com' },
              { '@type': 'ListItem', position: 2, name: 'Guide', item: 'https://avinvestresearch.com/guide' },
              { '@type': 'ListItem', position: 3, name: 'Formazione finanziaria: le basi per decidere con consapevolezza' },
            ],
          }),
        }}
      />
    </>
  );
}
