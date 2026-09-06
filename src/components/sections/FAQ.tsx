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
      'È un ambiente riservato con approfondimenti settimanali su mercati, aziende e settori: analisi documentate, scenari, catalizzatori e rischi. Non è un segnale, non sostituisce la tua valutazione e non promette risultati. È materiale di ricerca e studio, pensato per approfondire e allenare il processo decisionale.',
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
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 scroll-mt-28" aria-labelledby="faq-heading">
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

        <div className="mx-auto mt-14 max-w-3xl">
          <Accordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
