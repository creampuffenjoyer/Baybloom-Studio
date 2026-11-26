"use client";

import Image from "next/image";
import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { PhotoRecord } from "../../_kit/photos";

const preference = "(prefers-reduced-motion: reduce)";
const clamp = (number: number) => Math.max(-1, Math.min(1, number));

function subscribeToMotionPreference(change: () => void) {
  const media = window.matchMedia(preference);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}

const prefersReducedMotion = () => window.matchMedia(preference).matches;
const stillOnServer = () => true;

export function ProductMotion({ photo }: { photo: PhotoRecord }) {
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, stillOnServer);
  const [motionOverride, setMotionOverride] = useState<boolean>();
  const playing = motionOverride ?? !reducedMotion;
  const stage = useRef<HTMLButtonElement>(null);
  const dragStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const moved = useRef(false);
  const tilt = useRef({ x: 0, y: 0 });
  const instructions = useId();

  function position(x: number, y: number, interacting = true) {
    const element = stage.current;
    if (!element) return;
    tilt.current = { x: clamp(x), y: clamp(y) };
    element.style.setProperty("--rr-cup-x", `${tilt.current.y * -10}deg`);
    element.style.setProperty("--rr-cup-y", `${tilt.current.x * 17}deg`);
    element.style.setProperty("--rr-cup-roll", `${tilt.current.x * 11}deg`);
    element.dataset.interacting = String(interacting);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStart.current;
    const dragging = start?.id === event.pointerId;
    if (!dragging && (!playing || event.pointerType !== "mouse")) return;
    if (dragging && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) moved.current = true;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    position((event.clientX - left) * 2 / width - 1, (event.clientY - top) * 2 / height - 1);
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    moved.current = false;
    dragStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    move(event);
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (dragStart.current?.id !== event.pointerId) return;
    dragStart.current = null;
    position(0, 0, false);
  }

  function toggleMotion(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0 && moved.current) return;
    position(0, 0, false);
    setMotionOverride(!playing);
  }

  function tiltWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    const shifts = { ArrowLeft: [-0.3, 0], ArrowRight: [0.3, 0], ArrowUp: [0, -0.3], ArrowDown: [0, 0.3] };
    const shift = shifts[event.key as keyof typeof shifts];
    if (!shift) return;
    event.preventDefault();
    position(tilt.current.x + shift[0], tilt.current.y + shift[1]);
  }

  return (
    <>
      <button ref={stage} type="button" className="rr-cup-stage" data-playing={playing}
        aria-label={playing ? "Pause cup motion" : "Play cup motion"} aria-describedby={instructions}
        onPointerDown={startDrag} onPointerMove={move} onPointerUp={endDrag}
        onPointerCancel={endDrag} onLostPointerCapture={endDrag} onClick={toggleMotion}
        onKeyDown={tiltWithKeyboard} onBlur={() => position(0, 0, false)}
        onPointerLeave={() => { if (dragStart.current === null) position(0, 0, false); }}>
        <span className="rr-cup-pivot"><span className="rr-cup-float">
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(min-width: 800px) 44vw, 82vw" preload draggable={false} className="rr-product-photo" />
        </span></span>
      </button>
      <span id={instructions} className="sr-only">{photo.alt}. Use the arrow keys to tilt the cup.</span>
    </>
  );
}
