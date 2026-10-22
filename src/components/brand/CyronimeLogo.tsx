/* Brand mark Cyronime — ikon maskot vektor (images/mascot/mascot-icon.svg).
   Siluet rambut acak + kacamata bulat, monokrom; identitas dari maskot resmi. */

export function CyronimeMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/mascot/mascot-icon.svg"
      alt="Maskot Cyronime"
      width={size}
      height={size}
      className={`shrink-0 rounded-[28%] object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function CyronimeLogo({ size = 36, tagline = true }: { size?: number; tagline?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <CyronimeMark size={size} />
      {tagline ? (
        <span className="flex flex-col leading-tight">
          <span className="font-display text-[15px] font-bold tracking-tight text-ink">Cyronime</span>
          <span className="text-[11px] text-ink-muted">Free REST API</span>
        </span>
      ) : (
        <span className="font-display text-[15px] font-bold tracking-tight text-ink">Cyronime</span>
      )}
    </span>
  );
}
