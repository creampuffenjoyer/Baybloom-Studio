/* A slow breathing guide: four seconds in, four seconds out. Pure CSS, and still under reduced motion. */
const css = `
@keyframes sw-breathe { 0%, 100% { transform: scale(0.82); } 50% { transform: scale(1); } }
@keyframes sw-in { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }
@keyframes sw-out { 0%, 45% { opacity: 0; } 50%, 95% { opacity: 1; } 100% { opacity: 0; } }
.sw-ring { animation: sw-breathe 8s ease-in-out infinite; }
.sw-in { animation: sw-in 8s ease-in-out infinite; }
.sw-out { animation: sw-out 8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .sw-ring, .sw-in, .sw-out { animation: none; }
  .sw-out { opacity: 0; }
}`;

export function Breathe() {
  return (
    <div aria-hidden className="relative grid size-40 place-items-center">
      <style>{css}</style>
      <span className="sw-ring absolute inset-0 rounded-full bg-tpl-surface/70 ring-1 ring-tpl-ink/10 backdrop-blur" />
      <span className="relative font-tpl-display text-lg">
        <span className="sw-in absolute inset-0 grid place-items-center whitespace-nowrap">breathe in</span>
        <span className="sw-out grid place-items-center whitespace-nowrap opacity-0">breathe out</span>
      </span>
    </div>
  );
}
