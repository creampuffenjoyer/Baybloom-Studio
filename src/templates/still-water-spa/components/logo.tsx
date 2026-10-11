/** Wordmark with three ripple rings. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-t-display text-2xl lowercase ${className}`}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-7">
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <circle cx="16" cy="16" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
      still water
    </span>
  );
}
