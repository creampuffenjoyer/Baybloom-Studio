import { Suspense } from "react";

/** Language-aware editor previews read URL state only when the request arrives. */
export default function PersonalizationLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p role="status" className="p-6 text-sm text-muted-foreground">Loading your workspace…</p>}>{children}</Suspense>;
}
