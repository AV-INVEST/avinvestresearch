'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { Loader2, Repeat2 } from 'lucide-react';

interface Props {
  returnTo?: string;
  className?: string;
}

export default function SwitchAccountButton({
  returnTo = '/area-membri',
  className,
}: Props) {
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    if (pending) return;
    setPending(true);
    try {
      await signOut({ redirect: false });
    } catch {
      // ignore local session end error; continue to sign-in chooser
    } finally {
      // Explicitly pass no login_hint so Google always offers the account
      // chooser. select_account is also set provider-side in auth.ts.
      await signIn('google', {
        callbackUrl: returnTo || '/area-membri',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={
        'btn-ghost w-full !py-2.5 !px-4 text-sm items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ' +
        (className || '')
      }
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-av-green" />
      ) : (
        <Repeat2 className="h-4 w-4 text-av-green" />
      )}
      CAMBIA ACCOUNT
    </button>
  );
}
