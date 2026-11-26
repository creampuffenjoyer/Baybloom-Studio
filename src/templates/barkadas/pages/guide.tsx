import { eyebrow, outlineAction, wrap } from "../../_kit/hospitality-site";
import { houseRules } from "../content";
import { site } from "../site";

export function GuidePage() {
  return (
    <div className={`${wrap} py-12 sm:py-20`}>
      <p className={eyebrow}>{site.location}</p>
      <h1 className="mt-3 font-tpl-display text-5xl leading-none tracking-tight sm:text-7xl">Before you arrive.</h1>
      <div className="mt-8 grid gap-7 md:grid-cols-[1.2fr_0.8fr]">
        <section className="divide-y divide-tpl-line border-y border-tpl-line" aria-label="House rules">
          {houseRules.map((rule) => <details key={rule.title} className="py-1"><summary className="min-h-11 cursor-pointer py-3 font-semibold">{rule.title}</summary><p className="pb-4 text-tpl-muted">{rule.detail}</p></details>)}
        </section>
        <section className="self-start bg-tpl-deep p-6 text-tpl-on-deep sm:p-8">
          <h2 className="font-tpl-display text-3xl">Around Tagaytay</h2>
          <p className="mt-3">Make time for a ridge walk, a stop for hot bulalo, or a morning at the local market.</p>
          <a className={`${outlineAction} mt-5`} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location)}`}>Explore the area</a>
        </section>
      </div>
    </div>
  );
}
