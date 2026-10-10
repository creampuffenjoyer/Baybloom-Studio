import { cn } from "@/lib/utils";

/** Five-petal frangipani that stands in for the second "o" in "Bloom". */
export function Bloom({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <g transform="translate(20 20)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            transform={`rotate(${deg}) translate(0 -1)`}
            d="M0 0 C -7 -4, -8 -15, -1.5 -18.5 C 4 -19.5, 7.5 -13, 4 -6.5 C 2.5 -3.5, 1.2 -1.5, 0 0 Z"
            fill="currentColor"
          />
        ))}
        <circle r="3.6" fill="var(--logo-center, #f5c76b)" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  /** "dark" for light backgrounds, "light" for dark/photo backgrounds. */
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-serif leading-none",
        tone === "dark" ? "text-bay" : "text-white",
        className,
      )}
    >
      <span className="text-[1.45em] font-semibold tracking-tight" aria-hidden>
        Bayblo
        <Bloom
          className={cn(
            "mx-[0.02em] inline-block size-[0.78em] -translate-y-[0.04em] align-baseline",
            tone === "dark" ? "text-hibiscus" : "text-[#ffd9d3]",
          )}
        />
        m
      </span>
      <span
        aria-hidden
        className={cn(
          "font-sans text-[0.7em] font-medium uppercase tracking-[0.28em]",
          tone === "dark" ? "text-bay/70" : "text-white/80",
        )}
      >
        Studio
      </span>
      <span className="sr-only">Baybloom Studio</span>
    </span>
  );
}
