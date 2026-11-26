import { eyebrow, outlineAction, wrap } from "../../_kit/hospitality-site";
import { branches } from "../content";

export function VisitPage() {
  return (
    <div className={`${wrap} py-12 sm:py-20`}>
      <p className={eyebrow}>Quezon City</p>
      <h1 className="mt-3 font-tpl-display text-5xl font-black tracking-tight sm:text-7xl">Find a branch.</h1>
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        {branches.map((branch) => (
          <section key={branch.id} className="border border-tpl-line bg-tpl-surface p-6">
            <h2 className="font-tpl-display text-3xl font-black">{branch.name}</h2>
            <p className="mt-2 text-tpl-muted">{branch.cue}</p>
            <dl className="my-5 space-y-2 border-y border-tpl-line py-4">
              <div><dt className="font-semibold">Cafe hours</dt><dd>{branch.hours}</dd></div>
              <div><dt className="font-semibold">Pickup</dt><dd>{branch.pickup}</dd></div>
            </dl>
            <a className={outlineAction} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.map)}`}>View the neighborhood</a>
          </section>
        ))}
      </div>
    </div>
  );
}
