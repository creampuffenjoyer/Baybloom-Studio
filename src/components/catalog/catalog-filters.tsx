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
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, feature or style"
        className="h-11 rounded-full bg-white pl-10"
      />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-xs font-semibold tracking-[0.16em] text-ink/60 uppercase">
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
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="size-[18px] border-input bg-white data-[state=checked]:border-hibiscus-strong data-[state=checked]:bg-hibiscus-strong"
      />
      <label htmlFor={id} className="cursor-pointer text-sm text-ink/85 select-none">
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
        "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
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
        <Button variant="outline" onClick={clear} className="w-full rounded-full bg-white">
          <XIcon /> Clear all filters
        </Button>
      )}
    </div>
  );
}

export function MobileFilters({ options }: { options: FilterOptions }) {
  const { params } = useCatalogParams();
  const activeCount = FILTER_KEYS.filter((k) => k !== "q" && params.get(k)).length;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full bg-white lg:hidden">
          <SlidersHorizontalIcon /> Filters
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-hibiscus-strong text-[11px] text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto bg-sand">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl text-bay">Filters</SheetTitle>
          <SheetDescription>Results update as you choose.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-10">
          <FilterControls options={options} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
