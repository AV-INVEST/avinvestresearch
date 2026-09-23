'use client';

import { useEffect, useState } from 'react';

interface LastUpdatedLabelProps {
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function LastUpdatedLabel({
  prefix = '',
  suffix = '',
  className = '',
}: LastUpdatedLabelProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(formatRomeDate(new Date()));
    const intervalMs = 60 * 1000;
    const id = window.setInterval(() => {
      setFormattedDate((prev) => {
        const next = formatRomeDate(new Date());
        return prev === next ? prev : next;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, []);

  if (!formattedDate) {
    return (
      <span className={className} aria-hidden="true">
        {prefix}&nbsp;{suffix}
      </span>
    );
  }

  return (
    <span className={className}>
      {prefix}
      {formattedDate}
      {suffix}
    </span>
  );
}

function formatRomeDate(date: Date): string {
  const day = new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    timeZone: 'Europe/Rome',
  }).format(date);
  const month = new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    timeZone: 'Europe/Rome',
  }).format(date);
  const year = new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    timeZone: 'Europe/Rome',
  }).format(date);
  return `${day} ${month} ${year}`;
}
