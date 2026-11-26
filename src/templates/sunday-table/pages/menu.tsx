import Link from "next/link";
import { eyebrow, outlineAction, pesos, wrap } from "../../_kit/hospitality-site";
import { menu } from "../content";
import { href } from "../site";
import { TakeoutForm } from "./takeout-form";

export function MenuPage() {
  return (
    <div className={`${wrap} py-12 sm:py-20`}>
      <p className={`${eyebrow} text-tpl-accent`}>Sunday Table · Food menu</p>
      <h1 className="mt-4 max-w-3xl font-tpl-display text-5xl leading-none tracking-tight sm:text-7xl">Good food to pass around.</h1>
      <div className="mt-9 grid gap-6 md:grid-cols-2">
        {menu.map((section) => (
          <section key={section.name} className="border border-tpl-line bg-tpl-surface p-5 sm:p-7">
            <h2 className="font-tpl-display text-3xl text-tpl-accent">{section.name}</h2>
            <ul className="mt-4 divide-y divide-tpl-line">
              {section.items.map((item) => <li key={item.name} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-4"><strong>{item.name}</strong><strong>{pesos(item.price)}</strong><span className="col-span-2 text-sm text-tpl-muted">{item.description}</span><span className="col-span-2 text-sm text-tpl-muted">Serves {item.serves}</span></li>)}
            </ul>
          </section>
        ))}
      </div>
      <section id="takeout" className="mt-8 grid scroll-m-5 overflow-hidden border border-tpl-line bg-tpl-surface md:grid-cols-[0.75fr_1.25fr]">
        <div className="bg-tpl-deep p-6 text-tpl-on-deep sm:p-8">
          <h2 className="font-tpl-display text-3xl">Taking it home?</h2>
          <p className="mt-2">Try a takeaway request for a dish from the menu. Planning for a crowd? Choose party trays.</p>
          <Link href={href("/catering")} className={`${outlineAction} mt-5`}>Plan party trays</Link>
        </div>
        <div className="p-6 sm:p-8"><TakeoutForm /></div>
      </section>
    </div>
  );
}
