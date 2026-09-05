import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginCard from '@/components/auth/LoginCard';
import { auth, getAuthEnvGuardMessage } from '@/auth';

export const metadata: Metadata = {
  title: 'Accedi',
  description: 'Accedi all\'area membri di AV-INVEST Research tramite Google.',
  alternates: { canonical: '/login' },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth().catch(() => null);
  const params = await searchParams;

  if (session?.user) {
    redirect(params.callbackUrl || '/area-membri');
  }

  const guardMessage = getAuthEnvGuardMessage();

  return (
    <div className="relative min-h-screen pt-28 pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_55%)]"
      />
      <div className="container-page">
        <div className="mx-auto max-w-md">
          <LoginCard
            callbackUrl={params.callbackUrl || '/area-membri'}
            error={params.error}
            guardMessage={guardMessage}
          />
        </div>
      </div>
    </div>
  );
}
