"use client";
import { PlacementImage as Image } from "./placement-image";
import type { PhotoRecord } from "../../_kit/photos";

/** Title block that opens every inner page, with an optional wide photo underneath. */
export function PageIntro({
  title,
  lede,
  image,
  children,
}: {
  title: string;
  lede?: string;
  image?: PhotoRecord & { placement: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="pt-12 sm:pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h1 className="max-w-4xl font-tpl-display text-5xl leading-[1.02] font-semibold tracking-[-0.03em] text-balance [font-stretch:88%] sm:text-7xl">
          {title}
        </h1>
        {lede && <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-tpl-muted sm:text-xl">{lede}</p>}
        {children}
      </div>
      {image && (
        <div className="relative mx-auto mt-12 aspect-[16/9] max-w-[96rem] overflow-hidden sm:aspect-[21/8] sm:rounded-2xl sm:mx-4 xl:mx-auto">
          <Image placement={image.placement} src={image.src} unoptimized={(image.src).startsWith("blob:") || (image.src).startsWith("/api/personalization/")} alt={image.alt} fill preload sizes="100vw" className="object-cover" />
        </div>
      )}
    </section>
  );
}
