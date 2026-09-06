import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestione del rischio: proteggere il capitale | AV-INVEST Research',
  description: 'Gestione del rischio (risk management) per investitori e trader: sizing, stop loss, capitale per operazione, drawdown, regole e disciplina.',
  alternates: { canonical: 'https://avinvestresearch.com/gestione-del-rischio' },
  openGraph: {
    type: 'article',
    locale: 'it_IT',
    url: 'https://avinvestresearch.com/gestione-del-rischio',
    siteName: 'AV-INVEST RESEARCH',
    title: 'Gestione del rischio: proteggere il capitale | AV-INVEST Research',
    description: 'Gestione del rischio (risk management) per investitori e trader: sizing, stop loss, capitale per operazione, drawdown, regole e disciplina.',
    images: [{ url: 'https://avinvestresearch.com/images/av-invest-social-v2.png', width: 1200, height: 630, alt: 'AV-INVEST RESEARCH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestione del rischio: proteggere il capitale | AV-INVEST Research',
    description: 'Gestione del rischio (risk management) per investitori e trader: sizing, stop loss, capitale per operazione, drawdown, regole e disciplina.',
    images: ['https://avinvestresearch.com/images/av-invest-twitter-v2.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function GestioneDelRischioPage() {
  return (
    <>
      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 scroll-mt-28" aria-labelledby="page-heading">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">GUIDA FORMATIVA</p>
            <h1 id="page-heading" className="mt-5 heading-lg">Gestione del rischio: la parte più importante (e meno appariscente)</h1>
            <p className="mt-5 body-lg">
              La gestione del rischio è la disciplina che permette di sopravvivere ai mercati nel tempo, anche quando
              le cose non vanno come previsto. È meno spettacolare di una buona entrata, ma è la differenza tra chi
              continua a operare dopo un periodo negativo e chi invece perde tutto.
            </p>
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="heading-md">Cos&apos;è la gestione del rischio</h2>
                <p className="mt-3 body-lg">
                  La gestione del rischio non serve a evitare le perdite: le perdite fanno parte del gioco. Serve a
                  gestirle, in modo che nessuna singola idea o nessuna serie di idee negative possano compromettere
                  il capitale o la capacità di continuare a operare.
                </p>
                <p className="mt-3 body-lg">
                  È un insieme di regole scritte: quanto rischiare per operazione, quando uscire da un&apos;idea sbagliata,
                  quanto dimensione dare a una posizione, come comportarsi in drawdown.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Perché è più importante dell&apos;entrata</h2>
                <p className="mt-3 body-lg">
                  Anche la migliore strategia di ingresso al mondo, senza regole di rischio, può portare a perdere
                  il capitale. Viceversa, una strategia con una percentuale di successo non eccezionale, ma gestita
                  con sizing e stop coerenti, può sopravvivere a lungo e sfruttare la legge dei grandi numeri.
                </p>
                <p className="mt-3 body-lg">
                  La priorità nei mercati non è guadagnare domani: è restare nel gioco tra sei mesi, tra un anno, tra cinque anni.
                  Senza sopravvivenza, nessun risultato è possibile.
                </p>
              </div>
              <div>
                <h2 className="heading-md">I principi operativi</h2>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-white sm:text-base">
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Rischiare l&apos;1%-2% del capitale per singola idea: limita l&apos;impatto di una perdita.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Stop loss o condizione di invalidazione chiara PRIMA di entrare: non si decide sul momento.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Position sizing coerente con volatilità: strumenti più volatili = posizioni più piccole.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Drawdown massimo accettabile e regole di pausa: quando rallentare o fermarsi per riflettere.</span></li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md">Strumenti e pratiche</h2>
                <p className="mt-3 body-lg">
                  Calcolare la dimensione della posizione in base al rischio, non all&apos;intuizione. Valutare sempre
                  il rapporto rischio/rendimento atteso prima di entrare. Evitare la concentrazione su un solo strumento
                  o settore, monitorare la correlazione tra posizioni e usare la diversificazione come ulteriore strumento
                  di protezione, non come sostituto del sizing.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Errori comuni da evitare</h2>
                <p className="mt-3 body-lg">
                  Non usare stop loss o spostarli per non accettare la perdita. Scegliere la dimensione della posizione
                  a caso o in base all&apos;euforia del momento. Usare logiche di martingala, raddoppiando dopo ogni perdita.
                  Aggiungere capitale a posizioni perdenti nella speranza di pareggiare il conto.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Da dove iniziare</h2>
                <p className="mt-3 body-lg">
                  Scrivi le tue regole di rischio su carta, prima ancora di pensare a entrate e setup. Definisci:
                  capitale totale disponibile, percentuale massima per idea, criterio di stop loss, drawdown massimo
                  personale. Poi esercitati rispettando queste regole su conto demo, fino a quando non diventano
                  automatiche. Quando passi a soldi veri, inizia con importi piccoli e controlla: la pressione psicologica
                  cambia e le regole devono restare solide.
                </p>
              </div>
            </div>
            <div className="mt-14 rounded-2xl border border-av-line bg-av-surface/40 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">Guide correlate</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/formazione-finanziaria" className="link-underline text-sm">→ Parti dalle basi dell&apos;alfabetizzazione finanziaria</Link>
                <Link href="/analisi-tecnica" className="link-underline text-sm">→ Impara a leggere grafici e livelli di ingresso/uscita</Link>
                <Link href="/psicologia-del-trading" className="link-underline text-sm">→ Scopri come rispettare le regole anche sotto stress</Link>
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
              { '@type': 'ListItem', position: 3, name: 'Gestione del rischio: la parte più importante (e meno appariscente)' },
            ],
          }),
        }}
      />
    </>
  );
}
