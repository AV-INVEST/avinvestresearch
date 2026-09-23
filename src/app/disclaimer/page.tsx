import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import LastUpdatedLabel from '@/components/ui/LastUpdatedLabel';

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
          1. Natura esclusivamente educativa e informativa
        </h2>
        <p>
          Tutti i contenuti del Sito - inclusi, a titolo esemplificativo e non
          esaustivo, corsi digitali, ricerche PDF, dispense, esempi, grafici,
          commenti, visualizzazioni, call informative, presentazioni,
          newsletter, materiale del Research Club, la guida PDF AV Trading
          Starter, post social, approfondimenti e qualsiasi altra tipologia di
          materiale pubblicato o reso accessibile - sono forniti a scopo
          esclusivamente formativo, illustrativo e informativo. Non costituiscono, né possono essere interpretati in
          alcun modo come, consulenza finanziaria personalizzata, consulenza
          legale o fiscale, sollecitazione all&apos;investimento, suggerimento
          di strategie di investimento, promessa di rendimento, raccomandazione
          o parere professionale ad hoc.
        </p>
        <p className="mt-2">
          Il Sito &egrave; un progetto di formazione e ricerca, non un
          servizio di gestione del risparmio, non un&lsquo;attivit&agrave; di
          consulenza finanziaria o di investimento ex art. 1 TUF e non rientra
          nelle attivit&agrave; riservate a intermediari finanziari abilitati.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Nessun consiglio personalizzato, nessun segnale operativo
        </h2>
        <p>
          I contenuti pubblicati non tengono conto della situazione economica,
          finanziaria, fiscale, patrimoniale, personale o familiare di alcun
          utente specifico. Non vengono forniti segnali operativi, ordini di
          acquisto o vendita, target di prezzo, livelli di take-profit o
          stop-loss, indicazioni di timing, entry point automatizzati, liste di
          azioni &ldquo;da comprare&rdquo; o &ldquo;da vendere&rdquo;, o
          qualsiasi altro suggerimento che implichi una valutazione individuale
          delle circostanze dell&apos;utente.
        </p>
        <p className="mt-2">
          Ogni esempio operativo, ogni scenario, ogni analisi pubblicata nel
          Research Club, nei corsi o altrove sul Sito, ha esclusivamente scopo
          didattico o di documentazione di un metodo di lettura dei mercati e
          non deve essere interpretato come indicazione ad agire su uno
          specifico strumento finanziario in un determinato momento.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Nessuna sollecitazione all&apos;investimento
        </h2>
        <p>
          Nulla di quanto pubblicato sul Sito costituisce offerta pubblica di
          investimento, offerta di prodotti o servizi finanziari al pubblico,
          sollecitazione all&apos;acquisto o alla vendita di azioni, obbligazioni,
          ETF, ETC, strumenti derivati, crypto-asset o qualsiasi altro
          strumento finanziario o bene negoziabile sui mercati. L&apos;utente
          non deve assumere decisioni di investimento basandosi unicamente o
          prevalentemente sui contenuti del Sito.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Nessun target, nessun rendimento garantito
        </h2>
        <p>
          Non sono dichiarati, promessi, garantiti o anche solo suggeriti
          rendimenti, target di prezzo, obiettivi di performance, profitti
          attesi o risultati minimi di alcun tipo. Qualsiasi numero,
          percentuale, timeframe o indicatore economico riportato nei
          contenuti ha esclusivamente valore illustrativo e documentale e non
          costituisce una previsione, una stima affidabile o un impegno di
          risultato nei confronti dell&apos;utente. Non esistono strategie,
          metodi, indicatori o strumenti in grado di garantire profitti o di
          eliminare il rischio di perdita in ogni scenario di mercato.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Performance storiche e risultati passati
        </h2>
        <p>
          {siteConfig.performance.disclaimer} Le performance riportate nella
          sezione &quot;Un metodo costruito sui risultati&quot; e in altri
          punti del Sito si riferiscono a un portafoglio pubblico rilevato il{' '}
          <LastUpdatedLabel /> e riportate unicamente a scopo illustrativo
          del metodo. Non sono proiezioni, non garantiscono risultati analoghi
          in futuro e non costituiscono elemento di previsione.
        </p>
        <p className="mt-2">
          I risultati passati, i rendimenti storici dichiarati, i backtest,
          gli studi di simulazione e qualsiasi indicatore di performance
          passato non costituiscono in alcun modo un indicatore affidabile dei
          risultati futuri. Differenze sostanziali possono emergere per una
          pluralit&agrave; di fattori tra cui, senza limitazione: costi di
          transazione, spread, commissioni, imposte, liquidit&agrave; degli
          strumenti, tempi di esecuzione, slittamento, differenze di capitale
          investito, orizzonte temporale, diversa propensione al rischio ed
          eventi di mercato imprevisti.
        </p>
        <p className="mt-2 text-xs font-medium text-av-muted sm:text-sm">
          <LastUpdatedLabel prefix="Dati del portafoglio pubblico AV-INVEST, rilevati il " suffix="." />
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Rischio di investimento e perdita di capitale
        </h2>
        <p>
          I mercati finanziari e gli strumenti finanziari di qualsiasi natura
          (azioni, obbligazioni, ETF, derivati, materie prime, valute,
          crypto-asset e ogni altro bene negoziabile) presentano rischi
          significativi e intrinseci, inclusa la possibile perdita anche
          totale del capitale investito. Il valore degli investimenti pu&ograve;
          aumentare cos&igrave; come diminuire in modo anche rapido e imprevedibile,
          e l&apos;utente potrebbe non recuperare l&apos;intero importo
          investito.
        </p>
        <p className="mt-2">
          Operare sui mercati finanziari richiede conoscenze, esperienza,
          disciplina, capitale adeguato e una consapevole valutazione della
          propria propensione al rischio. L&apos;utente dichiara e riconosce
          di essere consapevole dei rischi connessi a qualsiasi decisione di
          natura finanziaria o di investimento e di assumersene ogni e
          qualsiasi responsabilit&agrave;.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Dati, valutazioni e scenari possono cambiare
        </h2>
        <p>
          Dati, analisi, valutazioni, scenari, tesi di investimento, analisi
          fondamentali, analisi tecniche, commenti su aziende, settori o
          contesti macroeconomici pubblicati nel Research Club o altrove sul
          Sito riflettono una fotografia temporale e un&apos;opinione
          soggettiva del momento della pubblicazione, basata su informazioni
          disponibili in quella data. Tali valutazioni possono cambiare
          rapidamente, completamente e senza preavviso in conseguenza di
          notizie, dati macro, risultati societari, eventi geopolitici,
          movimenti di mercato o qualsiasi altra circostanza nuova o
          sopravvenuta.
        </p>
        <p className="mt-2">
          Il Titolare non ha alcun obbligo di aggiornare, correggere, rimuovere
          o segnalare variazioni di analisi o valutazioni pubblicate in
          precedenza, salvi obblighi specifici di legge. L&apos;utente assume
          l&apos;onere di verificare autonomamente l&apos;attualit&agrave; e
          la fondatezza di qualsiasi informazione prima di basarvi proprie
          decisioni.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          8. Grafici, esempi, simulazioni e scenari
        </h2>
        <p>
          Grafici, simulazioni, candele, visualizzazioni, esempi operativi,
          backtest, casi studio e scenari riportati sul Sito possono essere
          rappresentazioni idealizzate, modelli didattici o rielaborazioni
          create a scopo esclusivamente formativo. Non riflettono necessariamente
          dati di mercato in tempo reale, non incorporano necessariamente tutti
          i costi reali di transazione e non devono essere interpretati come
          suggerimenti di ingresso, uscita, dimensione di posizione o
          indicazione operativa di qualsiasi genere.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          9. Corsi di formazione, AV Trading Starter e Research Club
        </h2>
        <p>
          L&apos;acquisto di un corso digitale, l&apos;acquisto one-time di AV
          Trading Starter (guida PDF educativa entry-level), l&apos;iscrizione
          ad AV Research Club o l&apos;accesso a qualsiasi contenuto formativo
          o informativo ha ad oggetto esclusivamente materiale didattico,
          documentale o di ricerca, fruibile secondo modalit&agrave; puramente
          autonome dall&apos;utente. In particolare, AV Trading Starter
          costituisce esclusivamente una guida introduttiva sulle basi della
          lettura dei mercati (grafici, trend, livelli chiave, elementi di
          gestione del rischio) e non fornisce in alcun modo indicazioni
          operative, analisi su specifici strumenti finanziari,
          raccomandazioni o promesse di performance. Nessuno di tali servizi
          d&agrave; diritto a ricevere segnali di investimento, consigli
          personalizzati, target di prezzo, indicazioni di timing, accesso a
          un conto di trading condiviso, gestione del risparmio per conto
          terzi, performance garantite o rendimenti attesi di alcun tipo.
        </p>
        <p className="mt-2">
          Il valore dei servizi offerti &egrave; limitato alla componente di
          formazione, conoscenza, metodo e documentazione trasmessa; non sussiste
          alcun legame diretto o indiretto tra il pagamento di un corso o di un
          abbonamento e i risultati di investimento che l&apos;utente potr&agrave;
          conseguire operando in autonomia sui mercati.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          10. AV Market Lens: marker tecnici predefiniti
        </h2>
        <p>
          AV Market Lens &egrave; un prodotto digitale composto da un
          indicatore in formato Pine Script per la piattaforma TradingView e da
          una guida PDF di utilizzo. L&apos;indicatore pu&ograve; evidenziare
          marker, avvisi, zone, livelli o segnali visivi derivanti esclusivamente
          da condizioni tecniche predefinite e parametri calcolati in modo
          automatico su dati di mercato storici o in tempo reale forniti da
          TradingView. Tali evidenze visive hanno natura puramente tecnica e
          descrittiva.
        </p>
        <p className="mt-2">
          Nessun marker, alert, evidenziazione, livello o output generato
          dall&apos;indicatore AV Market Lens costituisce: (a) una raccomandazione
          personalizzata di investimento, di gestione patrimoniale o fiscale;
          (b) un&apos;istruzione o un consiglio di acquisto, vendita o
          mantenimento di uno strumento finanziario; (c) una sollecitazione
          all&apos;investimento o al pubblico risparmio; (d) una previsione,
          stima o garanzia di risultati, profitti o rendimenti futuri; (e) un
          segnale operativo sostitutivo della valutazione autonoma dell&apos;utente.
        </p>
        <p className="mt-2">
          I marker possono essere soggetti a ripittura (repainting), ritardi,
          falsi positivi o falsi negativi in ragione della dinamica dei prezzi,
          delle fonti dati, delle impostazioni grafiche di TradingView, della
          volatilit&agrave; o di altri fattori tecnici. Il Titolare non
          garantisce l&apos;accuratezza, la tempestivit&agrave;, la completezza,
          la stabilit&agrave; nel tempo o l&apos;utilit&agrave; pratica di
          qualsiasi output dell&apos;indicatore in qualsiasi contesto di
          mercato. L&apos;utente assume ogni e qualsiasi responsabilit&agrave;
          per decisioni di natura finanziaria o operativa assunte anche in
          presenza di marker o alert di AV Market Lens.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          11. Fonti, accuratezza e completezza dei dati
        </h2>
        <p>
          I contenuti si basano su fonti ritenute attendibili e pubblicamente
          accessibili al momento della stesura (uffici stampa societari,
          database finanziari, documenti regolamentari, comunicati ufficiali,
          pubblicazioni di enti istituzionali e altre fonti generali). Nonostante
          ogni ragionevole sforzo di verifica, il Titolare non garantisce in
          alcun modo l&apos;accuratezza, la completezza, la veridicità,
          l&apos;esaustivit&agrave;, la tempestivit&agrave; o il continuo
          aggiornamento dei dati riportati. Errori materiali, omissioni,
          approssimazioni, ritardi o difformit&agrave; rispetto ai dati
          ufficiali possono sempre verificarsi.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          12. Valutazione autonoma e consulenza qualificata
        </h2>
        <p>
          Ogni decisione di investimento, finanziaria, patrimoniale, fiscale o
          legale deve essere presa in autonomia e sotto la propria esclusiva
          responsabilit&agrave;, dopo aver verificato le proprie conoscenze,
          i propri obiettivi, il proprio orizzonte temporale, la propria
          situazione patrimoniale e la propria propensione al rischio. In caso
          di dubbi sulle implicazioni economiche, finanziarie, legali o fiscali
          di una scelta, l&apos;utente deve rivolgersi esclusivamente a un
          consulente finanziario, legale, fiscale o patrimoniale abilitato,
          iscritto agli albi professionali previsti dalla legge e pienamente
          indipendente dal Titolare.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          13. Decisione finale sotto esclusiva responsabilit&agrave; dell&apos;utente
        </h2>
        <p>
          Qualsiasi decisione, azione od operazione di natura finanziaria o
          patrimoniale assunta dall&apos;utente, anche se ispirata o suggesta da
          contenuti formativi o da analisi pubblicate sul Sito, resta sotto la
          responsabilit&agrave; esclusiva, personale e insindacabile
          dell&apos;utente medesimo. Il Titolare non sar&agrave; in alcun modo
          ritenuto responsabile per operazioni, investimenti, scelte o
          comportamenti dell&apos;utente conseguenti alla consultazione dei
          contenuti del Sito, salvi i casi di dolo o colpa grave imputabili
          al Titolare e comunque nei limiti e nei modi stabiliti dalle norme
          imperative di legge.
        </p>
      </section>

      <section className="rounded-2xl border border-av-line bg-av-bg-2/40 p-5 sm:p-6">
        <p className="text-sm font-semibold text-white sm:text-base">
          Ambito di applicazione
        </p>
        <p className="mt-2 text-sm text-av-muted sm:text-base">
          Il presente disclaimer trova applicazione in relazione a qualsiasi
          utilizzo dei contenuti pubblicati sul Sito. In particolare: la
          registrazione e il primo accesso all&apos;account Google per l&apos;area
          membri, l&apos;acquisto dei corsi digitali, l&apos;acquisto one-time di
          AV Market Lens (indicatore Pine Script e guida PDF) e la
          sottoscrizione dell&apos;abbonamento al Research Club, cos&igrave; come
          l&apos;utilizzo dei servizi riservati, comportano la presa visione e
          l&apos;accettazione integrale del presente disclaimer, nonch&eacute; dei
          Termini e condizioni d&apos;uso e della Privacy Policy pubblicati nelle
          rispettive pagine del Sito.
        </p>
      </section>
    </LegalLayout>
  );
}
