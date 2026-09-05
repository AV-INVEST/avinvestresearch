import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Disclaimer finanziario',
  description:
    'Disclaimer finanziario: i contenuti di AV-INVEST Research hanno finalità esclusivamente educative.',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer finanziario"
      subtitle="Informazioni essenziali sulla natura dei contenuti e sui limiti di responsabilità."
    >
      <section className="rounded-2xl border border-av-green-deep/40 bg-av-green/[0.04] p-5 sm:p-6">
        <p className="text-sm font-semibold text-av-green sm:text-base">
          {siteConfig.legal.disclaimer}
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Natura dei contenuti
        </h2>
        <p>
          Tutti i contenuti pubblicati sul sito, inclusi corsi, ricerche, dispense,
          esempi, grafici, commenti, call e materiale del Research Club, sono forniti a
          scopo esclusivamente formativo, illustrativo e informativo. Non costituiscono,
          né possono essere interpretati come, consulenza finanziaria personalizzata,
          consulenza legale o fiscale, sollecitazione all&apos;investimento, suggerimento
          di strategie di investimento o promessa di rendimento.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Nessuna promessa di risultati
        </h2>
        <p>
          I mercati finanziari presentano rischi significativi, inclusa la perdita anche
          totale del capitale investito. Non esistono strategie, metodi o indicatori in
          grado di garantire profitti o proteggere dalle perdite in ogni scenario di
          mercato. Gli esempi, le simulazioni e i casi discussi hanno solo funzione
          didattica e non rappresentano alcuna garanzia di performance futura.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Valutazione autonoma e responsabilità
        </h2>
        <p>
          Ogni decisione di investimento deve essere presa in autonomia, dopo aver
          verificato attentamente le proprie conoscenze, obiettivi, orizzonte temporale,
          propensione al rischio e situazione economica e finanziaria personale. Il
          Titolare non si assume alcuna responsabilità per decisioni, operazioni o
          risultati conseguiti dall&apos;utente sulla base dei contenuti divulgati.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Consulenza professionale
        </h2>
        <p>
          In caso di dubbi sulle implicazioni di una scelta finanziaria, l&apos;utente
          è invitato a rivolgersi a un consulente finanziario, legale o fiscale
          abilitato e indipendente, in grado di valutare la sua situazione personale.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Dati e fonti
        </h2>
        <p>
          I contenuti si basano su fonti ritenute attendibili al momento della
          pubblicazione. Nonostante ogni ragionevole sforzo, il Titolare non garantisce
          l&apos;accuratezza, la completezza, la veridicità o l&apos;aggiornamento dei
          dati riportati. Grafici, prezzi e indicatori sono presentati a scopo didattico
          e decorativo e non costituiscono dati di mercato in tempo reale.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Accettazione
        </h2>
        <p>
          L&apos;utilizzo del sito e dei servizi implica l&apos;accettazione integrale
          del presente disclaimer.
        </p>
      </section>
    </LegalLayout>
  );
}
