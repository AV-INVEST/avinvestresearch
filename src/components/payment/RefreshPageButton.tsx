'use client';

import { RefreshCw } from 'lucide-react';

export default function RefreshPageButton({
  label = 'AGGIORNA STATO',
  compact = false,
  variant = 'primary',
}: {
  label?: string;
  compact?: boolean;
  variant?: 'primary' | 'yellow';
}) {
  const onClick = () => {
    window.location.reload();
  };

  if (variant === 'yellow') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/50 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-yellow-400/20 transition-colors ${
          compact ? '!px-2.5 !py-1 text-[11px]' : ''
        }`}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-primary shadow-glow-green-sm inline-flex items-center gap-2 whitespace-nowrap ${
        compact ? '!py-2 !px-3.5 text-xs' : ''
      }`}
    >
      <RefreshCw className="h-4 w-4" />
      {label}
    </button>
  );
}
