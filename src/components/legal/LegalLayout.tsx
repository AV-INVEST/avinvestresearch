import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { siteConfig } from '@/config/siteConfig';
import LastUpdatedLabel from '@/components/ui/LastUpdatedLabel';

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
          <header>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 text-base leading-relaxed text-av-muted sm:text-lg">
                {subtitle}
              </p>
            ) : null}
            <p className="mt-5 text-xs font-medium text-av-muted sm:text-sm">
              <LastUpdatedLabel prefix="Ultimo aggiornamento: " />
            </p>
            <div className="mt-5 h-px w-full bg-gradient-to-r from-av-green/50 via-av-line to-transparent" />
          </header>

          <article className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-av-muted sm:text-base">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}
