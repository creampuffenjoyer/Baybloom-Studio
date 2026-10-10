"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CheckIcon, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import type { TierLevel } from "@prisma/client";
import type { CompareColumn } from "@/lib/catalog";
import { formatPrice, TIER_LABEL, TYPE_LABEL } from "@/lib/format";
import { COMPARE_MAX, compareHref, useCompare } from "@/components/compare/compare-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const LEVELS: TierLevel[] = ["STARTER", "STANDARD", "PREMIUM"];

export function CompareTable({ columns }: { columns: CompareColumn[] }) {
  const router = useRouter();
  const { replace } = useCompare();
  const [diffOnly, setDiffOnly] = useState(false);
  const diffId = useId();

  // Keep the saved selection in step with what's on screen (e.g. a shared link).
  useEffect(() => {
    replace(columns.map((c) => ({ slug: c.slug, title: c.title, heroImage: c.heroImage })));
  }, [columns, replace]);

  const removeColumn = (slug: string) => {
    const rest = columns.filter((c) => c.slug !== slug);
    replace(rest.map((c) => ({ slug: c.slug, title: c.title, heroImage: c.heroImage })));
    router.replace(compareHref(rest), { scroll: false });
  };

  // Union of features, grouped, in a stable order.
  const allFeatures = new Map<string, { group: string; name: string }>();
  for (const c of columns) for (const f of c.features) allFeatures.set(f.slug, f);
  const featureRows = [...allFeatures.entries()]
    .sort(([, a], [, b]) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name))
    .filter(([slug]) => {
      if (!diffOnly) return true;
      const hits = columns.filter((c) => c.features.some((f) => f.slug === slug)).length;
      return hits > 0 && hits < columns.length;
    });

  const grid = {
    gridTemplateColumns: `minmax(140px, 180px) repeat(${columns.length}, minmax(220px, 1fr))`,
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Checkbox id={diffId} checked={diffOnly} onCheckedChange={(v) => setDiffOnly(v === true)} className="bg-white" />
          <label htmlFor={diffId} className="text-sm">
            Only show features that differ
          </label>
        </div>
        {columns.length < COMPARE_MAX && (
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link href="/designs">
              <PlusIcon /> Add another design
            </Link>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto pb-4" role="table" aria-label="Design comparison">
        <div className="min-w-fit">
          {/* Header row: images and titles */}
          <div role="row" className="grid" style={grid}>
            <div className="sticky left-0 z-10 bg-sand/95" />
            {columns.map((c, i) => (
              <motion.div
                role="columnheader"
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="px-3 pb-5"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand-deep">
                  <Image src={c.heroImage} alt={c.heroAlt} fill sizes="320px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeColumn(c.slug)}
                    aria-label={`Remove ${c.title} from comparison`}
                    className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
                <p className="mt-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  {TYPE_LABEL[c.type]} · {c.category.name}
                </p>
                <Link href={`/designs/${c.slug}`} className="font-serif text-xl font-medium text-bay hover:underline">
                  {c.title}
                </Link>
              </motion.div>
            ))}
          </div>

          <Row grid={grid} label="Style">
            {columns.map((c) => (
              <div role="cell" key={c.id} className="px-3 py-4 text-sm">
                {c.style?.name ?? "—"}
              </div>
            ))}
          </Row>

          {LEVELS.map((level) => (
            <Row grid={grid} key={level} label={`${TIER_LABEL[level]} tier`}>
              {columns.map((c) => {
                const tier = c.tiers.find((t) => t.level === level);
                const price = c.pricing?.tiers.find((t) => t.level === level);
                return (
                  <div role="cell" key={c.id} className="px-3 py-4 text-sm">
                    {tier ? (
                      <>
                        <p className="font-serif text-lg text-bay">
                          {price ? formatPrice(price.priceCents, price.currency) : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tier.revisions} {tier.revisions === 1 ? "revision" : "revisions"}
                        </p>
                        <ul className="mt-2 space-y-1 text-ink/80">
                          {tier.inclusions.map((inc) => (
                            <li key={inc} className="leading-snug">
                              {inc}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not offered</span>
                    )}
                  </div>
                );
              })}
            </Row>
          ))}

          {featureRows.map(([slug, f], i) => {
            const firstOfGroup = i === 0 || featureRows[i - 1][1].group !== f.group;
            return (
              <Row grid={grid}
                key={slug}
                className={cn(!firstOfGroup && "border-border/30")}
                label={
                  <>
                    {firstOfGroup && (
                      <span className="block text-[11px] font-semibold tracking-[0.14em] text-hibiscus-strong uppercase">
                        {f.group}
                      </span>
                    )}
                    {f.name}
                  </>
                }
              >
                {columns.map((c) => {
                  const has = c.features.some((x) => x.slug === slug);
                  return (
                    <div role="cell" key={c.id} className="flex items-end px-3 py-4">
                      {has ? (
                        <CheckIcon className="size-5 text-bay" aria-label="Included" />
                      ) : (
                        <MinusIcon className="size-5 text-ink/25" aria-label="Not included" />
                      )}
                    </div>
                  );
                })}
              </Row>
            );
          })}
          {diffOnly && featureRows.length === 0 && (
            <Row grid={grid} label="Features">
              <div role="cell" className="px-3 py-4 text-sm text-muted-foreground" style={{ gridColumn: `span ${columns.length}` }}>
                These designs share the same features.
              </div>
            </Row>
          )}

          <Row grid={grid} label="You receive">
            {columns.map((c) => (
              <div role="cell" key={c.id} className="px-3 py-4">
                <ul className="space-y-1.5 text-sm text-ink/80">
                  {c.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Row>

          <Row grid={grid} label="">
            {columns.map((c) => (
              <div role="cell" key={c.id} className="px-3 py-5">
                <Button asChild className="w-full rounded-full">
                  <Link href={`/designs/${c.slug}`}>View design</Link>
                </Button>
              </div>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  className,
  grid,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  grid: React.CSSProperties;
}) {
  return (
    <div role="row" className={cn("grid border-t border-border/70", className)} style={grid}>
      <div
        role="rowheader"
        className="sticky left-0 z-10 bg-sand/95 py-4 pr-4 text-sm font-medium text-ink/70 backdrop-blur"
      >
        {label}
      </div>
      {children}
    </div>
  );
}
