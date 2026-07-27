type IconProps = { className?: string };

const SHARED = "stroke-current fill-none";

export function HomeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`${SHARED} ${className}`}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function ExpensesIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`${SHARED} ${className}`}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

export function BudgetsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`${SHARED} ${className}`}>
      <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="16.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InsightsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`${SHARED} ${className}`}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  );
}

export function MoreIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`${SHARED} ${className}`}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}
