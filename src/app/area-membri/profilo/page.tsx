import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowLeft,
  LogOut,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Cookie,
  Lock,
  UserRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Profilo e sicurezza',
  description: 'Gestisci profilo e sicurezza dell\'area membri.',
  alternates: { canonical: '/area-membri/profilo' },
};

async function logoutAction() {
  'use server';
  await signOut({ redirectTo: '/' });
}

export default async function ProfiloPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    const target =
      '/login?callbackUrl=' + encodeURIComponent('/area-membri/profilo');
    redirect(target);
  }
  const name = session.user.name || 'Membro AV-INVEST';
  const email = session.user.email || '';
  const image = session.user.image;

  const delSubject = encodeURIComponent(
    'Richiesta eliminazione dati e account',
  );
  const delBody = encodeURIComponent(
    `Ciao AV-INVEST,\n\nVorrei richiedere la eliminazione dei miei dati e la chiusura dell'account.\n\nNome: ${name}\nEmail: ${email}\nID sessione Google (se disponibile): ${session.user.id || 'N/A'}\n\nNote:\n- Confermo di voler procedere con la richiesta di cancellazione.\n\nData: ${new Date().toISOString()}\n`,
  );
  const deleteMailto = `mailto:${siteConfig.contactEmail}?subject=${delSubject}&body=${delBody}`;

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
            Profilo e sicurezza
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
            Controlla i tuoi dati e le impostazioni di sicurezza dell&apos;area
            membri.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="overflow-hidden p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="relative grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-2xl border border-av-green-deep/60 bg-av-green/10 text-av-green">
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <UserRound className="h-8 w-8" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold text-white truncate">
                {name}
              </p>
              <p className="mt-1 text-sm text-av-muted truncate">{email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                <ShieldCheck className="h-3 w-3" />
                Provider · Google
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-av-muted">
            <div className="flex items-center justify-between gap-3 border-t border-av-line pt-3">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-av-green" />
                Sessione
              </span>
              <span className="text-white">Attiva</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-av-line pt-3">
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-av-muted" />
                Data creazione account
              </span>
              <span>Non disponibile</span>
            </div>
          </div>
          <form action={logoutAction} className="mt-6">
            <button
              type="submit"
              className="btn-ghost w-full !py-2.5 !px-4 text-sm items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4 text-av-green" />
              LOGOUT
            </button>
          </form>
        </GlassCard>

        <div className="space-y-4 lg:col-span-3">
          <GlassCard className="overflow-hidden p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Collegamenti rapidi
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-av-muted">
              Riferimenti legali e strumenti utili per la tua privacy.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/privacy"
                className="group inline-flex items-center justify-between gap-3 rounded-xl border border-av-line bg-av-bg-2/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-av-green-deep/60"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-av-green" />
                  Privacy Policy
                </span>
              </Link>
              <Link
                href="/cookie"
                className="group inline-flex items-center justify-between gap-3 rounded-xl border border-av-line bg-av-bg-2/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-av-green-deep/60"
              >
                <span className="inline-flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-av-green" />
                  Gestisci preferenze cookie
                </span>
              </Link>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Sessioni e sicurezza
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-av-muted">
              L&apos;autenticazione usa sessioni JWT gestite tramite provider
              Google. La validit&agrave; di tutte le sessioni attive dipende
              dal tuo account Google: per disconnettere tutti i dispositivi
              contemporaneamente puoi usare la gestione sicurezza del tuo
              profilo Google.
            </p>
          </GlassCard>
        </div>
      </div>

      <section aria-labelledby="danger-zone-title">
        <GlassCard className="overflow-hidden border-red-500/20 bg-red-500/[0.02] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="danger-zone-title"
                className="font-display text-lg font-semibold text-white"
              >
                Eliminazione dati e account
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                Al momento non conserviamo un profilo persistente nel nostro
                database. L&apos;accesso all&apos;area membri si basa su una
                sessione JWT rilasciata tramite il tuo account Google.
                Eventuali dati futuri (corsi acquistati, registrazioni
                economiche o altre tracce necessarie per obblighi legali)
                potrebbero essere conservati separatamente.
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-av-muted">
                <li>• Per chiudere la sessione attiva usa il pulsante LOGOUT.</li>
                <li>
                  • Per richiedere la cancellazione di eventuali dati o futuri
                  record associati al tuo account, invia una email tramite il
                  pulsante seguente (oggetto e corpo precompilati).
                </li>
                <li>
                  • I dati fiscali o transazionali che devono essere
                  conservati per obbligo legale non saranno eliminati ma
                  gestiti secondo la normativa e la Privacy Policy.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={deleteMailto}
                  className="btn-ghost border-red-500/40 text-red-200 hover:border-red-500/60 hover:text-white !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4 text-red-300" />
                  Richiedi eliminazione via email
                </a>
              </div>
              <p className="mt-4 text-xs text-av-muted">
                Nota: non viene richiesta la digitazione di una conferma per
                ora in quanto non esiste una cancellazione server-side diretta
                degli utenti. Quando verr&agrave; introdotta una persistenza
                dedicata, questa sezione verr&agrave; aggiornata con il flusso
                di conferma e revoca.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
