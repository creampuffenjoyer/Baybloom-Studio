"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type Photo = { src: string; alt: string; width?: number; height?: number };

/**
 * Accessible gallery: renders `children(open)` for the thumbnails and a
 * full-screen viewer with keyboard (←, →, Esc) and swipe support.
 */
export function Lightbox({
  photos,
  children,
  overlayClassName = "bg-black/92 text-white",
}: {
  photos: Photo[];
  children: (open: (index: number) => void) => React.ReactNode;
  overlayClassName?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const open = useCallback((i: number) => setIndex(i), []);
  const close = () => dialog.current?.close();
  const step = useCallback(
    (n: number) => setIndex((i) => (i === null ? i : (i + n + photos.length) % photos.length)),
    [photos.length],
  );

  const isOpen = index !== null;
  useEffect(() => {
    const el = dialog.current;
    if (isOpen && el && !el.open) el.showModal();
  }, [isOpen]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    el.addEventListener("keydown", onKey);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("close", onClose);
    };
  }, [step]);

  const photo = index === null ? null : photos[index];

  return (
    <>
      {children(open)}
      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        className={`fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-transparent ${overlayClassName}`}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {photo && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3 text-sm sm:px-6">
              <span aria-live="polite">
                {index! + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="rounded-full px-3 py-1.5 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-current"
              >
                Close
              </button>
            </div>
            <div className="relative flex-1">
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="animate-in fade-in object-contain duration-300"
              />
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full text-2xl hover:bg-white/10 sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full text-2xl hover:bg-white/10 sm:right-4"
              >
                ›
              </button>
            </div>
            <p className="mx-auto max-w-2xl px-6 py-4 text-center text-sm opacity-80">{photo.alt}</p>
          </div>
        )}
      </dialog>
    </>
  );
}
