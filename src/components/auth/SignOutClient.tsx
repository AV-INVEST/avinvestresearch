'use client';

import { useFormStatus } from 'react-dom';
import { LogOut, Loader2 } from 'lucide-react';

export default function SignOutClient({ actionPath }: { actionPath: string }) {
  const { pending } = useFormStatus();
  void actionPath;
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
