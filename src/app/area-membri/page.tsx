import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import MemberAreaCard from '@/components/auth/MemberAreaCard';

export const metadata: Metadata = {
  title: 'Area membri',
  description: 'Area riservata ai membri di AV-INVEST Research.',
  alternates: { canonical: '/area-membri' },
};

export default async function AreaMembriPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect('/login');
  const doSignOut = async () => {
    'use server';
    await signOut({ redirectTo: '/' });
  };
  return (
    <div className="relative min-h-screen pt-28 pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_55%)]"
      />
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
          >
            ← Torna alla home
          </Link>
          <MemberAreaCard
            name={session.user.name || 'Membro AV-INVEST'}
            email={session.user.email || ''}
            image={session.user.image || undefined}
            signOutAction={doSignOut}
          />
        </div>
      </div>
    </div>
  );
}
