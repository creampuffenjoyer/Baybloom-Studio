"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav({ items }: { items: readonly { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Open menu">
          <MenuIcon aria-hidden className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] max-w-sm overflow-y-auto bg-sand [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-lg">
        <SheetHeader className="border-b border-border px-6 py-7">
          <SheetTitle>
            <Logo className="text-sm" />
          </SheetTitle>
          <SheetDescription className="mt-2 text-left">Browse templates and manage your account.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-2">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-lg px-3 py-3 font-serif text-xl text-bay transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="mx-6 border-t border-border pt-5 pb-8">
          <p className="mb-3 text-sm text-muted-foreground">Your collection</p>
          <div className="grid gap-1">
            {[
              { href: "/favorites", label: "Saved favorites" },
              { href: "/compare", label: "Compare designs" },
              { href: "/account", label: "My account" },
              { href: "/login", label: "Log in" },
            ].map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-md text-sm font-medium text-bay hover:underline">{item.label}</Link>)}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
