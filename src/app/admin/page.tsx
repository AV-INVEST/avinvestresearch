import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import GlassCard from '@/components/ui/GlassCard';
import {
  BookOpenCheck,
  FileSearch,
  ArrowRight,
  Database,
  Sparkles,
  AlertTriangle,
  FileVideo,
  FileText,
  CheckCircle2,
  PencilLine,
} from 'lucide-react';
import { isAdminSession } from '@/lib/auth/admin';
import { auth } from '@/auth';
import { getAdminEmailsFromEnv } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panoramica - Gestione contenuti',
  description: 'Panoramica amministrativa dei contenuti AV-INVEST Research.',
};

export default async function AdminDashboardPage() {
  const session = await auth().catch(() => null);
  const isAdmin = isAdminSession(session);
  if (!isAdmin) {
    return null;
  }

  const dbConfigured = isDatabaseConfigured();
  let stats = {
    courses: 0,
    modules: 0,
    lessonsDraft: 0,
    lessonsPublished: 0,
    researchDraft: 0,
    researchPublished: 0,
  };
  let dbError: string | null = null;

  if (dbConfigured) {
    try {
      const [courses, modules, lessonsDraft, lessonsPublished, researchDraft, researchPublished] =
        await Promise.all([
          prisma.course.count(),
          prisma.module.count(),
          prisma.lesson.count({ where: { status: 'DRAFT' } }),
          prisma.lesson.count({ where: { status: 'PUBLISHED' } }),
          prisma.researchDoc.count({ where: { status: 'DRAFT' } }),
          prisma.researchDoc.count({ where: { status: 'PUBLISHED' } }),
        ]);
      stats = {
        courses,
        modules,
        lessonsDraft,
        lessonsPublished,
        researchDraft,
        researchPublished,
      };
    } catch (err) {
      dbError = err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche.';
    }
  }

  const adminEmails = getAdminEmailsFromEnv();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-av-green">
            <Sparkles className="h-3.5 w-3.5" />
            Panoramica contenuti
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Gestione contenuti
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
            Crea, modifica e pubblica lezioni dei percorsi e prepara i
            documenti del Research Club.
          </p>
        </div>
      </div>

      {adminEmails.length === 0 ? (
        <GlassCard className="border-amber-500/30 bg-amber-500/[0.03] overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-white">
                Bootstrap amministratore non completato
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                La variabile ambiente{' '}
                <code className="rounded bg-av-bg-2/70 px-1.5 py-0.5 font-mono text-xs text-av-green">
                  ADMIN_GOOGLE_EMAILS
                </code>{' '}
                non contiene email valide. Imposta la tua email Google nella
                forma <code className="font-mono text-xs text-av-green">tuo.indirizzo@gmail.com</code>{' '}
                (CSV separato da virgola per pi&ugrave; amministratori).
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {dbError ? (
        <GlassCard className="border-red-500/30 bg-red-500/[0.03] overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-white">
                Database non disponibile
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted break-words">
                {dbError}
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
                Percorsi formativi
              </p>
              <div className="mt-2 flex items-end gap-2">
                <p className="font-display text-3xl font-semibold text-white">
                  {stats.courses}
                </p>
                <span className="text-xs text-av-muted">corsi · {stats.modules} moduli</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-av-muted">
                  <PencilLine className="h-3.5 w-3.5 text-av-green" />{' '}
                  Bozze: <span className="font-semibold text-white">{stats.lessonsDraft}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-av-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 text-av-green" />{' '}
                  Pubblicate: <span className="font-semibold text-white">{stats.lessonsPublished}</span>
                </span>
              </div>
            </div>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-green">
              <FileVideo className="h-5 w-5" />
            </span>
          </div>
          <Link
            href="/admin/corsi"
            className="btn-primary mt-4 w-full justify-center gap-2 shadow-glow-green-sm !py-2.5 !px-4 text-sm"
          >
            Gestisci percorsi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>

        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
                Research Club
              </p>
              <div className="mt-2 flex items-end gap-2">
                <p className="font-display text-3xl font-semibold text-white">
                  {stats.researchDraft + stats.researchPublished}
                </p>
                <span className="text-xs text-av-muted">documenti</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-av-muted">
                  <PencilLine className="h-3.5 w-3.5 text-av-green" />{' '}
                  Bozze: <span className="font-semibold text-white">{stats.researchDraft}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-av-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 text-av-green" />{' '}
                  Pubblicati: <span className="font-semibold text-white">{stats.researchPublished}</span>
                </span>
              </div>
            </div>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-green">
              <FileText className="h-5 w-5" />
            </span>
          </div>
          <Link
            href="/admin/research"
            className="btn-ghost mt-4 w-full justify-center gap-2 !py-2.5 !px-4 text-sm"
          >
            Apri Research Club
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-[11px] leading-relaxed text-av-muted">
            Nota: Nessun abbonamento subscriber attivo in questa fase. I
            documenti pubblicati non sono ancora accessibili ai membri.
          </p>
        </GlassCard>

        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
                Sistema
              </p>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-av-muted">
                    <Database className="h-4 w-4 text-av-green" />
                    Database
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      dbConfigured
                        ? 'border-av-green-deep/50 text-av-green bg-av-green/10'
                        : 'border-red-500/40 text-red-300 bg-red-500/10'
                    }`}
                  >
                    {dbConfigured ? 'Attivo' : 'Non configurato'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-av-muted">
                    <BookOpenCheck className="h-4 w-4 text-av-green" />
                    Admin registrati
                  </span>
                  <span className="font-semibold text-white text-xs">
                    {adminEmails.length}
                  </span>
                </div>
              </div>
            </div>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-green">
              <FileSearch className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-av-muted">
            Video provider e storage PDF privato sono boundary: mostrano uno
            stato onesto non configurato finch&eacute; non valorizzi le env
            corrispondenti. Nessun fallback pubblico.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
