import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Psicologia del trading: disciplina ed emozioni | AV-INVEST Research',
  description: 'Psicologia del trading e investimenti: disciplina, pazienza, bias cognitivi, FOMO, loss aversion e diario operativo per migliorare nel tempo.',
  alternates: { canonical: 'https://avinvestresearch.com/psicologia-del-trading' },
  openGraph: {
    type: 'article',
    locale: 'it_IT',
    url: 'https://avinvestresearch.com/psicologia-del-trading',
    siteName: 'AV-INVEST RESEARCH',
    title: 'Psicologia del trading: disciplina ed emozioni | AV-INVEST Research',
    description: 'Psicologia del trading e investimenti: disciplina, pazienza, bias cognitivi, FOMO, loss aversion e diario operativo per migliorare nel tempo.',
    images: [{ url: 'https://avinvestresearch.com/opengraph-image.png', width: 1200, height: 630, alt: 'AV-INVEST RESEARCH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Psicologia del trading: disciplina ed emozioni | AV-INVEST Research',
    description: 'Psicologia del trading e investimenti: disciplina, pazienza, bias cognitivi, FOMO, loss aversion e diario operativo per migliorare nel tempo.',
    images: ['https://avinvestresearch.com/twitter-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function PsicologiaDelTradingPage() {
  return (
    <>
      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 scroll-mt-28" aria-labelledby="page-heading">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">GUIDA FORMATIVA</p>
            <h1 id="page-heading" className="mt-5 heading-lg">Psicologia del trading: quando il problema non è il grafico</h1>
            <p className="mt-5 body-lg">
              Molte volte il grafico è chiaro e il piano c&apos;è, ma siamo noi a non rispettarlo. La psicologia del trading
              studia proprio questo: le emozioni, i bias e le abitudini che influenzano le decisioni, anche quando pensiamo
              di essere razionali. Conoscerle è il primo passo per diventare più coerenti con il proprio metodo.
            </p>
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="heading-md">Perché la psicologia conta</h2>
                <p className="mt-3 body-lg">
                  Avere una strategia scritta non basta: bisogna essere in grado di applicarla anche quando il mercato
                  non collabora, quando si perde consecutivamente o quando tutti intorno sembrano fare il contrario.
                  La disciplina di rispettare le regole, nelle giornate difficili quanto in quelle fortunate, è quello
                  che separa un approccio serio da un gioco d&apos;azzardo mascherato.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Bias cognitivi comuni</h2>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-white sm:text-base">
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Bias di conferma: cercare solo informazioni che confermano la nostra tesi, ignorando quelle contrarie.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>FOMO: paura di perdere l&apos;occasione, quindi si entra senza piano o fuori dalle proprie regole.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Loss aversion: chiudere presto i vincitori e portare avanti perdite, per non accettare l&apos;errore.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-av-green" /><span>Overconfidence: dopo una serie di positivi ci si crede infallibili e si allentano le regole.</span></li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md">Disciplina e regole</h2>
                <p className="mt-3 body-lg">
                  La disciplina non nasce dall&apos;autocontrollo estremo: nasce da un piano operativo scritto, chiaro
                  e verificabile. Serve una checklist pre-ingresso per non saltare passaggi per fretta, una routine
                  pre e post operativa per organizzare il tempo, e regole precise per sapere quando non operare.
                  La routine protegge dalle decisioni d&apos;impulso.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Il diario operativo come strumento</h2>
                <p className="mt-3 body-lg">
                  Annotare ogni idea: tesi di fondo, motivi di ingresso e uscita, livello di stop e target, emozioni
                  provate prima, durante e dopo. Non serve a registrare solo i numeri: serve a vedere nel tempo se
                  gli errori sono casuali o ricorrenti, e a correggere i comportamenti ripetuti. Un diario fatto bene
                  è il miglior coach che puoi avere.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Errori comuni da evitare</h2>
                <p className="mt-3 body-lg">
                  Aprire posizioni per noia, perché non succede niente e ci si sente &quot;obbligati&quot; a fare qualcosa.
                  Inseguire il mercato quando ha già mosso, entrando tardi per rimpianto. Cercare la rivincita subito
                  dopo una perdita, con operazioni dettate dall&apos;emozione e non dal piano.
                </p>
              </div>
              <div>
                <h2 className="heading-md">Da dove iniziare</h2>
                <p className="mt-3 body-lg">
                  Inizia prendendoti 10 minuti alla fine di ogni sessione per annotare quello che hai fatto e perché,
                  anche se non hai aperto nessuna posizione. Scrivi il tuo piano operativo con regole semplici e verificabili,
                  e ogni settimana rivedi il diario per trovare pattern di comportamento. Non ti giudichi: osserva.
                  La consapevolezza arriva lentamente, ma quando arriva cambia il modo in cui ti approcci a tutto il resto.
                </p>
              </div>
            </div>
            <div className="mt-14 rounded-2xl border border-av-line bg-av-surface/40 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">Guide correlate</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/formazione-finanziaria" className="link-underline text-sm">→ Costruisci le basi dell&apos;educazione finanziaria</Link>
                <Link href="/analisi-tecnica" className="link-underline text-sm">→ Impara a leggere grafici e struttura di mercato</Link>
                <Link href="/gestione-del-rischio" className="link-underline text-sm">→ Definisci regole chiare per proteggere il capitale</Link>
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
              { '@type': 'ListItem', position: 3, name: 'Psicologia del trading: quando il problema non è il grafico' },
            ],
          }),
        }}
      />
    </>
  );
}
