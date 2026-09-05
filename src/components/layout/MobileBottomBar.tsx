import Link from 'next/link';
import { Phone, BookOpen } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export default function MobileBottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-auto w-full max-w-md px-3 pb-3 pt-2">
        <div className="flex items-center gap-2 rounded-2xl border border-av-line bg-av-bg/90 p-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <Link
            href="#percorsi"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:bg-av-surface active:bg-av-surface"
          >
            <BookOpen className="h-4 w-4 text-av-green" />
            Percorsi
          </Link>
          <a
            href={siteConfig.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-[1.2] items-center justify-center gap-2 rounded-xl bg-av-green py-2.5 text-sm font-semibold text-black shadow-glow-green-sm transition-all hover:bg-white"
            aria-label="Call Me — prenota una call (link esterno)"
          >
            <Phone className="h-4 w-4" />
            Call Me
          </a>
        </div>
      </div>
    </div>
  );
}
