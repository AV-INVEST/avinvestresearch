import type { FormEvent } from 'react';
import Image from 'next/image';
import { LogOut, ShieldCheck, UserRound, Sparkles, BookOpen, BarChart3, MessageSquare } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface Props {
  name: string;
  email: string;
  image?: string;
  signOutAction: () => Promise<void>;
}

export default function MemberAreaCard({ name, email, image, signOutAction }: Props) {
  const panels = [
    {
      icon: BookOpen,
      title: 'Materiale didattico',
      description: 'Dispense, esercitazioni e slide dei percorsi formativi.',
    },
    {
      icon: BarChart3,
      title: 'Research',
      description: 'Analisi di contesto, watchlist e note di mercato.',
    },
    {
      icon: MessageSquare,
      title: 'Community',
      description: 'Aggiornamenti e confronti dedicati ai membri.',
    },
  ];

  const onSignOut = async (e: FormEvent) => {
    e.preventDefault();
    await signOutAction();
  };

  return (
    <div className="mt-8 space-y-6">
      <GlassCard className="overflow-hidden p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-2xl border border-av-green-deep/60 bg-av-green/10 text-av-green">
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <UserRound className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                  Ciao, {name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/50 bg-av-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                  <ShieldCheck className="h-3 w-3" />
                  Accesso verificato
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-av-muted">{email}</p>
            </div>
          </div>
          <form onSubmit={onSignOut} className="sm:flex-none">
            <SignOutFormButton />
          </form>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
              Area membri
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-av-muted sm:text-base">
              Benvenuto nella sezione riservata.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {panels.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-av-line bg-av-bg-2/60 p-5 transition-colors hover:border-av-green-deep/50"
            >
              <h3 className="font-display text-lg font-semibold text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function SignOutFormButton() {
  'use client';
  const { useFormStatus } = require('react-dom') as typeof import('react-dom');
  const { pending } = useFormStatus();
  const { LogOut, Loader2 } = require('lucide-react') as typeof import('lucide-react');
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-ghost items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 text-av-green" />
      )}
      Esci
    </button>
  );
}
