/* Logo Cyronime — satu sumber bentuk, dipakai di semua tempat.
   Bentuk dasar sama dengan public/brand/cyronime-mark.svg:
   badge avatar girl (bun, anting tetes biru, skribel bingung).
   Garis ink mengikuti currentColor agar adaptif tema terang/gelap. */

export function CyronimeMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="32" cy="32" r="29" fill="#FFFDF6" stroke="currentColor" strokeWidth={3} />
      {/* skribel bingung */}
      <path
        d="M40 8.5 C43 6 47 7 47 10 C47 13 43 12.5 43.5 15.5 C44 18 40 18.5 39.5 16"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none"
      />
      {/* rambut belakang + bun */}
      <path
        d="M18 33 C14 20 21 10 32 10 C43 10 50 20 46 33 C46 24 40 18 32 18 C24 18 18 24 18 33 Z"
        fill="currentColor"
      />
      <circle cx="32" cy="9" r="6.5" fill="currentColor" />
      {/* jepit rambut putih */}
      <path d="M43.5 14.5 L47 15.5 L44 17.5" stroke="#FFFDF6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* wajah */}
      <path
        d="M20.5 33 C20.5 24 25.5 19.5 32 19.5 C38.5 19.5 43.5 24 43.5 33 C43.5 40 38.5 45.5 32 45.5 C25.5 45.5 20.5 40 20.5 33 Z"
        fill="#F3D9C6"
      />
      {/* poni + helai lepas */}
      <path
        d="M22.5 26 C24 20.5 28 18 32 18 C36.5 18 40 20 41.5 25 C39 23 36 22.5 33 24 C30 25.5 25.5 25 22.5 26 Z"
        fill="currentColor"
      />
      <path d="M20.5 30 C18.5 33 18.5 37 20 39" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* mata */}
      <path d="M35.5 30.5 C36.2 29.8 37.3 29.8 38 30.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <path d="M42.5 30.5 C43.2 29.8 44.3 29.8 45 30.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      {/* blush */}
      <circle cx="35" cy="35.5" r={2.6} fill="#E8A9B8" opacity={0.85} />
      <circle cx="45" cy="35.5" r={2.6} fill="#E8A9B8" opacity={0.85} />
      <path d="M41 39.5 L43.5 39.2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      {/* leher + baju biru */}
      <path d="M27 44 L27 49 L37 49 L37 44" fill="#F3D9C6" />
      <path
        d="M20 54 C22 49.5 26 47 32 47 C38 47 42 49.5 44 54 L44 61 L20 61 Z"
        fill="#1C4EAB" stroke="currentColor" strokeWidth={2.6} strokeLinejoin="round"
      />
      {/* anting tetes biru */}
      <path
        d="M25.2 50.5 C24.4 52.8 25 55.5 27.2 56.4 C29.6 57.4 32 55.8 32 53.4 C32 51.6 30.6 50.4 29.4 49.6 Z"
        fill="#0033CC" stroke="currentColor" strokeWidth={1.6}
      />
      <circle cx="28.5" cy="53.2" r={1} fill="#FFFDF6" />
      <path d="M44.5 46 L46 49 L43 49.4 Z" fill="#F6DF83" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}

export function CyronimeLogo({
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
      <CyronimeMark size={size} className="shrink-0 text-ink" />
      {withWordmark && (
        <span className="font-display text-lg font-extrabold tracking-tight text-ink">
          Cyronime<span className="text-primary">API</span>
        </span>
      )}
    </span>
  );
}
