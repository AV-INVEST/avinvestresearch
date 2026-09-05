import Link from 'next/link';
import { Phone, BookOpen } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export default function MobileBottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden safe-bottom">
      <div className="mx-auto w-full max-w-md px-3 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] pt-2">
        <div className="grid grid-cols-2 items-center gap-2 rounded-2xl border border-av-line bg-av-bg/90 p-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <Link
            href="/#percorsi"
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-av-surface active:bg-av-surface min-h-[44px] min-w-0"
          >
            <BookOpen className="h-4 w-4 flex-none text-av-green" />
            <span className="truncate">Percorsi</span>
          </Link>
          <a
            href={siteConfig.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-av-green py-2.5 pl-3 pr-3 text-sm font-semibold text-black shadow-glow-green-sm transition-all hover:bg-white min-h-[44px] min-w-0"
            aria-label="Prenota una call - Link Calendly (si apre in una nuova scheda)"
          >
            <Phone className="h-4 w-4 flex-none" />
            <span className="truncate">PRENOTA UNA CALL</span>
          </a>
        </div>
      </div>
    </div>
  );
}
