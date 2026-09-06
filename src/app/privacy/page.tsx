import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Informativa sul trattamento dei dati personali di AV-INVEST Research, ai sensi del GDPR e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.',
  alternates: { canonical: 'https://avinvestresearch.com/privacy' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Informativa ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018."
    >
      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Titolare del trattamento
        </h2>
        <p>
          Il titolare del trattamento dei dati personali è {siteConfig.legal.companyName}.
          Per ogni richiesta, reclamo o esercizio di diritti puoi scrivere a:
        </p>
        <p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="link-underline">
            {siteConfig.contactEmail}
          </a>
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Tipologie di dati raccolti
        </h2>
        <ul className="space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            Dati forniti volontariamente: nome, cognome, indirizzo email, numero di telefono
            e altre informazioni trasmesse tramite messaggi, form di contatto o richieste di
            prenotazione di una call.
          </li>
          <li>
            Dati di navigazione raccolti automaticamente: tipo di browser, sistema operativo,
            pagine visitate, orario di accesso e indirizzo IP in forma pseudonimizzata o
            aggregata, ove necessario.
          </li>
          <li>
            Preferenze sull&apos;utilizzo dei cookie: memorizzate in locale come descritto
            nella Cookie Policy.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Finalità e base giuridica
        </h2>
        <ul className="space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Risposta a richieste e contatti.</strong>{' '}
            Trattiamo i dati per rispondere a richieste di informazioni, prenotazioni di
            call orientative e richieste di supporto. Base giuridica: misure precontrattuali
            o risposta a richieste dell&apos;interessato (art. 6.1.b GDPR).
          </li>
          <li>
            <strong className="text-white">Funzionamento tecnico e sicurezza del sito.</strong>{' '}
            Gestione di sessione, log di sistema, misure anti-abuso. Base giuridica:
            legittimo interesse del Titolare (art. 6.1.f GDPR).
          </li>
          <li>
            <strong className="text-white">Comunicazioni informative e newsletter.</strong>{' '}
            Invio di aggiornamenti su nuovi contenuti, servizi o eventi, solo previo
            consenso esplicito. Base giuridica: consenso (art. 6.1.a GDPR).
          </li>
          <li>
            <strong className="text-white">Obblighi legali.</strong> Conservazione e
            comunicazione di dati in osservanza di obblighi fiscali, contabili e normativi
            applicabili. Base giuridica: obbligo legale (art. 6.1.c GDPR).
          </li>
          <li>
            <strong className="text-white">Analisi aggregate.</strong> Miglioramento di
            contenuti ed esperienza sul sito tramite statistiche anonime, con consenso ove
            richiesto dalla normativa.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Conservazione dei dati
        </h2>
        <p>
          I dati sono conservati per il tempo strettamente necessario alle finalità per cui
          sono stati raccolti e nel rispetto dei termini di legge applicabili:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>Dati di contatto: per la durata della relazione e fino a 24 mesi dall&apos;ultimo scambio.</li>
          <li>Preferenze cookie e consenso: per la durata indicata nella Cookie Policy.</li>
          <li>Dati fiscali, contabili o documentali: per i termini obbligatori di legge.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Destinatari e trasferimenti
        </h2>
        <p>
          I dati sono trattati da persone autorizzate del Titolare e da fornitori di servizi
          strumentali (es. hosting, comunicazione email, gestione delle prenotazioni). I
          fornitori operano come responsabili del trattamento, se nominati, o in qualità di
          titolari autonomi. Non sono effettuati trasferimenti extra UE senza adeguate
          garanzie. Calendly, quando utilizzato come link esterno, opera come titolare
          autonomo; la sua informativa è consultabile sul sito ufficiale.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Diritti dell&apos;interessato
        </h2>
        <p>
          In qualsiasi momento puoi chiedere al Titolare: accesso ai dati, rettifica o
          cancellazione, limitazione del trattamento, opposizione al trattamento, nonché la
          portabilità, ove applicabile. Puoi inoltre revocare il consenso in qualsiasi
          momento, senza pregiudicare la liceità dei trattamenti effettuati prima della
          revoca, e proporre reclamo al Garante per la protezione dei dati personali. Per
          esercitare i diritti scrivi a:
        </p>
        <p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="link-underline">
            {siteConfig.contactEmail}
          </a>
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Informazioni aggiuntive
        </h2>
        <p>
          La presente informativa descrive il trattamento dei dati in relazione al sito e
          ai servizi pubblici oggi disponibili. Per servizi aggiuntivi (corsi a pagamento,
          Research Club, aree riservate) sono fornite specifiche informative integrate
          contestualmente all&apos;attivazione o all&apos;acquisto.
        </p>
      </section>
    </LegalLayout>
  );
}
