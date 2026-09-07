export function computeCalendlyUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CALENDLY_URL;
  if (!raw || typeof raw !== 'string') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[siteConfig] NEXT_PUBLIC_CALENDLY_URL non è configurato. I pulsanti "Prenota una call" non navigheranno verso Calendly fino a quando la variabile non sarà impostata.',
      );
    }
    return undefined;
  }
  const trimmed = raw.trim();
  const forbidden = ['replace', 'REPLACE', '---', 'xxx', 'XXX', 'esempio', 'example'];
  if (forbidden.some((f) => trimmed.toLowerCase().includes(f.toLowerCase())) || trimmed.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[siteConfig] NEXT_PUBLIC_CALENDLY_URL contiene un valore placeholder non valido. I pulsanti "Prenota una call" rimarranno inattivi finché non sarà configurato un URL reale.',
      );
    }
    return undefined;
  }
  return trimmed;
}

export const calendlyUrl = computeCalendlyUrl();

export const siteConfig = {
  name: 'AV-INVEST RESEARCH',
  shortName: 'AV-INVEST',
  tagline: 'Non seguire il mercato. Impara a leggerlo.',
  url: 'https://avinvestresearch.com',
  description:
    'Formazione finanziaria, analisi tecnica e metodo operativo per prendere decisioni più consapevoli.',
  locale: 'it-IT',
  ogImage: '/og.png',

  calendlyUrl,
  contactEmail: 'avinvestresearch@gmail.com',

  featureFlags: {
    memberAreaEnabled: true,
  },

  social: {
    linkedin: 'https://www.linkedin.com/in/andreavivace/',
    instagram: 'https://www.instagram.com/avinvestresearch/',
  },

  founder: {
    name: 'Andrea',
    bio: 'Andrea è il fondatore di AV-INVEST Research. Il progetto nasce per rendere l\'analisi dei mercati più comprensibile, strutturata e trasparente.',
  },

  courses: {
    foundations: {
      slug: 'foundations',
      title: 'AV Foundations',
      subtitle: 'Analisi tecnica da zero',
      description:
        'Un percorso chiaro e progressivo per comprendere grafici, trend, livelli, volumi, indicatori e gestione del rischio.',
      topics: [
        'Struttura del mercato',
        'Trend',
        'Supporti e resistenze',
        'Volumi',
        'Indicatori',
        'Gestione del rischio',
      ],
      price: 297,
      currency: 'EUR',
      available: true,
    },
    tradingLab: {
      slug: 'trading-lab',
      title: 'AV Trading Lab',
      subtitle: 'Metodo operativo avanzato',
      description:
        'Un percorso avanzato dedicato a strategia, contesto, conferme, invalidazione, dimensionamento e disciplina operativa.',
      topics: [
        'Analisi multi-timeframe',
        'Qualita del setup',
        'Conferme',
        'Invalidazione',
        'Position sizing',
        'Gestione dell\'operazione',
      ],
      price: 497,
      currency: 'EUR',
      available: true,
    },
  },

  researchClub: {
    title: 'AV Research Club',
    badge: 'PROSSIMAMENTE',
    description:
      'Un ambiente riservato dedicato a ricerca, scenari di mercato e approfondimenti documentati su aziende e settori.',
    features: [
      'Weekly Market Radar',
      'Small & Mid Cap Focus',
      'Scenari, catalizzatori e rischi',
      'Archivio delle ricerche',
    ],
  },

  performance: {
    measuredAtLabel: '5 settembre 2026',
    entries: [
      {
        id: '2024h',
        label: '2024 - dal 9 luglio',
        value: 14.13,
        suffix: '%',
        positive: true,
      },
      {
        id: '2025f',
        label: '2025 - anno completo',
        value: 33.88,
        suffix: '%',
        positive: true,
      },
      {
        id: 'copiers',
        label: 'Investitori in copia attuali',
        value: 138,
        suffix: '',
        positive: true,
      },
      {
        id: 'aum',
        label: 'Capitale in copia: fascia $300K-$1M',
        value: 0,
        suffix: '',
        positive: false,
        displayValue: '$300K - $1M',
      },
    ],
    disclaimer:
      'I rendimenti passati non costituiscono un indicatore affidabile dei risultati futuri. Investire comporta il rischio di perdita del capitale.',
    sourceNote:
      'Dati del portafoglio pubblico AV-INVEST, rilevati il 5 settembre 2026.',
  },

  testimonials: [
    {
      id: 't1',
      author: 'Feedback pubblico di un investitore',
      text: 'Un messaggio estremamente chiaro, trasparente e maturo. Dimostra una visione strategica lucida e una gestione delle emozioni essenziale per chi gestisce capitale.',
    },
    {
      id: 't2',
      author: 'Feedback pubblico di un investitore',
      text: 'Personalmente, anche se investo quello che posso, il risultato ottenuto è positivo. Grazie.',
    },
    {
      id: 't3',
      author: 'Feedback pubblico di un investitore',
      text: 'Complimenti, continua così. Sono felice di copiarti.',
    },
    {
      id: 't4',
      author: 'Feedback pubblico di un investitore',
      text: 'Ho piena fiducia in te, continua così.',
    },
  ],

  navigation: [
    { label: 'Percorsi', href: '/#percorsi' },
    { label: 'Research Club', href: '/#research-club' },
    { label: 'Metodo', href: '/#metodo' },
    { label: 'Chi sono', href: '/#chi-sono' },
    { label: 'FAQ', href: '/#faq' },
  ],

  legal: {
    companyName: 'AV-INVEST Research',
    lastUpdated: '5 settembre 2026',
    disclaimer:
      'I contenuti hanno finalità esclusivamente informative ed educative e non costituiscono consulenza finanziaria personalizzata, sollecitazione all\'investimento o promessa di rendimento.',
    extendedDisclaimer: [
      'Tutti i contenuti del sito, dei corsi, delle ricerche e del materiale didattico hanno esclusivamente finalità educative e informative.',
      'Nulla di quanto pubblicato costituisce consulenza finanziaria personalizzata, consulenza legale, fiscale o di investimento.',
      'Nessun contenuto deve essere interpretato come raccomandazione, sollecitazione all\'investimento o suggerimento di strategia.',
      'Non sono garantiti rendimenti, profitti o performance futuri di alcun tipo.',
      'I mercati finanziari comportano rischi significativi, inclusa la possibile perdita totale del capitale investito.',
      'I risultati storici e le performance passate non costituiscono garanzia di risultati futuri.',
      'Grafici, esempi e scenari pubblicati possono essere rappresentazioni illustrative a scopo didattico.',
      'L\'acquisto di un corso o l\'accesso a contenuti formativi non dà diritto a ricevere segnali di investimento, consigli personalizzati o risultati garantiti.',
    ],
    identity: {
      address: null as string | null,
      vatId: null as string | null,
      fiscalCode: null as string | null,
      companyRegister: null as string | null,
      pec: null as string | null,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function computeCheckoutEnabled(cfg: typeof siteConfig): boolean {
  if (!cfg.courses.foundations.available || !cfg.courses.tradingLab.available) return false;
  const sk = process.env.STRIPE_SECRET_KEY;
  const wsec = process.env.STRIPE_WEBHOOK_SECRET;
  const p1 = process.env.STRIPE_PRICE_AV_FOUNDATIONS;
  const p2 = process.env.STRIPE_PRICE_AV_TRADING_LAB;
  if (!sk || !wsec || !p1 || !p2) return false;
  const forbidden = ['replace', 'REPLACE', '---', 'xxx', 'XXX'];
  for (const v of [sk, wsec, p1, p2]) {
    if (forbidden.some((f) => v.includes(f)) || v.trim().length === 0) return false;
  }
  return true;
}

export const checkoutEnabled = computeCheckoutEnabled(siteConfig);
