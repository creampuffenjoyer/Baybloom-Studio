/** A line-drawn flowering sprig, the estate's ornament. */
export function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden className={className}>
      <path d="M4 40 C 30 36, 60 30, 116 10" />
      <path d="M30 35 C 28 26, 34 20, 40 18 C 40 26, 36 32, 30 35 Z" />
      <path d="M52 30 C 54 40, 62 44, 68 42 C 64 36, 58 31, 52 30 Z" />
      <path d="M72 24 C 70 14, 76 8, 84 6 C 84 14, 80 21, 72 24 Z" />
      <circle cx="98" cy="15" r="5" />
      <circle cx="98" cy="15" r="1.6" fill="currentColor" />
      <path d="M93 12.5 C 90 9, 92 5, 96 6 M103 12.5 C 106 9, 104 5, 100 6 M101 20 C 104 23, 101 26, 98 23 M95 20 C 92 23, 95 26, 98 23" />
    </svg>
  );
}
