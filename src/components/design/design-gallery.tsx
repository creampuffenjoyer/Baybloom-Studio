"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { IMAGE_KIND_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ImageKind } from "@prisma/client";

export type GalleryImage = {
  id: string;
  url: string;
  thumbUrl: string | null;
  alt: string;
  kind: ImageKind;
  width: number | null;
  height: number | null;
};

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
};

export function DesignGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [open, setOpen] = useState(false);
  const count = images.length;

  const go = useCallback(
    (delta: number) =>
      setState(([i]) => [(i + delta + count) % count, delta > 0 ? 1 : -1]),
    [count],
  );
  const select = (i: number) => setState(([cur]) => [i, i > cur ? 1 : -1]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (count === 0) return null;
  const current = images[index];

  return (
    <div className="space-y-3">
      {/* Main stage */}
      <div
        className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand-deep"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={current.id}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.url}
              alt={current.alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover object-top"
            />
          </motion.div>
        </AnimatePresence>

        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-bay uppercase">
          {IMAGE_KIND_LABEL[current.kind]}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-bay shadow-sm transition hover:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Open full-screen gallery"
        >
          <ExpandIcon className="size-4" />
        </button>
        {count > 1 && (
          <>
            <StageArrow side="left" onClick={() => go(-1)} />
            <StageArrow side="right" onClick={() => go(1)} />
          </>
        )}
        <p className="sr-only" aria-live="polite">
          Image {index + 1} of {count}: {current.alt}
        </p>
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label={`${title} images`}>
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => select(i)}
                aria-label={`Show image ${i + 1}: ${img.alt}`}
                aria-current={i === index}
                className="relative block h-16 w-24 overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:h-20 sm:w-28"
              >
                <Image
                  src={img.thumbUrl ?? img.url}
                  alt=""
                  fill
                  sizes="112px"
                  className={cn(
                    "object-cover transition duration-300",
                    i === index ? "opacity-100" : "opacity-60 hover:opacity-90",
                  )}
                />
                {i === index && (
                  <motion.span
                    layoutId="thumb-active"
                    className="absolute inset-0 rounded-lg ring-2 ring-hibiscus ring-inset"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Lightbox */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-ink/92 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className="fixed inset-0 z-50 flex flex-col outline-none"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
                    <DialogPrimitive.Title className="truncate text-sm font-medium">
                      {title} · {index + 1} / {count}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close
                      className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      aria-label="Close gallery"
                    >
                      <XIcon className="size-5" />
                    </DialogPrimitive.Close>
                  </div>
                  <div className="relative min-h-0 flex-1">
                    <AnimatePresence initial={false} custom={dir} mode="popLayout">
                      <motion.div
                        key={current.id}
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-4 inset-y-0 sm:inset-x-20"
                      >
                        <Image
                          src={current.url}
                          alt={current.alt}
                          fill
                          sizes="100vw"
                          className="object-contain"
                        />
                      </motion.div>
                    </AnimatePresence>
                    {count > 1 && (
                      <>
                        <StageArrow side="left" onClick={() => go(-1)} dark />
                        <StageArrow side="right" onClick={() => go(1)} dark />
                      </>
                    )}
                  </div>
                  <p className="px-6 py-4 text-center text-sm text-white/75">{current.alt}</p>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </div>
  );
}

function StageArrow({
  side,
  onClick,
  dark = false,
}: {
  side: "left" | "right";
  onClick: () => void;
  dark?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full shadow-md transition focus-visible:ring-2 focus-visible:outline-none",
        side === "left" ? "left-3" : "right-3",
        dark
          ? "bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white"
          : "bg-white/90 text-bay opacity-0 group-hover:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:ring-ring max-sm:opacity-100",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
