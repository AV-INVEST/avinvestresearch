export const cookieConsentVersion = 1;

export type CookieCategory = 'necessari' | 'preferenze' | 'analitici' | 'marketing';

export interface CookieTableEntry {
  name: string;
  category: CookieCategory;
  provider: string;
  purpose: string;
  storage: 'http_only' | 'localStorage' | 'sessionStorage' | 'first_party';
  expiry: string;
  type: 'cookie' | 'localStorage';
}

export const cookieTable: CookieTableEntry[] = [
  {
    name: 'av-consent',
    category: 'necessari',
    provider: 'avinvestresearch.com (primo partito)',
    purpose:
      'Memorizza la scelta dell\'utente sulle categorie di cookie e la versione del consenso, per non ripetere il banner durante la visita successiva.',
    storage: 'localStorage',
    expiry: '12 mesi',
    type: 'localStorage',
  },
];

export const cookieCategories: Array<{
  id: CookieCategory;
  label: string;
  description: string;
  alwaysActive?: boolean;
}> = [
  {
    id: 'necessari',
    label: 'Necessari',
    description:
      'Attivi sempre. Servono al corretto funzionamento del sito (es. memorizzare le preferenze cookie, sicurezza di base). Non possono essere disattivati.',
    alwaysActive: true,
  },
  {
    id: 'preferenze',
    label: 'Preferenze',
    description:
      'Permettono di ricordare preferenze di visualizzazione o scelte compiute durante la navigazione.',
  },
  {
    id: 'analitici',
    label: 'Analitici',
    description:
      'Aiutano a capire come vengono usate le pagine del sito, per migliorare contenuti e performance. Al momento non vengono installati finché non viene dato il consenso.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description:
      'Possono essere usati per campagne promozionali e remarketing. Al momento non vengono installati finché non viene dato il consenso.',
  },
];
