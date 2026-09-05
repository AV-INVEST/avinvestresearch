import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Termini e condizioni',
  description:
    'Termini e condizioni di utilizzo del sito e dei servizi pubblici di AV-INVEST Research.',
  alternates: { canonical: '/termini' },
};

export default function TerminiPage() {
  return (
    <LegalLayout
      title="Termini e condizioni d'uso"
      subtitle="Condizioni generali per l'accesso e l'utilizzo del sito avinvestresearch.com e dei servizi pubblici correlati."
    >
      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Oggetto e accettazione
        </h2>
        <p>
          L&apos;accesso e l&apos;utilizzo del sito sono subordinati all&apos;accettazione e
          al rispetto dei presenti termini. La semplice navigazione sul sito implica la
          conoscenza e l&apos;accettazione integrale delle presenti condizioni. Il Titolare
          si riserva il diritto di modificare i termini in qualsiasi momento; le modifiche
          sono efficaci dal momento della pubblicazione.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Servizi e contenuti
        </h2>
        <p>
          Il sito fornisce contenuti a finalità esclusivamente formative, informative e
          educative su temi finanziari, analisi tecnica, gestione del rischio e metodo
          operativo. Nulla di quanto pubblicato costituisce consulenza finanziaria, legale,
          fiscale o di investimento, né sollecitazione al pubblico all&apos;investimento.
        </p>
        <p>
          I percorsi formativi, il Research Club e gli altri servizi a pagamento non sono
          ancora attivi: i riferimenti ai prezzi, alle caratteristiche e ai pulsanti di
          acquisto sono indicativi di una roadmap di prodotto e non costituiscono offerta
          al pubblico. Fino all&apos;attivazione ufficiale, i pagamenti e la consegna dei
          servizi non sono disponibili.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Proprietà intellettuale
        </h2>
        <p>
          Tutti i contenuti del sito (testi, grafica, loghi, icone, design, illustrazioni,
          slide, esercitazioni, nomi di prodotti e marchi) sono di proprietà del Titolare o
          dei rispettivi autori e sono tutelati dalle normative vigenti in materia di
          diritto d&apos;autore e proprietà industriale. È vietata ogni riproduzione,
          distribuzione, comunicazione al pubblico, modifica o uso commerciale non
          autorizzata, anche parziale.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Obblighi dell&apos;utente
        </h2>
        <ul className="space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            Utilizzare il sito in modo conforme a legge, morale e buon costume.
          </li>
          <li>
            Non introdurre malware, virus, codice dannoso o contenuti offensivi,
            diffamatori o illeciti.
          </li>
          <li>
            Non compiere attività volte a compromettere la sicurezza, la disponibilità o
            la regolare fruizione del sito da parte di terzi.
          </li>
          <li>
            Non compiere scraping, data-mining o estrazione automatizzata di contenuti
            senza autorizzazione scritta.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Limitazione di responsabilità
        </h2>
        <p>
          Il sito è fornito &quot;così com&apos;è&quot;. Il Titolare adotta ogni misura
          organizzativa e tecnica ragionevole per garantire la disponibilità e
          l&apos;accuratezza dei contenuti, ma non garantisce la completezza,
          l&apos;esaustività, l&apos;assenza di errori o l&apos;aggiornamento in tempo
          reale. In nessun caso il Titolare sarà responsabile per decisioni di
          investimento, operazioni di trading, perdite economiche o altri danni derivanti
          dall&apos;uso dei contenuti pubblicati.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Corsi e servizi a pagamento
        </h2>
        <p>
          All&apos;attivazione ufficiale di servizi a pagamento saranno pubblicate
          condizioni specifiche, prezzi, IVA, tempi di accesso, modalità di pagamento ed
          eventuale politica di rimborso, disponibili nella pagina di vendita e durante la
          procedura d&apos;ordine. Fino a quella data i pulsanti di acquisto rimangono
          disabilitati. In ogni caso l&apos;acquisto di un corso o di un servizio non
          attribuisce diritto a ricevere segnali, consigli personalizzati o rendimenti
          garantiti.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Link esterni
        </h2>
        <p>
          Il sito può contenere link a siti di terze parti (es. social network,
          Calendly). Il Titolare non controlla tali siti e non è responsabile per
          contenuti, prodotti, servizi o pratiche di trattamento dati ivi adottati.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          8. Legge applicabile e controversie
        </h2>
        <p>
          I presenti termini sono regolati dalla legge italiana. Per ogni controversia in
          ordine a interpretazione, validità ed esecuzione, è competente il Foro del luogo
          di residenza o domicilio dell&apos;utente, se diverso dal Foro del luogo del
          Titolare, salvo obblighi di legge in senso contrario.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          9. Contatti
        </h2>
        <p>
          Per ogni domanda relativa ai presenti termini:
        </p>
        <p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="link-underline">
            {siteConfig.contactEmail}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
