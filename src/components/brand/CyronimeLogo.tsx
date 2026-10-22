/* Brand mark Cyronime — avatar bulat (brand/avatar.png).
   Mengikuti bahasa visual referensi: logo = avatar bulat + wordmark. */

export function CyronimeMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/avatar.png"
      alt="Logo Cyronime"
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className}`}
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
