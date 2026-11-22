"use client";

import { useEffect, useId, useState } from "react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import type { FilterOptions } from "@/lib/catalog";
import { TIER_LABEL } from "@/lib/format";
import { TIER_LEVELS } from "@/lib/validators";
import { useCatalogParams } from "@/components/catalog/catalog-nav";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const FILTER_KEYS = ["category", "style", "tier", "features", "q"] as const;

export function SearchBox() {
  const { params, set } = useCatalogParams();
  const urlQ = params.get("q") ?? "";
  const [value, setValue] = useState(urlQ);
  const id = useId();

  // Follow the URL when it changes elsewhere (e.g. "Clear all").
  const [lastUrlQ, setLastUrlQ] = useState(urlQ);
  if (urlQ !== lastUrlQ) {
    setLastUrlQ(urlQ);
    setValue(urlQ);
  }

  useEffect(() => {
    if (value.trim() === urlQ) return;
    const t = setTimeout(() => set("q", value.trim() || null), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Search designs
      </label>
      <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search templates"
        className="h-12 rounded-lg bg-white pl-10"
      />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-1">
      <legend className="mb-3 text-sm font-semibold text-ink">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-md px-1 transition-colors hover:bg-secondary/50">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="size-[18px] border-input bg-white data-[state=checked]:border-hibiscus-strong data-[state=checked]:bg-hibiscus-strong"
      />
      <label htmlFor={id} className="flex min-h-11 flex-1 cursor-pointer items-center text-sm text-ink select-none">
        {label}
      </label>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-hibiscus-strong bg-hibiscus-strong text-white"
          : "border-border bg-white text-ink/80 hover:border-bay/40",
      )}
    >
      {children}
    </button>
  );
}

export function FilterControls({ options }: { options: FilterOptions }) {
  const { list, toggle, clear, params } = useCatalogParams();
  const activeCount = FILTER_KEYS.filter((k) => params.get(k)).length;

  const featureGroups = Object.entries(
    options.features.reduce<Record<string, FilterOptions["features"]>>((acc, f) => {
      (acc[f.group] ??= []).push(f);
      return acc;
    }, {}),
  );

  return (
    <div className="space-y-8">
      <Group title="Industry">
        <div className="flex flex-wrap gap-2">
          {options.categories.map((c) => (
            <Chip
              key={c.slug}
              active={list("category").includes(c.slug)}
              onClick={() => toggle("category", c.slug)}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Style">
        {options.styles.map((s) => (
          <CheckRow
            key={s.slug}
            label={s.name}
            checked={list("style").includes(s.slug)}
            onChange={() => toggle("style", s.slug)}
          />
        ))}
      </Group>

      <Group title="Tier">
        {TIER_LEVELS.map((t) => (
          <CheckRow
            key={t}
            label={TIER_LABEL[t]}
            checked={list("tier").includes(t.toLowerCase())}
            onChange={() => toggle("tier", t.toLowerCase())}
          />
        ))}
      </Group>

      {featureGroups.map(([group, items]) => (
        <Group key={group} title={group}>
          {items.map((f) => (
            <CheckRow
              key={f.slug}
              label={f.name}
              checked={list("features").includes(f.slug)}
              onChange={() => toggle("features", f.slug)}
            />
          ))}
        </Group>
      ))}

      {activeCount > 0 && (
        <Button variant="outline" onClick={clear} className="h-11 w-full rounded-lg bg-white">
          <XIcon /> Clear all filters
        </Button>
      )}
    </div>
  );
}

export function MobileFilters({ options }: { options: FilterOptions }) {
  const { params } = useCatalogParams();
  const [open, setOpen] = useState(false);
  const activeCount = FILTER_KEYS.filter((k) => k !== "q" && params.get(k)).length;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-11 rounded-lg bg-white lg:hidden">
          <SlidersHorizontalIcon /> Filters
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-hibiscus-strong text-[11px] text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[90vw] max-w-sm gap-0 bg-sand [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-lg">
        <SheetHeader className="border-b border-border pr-16">
          <SheetTitle className="font-serif text-2xl text-bay">Filters</SheetTitle>
          <SheetDescription>Results update as you choose.</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <FilterControls options={options} />
        </div>
        <div className="border-t border-border bg-sand px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button className="h-12 w-full rounded-lg" onClick={() => setOpen(false)}>View results</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
