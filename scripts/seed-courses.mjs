import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FOUNDATIONS_COURSE = {
  slug: 'foundations',
  title: 'AV Foundations',
  subtitle: 'Analisi tecnica da zero',
  description:
    'Un percorso chiaro e progressivo per comprendere grafici, trend, livelli, volumi, indicatori e gestione del rischio.',
  order: 0,
};

const TRADING_LAB_COURSE = {
  slug: 'trading-lab',
  title: 'AV Trading Lab',
  subtitle: 'Metodo operativo avanzato',
  description:
    'Un percorso avanzato dedicato a strategia, contesto, conferme, invalidazione, dimensionamento e disciplina operativa.',
  order: 1,
};

const FOUNDATIONS_MODULE = {
  slug: 'fondamenti-analisi-tecnica',
  title: 'Fondamenti di analisi tecnica',
  description:
    'Principi base, struttura del mercato, grafici, candele, trend, livelli, rotture, volumi, indicatori e gestione del rischio.',
  order: 0,
};

const FOUNDATIONS_LESSONS = [
  {
    slug: 'partire-da-zero-come-funzionano-i-mercati',
    title: 'Partire da zero: come funzionano i mercati',
    description:
      'Che cosa compri quando investi, chi partecipa al mercato e perche i prezzi cambiano.',
    order: 0,
  },
  {
    slug: 'investire-o-fare-trading-capire-la-differenza',
    title: 'Investire o fare trading? Capire la differenza',
    description:
      'Obiettivi, tempi e rischi dei due approcci, per partire con aspettative realistiche.',
    order: 1,
  },
  {
    slug: 'il-tuo-primo-grafico-orientarsi-senza-confusione',
    title: 'Il tuo primo grafico: orientarsi senza confusione',
    description:
      'Prezzo, tempo, timeframe e strumenti essenziali per leggere un grafico da zero.',
    order: 2,
  },
  {
    slug: 'candele-giapponesi-leggere-il-movimento-del-prezzo',
    title: 'Candele giapponesi: leggere il movimento del prezzo',
    description:
      'Apertura, chiusura, massimi, minimi e significato di corpi e ombre.',
    order: 3,
  },
  {
    slug: 'trend-riconoscere-rialzi-ribassi-e-fasi-laterali',
    title: 'Trend: riconoscere rialzi, ribassi e fasi laterali',
    description:
      'Leggere massimi e minimi per descrivere la struttura del mercato.',
    order: 4,
  },
  {
    slug: 'supporti-e-resistenze-individuare-le-zone-importanti',
    title: 'Supporti e resistenze: individuare le zone importanti',
    description:
      'Tracciare aree rilevanti senza riempire il grafico di linee o cercare livelli infallibili.',
    order: 5,
  },
  {
    slug: 'rotture-e-falsi-segnali-cosa-osservare',
    title: 'Rotture e falsi segnali: cosa osservare',
    description:
      'Capire breakout, retest e false rotture attraverso esempi semplici.',
    order: 6,
  },
  {
    slug: 'volumi-e-indicatori-pochi-strumenti-usati-bene',
    title: 'Volumi e indicatori: pochi strumenti, usati bene',
    description:
      'Introduzione a volumi, medie mobili e RSI, con applicazioni e limiti.',
    order: 7,
  },
  {
    slug: 'gestire-il-rischio-prima-di-pensare-al-profitto',
    title: 'Gestire il rischio prima di pensare al profitto',
    description:
      'Capitale esposto, dimensione della posizione, stop loss, leva e costi spiegati da zero.',
    order: 8,
  },
  {
    slug: 'la-tua-prima-analisi-completa-passo-dopo-passo',
    title: 'La tua prima analisi completa, passo dopo passo',
    description:
      'Applicare una checklist a un esempio storico e iniziare un diario di esercitazioni in demo.',
    order: 9,
  },
];

async function upsertCourse(input) {
  return prisma.course.upsert({
    where: { slug: input.slug },
    create: {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      order: input.order,
    },
    update: {},
    select: { id: true, slug: true },
  });
}

async function upsertModule(courseId, input) {
  return prisma.module.upsert({
    where: {
      courseId_slug: {
        courseId,
        slug: input.slug,
      },
    },
    create: {
      courseId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      order: input.order,
    },
    update: {},
    select: { id: true, slug: true, courseId: true },
  });
}

async function main() {
  console.log('[seed:courses] Upserting courses...');

  const foundations = await upsertCourse(FOUNDATIONS_COURSE);
  const tradingLab = await upsertCourse(TRADING_LAB_COURSE);
  console.log('[seed:courses] Courses ensured. foundations.id=', foundations.id, 'tradingLab.id=', tradingLab.id);

  console.log('[seed:courses] Upserting Foundations module...');
  const mod = await upsertModule(foundations.id, FOUNDATIONS_MODULE);
  console.log('[seed:courses] Module ensured. module.id=', mod.id);

  console.log('[seed:courses] Creating lessons with skipDuplicates...');
  const data = FOUNDATIONS_LESSONS.map((l) => ({
    moduleId: mod.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    order: l.order,
  }));

  const created = await prisma.lesson.createMany({
    data,
    skipDuplicates: true,
  });
  console.log('[seed:courses] Lessons created (or skipped):', created.count, 'new of', data.length);

  const count = await prisma.lesson.count({
    where: {
      module: {
        course: { slug: 'foundations' },
      },
    },
  });
  console.log('[seed:courses] Total foundations lessons in DB:', count);
}

main()
  .then(() => console.log('[seed:courses] Done.'))
  .catch((err) => {
    console.error('[seed:courses] FAILED:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
