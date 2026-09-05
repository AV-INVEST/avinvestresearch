import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termini e condizioni',
  description:
    'Termini e condizioni di utilizzo del sito e dei servizi di AV-INVEST Research. Bozza, richiede revisione legale.',
  alternates: { canonical: '/termini' },
};

export default function TerminiPage() {
  return (
    <LegalLayout
      title="Termini e condizioni d'uso"
      subtitle="Condizioni generali per l'accesso e l'utilizzo del sito avinvestresearch.com e dei servizi correlati."
    >
      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Oggetto e accettazione
        </h2>
        <p>
          L&apos;accesso e l&apos;utilizzo del sito sono subordinati all&apos;accettazione
          e al rispetto dei presenti termini. L&apos;utilizzo del sito implica la
          conoscenza e l&apos;accettazione integrale. Il Titolare si riserva il diritto
          di modificare i termini in qualsiasi momento; le modifiche sono efficaci dal
          momento della pubblicazione.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Servizi e contenuti
        </h2>
        <p>
          Il sito fornisce contenuti a finalità esclusivamente informative ed educative
          su temi finanziari, analisi tecnica e metodo operativo. Non costituisce in
          nessun caso consulenza finanziaria, legale, fiscale o di investimento, né
          sollecitazione al pubblico all&apos;investimento.
        </p>
        <p>
          I percorsi formativi, il Research Club e gli altri servizi saranno attivati in
          fasi successive; fino all&apos;attivazione ufficiale l&apos;accesso ai contenuti
          pagati non è disponibile e i pulsanti di acquisto sono indicativi.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Proprietà intellettuale
        </h2>
        <p>
          Tutti i contenuti del sito (testi, grafica, loghi, icone, video, dispense,
          slide, esercitazioni, design) sono di proprietà del Titolare o dei rispettivi
          autori e sono tutelati dalle normative sul diritto d&apos;autore. È vietata
          ogni riproduzione, distribuzione, modifica o uso commerciale non autorizzato,
          anche parziale.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Obblighi dell&apos;utente
        </h2>
        <p>
          L&apos;utente si impegna a utilizzare il sito e i servizi in modo conforme a
          legge, morale e buon costume, a non ledere i diritti altrui, a non introdurre
          malware o effettuare attività che possano danneggiare o compromettere il
          funzionamento del sito.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Limitazione di responsabilità
        </h2>
        <p>
          Il sito è fornito &quot;così com&apos;è&quot;. Il Titolare adotta ogni misura
          ragionevole per l&apos;accuratezza dei contenuti ma non garantisce la completezza,
          l&apos;esaustività, l&apos;aggiornamento né l&apos;assenza di errori. In nessun
          caso il Titolare sarà responsabile per decisioni di investimento o finanziarie
          prese dall&apos;utente sulla base dei contenuti pubblicati.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Acquisti e pagamenti
        </h2>
        <p>
          In fase di attivazione dei servizi a pagamento, le modalità di acquisto, prezzi,
          IVA, rimborsi e caratteristiche saranno dettagliate in apposite pagine e nel
          processo di checkout, prima della conferma d&apos;ordine. I pagamenti saranno
          gestiti tramite gateway sicuri.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Foro competente
        </h2>
        <p>
          I presenti termini sono regolati dalla legge italiana. Per ogni controversia
          relativa all&apos;interpretazione, esecuzione e validità dei presenti termini è
          competente in via esclusiva il Foro di [COMUNE SEDE — DA COMPLETARE].
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          8. Ultimo aggiornamento
        </h2>
        <p>
          Documento in bozza. Ultima revisione: [DATA — DA COMPLETARE].
        </p>
      </section>
    </LegalLayout>
  );
}
