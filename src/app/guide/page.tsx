import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guide | AV-INVEST Research',
  description: 'Le guide di AV-INVEST Research su formazione finanziaria, analisi tecnica, gestione del rischio e psicologia del trading. Contenuti educativi chiari e senza artifici.',
  alternates: { canonical: 'https://avinvestresearch.com/guide' },
  openGraph: {
    type: 'article',
    locale: 'it_IT',
    url: 'https://avinvestresearch.com/guide',
    siteName: 'AV-INVEST RESEARCH',
    title: 'Guide | AV-INVEST Research',
    description: 'Le guide di AV-INVEST Research su formazione finanziaria, analisi tecnica, gestione del rischio e psicologia del trading. Contenuti educativi chiari e senza artifici.',
    images: [{ url: 'https://avinvestresearch.com/opengraph-image.png', width: 1200, height: 630, alt: 'AV-INVEST RESEARCH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guide | AV-INVEST Research',
    description: 'Le guide di AV-INVEST Research su formazione finanziaria, analisi tecnica, gestione del rischio e psicologia del trading. Contenuti educativi chiari e senza artifici.',
    images: ['https://avinvestresearch.com/images/av-invest-twitter-v2.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function GuidePage() {
  return (
    <>
      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 scroll-mt-28" aria-labelledby="page-heading">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">GUIDA FORMATIVA</p>
            <h1 id="page-heading" className="mt-5 heading-lg">Guide di formazione finanziaria e analisi tecnica</h1>
            <p className="mt-5 body-lg">
              Risorse educative organizzate per comprendere i mercati, costruire un metodo e prendere decisioni più consapevoli.
              Ogni guida è pensata per essere chiara, onesta e priva di scorciatoie.
            </p>
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="heading-md">Cosa trovi in queste guide</h2>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-white sm:text-base">
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Struttura progressiva, dalle basi fino agli aspetti più operativi.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Nessuna promessa di rendimento, solo spiegazioni oneste e concrete.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Focus sul metodo: regole, processi e consapevolezza delle scelte.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Riferimenti chiari al disclaimer e ai limiti dei contenuti formativi.</span></li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md">Scegli la guida che fa per te</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-av-line bg-av-surface/40 p-5">
                    <h3 className="font-display text-lg font-semibold text-white">Formazione finanziaria</h3>
                    <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
                      Le basi: alfabetizzazione finanziaria, bilancio, obiettivi, risparmio e strumenti per iniziare con piede per terra.
                    </p>
                    <Link href="/formazione-finanziaria" className="link-underline mt-3 inline-flex items-center gap-1 text-sm font-medium text-av-green">
                      Vai alla guida →
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-av-line bg-av-surface/40 p-5">
                    <h3 className="font-display text-lg font-semibold text-white">Analisi tecnica</h3>
                    <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
                      Grafici, candele, trend, supporti e resistenze, volumi e indicatori di base. Per leggere la struttura di mercato senza illusioni.
                    </p>
                    <Link href="/analisi-tecnica" className="link-underline mt-3 inline-flex items-center gap-1 text-sm font-medium text-av-green">
                      Vai alla guida →
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-av-line bg-av-surface/40 p-5">
                    <h3 className="font-display text-lg font-semibold text-white">Gestione del rischio</h3>
                    <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
                      Risk management: capitale per operazione, stop loss, sizing, drawdown e regole per proteggere il capitale nel tempo.
                    </p>
                    <Link href="/gestione-del-rischio" className="link-underline mt-3 inline-flex items-center gap-1 text-sm font-medium text-av-green">
                      Vai alla guida →
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-av-line bg-av-surface/40 p-5">
                    <h3 className="font-display text-lg font-semibold text-white">Psicologia del trading</h3>
                    <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
                      Disciplina, emozioni, bias, FOMO, loss aversion e diario operativo. Per capire quando il problema non è il grafico.
                    </p>
                    <Link href="/psicologia-del-trading" className="link-underline mt-3 inline-flex items-center gap-1 text-sm font-medium text-av-green">
                      Vai alla guida →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-14 rounded-2xl border border-av-line bg-av-surface/40 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">Guide correlate</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/formazione-finanziaria" className="link-underline text-sm">→ Inizia dalle basi con la formazione finanziaria</Link>
                <Link href="/analisi-tecnica" className="link-underline text-sm">→ Impara a leggere grafici e livelli chiave</Link>
                <Link href="/gestione-del-rischio" className="link-underline text-sm">→ Scopri come proteggere il capitale</Link>
                <Link href="/psicologia-del-trading" className="link-underline text-sm">→ Approfondisci disciplina e gestione emozionale</Link>
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
            ],
          }),
        }}
      />
    </>
  );
}
