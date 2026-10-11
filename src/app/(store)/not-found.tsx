import Link from "next/link";
import { Bloom } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Bloom className="size-12 text-hibiscus" />
      <h1 className="mt-6 text-4xl font-medium">We couldn’t find that page</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The template may have been archived, or the link is mistyped.
      </p>
      <Button asChild className="mt-8 rounded-full">
        <Link href="/designs">Browse all templates</Link>
      </Button>
    </div>
  );
}
