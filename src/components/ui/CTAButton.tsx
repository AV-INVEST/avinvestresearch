import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

type Variant = 'primary' | 'ghost';
type Size = 'md' | 'lg';

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  external = false,
  icon,
  className = '',
  ariaLabel,
}: CTAButtonProps) {
  const sizeClass =
    size === 'lg' ? (variant === 'primary' ? 'btn-primary-lg' : 'btn-ghost-lg') : '';
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-ghost';
  const arrow = icon ?? <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${sizeClass} ${className}`}
        aria-label={ariaLabel}
      >
        {children}
        {arrow}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`${baseClass} ${sizeClass} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
      {arrow}
    </a>
  );
}
