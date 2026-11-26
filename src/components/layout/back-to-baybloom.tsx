import Link from "next/link";

export function BackToBaybloom() {
  return (
    <Link href="/" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-bay/25 bg-white px-3 text-sm font-semibold whitespace-nowrap text-bay transition-colors hover:border-bay hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bay">
      <span aria-hidden="true">←</span> Back to Baybloom
    </Link>
  );
}
