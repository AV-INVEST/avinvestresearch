import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

const privacyContact = 'avinvestresearch@gmail.com';

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
          1. Titolare del trattamento e contatto privacy
        </h2>
        <p>
          Il titolare del trattamento dei dati personali &egrave;{' '}
          <strong className="text-white">{siteConfig.legal.companyName}</strong>.
          Per ogni domanda, reclamo, richiesta di informazioni o esercizio
          dei diritti di cui al GDPR puoi scrivere esclusivamente al seguente
          indirizzo email dedicato:
        </p>
        <p>
          <a href={`mailto:${privacyContact}`} className="link-underline">
            {privacyContact}
          </a>
        </p>
        <p className="mt-2">
          Tutte le richieste relative alla privacy sono evase direttamente dal
          Titolare. Non &egrave; stato nominato un Responsabile della Protezione
          dei Dati (DPO) in quanto non obbligatorio ai sensi dell&apos;art. 37 GDPR.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Ambito di applicazione
        </h2>
        <p>
          La presente informativa descrive il trattamento dei dati personali
          effettuato dal Titolare in relazione a:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            Navigazione e utilizzo del sito avinvestresearch.com, incluse le
            pagine informative e i contenuti pubblici.
          </li>
          <li>
            Autenticazione con account Google e accesso all&apos;area membri
            riservata.
          </li>
          <li>
            Acquisto dei corsi digitali AV Foundations e AV Trading Lab con
            pagamento a tantum.
          </li>
          <li>
            Sottoscrizione e gestione dell&apos;abbonamento mensile ad
            AV Research Club, incluso l&apos;accesso ai PDF e al materiale
            riservato.
          </li>
          <li>
            Tracciamento del progresso personale nell&apos;area membri.
          </li>
          <li>
            Prenotazione di call informative tramite link a Calendly.
          </li>
          <li>
            Richieste di contatto, supporto o informazioni inviate tramite
            email.
          </li>
          <li>
            Adempimenti di legge, contabili e fiscali conseguenti alle
            transazioni e ai rapporti con gli utenti.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Tipologie di dati raccolti e modalit&agrave;
        </h2>
        <h3 className="mt-3 font-display font-semibold text-white sm:text-lg">
          3.1 Dati forniti volontariamente dall&apos;utente
        </h3>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Dati account Google</strong>:
            al momento dell&apos;autenticazione per l&apos;accesso all&apos;area
            membri, il Titolare riceve e memorizza da Google Identity Services
            le seguenti informazioni minime: nome visualizzato, indirizzo
            email associato all&apos;account Google, identificativo univoco
            Google dell&apos;utente (sub) ed eventualmente l&apos;immagine del
            profilo, se resa disponibile da Google e dall&apos;utente.
          </li>
          <li>
            <strong className="text-white">Dati di acquisto e transazione</strong>:
            in occasione dell&apos;acquisto di corsi o della sottoscrizione
            del Research Club, il Titolare riceve da Stripe le informazioni
            necessarie alla gestione dell&apos;ordine: identificativo cliente
            Stripe, email associata al pagamento, oggetto dell&apos;acquisto,
            importo pagato, valuta, data e ora della transazione, stato del
            pagamento e, per gli abbonamenti, identificativo della
            sottoscrizione e relativo stato (attiva, annullata, scaduta, in
            ritardo di pagamento).
          </li>
          <li>
            <strong className="text-white">Dati Calendly</strong>: quando
            l&apos;utente prenota una call tramite il link esterno a Calendly,
            nome, cognome, indirizzo email, numero di telefono e ogni altro
            campo compilato nel form di prenotazione sono trattati da Calendly
            come titolare autonomo; una copia delle informazioni della
            prenotazione &egrave; ricevuta dal Titolare via email per la sola
            gestione dell&apos;appuntamento.
          </li>
          <li>
            <strong className="text-white">Dati di contatto</strong>: nome,
            cognome, indirizzo email e contenuto dei messaggi nel caso di
            richieste informative o di supporto inviate direttamente dal
            Titolare.
          </li>
        </ul>

        <h3 className="mt-4 font-display font-semibold text-white sm:text-lg">
          3.2 Dati raccolti automaticamente
        </h3>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Dati di navigazione e log tecnici</strong>:
            nell&apos;ambito del normale funzionamento e della sicurezza
            del Sito, i sistemi di hosting Vercel e l&apos;infrastruttura
            tecnica possono registrare in forma pseudonimizzata: indirizzo
            IP (in genere troncato o mascherato dopo breve tempo), tipo di
            dispositivo, sistema operativo, tipo e versione del browser,
            pagina di provenienza, orario e data della richiesta, URL delle
            pagine visitate e durata della sessione.
          </li>
          <li>
            <strong className="text-white">Dati di progresso area membri</strong>:
            per migliorare l&apos;esperienza formativa, vengono memorizzati
            nel database Neon i progressi dell&apos;utente all&apos;interno
            dei corsi (lezioni completate, timestamp di ultima visualizzazione,
            segnalibri ed eventuali note o stati di avanzamento personalizzati).
          </li>
          <li>
            <strong className="text-white">Preferenze cookie</strong>: lo stato
            del consenso o rifiuto alle singole categorie di cookie, come
            descritto nella Cookie Policy, viene memorizzato localmente sul
            dispositivo tramite localStorage di primo partito.
          </li>
        </ul>

        <h3 className="mt-4 font-display font-semibold text-white sm:text-lg">
          3.3 Dati NON raccolti direttamente dal Titolare
        </h3>
        <p>
          Il Titolare non memorizza direttamente sui propri server numeri
          completi di carta di credito, IBAN o dettagli degli strumenti di
          pagamento: tali dati sono trattati esclusivamente da Stripe sui
          propri sistemi sicuri (cfr. paragrafo 6). Il Titolare non effettua
          profilazione automatizzata dell&apos;utente ai sensi dell&apos;art. 22
          GDPR, n&eacute; produce scoring di solvibilit&agrave; o valutazioni
          personali automatizzate con effetti giuridici o analoghi.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Finalit&agrave; del trattamento e base giuridica
        </h2>
        <p>
          Ciascun trattamento &egrave; effettuato solo se esiste una base
          giuridica valida ai sensi dell&apos;art. 6 GDPR. Di seguito il
          dettaglio:
        </p>
        <ul className="mt-3 space-y-3 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">A. Esecuzione di un contratto o misure precontrattuali (art. 6.1.b GDPR)</strong>
            <br />
            - Registrazione e mantenimento dell&apos;account Google per l&apos;accesso all&apos;area membri.
            <br />
            - Gestione degli ordini di acquisto dei corsi digitali e consegna del relativo accesso.
            <br />
            - Attivazione, gestione e rinnovo dell&apos;abbonamento mensile al Research Club.
            <br />
            - Gestione del Customer Portal Stripe e dello stato di abbonamento.
            <br />
            - Tracciamento del progresso personale nei corsi all&apos;interno dell&apos;area membri.
            <br />
            - Gestione delle prenotazioni di call informative ricevute tramite Calendly.
            <br />
            - Supporto tecnico e rispondenza a richieste strettamente connesse al servizio acquistato o sottoscritto.
          </li>
          <li>
            <strong className="text-white">B. Adempimento di obblighi legali (art. 6.1.c GDPR)</strong>
            <br />
            - Conservazione di documenti fiscali, contabili e amministrativi relativi a transazioni di vendita o abbonamenti, per i termini di legge applicabili (inclusi, tra gli altri, quelli fiscali e civilistici in materia di conservazione scritture contabili elettroniche e fatturazione).
            <br />
            - Collaborazione con autorit&agrave; amministrative, giudiziarie o di controllo, per richieste formalmente motivate e nei limiti di legge.
            <br />
            - Adempimenti connessi alla normativa antiriciclaggio, ove applicabili.
          </li>
          <li>
            <strong className="text-white">C. Legittimo interesse del Titolare (art. 6.1.f GDPR)</strong>
            <br />
            - Gestione di log tecnici, sicurezza anti-abuso e prevenzione di frodi o accessi non autorizzati al Sito e ai servizi.
            <br />
            - Miglioramento dell&apos;esperienza utente e analisi aggregate anonime di utilizzo, quando non necessitano di consenso specifico.
            <br />
            - Invio di comunicazioni di servizio relative a manutenzioni, modifiche sostanziali dei servizi, aggiornamenti dello stato abbonamento o interruzioni programmate, senza finalit&agrave; promozionale.
            <br />
            - Tutela dei diritti del Titolare in sede giudiziale o stragiudiziale, per contestazioni, reclami o controversie con l&apos;utente o terzi.
            <br />
            <em className="text-xs text-av-muted">
              L&apos;utente pu&ograve; opporsi in qualsiasi momento al trattamento basato su legittimo interesse, scrivendo all&apos;indirizzo privacy indicato nel paragrafo 1, salvo cause sopravvenute che rendano obbligatoria la prosecuzione del trattamento.
            </em>
          </li>
          <li>
            <strong className="text-white">D. Consenso esplicito dell&apos;interessato (art. 6.1.a GDPR)</strong>
            <br />
            - Installazione di cookie non necessari (categorie preferenze, analitici, marketing) dopo la raccolta del consenso tramite il banner, ai sensi e nei modi descritti nella Cookie Policy.
            <br />
            - Eventuali comunicazioni promozionali, newsletter o campagne di marketing diretto, se e quando attivate e solo dopo consenso esplicito e specifico.
            <br />
            <em className="text-xs text-av-muted">
              Il consenso pu&ograve; essere revocato in qualsiasi momento senza pregiudicare la liceit&agrave; dei trattamenti effettuati prima della revoca.
            </em>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Conservazione dei dati
        </h2>
        <p>
          I dati sono conservati per il tempo strettamente necessario alle
          finalit&agrave; per cui sono stati raccolti e in osservanza ai
          termini di conservazione obbligatori previsti dalla legge. In
          sintesi:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Account e dati area membri</strong>:
            conservati per tutta la durata del rapporto e fino a 36 mesi dopo
            la disdetta definitiva dell&apos;abbonamento o la cancellazione
            volontaria dell&apos;account da parte dell&apos;utente, salvo
            necessit&agrave; di conservazione per obblighi legali o per
            l&apos;accertamento, esercizio o difesa di un diritto in sede
            giudiziale.
          </li>
          <li>
            <strong className="text-white">Dati di acquisto e abbonamento</strong>:
            le informazioni relative a ordini, transazioni e stato
            sottoscrizione sono conservate per il tempo necessario alla
            gestione amministrativa e, successivamente, per i termini obbligatori
            di legge (in genere 10 anni per documenti fiscali e scritture
            contabili, salvo diverse disposizioni specifiche).
          </li>
          <li>
            <strong className="text-white">Progressi e preferenze utente</strong>:
            conservati per tutta la durata dell&apos;account attivo o fino a
            richiesta di cancellazione.
          </li>
          <li>
            <strong className="text-white">Dati di contatto e richieste</strong>:
            conservati per il tempo necessario a evadere la richiesta e,
            successivamente, per massimo 24 mesi per esigenze di follow-up o
            archivio amministrativo.
          </li>
          <li>
            <strong className="text-white">Prenotazioni Calendly</strong>:
            copie ricevute dal Titolare conservate per la durata necessaria
            alla gestione dell&apos;appuntamento e per massimo 12 mesi dopo
            la data della call per esigenze amministrative e di follow-up.
          </li>
          <li>
            <strong className="text-white">Log tecnici e dati di sicurezza</strong>:
            conservati per il tempo minimo necessario a finalit&agrave; di
            sicurezza, prevenzione frodi e troubleshooting, in genere non
            superiore a 90 giorni, salvo casi specifici di investigazione
            o contestazione.
          </li>
          <li>
            <strong className="text-white">Consensi cookie</strong>: memorizzati
            localmente per 12 mesi, come descritto nella Cookie Policy.
          </li>
        </ul>
        <p className="mt-2 text-xs text-av-muted sm:text-sm">
          Allo scadere dei termini di conservazione, i dati vengono eliminati
          in modo definitivo, resi anonimi in modo irreversibile o isolati in
          archivio freddo ai soli fini di conservazione legale, secondo quanto
          applicabile.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Fornitori terzi, responsabili del trattamento e trasferimenti
        </h2>
        <p>
          Il Titolare condivide i dati personali esclusivamente con fornitori
          e partner strumentali, necessari all&apos;erogazione dei servizi,
          operanti come responsabili del trattamento ai sensi dell&apos;art.
          28 GDPR o come titolari autonomi secondo il proprio ruolo. Di seguito
          l&apos;elenco dei fornitori attualmente utilizzati:
        </p>
        <ul className="mt-3 space-y-3 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Stripe Payments Europe, Ltd. / Stripe, Inc.</strong>
            <br />
            Ruolo: titolare autonomo per il servizio di pagamento.
            <br />
            Trattamento: gestione completa dei pagamenti, metodi di pagamento,
            sottoscrizioni, fatturazione elettronica, Customer Portal, gestione
            delle frodi e adempimenti fiscali connessi.
            <br />
            Sede: Irlanda / Stati Uniti. Trasferimento extra UE: pu&ograve;
            avvenire verso gli Stati Uniti sotto copertura delle clausole
            contrattuali standard (SCCs) e delle misure supplementari adottate
            da Stripe. Informativa:{' '}
            <a href="https://stripe.com/it/privacy" target="_blank" rel="noopener noreferrer" className="link-underline">
              stripe.com/it/privacy
            </a>.
          </li>
          <li>
            <strong className="text-white">Google Ireland Limited / Google LLC (Google Identity / Google OAuth)</strong>
            <br />
            Ruolo: titolare autonomo per il servizio di autenticazione.
            <br />
            Trattamento: verifica dell&apos;identit&agrave; utente tramite
            account Google e comunicazione dei dati minimi di profilo al
            momento del login.
            <br />
            Sede: Irlanda / Stati Uniti. Trasferimento extra UE: disciplinato
            dalle decisioni di adeguatezza e dalle clausole contrattuali
            standard di Google. Informativa:{' '}
            <a href="https://policies.google.com/privacy?hl=it" target="_blank" rel="noopener noreferrer" className="link-underline">
              policies.google.com/privacy
            </a>.
          </li>
          <li>
            <strong className="text-white">Calendly, LLC</strong>
            <br />
            Ruolo: titolare autonomo per il servizio di prenotazione call.
            <br />
            Trattamento: dati del form di prenotazione (nome, email, telefono,
            note, data/ora appuntamento) sono gestiti direttamente sui server
            di Calendly.
            <br />
            Sede: Stati Uniti. L&apos;utente viene instradato al sito Calendly
            tramite link esterno; qualsiasi dato inserito sul sito Calendly
            ricade sotto la sua esclusiva informativa. Informativa:{' '}
            <a href="https://calendly.com/it/privacy" target="_blank" rel="noopener noreferrer" className="link-underline">
              calendly.com/it/privacy
            </a>.
          </li>
          <li>
            <strong className="text-white">Vercel, Inc.</strong>
            <br />
            Ruolo: responsabile del trattamento (con DPA in essere) per
            l&apos;infrastruttura di hosting.
            <br />
            Trattamento: deployment e hosting del Sito, CDN, edge functions,
            log di sistema, metriche tecniche e report di errore.
            <br />
            Sede: Stati Uniti. I dati possono transitare o essere replicati in
            data center UE o extra UE; i trasferimenti sono coperti da
            adeguate garanzie (clausole contrattuali standard e misure
            supplementari secondo le informative ufficiali di Vercel).
            Informativa:{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="link-underline">
              vercel.com/legal/privacy-policy
            </a>.
          </li>
          <li>
            <strong className="text-white">Neon Serverless Inc. / Neon Technologies, s.r.o.</strong>
            <br />
            Ruolo: responsabile del trattamento (con DPA) per il database
            PostgreSQL.
            <br />
            Trattamento: memorizzazione persistente di account, acquisti,
            stato abbonamento, progressi area membri e dati amministrativi
            minimi.
            <br />
            Sede: Repubblica Ceca / Stati Uniti. Dati replicati in area
            europea con backup in regioni sicure. Informativa:{' '}
            <a href="https://neon.tech/privacy" target="_blank" rel="noopener noreferrer" className="link-underline">
              neon.tech/privacy
            </a>.
          </li>
          <li>
            <strong className="text-white">Vercel Blob (storage documentale)</strong>
            <br />
            Ruolo: responsabile del trattamento per lo storage privato.
            <br />
            Trattamento: archiviazione e distribuzione sicura dei PDF e dei
            documenti riservati del Research Club. I PDF sono distribuiti
            tramite URL firmati con scadenza, senza accesso diretto pubblico.
            <br />
            Sede e trasferimenti: come Vercel Inc., supra.
          </li>
        </ul>
        <p className="mt-3">
          Il Titolare non trasferisce dati personali verso paesi terzi al di
          fuori dei casi descritti nel presente paragrafo e, in ogni caso,
          solo sotto copertura di una decisione di adeguatezza, di clausole
          contrattuali standard approvate dalla Commissione UE o di altre
          garanzie adeguate riconosciute dal GDPR.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Categorie di destinatari dei dati
        </h2>
        <p>
          Ferme restando le comunicazioni ai fornitori descritti al paragrafo 6,
          i dati personali possono essere comunicati:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            A consulenti legali, fiscali, contabili o revisori, per finalit&agrave;
            connesse alla gestione del rapporto, alla difesa di diritti o
            all&apos;adempimento di obblighi di legge.
          </li>
          <li>
            Ad autorit&agrave; amministrative, giudiziarie, di controllo o di
            polizia, quando richiesto da disposizioni di legge imperative o
            da provvedimenti formali e motivati.
          </li>
        </ul>
        <p className="mt-2">
          Nessun dato personale &egrave; oggetto di diffusione verso soggetti
          indeterminati, salvo esplicito consenso dell&apos;interessato.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          8. Diritti dell&apos;interessato
        </h2>
        <p>
          In qualunque momento, e secondo le modalit&agrave; e i limiti previsti
          dal GDPR, l&apos;utente pu&ograve; esercitare nei confronti del
          Titolare i seguenti diritti, scrivendo all&apos;indirizzo email
          privacy indicato nel paragrafo 1:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Diritto di accesso (art. 15 GDPR)</strong>:
            ottenere conferma dell&apos;esistenza di un trattamento di dati
            che lo riguardano e riceverne copia, unitamente alle informazioni
            accessorie previste dalla normativa.
          </li>
          <li>
            <strong className="text-white">Diritto di rettifica (art. 16 GDPR)</strong>:
            ottenere la correzione di dati inesatti o incompleti che lo
            riguardano, es. aggiornamento dell&apos;indirizzo email o del
            nome visualizzato.
          </li>
          <li>
            <strong className="text-white">Diritto alla cancellazione (art. 17 GDPR)</strong>:
            ottenere la rimozione dei dati quando sussiste una delle cause
            previste (trattamento non pi&ugrave; necessario, revoca del consenso,
            opposizione valida, trattamento illecito, obbligo legale di
            cancellazione), fatti salvi i trattamenti che il Titolare deve
            mantenere per obbligo di legge o per difesa di un proprio diritto.
          </li>
          <li>
            <strong className="text-white">Diritto alla limitazione del trattamento (art. 18 GDPR)</strong>:
            richiedere la limitazione in caso di contestazione sull&apos;esattezza
            dei dati, sulla liceit&agrave; del trattamento, sulla necessit&agrave;
            dei dati per le finalit&agrave; dichiarate o in attesa di esito
            di una opposizione al trattamento.
          </li>
          <li>
            <strong className="text-white">Diritto alla portabilit&agrave; (art. 20 GDPR)</strong>:
            ricevere i dati forniti al Titolare, basati su contratto o su
            consenso, in un formato strutturato, di uso comune e leggibile
            da dispositivo automatico, o richiederne la trasmissione diretta
            a un altro titolare, ove tecnicamente fattibile.
          </li>
          <li>
            <strong className="text-white">Diritto di opposizione (art. 21 GDPR)</strong>:
            opporsi, in qualsiasi momento, al trattamento di dati che lo
            riguardano basato su legittimo interesse, per motivi connessi alla
            propria situazione particolare, salvo che il Titolare dimostri
            l&apos;esistenza di motivi legittimi imperiosi che prevalgano
            sugli interessi, sui diritti e sulle libert&agrave;
            dell&apos;interessato oppure l&apos;accertamento, l&apos;esercizio
            o la difesa di un diritto in sede giudiziale.
          </li>
          <li>
            <strong className="text-white">Revoca del consenso (art. 7.3 GDPR)</strong>:
            revocare in qualsiasi momento un consenso precedentemente prestato
            (es. per cookie non necessari o per comunicazioni promozionali),
            senza incidere sulla liceit&agrave; dei trattamenti effettuati
            prima della revoca.
          </li>
          <li>
            <strong className="text-white">Diritto di proporre reclamo (art. 77 GDPR)</strong>:
            proporre reclamo dinanzi al Garante per la Protezione dei Dati
            Personali (Italia) o ad altra autorit&agrave; di controllo UE
            competente, qualora ritenga che il trattamento dei propri dati
            violi le disposizioni del GDPR.
          </li>
        </ul>
        <p className="mt-3">
          Le richieste sono evase, salvo casi complessi, entro 30 giorni dal
          ricevimento; il periodo pu&ograve; essere prorogato di altri 60
          giorni in caso di necessit&agrave;, dandone comunicazione motivata
          all&apos;utente. Il Titolare si riserva di richiedere un documento
          di identit&agrave; per verificare la legittimazione del richiedente,
          in caso di dubbi.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          9. Minorenni
        </h2>
        <p>
          Il Sito e i suoi servizi sono rivolti a persone maggiorenni. Non
          vengono raccolti consapevolmente dati personali di soggetti di et&agrave;
          inferiore a 18 anni. Se il Titolare dovesse venire a conoscenza
          dell&apos;avvenuta registrazione o acquisto da parte di un minore
          senza autorizzazione dei titolari della responsabilit&agrave; genitoriale,
          provveder&agrave; alla tempestiva eliminazione dei dati e alla
          disattivazione dell&apos;account secondo quanto consentito dalla legge.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          10. Misure di sicurezza
        </h2>
        <p>
          Il Titolare adotta misure tecniche e organizzative adeguate,
          aggiornate secondo lo stato dell&apos;arte, per proteggere i dati
          personali da rischi di distruzione, perdita, alterazione, accesso
          non autorizzato o diffusione illecita. Tra le misure adottate:
          connessioni TLS/HTTPS, storage sicuro di password e token lato
          provider, accesso amministrativo limitato, autenticazione multi-fattore
          ove disponibile, politiche di sicurezza interne e aggiornamenti
          periodici di infrastruttura. Nonostante ogni ragionevole sforzo,
          nessun sistema pu&ograve; essere garantito come infallibile al 100%.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          11. Modifiche alla presente informativa
        </h2>
        <p>
          Il Titolare si riserva il diritto di modificare o aggiornare la
          presente Privacy Policy in qualsiasi momento, anche in conseguenza
          di modifiche normative, di nuove interpretazioni delle autorit&agrave;
          di controllo o di variazioni dei servizi offerti. Le modifiche sono
          efficaci dal momento della pubblicazione sul Sito. In caso di
          variazioni sostanziali che introducano nuove finalit&agrave; o nuove
          categorie di trattamento che necessitano di consenso, il Titolare
          provveder&agrave; a richiedere nuovamente il consenso ove previsto
          dalla normativa vigente.
        </p>
      </section>
    </LegalLayout>
  );
}
