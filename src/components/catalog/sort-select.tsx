"use client";

import { useCatalogParams } from "@/components/catalog/catalog-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "name", label: "Name A–Z" },
];
const PRICE = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function SortSelect({ current, canSortByPrice }: { current: string; canSortByPrice: boolean }) {
  const { set } = useCatalogParams();
  const options = canSortByPrice ? [...BASE, ...PRICE] : BASE;
  return (
    <Select value={current} onValueChange={(v) => set("sort", v === "newest" ? null : v)}>
      <SelectTrigger aria-label="Sort designs" className="h-10 min-w-44 rounded-full bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
