"use client";

import { use, useSyncExternalStore } from "react";
import { io } from "next/cache";
import { today, type Day } from "./dates";

/**
 * Today's date for Client Components. `io()` keeps the read out of the
 * prerendered shell, so render the caller inside <Suspense>.
 */
export function useToday(): Day {
  use(io());
  return today();
}

const noop = () => () => {};

/**
 * Today's date after hydration, or null while prerendering. Use it for small
 * hints (like a date input's `min`) that don't need a Suspense boundary.
 */
export function useClientToday(): Day | null {
  return useSyncExternalStore(noop, today, () => null);
}
