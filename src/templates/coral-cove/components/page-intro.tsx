import Image from "next/image";
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
  image?: PhotoRecord;
  children?: React.ReactNode;
}) {
  return (
    <section className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h1 className="max-w-4xl font-t-display text-5xl leading-[0.95] font-extrabold tracking-[-0.045em] text-balance [font-stretch:88%] sm:text-7xl">
          {title}
        </h1>
        {lede && <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-t-muted sm:text-xl">{lede}</p>}
        {children}
      </div>
      {image && (
        <div className="relative mx-auto mt-12 aspect-[16/9] max-w-[96rem] overflow-hidden sm:aspect-[21/8] sm:rounded-[2rem] sm:mx-4 xl:mx-auto">
          <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}
    </section>
  );
}
