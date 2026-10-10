"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon, EyeIcon } from "lucide-react";
import type { DesignCard as DesignCardData } from "@/lib/catalog";
import { TIER_LABEL, TYPE_LABEL } from "@/lib/format";
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
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgb(15_76_92/0.06)] ring-1 ring-border/70 transition-shadow duration-300 hover:shadow-[0_24px_48px_-20px_rgb(15_76_92/0.35)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-deep">
        <Image
          src={design.heroImage}
          alt={design.heroAlt}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />

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
            className="opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 aria-pressed:opacity-100 max-md:opacity-100"
          />
        </div>

        {/* Quick view slides up on hover / keyboard focus */}
        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-[calc(100%+12px)] transition-transform duration-300 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0">
          <Button
            type="button"
            onClick={() => setQuickView(true)}
            className="h-10 w-full rounded-full bg-white/95 text-bay shadow-md backdrop-blur hover:bg-white"
          >
            <EyeIcon /> Quick view
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {TYPE_LABEL[design.type]} · {design.category.name}
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
        <div className="mt-auto flex items-center justify-between pt-3">
          <PriceChip price={price} callbackUrl={href} />
          <ArrowRightIcon
            aria-hidden
            className="size-4 text-bay transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>

      <Dialog open={quickView} onOpenChange={setQuickView}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
          <div className="relative aspect-[16/9] bg-sand-deep">
            <Image
              src={design.heroImage}
              alt={design.heroAlt}
              fill
              sizes="(min-width: 640px) 672px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-3 p-6 pt-4">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              {TYPE_LABEL[design.type]} · {design.category.name}
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
              <Button asChild className="rounded-full">
                <Link href={href}>
                  View full design <ArrowRightIcon />
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.article>
  );
}
