export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--outline-variant)]/20 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--outline-variant)]/30 overflow-hidden">
      <Skeleton className="h-[160px] rounded-none" />
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container-low)]/50">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-12 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
