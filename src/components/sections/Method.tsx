import { Eye, Compass, Shield } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const steps = [
  {
    icon: Eye,
    num: '01',
    title: 'Leggi il contesto',
    text: 'Analizziamo struttura, trend, tempi e volumi per capire in quale ambiente operiamo, prima di prendere qualsiasi decisione.',
  },
  {
    icon: Compass,
    num: '02',
    title: 'Costruisci la tesi',
    text: 'Definiamo scenari, livelli chiave, trigger e condizioni di conferma o invalidazione: una mappa chiara prima di agire.',
  },
  {
    icon: Shield,
    num: '03',
    title: 'Gestisci il rischio',
    text: 'Dimensioniamo, impostiamo uscite e regole per proteggere il capitale. Il profitto è conseguenza, non obiettivo.',
  },
];

export default function Method() {
  return (
    <section id="metodo" className="relative py-14 sm:py-32 scroll-mt-28" aria-labelledby="metodo-heading">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Il metodo</span>
          <h2 id="metodo-heading" className="mt-5 heading-lg">
            Tre passi, una sola logica:{' '}
            <span className="text-av-green">decidere con criterio.</span>
          </h2>
          <p className="mt-5 body-lg">
            L&apos;obiettivo non è prevedere ogni movimento. È sapere cosa fare quando il
            mercato si muove.
          </p>
        </div>

        <div className="relative mt-10 sm:mt-16">
          <div
            aria-hidden="true"
            className="absolute left-[1.75rem] top-10 z-0 hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-transparent via-av-green-deep/70 to-transparent md:block"
          />
          <div className="relative z-10 grid auto-rows-fr gap-3.5 sm:gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <GlassCard key={s.num} hover className="h-full relative p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
                    <s.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-semibold text-av-green/40 sm:text-3xl">
                    {s.num}
                  </span>
                </div>
                <h3 className="mt-4 sm:mt-6 font-display text-lg sm:text-xl font-semibold text-white sm:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-2 sm:mt-3 text-sm leading-relaxed text-av-muted sm:text-base">
                  {s.text}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
