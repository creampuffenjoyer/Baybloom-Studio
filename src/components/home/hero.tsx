"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon, MonitorSmartphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShowcaseTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Product-first hero: pick a template from the list and the browser window
 * shows its real home page, on a panel in that template's colour.
 */
export function Hero({ templates, count }: { templates: ShowcaseTemplate[]; count: number }) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = templates[index];

  function onKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + templates.length) % templates.length;
    setIndex(next);
    tabs.current[next]?.focus();
  }

  const item = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="container-page grid grid-cols-1 gap-12 pt-14 pb-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        {/* Copy and the template list */}
        <div className="flex min-w-0 flex-col">
          <motion.h1 {...item(0.05)} className="text-5xl leading-[1.02] font-medium text-balance sm:text-6xl xl:text-[4.25rem]">
            Websites for hospitality brands that bloom.
          </motion.h1>
          <motion.p {...item(0.15)} className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
            {count} complete, ready-made sites for resorts, hotels, restaurants, spas and venues. Every page
            and every booking flow works in the live demo. Buy one and launch in days.
          </motion.p>
          <motion.div {...item(0.25)} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-hibiscus-strong px-7 text-base text-white hover:bg-hibiscus-strong/90">
              <Link href="/designs">
                Browse templates <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base">
              <Link href="#how-it-works">How buying works</Link>
            </Button>
          </motion.div>

          <motion.div {...item(0.35)} className="mt-12">
            <p id="switcher-label" className="text-sm text-muted-foreground">
              Preview a template
            </p>
            <div
              role="tablist"
              aria-labelledby="switcher-label"
              aria-orientation="vertical"
              className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-x-2 lg:gap-y-1 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {templates.map((tpl, i) => (
                <button
                  key={tpl.slug}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tpl.slug}`}
                  aria-selected={i === index}
                  aria-controls="template-preview"
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => setIndex(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    i === index ? "bg-white shadow-sm ring-1 ring-border" : "hover:bg-white/60",
                  )}
                >
                  <span aria-hidden className="size-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: tpl.color }} />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold whitespace-nowrap text-ink">{tpl.title}</span>
                    <span className="block text-xs whitespace-nowrap text-muted-foreground">{tpl.kind}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Preview panel */}
        <motion.div
          {...item(0.2)}
          id="template-preview"
          role="tabpanel"
          aria-labelledby={`tab-${t.slug}`}
          className={cn(
            "relative flex min-w-0 flex-col overflow-hidden rounded-[2rem] px-5 pt-6 pb-6 transition-colors duration-500 sm:px-8 sm:pt-8",
            t.light ? "text-ink" : "text-white",
          )}
          style={{ backgroundColor: t.color }}
        >
          <div aria-hidden className="pointer-events-none absolute -top-1/3 -right-1/4 size-[70%] rounded-full bg-white/15 blur-3xl" />

          <Link
            href={`/demo/${t.slug}`}
            aria-label={`Open the ${t.title} live demo`}
            className="relative block overflow-hidden rounded-xl bg-white shadow-[0_30px_60px_-24px_rgb(0_0_0/0.45)] ring-1 ring-black/10 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#efeeea] px-3 py-2">
              <span className="size-2.5 rounded-full bg-[#ec6a5e]" />
              <span className="size-2.5 rounded-full bg-[#f4bf4f]" />
              <span className="size-2.5 rounded-full bg-[#61c554]" />
              <span className="ml-3 flex h-5 flex-1 items-center rounded-full bg-white px-3 text-[11px] text-ink/50">
                /demo/{t.slug}
              </span>
            </div>
            <div className="relative aspect-[16/10] bg-sand-deep">
              <Image
                key={t.slug}
                src={`/images/designs/${t.slug}/00-home-page.webp`}
                alt={`${t.title} template home page`}
                fill
                priority={index === 0}
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 55vw, 100vw"
                className="animate-in fade-in object-cover object-top duration-500"
              />
            </div>
          </Link>

          <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4">
            <div aria-live="polite" className="min-h-[4.5rem]">
              <p className="font-serif text-2xl font-medium">{t.title}</p>
              <p className={cn("mt-1 max-w-[38ch] text-[15px]", t.light ? "text-ink/75" : "text-white/80")}>{t.line}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                className={cn("h-11 rounded-full px-5", t.light ? "bg-ink text-white hover:bg-ink/90" : "bg-white text-ink hover:bg-white/90")}
              >
                <Link href={`/demo/${t.slug}`}>
                  <MonitorSmartphoneIcon /> Live demo
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn(
                  "h-11 rounded-full border-current bg-transparent px-5 hover:bg-white/15",
                  t.light ? "text-ink hover:text-ink" : "text-white hover:text-white",
                )}
              >
                <Link href={`/designs/${t.slug}`}>Details and pricing</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
