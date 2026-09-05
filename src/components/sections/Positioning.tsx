import { Target, Shield, LineChart } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const pillars = [
  {
    icon: LineChart,
    title: 'Analisi',
    text: 'Strumenti e regole per leggere struttura, trend e contesto di mercato, senza scorciatoie e senza facili certezze.',
  },
  {
    icon: Shield,
    title: 'Gestione del rischio',
    text: 'dimensione del capitale, esposizione massima e regole di ingresso e uscita prima di pensare al profitto.',
  },
  {
    icon: Target,
    title: 'Processo ripetibile',
    text: 'un metodo documentato, verificabile e applicabile nel tempo, per prendere decisioni con criterio.',
  },
];

export default function Positioning() {
  return (
    <section id="posizionamento" className="relative py-24 sm:py-32 scroll-mt-28" aria-labelledby="pos-heading">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Perché AV‑INVEST</span>
          <h2 id="pos-heading" className="mt-5 heading-lg">
            Il mercato non premia chi indovina.
            <br />
            <span className="text-av-green">Premia chi sa gestire l&apos;incertezza.</span>
          </h2>
          <p className="mt-6 body-lg">
            AV‑INVEST insegna analisi, gestione del rischio e un processo decisionale
            ripetibile: competenze reali, per muoversi nel mercato con consapevolezza e
            criterio, dall&apos;obiettivo di lungo periodo.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <GlassCard key={title} hover className="p-6 sm:p-7">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-av-muted sm:text-base">
                {text}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
