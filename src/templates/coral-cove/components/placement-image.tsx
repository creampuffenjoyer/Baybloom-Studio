"use client";

import Image, { type ImageProps } from "next/image";
import { usePersonalization } from "../personalization";
import { resolveCoralPhoto } from "../photo-placements";
export { resolveCoralPhoto } from "../photo-placements";

/** Public output is an ordinary image. Selection tools exist only in the editor iframe. */
export function PlacementImage({ placement, ...props }: ImageProps & { placement: string }) {
  const personalization = usePersonalization();
  const resolved = resolveCoralPhoto(placement, { src: typeof props.src === "string" ? props.src : "", alt: props.alt }, personalization);
  const src = resolved.src || props.src;
  const privateImage = typeof src === "string" && (src.startsWith("blob:") || src.startsWith("/api/personalization/"));
  return <Image {...props} src={src} alt={resolved.alt} unoptimized={privateImage || props.unoptimized} data-coral-photo={placement} />;
}
