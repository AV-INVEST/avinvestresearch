import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Termini e condizioni',
  description:
    'Termini e condizioni di utilizzo del sito e dei servizi di AV-INVEST Research.',
  alternates: { canonical: 'https://avinvestresearch.com/termini' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function TerminiPage() {
  return (
    <LegalLayout
      title="Termini e condizioni d'uso"
      subtitle="Condizioni generali per l'accesso e l'utilizzo del sito avinvestresearch.com e dei servizi correlati."
    >
      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Oggetto e ambito di applicazione
        </h2>
        <p>
          I presenti Termini e condizioni d&apos;uso (i &quot;Termini&quot;)
          disciplinano l&apos;accesso e l&apos;utilizzo del sito
          avinvestresearch.com (il &quot;Sito&quot;) e dei servizi in esso
          offerti da {siteConfig.legal.companyName} (il &quot;Titolare&quot;).
        </p>
        <p className="mt-2">
          Ai fini dell&apos;applicazione dei presenti Termini, si distinguono
          le seguenti condotte:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Navigazione pubblica</strong>:
            l&apos;accesso alle pagine informative del Sito senza
            autenticazione, senza registrazione di account e senza acquisto
            di servizi.
          </li>
          <li>
            <strong className="text-white">Registrazione e accesso account</strong>:
            l&apos;autenticazione tramite account Google per l&apos;accesso
            all&apos;area membri. La registrazione e il primo accesso
            all&apos;area membri comportano l&apos;accettazione integrale dei
            presenti Termini.
          </li>
          <li>
            <strong className="text-white">Acquisto di corsi digitali</strong>:
            la conclusione dell&apos;ordine e il pagamento a tantum di AV
            Foundations o AV Trading Lab, tramite Stripe, comportano
            l&apos;accettazione integrale dei presenti Termini.
          </li>
          <li>
            <strong className="text-white">Acquisto one-time AV Market Lens</strong>:
            la conclusione dell&apos;ordine e il pagamento a tantum del prodotto
            digitale AV Market Lens (indicatore TradingView in Pine Script e
            guida PDF), tramite Stripe, comportano l&apos;accettazione integrale
            dei presenti Termini, del Disclaimer e la dichiarazione di consenso
            alla fornitura immediata del contenuto digitale con perdita del
            diritto di recesso ai sensi dell&apos;art. 59 del Codice del Consumo,
            ove applicabile.
          </li>
          <li>
            <strong className="text-white">Acquisto one-time AV Trading Starter</strong>:
            la conclusione dell&apos;ordine e il pagamento a tantum della guida
            PDF AV Trading Starter (materiale educativo entry-level), tramite
            Stripe, comportano l&apos;accettazione integrale dei presenti Termini,
            del Disclaimer e la dichiarazione di consenso alla fornitura
            immediata del contenuto digitale con perdita del diritto di recesso
            ai sensi dell&apos;art. 59 del Codice del Consumo, ove applicabile.
          </li>
          <li>
            <strong className="text-white">Sottoscrizione abbonamento</strong>:
            l&apos;attivazione dell&apos;abbonamento mensile al Research Club,
            tramite Stripe, comporta l&apos;accettazione integrale dei
            presenti Termini.
          </li>
        </ul>
        <p className="mt-2">
          Il Titolare si riserva il diritto di modificare i Termini in
          qualsiasi momento. Le modifiche sono efficaci dal momento della
          pubblicazione sul Sito. La prosecuzione dell&apos;utilizzo
          dell&apos;account, di un abbonamento attivo o di servizi gi&agrave;
          acquistati dopo la pubblicazione delle modifiche implica
          l&apos;accettazione dei Termini aggiornati per la parte ancora da
          eseguire.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Servizi e contenuti: natura esclusivamente educativa
        </h2>
        <p>
          Il Sito fornisce contenuti a finalit&agrave; esclusivamente formative,
          informative e educative su temi finanziari, analisi tecnica, gestione
          del rischio, metodo operativo e ricerca di mercato. Nulla di quanto
          pubblicato sul Sito, nei corsi, nelle ricerche PDF, nel Research Club
          o in qualsiasi materiale di qualsiasi tipo costituisce consulenza
          finanziaria, legale, fiscale o di investimento personalizzata, n&eacute;
          sollecitazione al pubblico all&apos;investimento, n&eacute; raccomandazione
          di acquisto o vendita di strumenti finanziari, azioni, ETF, obbligazioni
          o qualsiasi altro bene o servizio finanziario.
        </p>
        <p className="mt-2">
          I servizi attualmente offerti sul Sito sono:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Corsi digitali educativi</strong>
            {' '}
            (AV Foundations e AV Trading Lab): forniti in modalit&agrave;
            one-time con pagamento a tantum e accesso all&apos;area
            membri per il contenuto del corso acquistato.
          </li>
          <li>
            <strong className="text-white">AV Research Club</strong>
            : servizio in abbonamento mensile che include l&apos;accesso a
            ricerche PDF, analisi riservate e archivio del materiale
            pubblicato per gli abbonati.
          </li>
          <li>
            <strong className="text-white">AV Market Lens</strong>
            : prodotto digitale one-time venduto con pagamento a tantum che
            include il download di un indicatore TradingView in formato Pine
            Script e di una guida PDF di utilizzo, riservati al solo account
            che ha completato l&apos;acquisto.
          </li>
          <li>
            <strong className="text-white">AV Trading Starter</strong>
            : prodotto digitale one-time venduto con pagamento a tantum che
            include il download di una guida PDF educativa entry-level su
            grafici, trend, livelli chiave e gestione del rischio, riservata
            al solo account che ha completato l&apos;acquisto.
          </li>
          <li>
            <strong className="text-white">Area membri</strong>
            : piattaforma riservata agli utenti autenticati tramite account
            Google per la fruizione di corsi, ricerche PDF e tracciamento
            del progresso personale.
          </li>
          <li>
            <strong className="text-white">Prenotazione call informative</strong>
            : tramite link esterno a Calendly per richieste di orientamento
            iniziale sui servizi formativi.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Nessuna promessa di rendimento o risultato
        </h2>
        <p>
          Nessun contenuto o servizio del Sito promette, garantisce o anche solo
          suggerisce l&apos;ottenimento di rendimenti, profitti o risultati di
          investimento specifici. Performance storiche, esempi operativi,
          casi studio, backtest, simulazioni, dati di portafoglio pubblico o
          qualsiasi altra metrica riportata sul Sito hanno esclusivamente scopo
          illustrativo e didattico e non costituiscono indicazione di risultati
          futuri ottenibili. Non esistono strategie, metodi, indicatori o
          strumenti in grado di eliminare il rischio di perdita o garantire
          profitti in ogni scenario di mercato.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Accuratezza dei dati e fonti
        </h2>
        <p>
          I contenuti del Sito si basano su fonti ritenute affidabili al momento
          della pubblicazione. Il Titolare adopera ogni ragionevole sforzo per
          garantire la correttezza delle informazioni pubblicate, ma non
          garantisce in alcun modo l&apos;assenza di errori, omissioni,
          approssimazioni, ritardi nell&apos;aggiornamento o modifiche
          sopravvenute a dati, valutazioni e scenari riportati. I mercati
          finanziari e le informazioni su aziende, strumenti e contesti
          macroeconomici possono cambiare rapidamente e senza preavviso.
          L&apos;utente riconosce che qualsiasi dato o valutazione pu&ograve;
          risultare non aggiornato, incompleto o non accurato al momento
          della consultazione.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Propriet&agrave; intellettuale
        </h2>
        <p>
          Tutti i contenuti del Sito e dei servizi offerti - inclusi, a titolo
          esemplificativo e non esaustivo, testi, grafica, loghi, icone, design,
          illustrazioni, slide, video, esercitazioni, dispense, ricerche PDF,
          analisi, nomi di prodotti e marchi - sono di propriet&agrave; esclusiva
          del Titolare o dei rispettivi autori e sono tutelati dalle normative
          vigenti in materia di diritto d&apos;autore, propriet&agrave;
          industriale e concorrenza sleale.
        </p>
        <p className="mt-2">
          &Egrave; espressamente vietata, senza autorizzazione scritta e
          preventiva del Titolare, ogni riproduzione, distribuzione,
          comunicazione al pubblico, modifica, adattamento, traduzione,
          creazione di opere derivate, uso commerciale, rivendita, sublicenza,
          pubblicazione o trasmissione in qualsiasi forma o con qualsiasi mezzo,
          anche parziale, dei contenuti protetti.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Uso consentito: personale, non trasferibile e non condiviso
        </h2>
        <p>
          Tutti i servizi e i contenuti acquistati o accessibili tramite
          abbonamento o licenza sono concessi in uso esclusivamente personale,
          non esclusivo, non trasferibile e non condivisibile con terzi, nei
          limiti e per le finalit&agrave; strettamente connesse alla propria
          formazione individuale.
        </p>
        <p className="mt-2">
          In particolare, e senza limitazione, &egrave; espressamente vietato:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            Condividere le credenziali di accesso all&apos;area membri (account
            Google) con persone diverse dal titolare legittimo dell&apos;account,
            anche tra familiari, colleghi o soci.
          </li>
          <li>
            Copiare, scaricare, estrarre, registrare o pubblicare su
            qualsiasi piattaforma pubblica o privata (social network, forum,
            gruppi di messaggistica, siti web, drive condivisi, ecc.) i PDF, le
            ricerche, i video, le slide o qualsiasi altro materiale riservato
            del Sito o del Research Club, anche in forma estratta o modificata.
          </li>
          <li>
            Effettuare attivit&agrave; di scraping, crawling, data-mining o
            qualsiasi estrazione automatizzata di contenuti, dati o materiale
            dal Sito o dall&apos;area membri.
          </li>
          <li>
            Rivendere, sublicenziare, noleggiare, concedere in uso a terzi o
            comunque sfruttare commercialmente qualsiasi servizio o contenuto
            acquistato.
          </li>
          <li>
            Utilizzare i contenuti o il materiale del Sito per creare prodotti
            o servizi concorrenti o per formare terzi dietro corrispettivo.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Autenticazione e account
        </h2>
        <p>
          L&apos;accesso all&apos;area membri e ai servizi riservati avviene
          esclusivamente tramite autenticazione con account Google.
          L&apos;utente &egrave; responsabile della custodia riservata delle
          proprie credenziali Google e di ogni attivit&agrave; svolta tramite
          il proprio account. Il Titolare non sar&agrave; ritenuto
          responsabile per accessi non autorizzati conseguenti a condotte
          imprudenti o negligenti dell&apos;utente nella gestione delle proprie
          credenziali. Qualsiasi utilizzo dell&apos;account effettuato dopo
          l&apos;autenticazione Google si intende riferibile al titolare
          dell&apos;account medesimo.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          8. Pagamenti e acquisti tramite Stripe
        </h2>
        <p>
          Tutti i pagamenti per l&apos;acquisto dei corsi digitali e per
          l&apos;abbonamento al Research Club sono gestiti tramite Stripe,
          fornitore terzo di servizi di pagamento. Il Titolare non memorizza
          direttamente sul proprio database dati di carta di credito o strumenti
          di pagamento completi; il trattamento dei dati di pagamento avviene
          tramite le piattaforme e secondo le procedure di Stripe.
        </p>
        <p className="mt-2">
          Completando una procedura di acquisto, l&apos;utente dichiara di
          essere autorizzato all&apos;utilizzo dello strumento di pagamento
          prescelto e accetta i termini e le condizioni di Stripe, disponibili
          sul sito ufficiale stripe.com. In caso di contestazioni, frodi o
          mancati pagamenti da parte dell&apos;utente, il Titolare si riserva
          il diritto di sospendere o revocare l&apos;accesso ai servizi fino
          alla risoluzione della controversia, nei limiti consentiti dalla legge.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          9. Corsi digitali: licenza one-time
        </h2>
        <p>
          I corsi AV Foundations e AV Trading Lab sono venduti con formula a
          tantum (pagamento unico una tantum). Dopo l&apos;acquisto completato
          e la conferma del pagamento da parte di Stripe, viene concesso
          all&apos;utente il diritto di accesso personale e non
          trasferibile ai contenuti del corso, alle lezioni, al materiale
          didattico associato e alle relative funzionalit&agrave; di tracciamento
          del progresso nell&apos;area membri. Il prezzo pubblicato nella pagina
          del corso include l&apos;IVA ove applicabile secondo la normativa
          vigente.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          10. AV Research Club: abbonamento mensile
        </h2>
        <p>
          Il servizio AV Research Club &egrave; offerto in formula di
          abbonamento ricorrente con cadenza mensile. L&apos;abbonamento
          include l&apos;accesso al materiale riservato pubblicato per i
          membri (ricerche PDF, analisi, approfondimenti) secondo quanto
          descritto nella pagina di presentazione del servizio. L&apos;area
          membri rende disponibili le 5 pubblicazioni più recenti del Research
          Club secondo un archivio rotativo. Alla pubblicazione di un nuovo
          contenuto, la pubblicazione più vecchia può essere rimossa
          dall&apos;area riservata e non è garantita la disponibilità
          permanente dei contenuti precedentemente pubblicati. Il numero di
          pubblicazioni, gli argomenti trattati e la frequenza di aggiornamento
          dell&apos;archivio possono variare nel tempo, purch&eacute; il
          servizio resti coerente con la finalit&agrave; generale di ricerca
          e approfondimento formativo.
        </p>
        <p className="mt-2">
          L&apos;abbonamento si intende attivato alla data di conferma del
          primo pagamento da parte di Stripe e ha una durata iniziale di un
          mese solare.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          11. AV Market Lens: prodotto digitale one-time
        </h2>
        <p>
          AV Market Lens &egrave; un prodotto digitale venduto con pagamento
          unico e una tantum. Dopo la conferma del pagamento da parte di Stripe
          e la registrazione di un <em>Purchase</em> con stato{' '}
          <code className="font-mono bg-av-bg-2/60 px-1.5 py-0.5 rounded border border-av-line text-av-green/90 text-[12px]">
            succeeded
          </code>{' '}
          e <em>productSlug</em> uguale a{' '}
          <code className="font-mono bg-av-bg-2/60 px-1.5 py-0.5 rounded border border-av-line text-av-green/90 text-[12px]">
            market-lens
          </code>
          , l&apos;utente acquisisce il diritto personale, non esclusivo e non
          trasferibile di scaricare dal proprio account: (a) il file indicatore
          per la piattaforma TradingView in formato Pine Script, e (b) la guida
          PDF di utilizzo. Entrambi i file sono conservati su storage privato
          Vercel Blob e sono scaricabili esclusivamente tramite rotte server
          protette. Nessun URL pubblico o permanente viene generato o esposto.
        </p>
        <p className="mt-2">
          La licenza d&apos;uso &egrave; concessa esclusivamente per finalit&agrave;
          di studio, formazione e analisi personale dell&apos;utente. &Egrave;
          espressamente vietato, senza autorizzazione scritta e preventiva del
          Titolare: condividere, distribuire o trasmettere a terzi i file
          ricevuti; pubblicare il codice Pine Script o estratti su qualsiasi
          piattaforma pubblica o privata (forum, social, gruppi, repository,
          siti web, drive condivisi, servizi di trading collettivo, ecc.);
          rivendere, sublicenziare, noleggiare o concedere in uso a terzi il
          prodotto, in tutto o in parte; integrare l&apos;indicatore in servizi
          concorrenti, piattaforme di segnali, prodotti commerciali o servizi
          offerti a corrispettivo.
        </p>
        <p className="mt-2">
          L&apos;indicatore Pine Script &egrave; progettato per essere importato
          ed eseguito esclusivamente sulla piattaforma TradingView, servizio
          terzo indipendente che l&apos;utente utilizza secondo i propri termini
          e condizioni. Il Titolare non fornisce alcuna garanzia sul
          funzionamento dell&apos;indicatore in contesti diversi da TradingView,
          n&eacute; sulla disponibilit&agrave;, sulle modifiche o sui costi dei
          servizi di TradingView.
        </p>
        <p className="mt-2">
          In ragione della natura di contenuto digitale fornito su supporto
          immateriale, l&apos;utente, con l&apos;apposito consenso espresso
          reso prima del checkout (registrato nel Purchase e nei metadata di
          Stripe), richiede la fornitura immediata del contenuto all&apos;atto
          del pagamento andato a buon fine e riconosce che, in conseguenza di
          tale fornitura, il diritto di recesso di cui agli articoli 52 e seg.
          del Codice del Consumo si considera escluso ai sensi dell&apos;art.
          59, comma 1, lett. o), D.Lgs. 206/2005, nonch&eacute; delle altre
          norme imperative di diritto UE e nazionale applicabili al caso.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          12. AV Trading Starter: guida PDF one-time
        </h2>
        <p>
          AV Trading Starter &egrave; un prodotto digitale venduto con pagamento
          unico e una tantum, consistente in una guida PDF in lingua italiana
          a carattere esclusivamente educativo e informativo, destinata ai
          principianti che intendono approcciare i mercati finanziari con
          conoscenze di base relative a grafici, riconoscimento di trend,
          livelli chiave, nozioni di gestione del rischio e approccio mentale
          corretto. Dopo la conferma del pagamento da parte di Stripe e la
          registrazione di un <em>Purchase</em> con stato{' '}
          <code className="font-mono bg-av-bg-2/60 px-1.5 py-0.5 rounded border border-av-line text-av-green/90 text-[12px]">
            succeeded
          </code>{' '}
          e <em>productSlug</em> uguale a{' '}
          <code className="font-mono bg-av-bg-2/60 px-1.5 py-0.5 rounded border border-av-line text-av-green/90 text-[12px]">
            trading-starter
          </code>
          , l&apos;utente acquisisce il diritto personale, non esclusivo e non
          trasferibile di scaricare dal proprio account la guida PDF. Il file
          &egrave; conservato su storage privato Vercel Blob ed &egrave;
          scaricabile esclusivamente tramite rotta server protetta. Nessun
          URL pubblico o permanente viene generato o esposto.
        </p>
        <p className="mt-2">
          <strong className="text-white">Natura educativa e non finanziaria.</strong>{' '}
          AV Trading Starter &egrave; esclusivamente materiale formativo e
          illustrativo. Non costituisce in alcun modo consulenza finanziaria,
          legale, fiscale o di investimento personalizzata, non &egrave; una
          sollecitazione al pubblico all&apos;investimento, non contiene
          raccomandazioni di acquisto o vendita di strumenti finanziari, non
          fornisce segnali operativi e non promette, garantisce o suggerisce
          alcun risultato, rendimento o profitto specifico.
        </p>
        <p className="mt-2">
          La licenza d&apos;uso &egrave; concessa esclusivamente per finalit&agrave;
          di studio e formazione personale dell&apos;utente. &Egrave;
          espressamente vietato, senza autorizzazione scritta e preventiva del
          Titolare: condividere, distribuire o trasmettere a terzi la guida PDF
          o estratti di essa; pubblicare il file o parti di essa su qualsiasi
          piattaforma pubblica o privata (forum, social network, gruppi di
          messaggistica, repository, siti web, drive condivisi, servizi di
          formazione a pagamento, ecc.); rivendere, sublicenziare, noleggiare
          o concedere in uso a terzi la guida, in tutto o in parte; integrare
          il contenuto in prodotti o servizi concorrenti, piattaforme di
          segnali, formazione commerciale o servizi offerti a corrispettivo.
        </p>
        <p className="mt-2">
          In ragione della natura di contenuto digitale fornito su supporto
          immateriale, l&apos;utente, con l&apos;apposito consenso espresso
          reso prima del checkout (registrato nel Purchase e nei metadata di
          Stripe), richiede la fornitura immediata del contenuto all&apos;atto
          del pagamento andato a buon fine e riconosce che, in conseguenza di
          tale fornitura, il diritto di recesso di cui agli articoli 52 e seg.
          del Codice del Consumo si considera escluso ai sensi dell&apos;art.
          59, comma 1, lett. o), D.Lgs. 206/2005, nonch&eacute; delle altre
          norme imperative di diritto UE e nazionale applicabili al caso.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          13. Rinnovo automatico del Research Club
        </h2>
        <p>
          L&apos;abbonamento al Research Club si rinnova automaticamente alla
          fine di ogni periodo mensile, sullo stesso giorno del mese in cui
          &egrave; stato attivato (o nel giorno pi&ugrave; vicino in caso di
          mese pi&ugrave; corto), previa addebito automatico dello stesso prezzo
          in vigore nel momento del rinnovo sullo strumento di pagamento
          registrato su Stripe.
        </p>
        <p className="mt-2">
          L&apos;utente pu&ograve; disattivare il rinnovo automatico in
          qualsiasi momento tramite il Customer Portal di Stripe, accessibile
          dalla propria pagina di profilo nell&apos;area membri del Sito.
          La disattivazione del rinnovo non produce effetti retroattivi e
          lascia invariato l&apos;accesso al Research Club fino alla fine
          del periodo gi&agrave; pagato.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          14. Disdetta e fine accesso
        </h2>
        <p>
          L&apos;utente pu&ograve; disattivare il rinnovo automatico
          dell&apos;abbonamento al Research Club in qualsiasi momento tramite
          il Customer Portal di Stripe. Dopo la disattivazione, l&apos;abbonamento
          non sar&agrave; pi&ugrave; rinnovato alla scadenza del periodo corrente.
        </p>
        <p className="mt-2">
          In caso di disattivazione del rinnovo, l&apos;accesso ai
          contenuti del Research Club rimane attivo e pienamente fruibile
          fino alla fine naturale del periodo gi&agrave; corrisposto.
          Alla scadenza del periodo pagato, l&apos;utente non abilitato al
          rinnovo non potr&agrave; pi&ugrave; accedere ai contenuti riservati
          del Research Club.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          15. Customer Portal e gestione autonoma
        </h2>
        <p>
          La gestione autonoma dell&apos;abbonamento (aggiornamento dei dati di
          pagamento, disattivazione del rinnovo, visualizzazione dello stato
          sottoscrizione e consultazione fatture) avviene tramite il Customer
          Portal di Stripe, accessibile direttamente dalla pagina di profilo
          dell&apos;area membri del Sito.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          16. Rimborsi e diritto di recesso
        </h2>
        <p>
          In relazione ai servizi digitali forniti dal Sito (corsi digitali,
          prodotti one-time AV Market Lens e AV Trading Starter, e abbonamento
          Research Club), i rimborsi e il diritto di recesso sono regolati
          esclusivamente nei limiti e nei modi previsti dalla legge applicabile,
          con particolare riferimento al Codice del Consumo (D.Lgs. 206/2005)
          e alle disposizioni inderogabili di diritto comunitario e nazionale.
        </p>
        <p className="mt-2">
          Non sono previsti rimborsi discrezionali al di l&agrave; di quanto
          espressamente previsto da norme imperative di legge. Il Titolare
          non dichiara rinunce unilaterali ai diritti riconosciuti all&apos;utente
          consumatore da norme inderogabili.
        </p>
        <p className="mt-2">
          Per quanto riguarda i contenuti digitali non forniti su supporto
          materiale, l&apos;eventuale esclusione o esaurimento del diritto di
          recesso &egrave; disciplinata dall&apos;articolo 59, comma 1, lett. o)
          del Codice del Consumo: essa opera soltanto se e nei casi in cui
          ricorrano tutti i presupposti previsti dalla legge (consenso espresso
          dell&apos;utente all&apos;inizio della prestazione, riconoscimento
          della conseguente perdita del diritto di recesso e conferma prevista
          dalla normativa). In assenza di tali condizioni, il diritto di
          recesso si applica secondo la regola generale. Per AV Market Lens
          e per AV Trading Starter, l&apos;espressa richiesta di fornitura
          immediata e il riconoscimento della perdita del diritto di recesso
          sono oggetto di consenso esplicito e documentato prima dell&apos;avvio
          del checkout.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          17. Sospensione e revoca dell&apos;accesso per abuso
        </h2>
        <p>
          Il Titolare si riserva il diritto, a propria esclusiva discrezione
          e senza necessit&agrave; di preavviso ove la legge lo consenta, di
          sospendere o revocare in modo definitivo o temporaneo l&apos;accesso
          all&apos;area membri, ai corsi acquistati, al Research Club o a
          qualsiasi altro servizio, in caso di:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            Violazione dei presenti Termini, inclusi i divieti di condivisione
            account, copia, redistribuzione o pubblicazione non autorizzata
            dei contenuti.
          </li>
          <li>
            Utilizzo fraudolento, abusivo o in violazione di leggi o regolamenti
            applicabili.
          </li>
          <li>
            Mancato pagamento di rate o importi dovuti per abbonamenti o
            acquisti, dopo idoneo preavviso ove previsto da contratto o da
            disposizioni di legge.
          </li>
          <li>
            Condotte che compromettano o possano compromettere la sicurezza,
            la reputazione, il corretto funzionamento o la disponibilit&agrave;
            del Sito e dei servizi per gli altri utenti.
          </li>
        </ul>
        <p className="mt-2">
          In caso di revoca per accertata violazione dei presenti Termini,
          non sono dovuti rimborsi di importi gi&agrave; pagati, salvi i
          diritti inderogabili del consumatore.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          18. Disponibilit&agrave; del servizio e manutenzioni
        </h2>
        <p>
          Il Titolare adopera ogni ragionevole sforzo per garantire la
          disponibilit&agrave; continua e regolare del Sito e dei servizi,
          ma non pu&ograve; garantire che il funzionamento sia privo di
          interruzioni, errori, rallentamenti o disservizi temporanei dovuti
          a manutenzioni programmate, aggiornamenti infrastrutturali, guasti
          tecnici, congestioni di rete o cause comunque non direttamente
          imputabili.
        </p>
        <p className="mt-2">
          Interruzioni temporanee per manutenzione straordinaria o ordinaria
          possono avvenire senza preavviso. Il Titolare non sar&agrave;
          responsabile per danni derivanti da indisponibilit&agrave; temporanea
          del servizio ai sensi e nei limiti di quanto stabilito dalle
          presenti clausole e dalle norme inderogabili di legge.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          19. Servizi di terze parti
        </h2>
        <p>
          Il Sito si avvale di fornitori terzi per l&apos;erogazione dei servizi.
          In particolare, i servizi attualmente coinvolti nella catena di
          erogazione sono:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Stripe</strong>: per la gestione dei
            pagamenti, degli abbonamenti, delle fatture e del Customer Portal.
          </li>
          <li>
            <strong className="text-white">Google (Auth)</strong>: per il
            servizio di autenticazione tramite account Google utilizzato per
            l&apos;accesso all&apos;area membri.
          </li>
          <li>
            <strong className="text-white">Calendly</strong>: per la
            prenotazione di call informative tramite link esterno.
          </li>
          <li>
            <strong className="text-white">Vercel</strong>: per l&apos;hosting,
            il deployment del Sito e l&apos;infrastruttura tecnica di
            distribuzione dei contenuti.
          </li>
          <li>
            <strong className="text-white">Neon</strong>: per il database
            utilizzato per la memorizzazione di account, acquisti, stato
            abbonamento e progressi utente.
          </li>
          <li>
            <strong className="text-white">Vercel Blob</strong>: per lo
            storage privato e la distribuzione dei PDF e dei documenti del
            Research Club, nonch&eacute; dei file Pine Script e PDF del
            prodotto AV Market Lens e della guida PDF di AV Trading Starter.
          </li>
          <li>
            <strong className="text-white">TradingView</strong>: piattaforma
            terza indipendente utilizzata per l&apos;esecuzione dell&apos;indicatore
            Pine Script di AV Market Lens. L&apos;indicatore &egrave; progettato
            esclusivamente per l&apos;importazione e l&apos;utilizzo all&apos;interno
            dell&apos;ambiente TradingView secondo i termini e le politiche
            di TradingView.
          </li>
        </ul>
        <p className="mt-2">
          L&apos;utilizzo dei servizi di tali fornitori &egrave; soggetto alle
          rispettive condizioni generali e informative sulla privacy,
          disponibili sui siti ufficiali di ciascuno. Il Titolare non
          controlla direttamente i servizi di terzi e non &egrave; responsabile
          per disservizi, modifiche unilaterali o condotte di tali fornitori.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          20. Responsabilit&agrave; dell&apos;utente e decisioni autonome
        </h2>
        <p>
          Qualsiasi decisione di investimento, finanziaria, patrimoniale,
          fiscale o legale resta sotto la responsabilit&agrave; esclusiva
          e insindacabile dell&apos;utente. Il Titolare non fornisce pareri
          personalizzati e non entra in alcun modo nella valutazione della
          situazione individuale di un utente. L&apos;utente dichiara di
          assumere ogni e qualsiasi conseguenza, positiva o negativa, derivante
          dalle proprie decisioni autonome e di sollevare il Titolare da ogni
          responsabilit&agrave; per operazioni, investimenti o condotte
          intraprese sulla base di contenuti formativi o illustrativi
          pubblicati sul Sito, salvo quanto previsto dalle norme inderogabili
          di legge.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          21. Limitazione di responsabilit&agrave;
        </h2>
        <p>
          Nei limiti massimi consentiti dalla normativa applicabile e fatti
          salvi in ogni caso i diritti inderogabili del consumatore, il
          Titolare non sar&agrave; responsabile per danni indiretti,
          incidentali, speciali, consequenziali o punitivi - inclusa, a
          titolo esemplificativo, la perdita di profitti, ricavi,
          opportunit&agrave;, dati o avviamento - derivanti o in qualsiasi
          modo connessi all&apos;utilizzo o all&apos;impossibilit&agrave; di
          utilizzo del Sito o dei servizi.
        </p>
        <p className="mt-2">
          Restano impregiudicate, senza alcuna limitazione, le responsabilit&agrave;
          non eliminabili per dolo o colpa grave e le responsabilit&agrave;
          espressamente previste da norme imperative di legge.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          22. Forza maggiore e cause esterne
        </h2>
        <p>
          Il Titolare non sar&agrave; ritenuto responsabile per inadempimenti
          o ritardi nell&apos;esecuzione dei propri obblighi derivanti da cause
          non imputabili e non prevedibili, tra cui, a titolo esemplificativo
          e non esaustivo: guasti alle linee telecomunicative o a internet,
          blackout, disastri naturali, guerre, atti terroristici, crisi
          pandemiche, interruzioni dei servizi di fornitori terzi (Stripe,
          Google, Vercel, Neon, Calendly), provvedimenti amministrativi o
          normativi sopravvenuti, attacchi informatici, quando non siano
          riconducibili a dolo o colpa grave del Titolare.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          23. Modifiche ai servizi e ai prezzi
        </h2>
        <p>
          Il Titolare si riserva il diritto di modificare, aggiornare, ampliare,
          limitare o interrompere in tutto o in parte i servizi offerti (inclusi
          contenuti, funzionalit&agrave;, frequenza delle pubblicazioni nel
          Research Club e caratteristiche dei corsi), nonch&eacute; di
          modificare i prezzi e le condizioni economiche, con effetto per i
          nuovi acquisti o per i rinnovi futuri degli abbonamenti, dandone
          comunicazione mediante pubblicazione sul Sito o, per quanto possibile,
          tramite comunicazione diretta agli abbonati attivi prima
          dell&apos;apposizione della modifica sul rinnovo. Eventuali modifiche
          non incidono sui servizi gi&agrave; acquistati e pagati.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          24. Legge applicabile e foro competente
        </h2>
        <p>
          I presenti Termini sono regolati dalla legge italiana. Per ogni
          controversia in ordine a interpretazione, validit&agrave;, esecuzione
          e risoluzione dei presenti Termini, ferma restando la possibilit&agrave;
          di ricorso a procedure di risoluzione alternativa delle controversie
          ove disponibili, il Foro competente &egrave; quello del luogo di
          residenza o domicilio dell&apos;utente consumatore, nel pieno
          rispetto delle disposizioni inderogabili in materia di tutela dei
          consumatori e dei diritti riconosciuti dalla normativa UE e nazionale.
          Qualsiasi disposizione dei presenti Termini che risultasse in
          contrasto con norme imperative di legge si intende sostituita di
          diritto dalla disposizione legale applicabile, senza pregiudizio per
          la validit&agrave; delle restanti clausole.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          25. Contatti e dati del venditore
        </h2>
        <p>
          I servizi offerti sul Sito sono forniti da:
        </p>
        <div className="mt-3 rounded-2xl border border-av-line bg-av-bg-2/40 p-4 sm:p-5">
          <ul className="space-y-1.5 text-sm sm:text-base">
            {siteConfig.legal.identity.fullName ? (
              <li>
                <strong className="text-white/90">{siteConfig.legal.identity.fullName}</strong>
              </li>
            ) : null}
            {siteConfig.legal.identity.address ? (
              <li className="text-white/80">{siteConfig.legal.identity.address}</li>
            ) : null}
            {siteConfig.legal.identity.phone ? (
              <li className="text-white/80">
                Telefono:{' '}
                <a
                  href={`tel:${siteConfig.legal.identity.phone.replace(/\s+/g, '')}`}
                  className="link-underline"
                >
                  {siteConfig.legal.identity.phone}
                </a>
              </li>
            ) : null}
            {siteConfig.legal.identity.vatId ? (
              <li className="text-white/80">P.IVA: {siteConfig.legal.identity.vatId}</li>
            ) : null}
            {siteConfig.legal.identity.fiscalCode ? (
              <li className="text-white/80">C.F.: {siteConfig.legal.identity.fiscalCode}</li>
            ) : null}
            {siteConfig.legal.identity.companyRegister ? (
              <li className="text-white/80">
                REA / Registro Imprese: {siteConfig.legal.identity.companyRegister}
              </li>
            ) : null}
            {siteConfig.legal.identity.pec ? (
              <li className="text-white/80 break-all">
                PEC:{' '}
                <a href={`mailto:${siteConfig.legal.identity.pec}`} className="link-underline">
                  {siteConfig.legal.identity.pec}
                </a>
              </li>
            ) : null}
            <li className="text-white/80 break-all">
              Email:{' '}
              <a
                href={`mailto:${siteConfig.legal.identity.email || siteConfig.contactEmail}`}
                className="link-underline"
              >
                {siteConfig.legal.identity.email || siteConfig.contactEmail}
              </a>
            </li>
          </ul>
        </div>
        <p className="mt-3">
          Per ogni domanda, segnalazione o richiesta relativa ai presenti
          Termini o ai servizi offerti, puoi scrivere all&apos;indirizzo email
          riportato sopra o consultare la pagina{' '}
          <a href="/informazioni-legali" className="link-underline">Informazioni legali</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
