"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, EyeIcon } from "lucide-react";
import type { DesignCard as DesignCardData } from "@/lib/catalog";
import { TIER_LABEL } from "@/lib/format";
import { FavoriteButton } from "@/components/catalog/favorite-button";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { PriceChip, type CardPrice } from "@/components/catalog/price-chip";
import { TierBadge } from "@/components/catalog/tier-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function DesignCard({
  design,
  price,
  signedIn = false,
  favorited = false,
  priority = false,
  onFavoriteChange,
}: {
  design: DesignCardData;
  price?: CardPrice;
  signedIn?: boolean;
  favorited?: boolean;
  priority?: boolean;
  onFavoriteChange?: (favorite: boolean) => void;
}) {
  const [quickView, setQuickView] = useState(false);
  const href = `/designs/${design.slug}`;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-bay/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-deep">
        <Image
          src={design.heroImage}
          alt={design.heroAlt}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          className="object-cover object-top"
        />

        <div className="absolute top-3 left-3 flex gap-2">
          {design.topTier && <TierBadge level={design.topTier} />}
        </div>
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <FavoriteButton
            designId={design.id}
            title={design.title}
            initial={favorited}
            signedIn={signedIn}
            onChange={onFavoriteChange}
          />
          <CompareToggle
            item={{ slug: design.slug, title: design.title, heroImage: design.heroImage }}
            signedIn={signedIn}
          />
        </div>

        <div className="absolute bottom-3 left-3 z-10">
          <Button
            type="button"
            onClick={() => setQuickView(true)}
            aria-label={`Quick view of ${design.title}`}
            className="h-11 rounded-lg border border-border bg-white px-4 text-bay shadow-sm hover:bg-sand"
          >
            <EyeIcon aria-hidden /> Quick view
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium text-muted-foreground">
          {design.category.name}
          {design.style && ` · ${design.style.name}`}
        </p>
        <h3 className="text-xl leading-snug font-medium">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {design.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {design.summary}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <PriceChip price={price} callbackUrl={href} />
          <ArrowRightIcon
            aria-hidden
            className="size-4 text-bay transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>

      <Dialog open={quickView} onOpenChange={setQuickView}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-2xl">
          <div className="relative aspect-[16/9] bg-sand-deep">
            <Image
              src={design.heroImage}
              alt={design.heroAlt}
              fill
              sizes="(min-width: 640px) 672px, 100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="space-y-3 p-6 pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              {design.category.name}
              {design.style && ` · ${design.style.name}`}
            </p>
            <DialogTitle className="font-serif text-2xl font-medium text-bay">
              {design.title}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">{design.summary}</DialogDescription>
            <p className="text-sm text-muted-foreground">
              Tiers: {design.tierLevels.map((l) => TIER_LABEL[l]).join(" · ")}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <PriceChip price={price} callbackUrl={href} />
              <Button asChild className="h-11 rounded-lg">
                <Link href={href}>
                  View full design <ArrowRightIcon />
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
