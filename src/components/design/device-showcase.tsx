import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

type Shot = { url: string; alt: string };

/**
 * The template's real home page in a laptop and a phone, captured from the
 * live demo (scripts/capture-catalog.mjs). Both frames link into the demo.
 */
export function DeviceShowcase({ desktop, mobile, demoUrl }: { desktop: Shot; mobile: Shot; demoUrl: string | null }) {
  const frame = (children: React.ReactNode, label: string) =>
    demoUrl ? (
      <Link href={demoUrl} aria-label={label} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bay">
        {children}
      </Link>
    ) : (
      children
    );

  return (
    <Reveal className="relative mx-auto max-w-4xl px-2 pt-4 pb-10 sm:px-8">
      {/* Laptop */}
      <div className="relative ml-[3%] w-[80%]">
        {frame(
          <div className="rounded-t-[14px] border-[10px] border-b-0 border-[#1f2a2e] bg-[#1f2a2e] shadow-2xl sm:rounded-t-[18px] sm:border-[14px] sm:border-b-0">
            <div className="overflow-hidden rounded-[4px] bg-white">
              <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#f4f1ec] px-3 py-1.5">
                <span className="size-2 rounded-full bg-[#ec6a5e]" />
                <span className="size-2 rounded-full bg-[#f4bf4f]" />
                <span className="size-2 rounded-full bg-[#61c554]" />
                <span className="ml-3 h-3.5 flex-1 rounded-full bg-white/80" />
              </div>
              <div className="relative aspect-[16/10]">
                <Image src={desktop.url} alt={desktop.alt} fill sizes="(min-width: 896px) 700px, 80vw" className="object-cover object-top" />
              </div>
            </div>
          </div>,
          "Open the live demo",
        )}
        <div className="relative -mx-[6%] h-3 rounded-b-xl bg-gradient-to-b from-[#d9d5ce] to-[#b9b4ab] sm:h-4">
          <span className="absolute top-0 left-1/2 h-1.5 w-1/6 -translate-x-1/2 rounded-b-md bg-[#a39e95]" />
        </div>
      </div>

      {/* Phone */}
      <div className="absolute right-0 bottom-0 w-[23%] min-w-[96px] sm:right-2">
        {frame(
          <div className="rounded-[22px] border-[6px] border-[#1f2a2e] bg-[#1f2a2e] shadow-2xl sm:rounded-[30px] sm:border-[8px]">
            <div className="relative aspect-[390/844] overflow-hidden rounded-[16px] bg-white sm:rounded-[22px]">
              <Image src={mobile.url} alt={mobile.alt} fill sizes="200px" className="object-cover object-top" />
            </div>
          </div>,
          "Open the live demo on your phone",
        )}
      </div>
    </Reveal>
  );
}
