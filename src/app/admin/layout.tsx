import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import {
  LayoutDashboard,
  BookOpenCheck,
  FileSearch,
  LogOut,
  ShieldAlert,
  Home,
  ArrowUpRight,
  Eye,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Gestione contenuti',
    template: '%s - Admin',
  },
  description: 'Pannello di gestione contenuti AV-INVEST Research - Accesso riservato.',
  robots: {
    index: false,
    follow: false,
  },
};

const NAV: Array<{ href: string; label: string; Icon: typeof Home }> = [
  { href: '/admin', label: 'Panoramica', Icon: LayoutDashboard },
  { href: '/admin/corsi', label: 'Percorsi formativi', Icon: BookOpenCheck },
  { href: '/admin/research', label: 'Research Club', Icon: FileSearch },
  { href: '/admin/market-lens', label: 'AV Market Lens', Icon: Eye },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth().catch(() => null);
  const isAdmin = isAdminSession(session);

  if (!session?.user) {
    return (
      <main className="min-h-screen grid place-items-center bg-av-bg p-6">
        <div className="max-w-md w-full rounded-2xl border border-av-line bg-av-surface/70 backdrop-blur-xl p-6 sm:p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-av-green mx-auto" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-white">
            Autenticazione richiesta
          </h1>
          <p className="mt-2 text-sm text-av-muted">
            Effettua l&apos;accesso con il tuo account Google per accedere al
            pannello amministrativo.
          </p>
          <Link
            href="/login?callbackUrl=%2Fadmin"
            className="btn-primary mt-6 shadow-glow-green-sm w-full justify-center gap-2"
          >
            Vai al login
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center bg-av-bg p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/[0.03] backdrop-blur-xl p-6 sm:p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-red-300 mx-auto" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-white">
            403 - Accesso riservato
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted">
            Questa area e dedicata esclusivamente all&apos;amministratore. Se
            credi di aver ricevuto questo messaggio per errore, contatta il
            supporto.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
            >
              <Home className="h-4 w-4 text-av-green" />
              Torna al sito
            </Link>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button
                type="submit"
                className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4 text-av-green" />
                LOGOUT
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const name = session.user.name || 'Amministratore';
  const email = session.user.email || '';

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.07),transparent_55%)]"
      />
      <div className="container-page space-y-6">
        <header className="rounded-2xl border border-av-line bg-av-surface/60 backdrop-blur-xl p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/admin"
                className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-green-deep/60 bg-av-green/10 text-av-green"
                aria-label="AV-INVEST Research - Admin"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M3 17l5-5 4 4 9-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display truncate text-base font-semibold text-white sm:text-lg">
                    AV-INVEST <span className="text-av-green">RESEARCH</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                    <ShieldAlert className="h-3 w-3" />
                    Gestione contenuti
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-av-muted">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 transition-colors hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Home className="h-3.5 w-3.5" />
                    Apri sito pubblico
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="text-xs text-white font-semibold sm:text-right">
                {name}
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/login' });
                }}
                className="sm:flex-none"
              >
                <button
                  type="submit"
                  className="btn-ghost w-full !py-2.5 !px-4 text-sm items-center justify-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4 text-av-green" />
                  LOGOUT
                </button>
              </form>
            </div>
          </div>

          <nav
            aria-label="Admin - Navigazione"
            className="mt-4 flex flex-wrap gap-1.5 border-t border-av-line pt-4 sm:gap-2"
          >
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-xl border border-av-line bg-av-bg-2/50 px-3 py-2 text-sm font-medium text-av-muted transition-colors hover:border-av-green-deep/50 hover:text-white"
              >
                <Icon className="h-4 w-4 flex-none text-av-green" />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </nav>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
