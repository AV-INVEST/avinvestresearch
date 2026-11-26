import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { isDatabaseConfigured } from '@/lib/db/prisma';
import { listLiveEventsAdmin } from '@/lib/admin/live-event-admin';
import GlassCard from '@/components/ui/GlassCard';
import { AlertTriangle, ArrowLeft, CalendarClock } from 'lucide-react';
import EventiManager from './eventi-manager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Eventi Live',
  description: 'Gestione degli Eventi Live Premium: creazione, pubblicazione e biglietti.',
  robots: { index: false, follow: false },
};

export default async function AdminEventiPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect('/login?callbackUrl=' + encodeURIComponent('/admin/eventi'));
  if (!isAdminSession(session)) notFound();

  const dbConfigured = isDatabaseConfigured();
  const events = await listLiveEventsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Torna a dashboard admin
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            <span className="flex items-center gap-2">
              <CalendarClock className="h-7 w-7 text-av-green" aria-hidden="true" />
              Eventi Live
            </span>
          </h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-av-muted/90">
          Crea eventi formativi online, pubblica o riporta in bozza senza deploy e monitora i
          biglietti venduti. Le date sono salvate in UTC e mostrate nel fuso Europe/Rome.
        </p>
      </div>

      {!dbConfigured ? (
        <GlassCard className="border-av-yellow-deep/30 bg-av-yellow/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-none text-av-yellow" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-av-yellow">Database non configurato</p>
              <p className="mt-1 text-xs leading-relaxed text-av-yellow/85">
                La variabile <code className="font-mono">DATABASE_URL</code> non è impostata.
                Gli eventi non possono essere caricati né salvati finché il database non è
                disponibile.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <EventiManager initial={events} />
    </div>
  );
}
