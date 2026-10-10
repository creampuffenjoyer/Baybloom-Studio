"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({
  image,
  alt,
  featured,
}: {
  image: string;
  alt: string;
  featured: { title: string; href: string } | null;
}) {
  const item = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section className="relative isolate flex min-h-[calc(88svh-4rem)] items-end overflow-hidden">
      {/* Slow Ken Burns zoom (CSS; disabled under prefers-reduced-motion) */}
      <div className="absolute inset-0 -z-10 animate-[ken-burns_24s_ease-out_both] will-change-transform">
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bay-deep/90 via-bay-deep/35 to-bay-deep/10" />

      <div className="container-page pb-16 sm:pb-24">
        <motion.p
          {...item(0.1)}
          className="text-xs font-semibold tracking-[0.28em] text-seaglass uppercase"
        >
          Baybloom Studio
        </motion.p>
        <motion.h1
          {...item(0.22)}
          className="mt-4 max-w-4xl text-5xl leading-[1.02] font-medium text-white sm:text-7xl"
        >
          Designs for resorts that bloom.
        </motion.h1>
        <motion.p {...item(0.36)} className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
          Ready-made resort websites, villa plans and interior concepts. Browse the
          collection, compare tiers and make it yours.
        </motion.p>
        <motion.div {...item(0.5)} className="mt-9 flex flex-wrap items-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-hibiscus-strong px-7 text-base text-white hover:bg-hibiscus-strong/90"
          >
            <Link href="/designs">
              Browse designs <ArrowRightIcon />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-white/40 bg-white/10 px-7 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
          >
            <Link href="#how-it-works">How it works</Link>
          </Button>
        </motion.div>
      </div>

      {featured && (
        <motion.div
          {...item(0.8)}
          className="absolute right-4 bottom-6 hidden text-right text-sm text-white/80 sm:right-6 md:block lg:right-8"
        >
          <span className="text-white/60">Pictured: </span>
          <Link href={featured.href} className="underline underline-offset-4 hover:text-white">
            {featured.title}
          </Link>
        </motion.div>
      )}
    </section>
  );
}
