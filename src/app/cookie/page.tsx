import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Informativa sull\'utilizzo dei cookie sul sito AV-INVEST Research. Bozza, richiede revisione legale.',
  alternates: { canonical: '/cookie' },
};

export default function CookiePage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Informazioni sui cookie e tecnologie simili utilizzati sul sito avinvestresearch.com."
    >
      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Cosa sono i cookie
        </h2>
        <p>
          I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo
          dell&apos;utente, dove vengono memorizzati per essere poi ritrasmessi ai siti
          stessi alla visita successiva o a siti terzi.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Tipologie di cookie utilizzati
        </h2>
        <ul className="space-y-3 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Cookie tecnici essenziali:</strong> necessari
            per il corretto funzionamento del sito (navigazione, accesso ad aree riservate,
            sicurezza). Non richiedono consenso.
          </li>
          <li>
            <strong className="text-white">Cookie analitici:</strong> se installati, per
            raccogliere informazioni aggregate sulle visite al fine di migliorare il sito.
            Potranno essere utilizzati solo previo consenso dell&apos;utente, ove previsto.
          </li>
          <li>
            <strong className="text-white">Cookie di profilazione e terze parti:</strong>{' '}
            potranno essere installati in futuro per attività di marketing e remarketing,
            solo previo consenso esplicito dell&apos;utente.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Gestione del consenso
        </h2>
        <p>
          Al primo accesso al sito viene presentato un banner informativo attraverso cui
          l&apos;utente può accettare o rifiutare categorie di cookie non essenziali,
          oltre a modificare le preferenze in qualsiasi momento tramite l&apos;apposito
          link nel footer.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Come disabilitare i cookie
        </h2>
        <p>
          È possibile disabilitare i cookie direttamente dalle impostazioni del browser:
          istruzioni disponibili sui siti ufficiali dei principali browser (Chrome,
          Firefox, Safari, Edge). La disabilitazione potrebbe impedire alcune funzionalità
          del sito.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Ultimo aggiornamento
        </h2>
        <p>
          Documento in bozza. Sarà integrato con l&apos;elenco specifico dei cookie
          installati, fornitori terzi, tempi di conservazione e modalità del banner
          prima della messa online. Ultima revisione: [DATA — DA COMPLETARE].
        </p>
      </section>
    </LegalLayout>
  );
}
