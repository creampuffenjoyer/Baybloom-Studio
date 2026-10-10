import Image from "next/image";
import { CalendarDaysIcon, MenuIcon, UsersIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

type Shot = { url: string; alt: string };

/**
 * Laptop + phone frames drawn in CSS around the design's photos, laid out as
 * a sample resort site. Purely illustrative: shows how a template frames the
 * imagery without copying any real website (spec §7A notes).
 */
export function DeviceShowcase({
  name,
  tagline,
  hero,
  secondary,
  tertiary,
}: {
  name: string;
  tagline: string;
  hero: Shot;
  secondary: Shot;
  tertiary: Shot;
}) {
  const brand = name.split(" ").slice(0, 2).join(" ");
  return (
    <Reveal className="relative mx-auto max-w-4xl px-2 pt-4 pb-10 sm:px-8">
      {/* Laptop */}
      <div className="relative ml-[3%] w-[78%]">
        <div className="rounded-t-[14px] border-[10px] border-b-0 border-[#1f2a2e] bg-[#1f2a2e] shadow-2xl sm:rounded-t-[18px] sm:border-[14px] sm:border-b-0">
          <div className="overflow-hidden rounded-[4px] bg-white">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#f4f1ec] px-3 py-1.5">
              <span className="size-2 rounded-full bg-[#ec6a5e]" />
              <span className="size-2 rounded-full bg-[#f4bf4f]" />
              <span className="size-2 rounded-full bg-[#61c554]" />
              <span className="ml-3 h-3.5 flex-1 rounded-full bg-white/80" />
            </div>
            {/* Sample page */}
            <div className="@container relative aspect-[16/9.2]">
              <Image src={hero.url} alt={hero.alt} fill sizes="720px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[4cqw] py-[2.4cqw] text-white">
                <span className="font-serif text-[2.6cqw] font-semibold">{brand}</span>
                <span className="hidden gap-[2.6cqw] text-[1.5cqw] tracking-wide uppercase opacity-90 @[300px]:flex">
                  <span>Rooms</span>
                  <span>Dining</span>
                  <span>Spa</span>
                  <span>Offers</span>
                </span>
                <span className="rounded-full bg-white px-[2cqw] py-[0.8cqw] text-[1.4cqw] font-semibold text-bay">
                  Book now
                </span>
              </div>
              <div className="absolute inset-x-[4cqw] top-[30%] text-white">
                <p className="max-w-[60%] font-serif text-[5cqw] leading-[1.05]">{tagline}</p>
              </div>
              <div className="absolute inset-x-[4cqw] bottom-[4cqw] flex items-center gap-[1.6cqw] rounded-[1.4cqw] bg-white/95 p-[1.4cqw] text-[1.45cqw] text-ink shadow-lg">
                <span className="flex flex-1 items-center gap-[0.8cqw] border-r border-black/10 px-[1cqw]">
                  <CalendarDaysIcon className="size-[2cqw] text-bay" /> Check-in · Check-out
                </span>
                <span className="flex flex-1 items-center gap-[0.8cqw] px-[1cqw]">
                  <UsersIcon className="size-[2cqw] text-bay" /> 2 adults
                </span>
                <span className="rounded-[0.9cqw] bg-hibiscus-strong px-[2cqw] py-[1cqw] font-semibold text-white">
                  Check availability
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative -mx-[6%] h-3 rounded-b-xl bg-gradient-to-b from-[#d9d5ce] to-[#b9b4ab] sm:h-4">
          <span className="absolute top-0 left-1/2 h-1.5 w-1/6 -translate-x-1/2 rounded-b-md bg-[#a39e95]" />
        </div>
      </div>

      {/* Phone */}
      <div className="absolute right-0 bottom-0 w-[24%] min-w-[96px] sm:right-2">
        <div className="rounded-[22px] border-[6px] border-[#1f2a2e] bg-[#1f2a2e] shadow-2xl sm:rounded-[30px] sm:border-[8px]">
          <div className="@container relative aspect-[9/19] overflow-hidden rounded-[16px] bg-sand sm:rounded-[22px]">
            <div className="relative h-[46%]">
              <Image src={secondary.url} alt={secondary.alt} fill sizes="200px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[7cqw] pt-[9cqw] text-white">
                <span className="font-serif text-[8cqw] font-semibold">{brand.split(" ")[0]}</span>
                <MenuIcon className="size-[8cqw]" />
              </div>
            </div>
            <div className="space-y-[4cqw] p-[7cqw]">
              <p className="font-serif text-[9cqw] leading-tight text-bay">Our rooms</p>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[5cqw]">
                <Image src={tertiary.url} alt={tertiary.alt} fill sizes="200px" className="object-cover" />
              </div>
              <span className="block rounded-full bg-hibiscus-strong py-[3.5cqw] text-center text-[6cqw] font-semibold text-white">
                Book a stay
              </span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
