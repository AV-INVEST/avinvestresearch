import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analisi tecnica: grafici, trend e livelli chiave | AV-INVEST Research',
  description: 'Analisi tecnica spiegata in modo semplice: grafici a candele, trend, supporti e resistenze, volumi, indicatori e limiti di questo approccio.',
  alternates: { canonical: 'https://avinvestresearch.com/analisi-tecnica' },
  openGraph: {
    type: 'article',
    locale: 'it_IT',
    url: 'https://avinvestresearch.com/analisi-tecnica',
    siteName: 'AV-INVEST RESEARCH',
    title: 'Analisi tecnica: grafici, trend e livelli chiave | AV-INVEST Research',
    description: 'Analisi tecnica spiegata in modo semplice: grafici a candele, trend, supporti e resistenze, volumi, indicatori e limiti di questo approccio.',
    images: [{ url: 'https://avinvestresearch.com/opengraph-image.png', width: 1200, height: 630, alt: 'AV-INVEST RESEARCH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analisi tecnica: grafici, trend e livelli chiave | AV-INVEST Research',
    description: 'Analisi tecnica spiegata in modo semplice: grafici a candele, trend, supporti e resistenze, volumi, indicatori e limiti di questo approccio.',
    images: ['https://avinvestresearch.com/twitter-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function AnalisiTecnicaPage() {
  return (
    <>
      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 scroll-mt-28" aria-labelledby="page-heading">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">GUIDA FORMATIVA</p>
            <h1 id="page-heading" className="mt-5 heading-lg">Analisi tecnica: comprendere i grafici e la struttura di mercato</h1>
            <p className="mt-5 body-lg">
              L&apos;analisi tecnica è uno strumento per leggere il comportamento del mercato attraverso i prezzi e i volumi.
              Non è una sfera di cristallo, ma un linguaggio: impararlo aiuta a riconoscere contesti, probabili aree di reazione
              e a strutturare le proprie idee con più metodo.
            </p>
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="heading-md">Cos&apos;è l&apos;analisi tecnica</h2>
                <p className="mt-3 body-lg">
                  L&apos;analisi tecnica studia la storia dei prezzi e dei volumi per identificare pattern, strutture e livelli
                  che potrebbero ripetersi nel futuro. Si basa sul presupposto che il prezzo sconti già tutte le informazioni
                  disponibili e che i movimenti non siano completamente casuali.
                </p>
                <p className="mt-3 body-lg">
                  Usa grafici, candele giapponesi, linee di tendenza e indicatori per rappresentare l&apos;azione del prezzo
                  nel tempo, su time frame diversi. Serve a contestualizzare un&apos;idea, non a sostituirla.
                </p>
              </div>
              <div>
                <h2 className="heading-md">I presupposti e i suoi limiti</h2>
                <p className="mt-3 body-lg">
                  L&apos;analisi tecnica ragiona in probabilità, non in certezze. Un pattern o un livello non garantisce
                  un risultato: suggerisce scenari più o meno probabili, che vanno sempre confermati e gestiti con regole precise.
                  Non tiene conto di fondamentali, news improvvise o eventi macro che possono stravolgere anche gli schemi più puliti.
                </p>
                <p className="mt-3 body-lg">
                  Per usarla bene serve umiltà: accettare che ci saranno letture sbagliate, scenari non validati e momenti
                  in cui la cosa più intelligente è stare fuori dal mercato.
                </p>
              </div>
              <div>
                <h2 className="heading-md">I blocchi fondamentali</h2>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-white sm:text-base">
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Grafici e time frame: saper scegliere la scala temporale coerente con il proprio stile operativo.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Candele giapponesi e pattern base: struttura, range, corpo e ombre per capire la pressione acquirente/venditrice.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Trend, supporti e resistenze: riconoscere la direzione prevalente e i livelli dove il prezzo ha reagito in passato.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Volumi e conferme: il prezzo si muove con partecipazione o su scambi deboli?</span></li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md">Indicatori più comuni</h2>
                <p className="mt-3 body-lg">
                  Medie mobili, RSI, MACD, Bollinger Bands e altri sono strumenti di supporto alla lettura, non segnali automatici.
                  Una media mobile può aiutare a vedere il trend, l&apos;RSI a misurare la velocità di un movimento, ma nessun
                  indicatore da solo dice quando entrare o uscire. Usane pochi, capiscili a fondo e preferisci sempre il prezzo nudo.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Errori comuni da evitare</h2>
                <p className="mt-3 body-lg">
                  Riempire il grafico di decine di indicatori sperando di trovare la combinazione perfetta, giudicare un setup
                  solo a posteriori dimenticandosi dell&apos;incertezza del momento, non definire un livello di invalidazione chiaro
                  e quindi non gestire quando l&apos;idea si rivela sbagliata.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Da dove iniziare</h2>
                <p className="mt-3 body-lg">
                  Parti dal prezzo nudo: impara a riconoscere trend, supporti e resistenze su più time frame prima di aggiungere
                  qualsiasi indicatore. Studia le candele giapponesi e i pattern più semplici. Esercitati a tracciare livelli a mano
                  su grafici storici e poi su demo, senza soldi veri. Annota le tue letture e confrontale con quello che succede dopo:
                  è il modo più efficace per costruire una tua visione personale.
                </p>
              </div>
            </div>
            <div className="mt-14 rounded-2xl border border-av-line bg-av-surface/40 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">Guide correlate</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/formazione-finanziaria" className="link-underline text-sm">→ Parti dalle basi dell&apos;educazione finanziaria</Link>
                <Link href="/gestione-del-rischio" className="link-underline text-sm">→ Impara a gestire rischio e capitale su ogni idea</Link>
                <Link href="/psicologia-del-trading" className="link-underline text-sm">→ Scopri come disciplina e emozioni influenzano le operazioni</Link>
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
              { '@type': 'ListItem', position: 3, name: 'Analisi tecnica: comprendere i grafici e la struttura di mercato' },
            ],
          }),
        }}
      />
    </>
  );
}
