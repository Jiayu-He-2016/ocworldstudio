interface OCWorldLogoProps {
  className?: string;
  title?: string;
  monochrome?: boolean;
}

export default function OCWorldLogo({ className = "h-9 w-9", title = "OCWorld Studio", monochrome = false }: OCWorldLogoProps) {
  const ink = monochrome ? "currentColor" : "#172033";
  const cream = monochrome ? "transparent" : "#fff8ec";
  const sage = monochrome ? "currentColor" : "#7a8f82";
  const plum = monochrome ? "currentColor" : "#7b647d";

  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="5" y="5" width="38" height="38" rx="13" fill={cream} stroke={ink} strokeWidth="2.5" />
      <circle cx="24" cy="24" r="12.2" stroke={ink} strokeWidth="3.4" />
      <path d="M15 28.2c3.5 5.2 10.8 6.8 16 3.2" stroke={sage} strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M24 17.7 25.7 22.3 30.3 24 25.7 25.7 24 30.3 22.3 25.7 17.7 24 22.3 22.3 24 17.7Z"
        fill={plum}
        stroke={ink}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OCWorldBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <OCWorldLogo className={compact ? "h-8 w-8" : "h-9 w-9"} />
      <span className="font-serif text-lg font-semibold tracking-[-0.02em] text-slate-950">OCWorld Studio</span>
    </span>
  );
}
