import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  ShieldQuestion,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Assistenza',
  description: 'Contatta il supporto di AV-INVEST Research.',
  alternates: { canonical: '/area-membri/assistenza' },
};

export default async function AssistenzaPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    const target =
      '/login?callbackUrl=' + encodeURIComponent('/area-membri/assistenza');
    redirect(target);
  }
  const email = siteConfig.contactEmail;
  const subject = encodeURIComponent('Assistenza area membri');
  const body = encodeURIComponent(
    `Ciao AV-INVEST,\n\nHo bisogno di supporto per l'area membri.\n\nNome: ${session.user.name || ''}\nEmail: ${session.user.email || ''}\n\n`,
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/area-membri"
            className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla Panoramica
          </Link>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Assistenza
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
            Per qualsiasi domanda o problema tecnico relativo all&apos;area
            membri, puoi contattarci tramite i canali ufficiali indicati di
            seguito.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
              <Mail className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-white">
                Email di supporto
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                Rispondiamo entro 1-2 giorni lavorativi. Includi nel messaggio
                la mail con cui hai effettuato l&apos;accesso.
              </p>
              <a
                href={`mailto:${email}?subject=${subject}&body=${body}`}
                className="mt-4 btn-primary !py-2.5 !px-4 text-sm shadow-glow-green-sm inline-flex"
              >
                Scrivi una email
              </a>
              <p className="mt-3 break-all text-xs text-av-muted">{email}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-line bg-av-surface/60 text-av-muted">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-white">
                Canali dedicati
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                Se hai acquistato un percorso tramite canale privato, puoi
                usare i riferimenti ricevuti al momento dell&apos;acquisto per
                un supporto diretto.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-line bg-av-surface/60 text-av-muted">
            <ShieldQuestion className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-white">
              Prima di scrivere
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-av-muted">
              <li>• Verifica che la sessione sia attiva e prova a ricaricare la pagina.</li>
              <li>• Per problemi di accesso, indica l&apos;esatto messaggio di errore e l&apos;ora in cui si è verificato.</li>
              <li>• Ricorda che tutti i contenuti hanno finalità educative e non costituiscono consulenza finanziaria.</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
