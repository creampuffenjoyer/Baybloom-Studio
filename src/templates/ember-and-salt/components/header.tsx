"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fromDay } from "../../_kit/dates";
import { useClientToday } from "../../_kit/use-today";
import { href, nav } from "../site";

// Opening hours by weekday (0 = Sunday), used for the "tonight" strip.
const TONIGHT = ["12 pm – 10 pm", null, "5:30 pm – 11 pm", "5:30 pm – 11 pm", "5:30 pm – 11 pm", "5:30 pm – 12 am", "5:30 pm – 12 am"];

function Tonight() {
  const today = useClientToday();
  if (!today) return <span>Open Tuesday to Sunday from 5:30 pm</span>;
  const hours = TONIGHT[fromDay(today).getDay()];
  return hours ? (
    <span>
      Open today <span className="text-t-ink">{hours}</span>. Walk-ins welcome at the bar.
    </span>
  ) : (
    <span>Closed today. We’re back tomorrow from 5:30 pm.</span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-t-line bg-t-bg/95 backdrop-blur">
      <p className="border-b border-t-line px-5 py-2 text-center text-[13px] text-t-muted">
        <Tonight />
      </p>
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 sm:px-8">
        <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] lg:flex">
          {nav.slice(0, 3).map((item) => (
            <NavItem key={item.href} {...item} active={pathname.startsWith(href(item.href))} />
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="es-menu"
          className="justify-self-start text-[15px] lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
        <Link href={href("/")} onClick={() => setOpen(false)} className="font-t-display text-2xl whitespace-nowrap sm:text-3xl">
          Ember <span className="text-t-accent">&amp;</span> Salt
        </Link>
        <div className="flex items-center justify-end gap-7 text-[15px]">
          <nav aria-label="More" className="hidden items-center gap-7 lg:flex">
            {nav.slice(3).map((item) => (
              <NavItem key={item.href} {...item} active={pathname.startsWith(href(item.href))} />
            ))}
          </nav>
          <Link
            href={href("/reserve")}
            className="border border-t-accent px-4 py-2 text-t-accent transition-colors hover:bg-t-accent hover:text-t-on-accent"
          >
            Reserve
          </Link>
        </div>
      </div>
      {open && (
        <div id="es-menu" className="fixed inset-x-0 top-[calc(4.5rem+2.1rem)] bottom-0 overflow-y-auto bg-t-deep px-5 py-10 lg:hidden">
          <nav aria-label="Mobile">
            <ul className="space-y-2">
              {[{ href: "/", label: "Home" }, ...nav, { href: "/reserve", label: "Reserve a table" }].map((item) => (
                <li key={item.href}>
                  <Link href={href(item.href)} onClick={() => setOpen(false)} className="block py-1 font-t-display text-4xl">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavItem({ href: path, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href(path)}
      aria-current={active ? "page" : undefined}
      className={`transition-colors hover:text-t-accent ${active ? "text-t-accent" : "text-t-ink/85"}`}
    >
      {label}
    </Link>
  );
}
