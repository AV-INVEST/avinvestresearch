export default function MarketLine({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 80"
      aria-hidden="true"
      className={`h-16 w-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ml-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00ff6a" stopOpacity="0" />
          <stop offset="10%" stopColor="#00ff6a" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#00ff6a" stopOpacity="1" />
          <stop offset="90%" stopColor="#00ff6a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00ff6a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,55 C120,55 140,28 260,32 C380,36 400,62 520,56 C640,50 660,22 780,28 C900,34 920,58 1040,50 C1160,42 1180,18 1300,26 C1420,34 1440,50 1600,48"
        fill="none"
        stroke="url(#ml-stroke)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
