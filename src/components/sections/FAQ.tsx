import Accordion, { type FAQItem } from '@/components/ui/Accordion';

const faqs: FAQItem[] = [
  {
    question: 'A chi sono rivolti i percorsi?',
    answer:
      'A chiunque voglia approcciare l\'analisi dei mercati con metodo: principianti che vogliono costruire basi solide, e persone già attive sui mercati che cercano struttura, disciplina e processo decisionale più chiaro. Non sono richieste conoscenze pregresse per il percorso base.',
  },
  {
    question: 'Da quale corso dovrei iniziare?',
    answer:
      'Se sei alle prime armi o vuoi consolidare le basi, parti da AV Foundations: copre struttura di mercato, trend, livelli, volumi, indicatori e gestione del rischio. Se invece hai già basi solide e vuoi approfondire strategia, contesto, conferme, invalidazione e dimensionamento, AV Trading Lab è il passo successivo.',
  },
  {
    question: 'Posso seguire i corsi da smartphone?',
    answer:
      'Sì: il sito e i contenuti sono progettati per essere fruibili anche da mobile. Video, dispense e materiale sono consultabili da smartphone, tablet e desktop con lo stesso account. Alcuni esercizi e grafici sono più comodi su schermo più ampio, ma non obbligatori.',
  },
  {
    question: 'Come funziona il Research Club?',
    answer:
      'È un ambiente riservato con approfondimenti settimanali su mercati, aziende e settori: analisi documentate, scenari, catalizzatori e rischi. L\'area membri contiene un archivio rotativo delle 5 pubblicazioni più recenti. Non è un segnale, non sostituisce la tua valutazione e non promette risultati. È materiale di ricerca e studio, pensato per approfondire e allenare il processo decisionale.',
  },
  {
    question: 'Il servizio include segnali di acquisto o vendita?',
    answer:
      'No. AV‑INVEST Research non emette segnali, non fornisce consigli personalizzati e non promette rendimenti. I contenuti sono esclusivamente formativi e di ricerca: ti forniamo metodo, strumenti e contesti per costruire le tue valutazioni in autonomia.',
  },
  {
    question: 'La call è una consulenza finanziaria?',
    answer:
      'No. La call è una chiamata orientativa: serve a capire il tuo punto di partenza, i tuoi obiettivi formativi e quale percorso può essere più adatto. Non vengono forniti consigli su strumenti, portafogli o operazioni specifiche.',
  },
  {
    question: 'Quali metodi di pagamento sono disponibili?',
    answer:
      'Puoi pagare con le principali carte di credito e debito tramite Stripe. Gli eventuali altri metodi disponibili vengono mostrati direttamente durante il checkout. I pagamenti sono gestiti tramite una connessione sicura.',
  },
  {
    question: 'Cos\'è AV Market Lens?',
    answer:
      'AV Market Lens è un prodotto digitale one-time composto da un indicatore per la piattaforma TradingView (formato Pine Script) e da una guida PDF di utilizzo. L\'indicatore evidenzia condizioni tecniche predefinite su grafico, per aiutarti a leggere più velocemente struttura, livelli e dinamiche di mercato. Non sostituisce la tua analisi e non promette risultati.',
  },
  {
    question: 'Cosa ricevo esattamente dopo l\'acquisto di AV Market Lens?',
    answer:
      'Dopo l\'acquisto andato a buon fine (Purchase status succeeded, productSlug market-lens) puoi scaricare dal tuo account, nella sezione "I miei prodotti" dell\'area membri: 1) il file sorgente Pine Script dell\'indicatore (nome file: AV-Market-Lens.pine) e 2) la guida PDF ufficiale all\'utilizzo (nome file: AV-Market-Lens-Guida.pdf). Entrambi sono in formato scaricabile direttamente dal browser, senza URL pubblico.',
  },
  {
    question: 'Dove trovo i file di AV Market Lens dopo aver pagato?',
    answer:
      'Accedi all\'area membri con lo stesso account Google usato per il pagamento e vai a "I miei prodotti" (sezione /area-membri/prodotti), oppure dalla pagina del tuo profilo in "Acquisti e fatturazione" clicca sul pulsante "Apri prodotto" accanto alla riga di AV Market Lens. Se il pagamento è ancora in elaborazione, la pagina mostra uno stato di attesa; usa il pulsante "AGGIORNA STATO" o ricarica la pagina per verificare l\'attivazione.',
  },
  {
    question: 'Serve un account TradingView per usare l\'indicatore di AV Market Lens?',
    answer:
      'Sì: AV Market Lens è progettato esclusivamente per essere importato ed eseguito all\'interno della piattaforma TradingView, che è un servizio terzo indipendente. È sufficiente anche un account TradingView gratuito per importare il file .pine; funzionalità avanzate o abbonamenti specifici di TradingView, se richiesti, dipendono esclusivamente dalle politiche di TradingView.',
  },
  {
    question: 'AV Market Lens è un segnale di acquisto o vendita?',
    answer:
      'No. Assolutamente no. I marker, gli alert o le evidenziazioni prodotte dall\'indicatore derivano unicamente da regole tecniche predefinite su dati di mercato e hanno esclusivamente natura descrittiva e di supporto alla lettura grafica. Non costituiscono in alcun modo consigli personalizzati, istruzioni di acquisto/vendita, segnali operativi, previsioni o garanzie di risultato. Ogni decisione operativa resta sotto la tua esclusiva responsabilità. Consulta il Disclaimer pubblicato sul sito per i dettagli completi.',
  },
  {
    question: 'Cos\'è AV Trading Starter?',
    answer:
      'AV Trading Starter è un prodotto digitale one-time entry-level, consistente in una guida PDF educativa pensata per i principianti: copre le basi della lettura dei grafici, il riconoscimento dei trend, i livelli chiave e i primi concetti di gestione del rischio, con un approccio semplice e strutturato. È materiale esclusivamente formativo, non contiene analisi su strumenti specifici, non promette risultati e non sostituisce la tua valutazione autonoma.',
  },
  {
    question: 'Cosa ricevo esattamente dopo l\'acquisto di AV Trading Starter?',
    answer:
      'Dopo l\'acquisto andato a buon fine (Purchase status succeeded, productSlug trading-starter) puoi scaricare dal tuo account, nella sezione "I miei prodotti" dell\'area membri, la guida PDF ufficiale in formato scaricabile direttamente dal browser (nome file: AV-Trading-Starter.pdf). Il file è conservato su storage privato e non viene fornito alcun URL pubblico o permanente. Se il pagamento è ancora in elaborazione, la pagina mostra uno stato di attesa; usa il pulsante "AGGIORNA STATO" o ricarica la pagina per verificare l\'attivazione.',
  },
  {
    question: 'AV Trading Starter è un segnale operativo o una consulenza finanziaria?',
    answer:
      'No. Assolutamente no. AV Trading Starter è esclusivamente materiale formativo introduttivo: non contiene consigli personalizzati, raccomandazioni di acquisto o vendita, target di prezzo, indicazioni di timing o segnali operativi di qualsiasi genere. Non menziona strumenti finanziari specifici e non costituisce consulenza finanziaria, legale o fiscale. Ogni decisione di investimento o operativa resta sotto la tua esclusiva responsabilità. Consulta il Disclaimer e i Termini pubblicati sul sito per i dettagli completi.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-14 sm:py-32 scroll-mt-28" aria-labelledby="faq-heading">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">FAQ</span>
          <h2 id="faq-heading" className="mt-5 heading-lg">
            Domande frequenti. <span className="text-av-green">Risposte chiare.</span>
          </h2>
          <p className="mt-6 body-lg">
            Se non trovi quello che cerchi, prenota una call: rispondiamo a ogni dubbio
            senza giri di parole.
          </p>
        </div>

        <div className="mx-auto mt-9 sm:mt-14 max-w-3xl">
          <Accordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
