/** Topographic contour lines, used as a quiet background texture. */
export function Contours({ className = "" }: { className?: string }) {
  const rings = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden className={className} fill="none" stroke="currentColor">
      {rings.map((i) => (
        <path
          key={i}
          strokeWidth="1"
          d={`M ${-40 + i * 6} ${300 - i * 22}
              C ${120 - i * 4} ${250 - i * 30}, ${200 + i * 6} ${330 - i * 28}, ${330 + i * 4} ${240 - i * 24}
              S ${520 - i * 8} ${160 - i * 14}, ${660 - i * 6} ${210 - i * 20}`}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={`e${i}`} cx="460" cy="110" rx={30 + i * 22} ry={18 + i * 14} strokeWidth="1" transform="rotate(-12 460 110)" />
      ))}
    </svg>
  );
}
