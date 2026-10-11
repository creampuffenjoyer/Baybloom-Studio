"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { photo, tourScenes } from "../content";

/**
 * A simple pannable "virtual tour": drag (or use ← →) to look around each
 * scene, and switch scenes with the buttons. Swap the photos for real
 * 360° panoramas, or embed your Matterport/Kuula tour in their place.
 */
export function TourViewer() {
  const [scene, setScene] = useState(0);
  const [pan, setPan] = useState(0.5); // 0 = far left, 1 = far right
  const drag = useRef<{ x: number; pan: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const current = photo(tourScenes[scene].photo);

  const clamp = (n: number) => Math.min(1, Math.max(0, n));

  return (
    <div>
      <div
        ref={frame}
        role="application"
        aria-roledescription="panorama viewer"
        aria-label={`${tourScenes[scene].name}. Use the left and right arrow keys to look around.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPan((p) => clamp(p - 0.08));
          if (e.key === "ArrowRight") setPan((p) => clamp(p + 0.08));
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, pan };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current || !frame.current) return;
          const dx = (e.clientX - drag.current.x) / frame.current.clientWidth;
          setPan(clamp(drag.current.pan - dx));
        }}
        onPointerUp={() => (drag.current = null)}
        className="relative aspect-[16/9] cursor-grab touch-pan-y overflow-hidden bg-tpl-soft select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-accent active:cursor-grabbing sm:aspect-[21/9]"
      >
        <div className="absolute inset-y-0 w-[180%]" style={{ left: `${-pan * 80}%` }}>
          <Image key={current.src} src={current.src} alt={current.alt} fill sizes="180vw" draggable={false} className="object-cover animate-in fade-in duration-500" />
        </div>
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur">
          Drag to look around
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Scenes">
        {tourScenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scene === i}
            onClick={() => {
              setScene(i);
              setPan(0.5);
            }}
            className={`px-4 py-2 text-sm ring-1 ${scene === i ? "bg-tpl-ink text-white ring-tpl-ink" : "ring-tpl-line hover:ring-tpl-ink"}`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
