import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Informativa sul trattamento dei dati personali di AV-INVEST Research. Bozza, richiede revisione legale.',
  alternates: { canonical: '/privacy' },
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
          Il titolare del trattamento dei dati personali è AV-INVEST Research, con sede in{' '}
          [INDIRIZZO SEDE LEGALE — DA COMPLETARE], P.IVA [P.IVA — DA COMPLETARE], Codice
          Fiscale [CODICE FISCALE — DA COMPLETARE] (di seguito &quot;Titolare&quot;).
        </p>
        <p>
          Contatti per richieste sulla privacy:{' '}
          <a href="mailto:info@avinvestresearch.com" className="link-underline">
            info@avinvestresearch.com
          </a>
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Tipologie di dati raccolti
        </h2>
        <p>
          Potremmo raccogliere: dati forniti volontariamente dall&apos;interessato (nome,
          cognome, email, numero di telefono, informazioni trasmesse tramite form o
          richieste di contatto); dati di navigazione raccolti automaticamente (indirizzo
          IP, tipo di browser, sistema operativo, pagine visitate, orario di accesso);
          cookie e tecnologie simili, come descritto nella Cookie Policy.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Finalità e base giuridica
        </h2>
        <ul className="space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            Erogazione dei servizi richiesti (contatti, prenotazione call, iscrizione ai
            percorsi): base giuridica contratto o misure precontrattuali su richiesta
            dell&apos;interessato (art. 6.1.b GDPR).
          </li>
          <li>
            Invio di comunicazioni informative e newsletter su prodotti, servizi ed
            eventi: base giuridica consenso esplicito (art. 6.1.a GDPR).
          </li>
          <li>
            Adempimenti di obblighi di legge (fiscali, contabili, normativi): base
            giuridica obbligo legale (art. 6.1.c GDPR).
          </li>
          <li>
            Legittimo interesse del Titolare a sicurezza, analisi statistiche aggregate e
            miglioramento del servizio (art. 6.1.f GDPR).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Conservazione dei dati
        </h2>
        <p>
          I dati sono conservati per il tempo strettamente necessario alle finalità per
          cui sono stati raccolti e comunque in osservanza dei termini di legge applicabili.
          In particolare: dati di contatto per la durata della relazione e per un massimo
          di 24 mesi dopo l&apos;ultimo contatto; dati fiscali e contabili per i termini
          previsti dalla normativa vigente.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Diritti dell&apos;interessato
        </h2>
        <p>
          L&apos;interessato ha diritto di chiedere al Titolare l&apos;accesso ai dati,
          la rettifica o la cancellazione, la limitazione del trattamento, l&apos;opposizione
          al trattamento, nonché la portabilità, ove applicabile. Ha inoltre diritto di
          revocare il consenso in qualsiasi momento, senza pregiudicare la liceità del
          trattamento basata sul consenso prima della revoca, e di proporre reclamo al
          Garante per la protezione dei dati personali.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Ultimo aggiornamento
        </h2>
        <p>
          La presente informativa è in bozza e sarà aggiornata contestualmente alla
          messa online definitiva del servizio. Ultima revisione: [DATA — DA COMPLETARE].
        </p>
      </section>
    </LegalLayout>
  );
}
