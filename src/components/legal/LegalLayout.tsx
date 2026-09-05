import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { siteConfig } from '@/config/siteConfig';

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function LegalLayout({ title, subtitle, children }: LegalLayoutProps) {
  return (
    <div className="relative min-h-screen pt-24 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_55%)]"
      />
      <div className="container-page pb-20 sm:pb-28">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla home
        </Link>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-amber-400 sm:text-base">
                Bozza — Richiede revisione legale
              </p>
            </div>
            <p className="text-sm leading-relaxed text-amber-200/80 sm:text-base">
              {siteConfig.legal.draftNotice}
            </p>
          </div>

          <header className="mt-10">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 text-base leading-relaxed text-av-muted sm:text-lg">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-6 h-px w-full bg-gradient-to-r from-av-green/50 via-av-line to-transparent" />
          </header>

          <article className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-av-muted sm:text-base">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}
