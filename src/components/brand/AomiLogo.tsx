/* Logo Aomi API — satu sumber bentuk, dipakai di semua tempat.
   Bentuk dasar sama dengan public/brand/aomi-mark.svg;
   warna garis mengikuti currentColor agar adaptif tema. */

export function AomiMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M32 15 C26 10.5 17 10 8.5 13.5 L8.5 49.5 C17 46.5 26 47 32 51.5 Z"
        fill="#FFFDF6"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <path
        d="M32 15 C38 10.5 47 10 55.5 13.5 L55.5 49.5 C47 46.5 38 47 32 51.5 Z"
        fill="#FFF8E8"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <line x1={38} y1={25} x2={50} y2={23.5} stroke="#277C82" strokeWidth={2.2} strokeLinecap="round" />
      <line x1={38} y1={32} x2={52} y2={30.5} stroke="#C9B98C" strokeWidth={2.2} strokeLinecap="round" />
      <line x1={38} y1={39} x2={48} y2={37.5} stroke="#C9B98C" strokeWidth={2.2} strokeLinecap="round" />
      <path
        d="M20 22 L13.5 28.5 L20 35"
        stroke="#277C82"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M25.5 22 L28 28.5 L22 38.5"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14 49 C19 46.5 26 46 32 50 C38 46 45 45.5 50 48"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M52.5 4 L54.2 8.8 L59 10.5 L54.2 12.2 L52.5 17 L50.8 12.2 L46 10.5 L50.8 8.8 Z"
        fill="#F6DF83"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AomiLogo({
  size = 30,
  withWordmark = true,
  className = "",
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <AomiMark size={size} className="shrink-0 text-ink" />
      {withWordmark && (
        <span className="font-display text-lg font-extrabold tracking-tight text-ink">
          Aomi<span className="text-primary">API</span>
        </span>
      )}
    </span>
  );
}
