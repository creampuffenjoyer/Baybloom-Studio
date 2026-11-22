"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon, MonitorSmartphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShowcaseTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function Hero({ templates, count }: { templates: ShowcaseTemplate[]; count: number }) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = templates[index];

  function onKey(e: React.KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = templates.length - 1;
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % templates.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + templates.length) % templates.length;
    else return;
    e.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  }

  return (
    <section aria-labelledby="home-title" className="border-b border-border">
      <div className="container-page grid gap-10 pt-10 pb-12 sm:gap-12 sm:pt-14 sm:pb-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14 lg:py-16">
        <div className="min-w-0 lg:pb-14">
          <p className="flex items-center gap-3 text-sm font-medium text-bay">
            <span aria-hidden className="h-px w-8 bg-hibiscus-strong" /> Websites made for hospitality
          </p>
          <h1 id="home-title" className="mt-5 max-w-[13ch] text-[clamp(2.75rem,4.8vw,4.5rem)] leading-[1.06] font-medium tracking-tight">
            Make a great first impression.
          </h1>
          <p className="mt-6 max-w-[43ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            A memorable website for a place like yours. Explore {count} complete designs for hotels, resorts, restaurants, spas and venues. Find your favorite, then make it your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button asChild size="lg" className="h-12 rounded-lg bg-hibiscus-strong px-6 text-base text-white hover:bg-hibiscus-strong/90">
              <Link href="/designs">Explore the templates <ArrowRightIcon aria-hidden /></Link>
            </Button>
            <Link href="#how-it-works" className="inline-flex min-h-12 items-center text-sm font-medium text-bay underline-offset-4 hover:underline">
              How it works
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
            {["Every page included", "Mobile ready", "Full source code"].map((label) => (
              <li key={label} className="flex items-center gap-2"><CheckIcon aria-hidden className="size-4 text-bay" />{label}</li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <div id="template-preview" role="tabpanel" aria-labelledby={`tab-${t.slug}`} tabIndex={0} className="overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_48px_-24px_rgb(15_76_92/0.25)]">
            <Link href={`/demo/${t.slug}`} aria-label={`Open the ${t.title} live demo`} className="block border-b border-border p-3 sm:p-4" style={{ backgroundColor: t.color }}>
              <div aria-hidden className="flex items-center gap-1.5 rounded-t-md bg-sand px-3 py-2.5">
                <span className="size-2 rounded-full bg-ink/25" /><span className="size-2 rounded-full bg-ink/25" /><span className="size-2 rounded-full bg-ink/25" />
                <span className="ml-2 text-[11px] text-muted-foreground">{t.title} · Live website preview</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-b-md bg-sand-deep">
                <Image key={t.slug} src={`/images/designs/${t.slug}/00-home-page.webp`} alt={`${t.title} website home page`} fill priority={index === 0} sizes="(min-width: 1280px) 640px, (min-width: 1024px) 55vw, (min-width: 640px) 90vw, 100vw" className="object-cover object-top" />
              </div>
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div aria-live="polite" aria-atomic="true">
                <p className="font-serif text-2xl font-medium text-bay">{t.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.kind}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline" className="h-11 rounded-lg bg-white px-4">
                  <Link href={`/demo/${t.slug}`}><MonitorSmartphoneIcon aria-hidden /> Live demo</Link>
                </Button>
                <Link href={`/designs/${t.slug}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-bay hover:underline">Details <ArrowRightIcon aria-hidden className="size-4" /></Link>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <p id="switcher-label" className="font-medium text-ink">Find your style</p>
            <span className="text-muted-foreground" aria-hidden>{String(index + 1).padStart(2, "0")} / {String(templates.length).padStart(2, "0")}</span>
          </div>
          <div role="tablist" aria-labelledby="switcher-label" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {templates.map((tpl, i) => (
              <button key={tpl.slug} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`tab-${tpl.slug}`} aria-selected={i === index} aria-controls="template-preview" tabIndex={i === index ? 0 : -1} onClick={() => setIndex(i)} onKeyDown={(e) => onKey(e, i)} className={cn("flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs leading-snug font-medium transition-colors", i === index ? "border-bay bg-secondary text-bay" : "border-border bg-transparent text-muted-foreground hover:border-bay/50 hover:bg-white")}>
                <span aria-hidden className="size-2 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: tpl.color }} />
                {tpl.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
