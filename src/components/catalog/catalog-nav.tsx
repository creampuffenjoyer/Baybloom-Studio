"use client";

import { createContext, use, useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CatalogNav = {
  isPending: boolean;
  navigate: (href: string) => void;
};

const Ctx = createContext<CatalogNav | null>(null);

/**
 * Shares one transition between the filter controls and the results grid, so
 * the current grid stays on screen (dimmed) while new results load and the
 * cards can animate between the two layouts.
 */
export function CatalogNavProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = useCallback(
    (href: string) => startTransition(() => router.replace(href, { scroll: false })),
    [router],
  );
  return <Ctx value={{ isPending, navigate }}>{children}</Ctx>;
}

export function useCatalogNav() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useCatalogNav must be used inside CatalogNavProvider");
  return ctx;
}

/** Read/update catalog query params. Must render inside <Suspense>. */
export function useCatalogParams() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { navigate, isPending } = useCatalogNav();

  const list = (key: string) =>
    (params.get(key) ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

  const update = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    const qs = next.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname);
  };

  const toggle = (key: string, value: string) =>
    update((p) => {
      const current = list(key);
      const values = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (values.length) p.set(key, values.join(","));
      else p.delete(key);
    });

  const set = (key: string, value: string | null) =>
    update((p) => (value ? p.set(key, value) : p.delete(key)));

  const clear = () => navigate(pathname);

  return { params, list, toggle, set, clear, isPending };
}
