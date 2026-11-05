"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitCompareArrowsIcon,
  HeartIcon,
  LogOutIcon,
  ReceiptTextIcon,
  UserRoundIcon,
} from "lucide-react";
import { signOutAction } from "@/app/(store)/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loginHref } from "@/lib/urls";

export function AuthButtons() {
  const pathname = usePathname();
  const callback = pathname.startsWith("/login") || pathname.startsWith("/register")
    ? undefined
    : pathname;
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <Link href={loginHref(callback)}>Log in</Link>
      </Button>
      <Button asChild size="sm" className="rounded-full px-4">
        <Link href={callback ? `/register?callbackUrl=${encodeURIComponent(callback)}` : "/register"}>
          Create account
        </Link>
      </Button>
    </>
  );
}

export function UserMenu({ name, email }: { name: string | null; email: string | null }) {
  const initials = (name ?? email ?? "?")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 rounded-full pr-3 pl-1"
          aria-label="Account menu"
        >
          <span className="grid size-7 place-items-center rounded-full bg-bay text-[11px] font-semibold text-white">
            {initials}
          </span>
          <span className="hidden max-w-32 truncate text-sm sm:inline">
            {name ?? email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {[
          { href: "/account", label: "My account", icon: UserRoundIcon },
          { href: "/favorites", label: "Favorites", icon: HeartIcon },
          { href: "/compare", label: "Compare", icon: GitCompareArrowsIcon },
          { href: "/account/orders", label: "Orders & downloads", icon: ReceiptTextIcon },
        ].map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}>
              <Icon /> {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOutIcon className="size-4 text-muted-foreground" /> Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
