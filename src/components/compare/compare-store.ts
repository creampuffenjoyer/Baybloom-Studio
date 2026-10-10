"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CompareItem = { slug: string; title: string; heroImage: string };

export const COMPARE_MAX = 3;
const KEY = "baybloom:compare";
const EMPTY: CompareItem[] = [];
const listeners = new Set<() => void>();
let cache: CompareItem[] | null = null;

function read(): CompareItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.slice(0, COMPARE_MAX) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: CompareItem[]) {
  cache = items.slice(0, COMPARE_MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage unavailable: the selection still works for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The compare selection, shared across components and browser tabs. */
export function useCompare() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);
  const add = useCallback((item: CompareItem) => {
    const current = read();
    if (current.some((i) => i.slug === item.slug) || current.length >= COMPARE_MAX) return false;
    write([...current, item]);
    return true;
  }, []);
  const remove = useCallback((slug: string) => write(read().filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => write([]), []);
  const replace = useCallback((next: CompareItem[]) => write(next), []);

  return { items, has, add, remove, clear, replace, full: items.length >= COMPARE_MAX };
}

export function compareHref(items: { slug: string }[]) {
  return items.length ? `/compare?d=${items.map((i) => i.slug).join(",")}` : "/compare";
}
