export const siteConfig = {
  name: 'AV-INVEST RESEARCH',
  shortName: 'AV-INVEST',
  tagline: 'Non seguire il mercato. Impara a leggerlo.',
  url: 'https://avinvestresearch.com',
  description:
    'Formazione finanziaria, analisi tecnica e metodo operativo per prendere decisioni più consapevoli.',
  locale: 'it-IT',
  ogImage: '/og.png',

  calendlyUrl: 'https://calendly.com/REPLACE-ME',
  contactEmail: 'info@avinvestresearch.com',

  social: {
    linkedin: 'https://www.linkedin.com/company/av-invest-research',
    instagram: 'https://www.instagram.com/avinvestresearch',
    youtube: 'https://www.youtube.com/@avinvestresearch',
    x: 'https://x.com/avinvestresearch',
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
      price: 497,
      currency: 'EUR',
      available: false,
    },
    tradingLab: {
      slug: 'trading-lab',
      title: 'AV Trading Lab',
      subtitle: 'Metodo operativo avanzato',
      description:
        'Un percorso avanzato dedicato a strategia, contesto, conferme, invalidazione, dimensionamento e disciplina operativa.',
      topics: [
        'Analisi multi-timeframe',
        'Qualità del setup',
        'Conferme',
        'Invalidazione',
        'Position sizing',
        'Gestione dell\'operazione',
      ],
      price: 897,
      currency: 'EUR',
      available: false,
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

  navigation: [
    { label: 'Percorsi', href: '#percorsi' },
    { label: 'Research Club', href: '#research-club' },
    { label: 'Metodo', href: '#metodo' },
    { label: 'Chi sono', href: '#chi-sono' },
    { label: 'FAQ', href: '#faq' },
  ],

  legal: {
    companyName: 'AV-INVEST Research',
    address: 'Indirizzo sede legale — inserire dopo revisione legale',
    vatId: 'P.IVA — inserire dopo revisione legale',
    fiscalCode: 'Codice Fiscale — inserire dopo revisione legale',
    disclaimer:
      'I contenuti hanno finalità esclusivamente informative ed educative e non costituiscono consulenza finanziaria personalizzata, sollecitazione all\'investimento o promessa di rendimento.',
    draftNotice:
      'Documento in bozza. Richiede revisione legale professionale prima della pubblicazione definitiva.',
  },
} as const;

export type SiteConfig = typeof siteConfig;
