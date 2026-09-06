import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Disclaimer finanziario',
  description:
    'Disclaimer finanziario: natura educativa dei contenuti, limiti di responsabilità, rischi di mercato e garanzie.',
  alternates: { canonical: 'https://avinvestresearch.com/disclaimer' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function DisclaimerPage() {
  const points = siteConfig.legal.extendedDisclaimer;

  return (
    <LegalLayout
      title="Disclaimer finanziario"
      subtitle="Natura dei contenuti, limiti di responsabilità, rischi di mercato e rapporto tra formazione e risultati di investimento."
    >
      <section className="rounded-2xl border border-av-green-deep/40 bg-av-green/[0.04] p-5 sm:p-6">
        <p className="text-sm font-semibold text-av-green sm:text-base">
          {siteConfig.legal.disclaimer}
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          Punti chiave
        </h2>
        <ul className="space-y-3 pl-5 marker:text-av-green [list-style:disc]">
          {points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Natura educativa e informativa
        </h2>
        <p>
          Tutti i contenuti del sito, inclusi corsi, ricerche, dispense, esempi, grafici,
          commenti, visualizzazioni, call e materiale del Research Club, sono forniti a
          scopo esclusivamente formativo, illustrativo e informativo. Non costituiscono,
          né possono essere interpretati come, consulenza finanziaria personalizzata,
          consulenza legale o fiscale, sollecitazione all&apos;investimento, suggerimento
          di strategie di investimento, promessa di rendimento o raccomandazione.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Nessun consiglio personalizzato
        </h2>
        <p>
          I contenuti non tengono conto della situazione economica, finanziaria, fiscale,
          patrimoniale o personale di alcun utente specifico. Non sostituiscono in alcun
          modo una valutazione individuale o un parere professionale ad hoc.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Rischio e perdita di capitale
        </h2>
        <p>
          I mercati finanziari presentano rischi significativi, inclusa la possibile
          perdita anche totale del capitale investito. Non esistono strategie, metodi,
          indicatori o strumenti in grado di garantire profitti o proteggere dalle perdite
          in ogni scenario di mercato. Ogni decisione di investimento comporta un grado di
          rischio che deve essere valutato consapevolmente.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Performance storiche e risultati pubblici
        </h2>
        <p>
          {siteConfig.performance.disclaimer} Le performance riportate nella sezione
          &quot;Un metodo costruito sui risultati&quot; e in altri punti del sito si
          riferiscono a un portafoglio pubblico rilevato il{' '}
          {siteConfig.performance.measuredAtLabel} e riportate unicamente a scopo
          illustrativo del metodo. Non sono proiezioni, non garantiscono risultati
          analoghi in futuro e non costituiscono elemento di previsione.
        </p>
        <p className="mt-2 text-xs font-medium text-av-muted sm:text-sm">
          {siteConfig.performance.sourceNote}
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Grafici, esempi e scenari
        </h2>
        <p>
          Grafici, simulazioni, candele, visualizzazioni, esempi operativi e scenari
          riportati sul sito possono essere rappresentazioni idealizzate o create a scopo
          didattico. Non riflettono necessariamente dati di mercato in tempo reale e non
          devono essere interpretati come suggerimenti di ingresso o uscita.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Corsi di formazione
        </h2>
        <p>
          L&apos;acquisto di un corso o di contenuti formativi, laddove e quando
          disponibile, ha ad oggetto esclusivamente materiale didattico e di formazione.
          Non dà diritto a ricevere segnali di investimento, consigli personalizzati,
          accesso a un conto di trading condiviso, performance garantite o rendimenti
          attesi. Il valore dell&apos;offerta formativa è limitato alla competenza
          trasmessa.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Valutazione autonoma e consulenza
        </h2>
        <p>
          Ogni decisione di investimento deve essere presa in autonomia, dopo aver
          verificato le proprie conoscenze, obiettivi, orizzonte temporale e propensione
          al rischio. In caso di dubbi sulle implicazioni di una scelta finanziaria,
          rivolgersi a un consulente finanziario, legale o fiscale abilitato e indipendente.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          8. Dati e fonti
        </h2>
        <p>
          I contenuti si basano su fonti ritenute attendibili al momento della
          pubblicazione. Nonostante ogni ragionevole sforzo, il Titolare non garantisce
          l&apos;accuratezza, la completezza, la veridicità o il continuo aggiornamento
          dei dati riportati.
        </p>
      </section>

      <section className="rounded-2xl border border-av-line bg-av-bg-2/40 p-5 sm:p-6">
        <p className="text-sm font-semibold text-white sm:text-base">
          Accettazione
        </p>
        <p className="mt-2 text-sm text-av-muted sm:text-base">
          L&apos;utilizzo del sito e di qualsiasi servizio pubblico implica
          l&apos;accettazione integrale del presente disclaimer.
        </p>
      </section>
    </LegalLayout>
  );
}
