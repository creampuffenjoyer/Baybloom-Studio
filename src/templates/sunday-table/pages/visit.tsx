"use client";

import { todayInManila } from "../../_kit/demo-form";
import { eyebrow, input, label, outlineAction, wrap } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { site } from "../site";

function checkTableDate(form: FormData) {
  const date = String(form.get("date"));
  if (date < todayInManila()) return "Choose today or a future date.";
  if (new Date(date).getUTCDay() === 1) return "The restaurant is closed on Mondays. Choose Tuesday through Sunday.";
}

export function VisitPage() {
  return (
    <div className={`${wrap} py-12 sm:py-20`}>
      <p className={`${eyebrow} text-tpl-accent`}>Kapitolyo, Pasig City</p>
      <h1 className="mt-4 font-tpl-display text-5xl leading-none tracking-tight sm:text-7xl">Come by for a meal.</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <section className="self-start border border-tpl-line bg-tpl-surface p-5 sm:p-7">
          <h2 className="font-tpl-display text-3xl text-tpl-accent">Opening hours</h2>
          <p className="mt-3 text-lg">{site.hours}</p>
          <p className="mt-2 text-tpl-muted">Closed on Mondays.</p>
          <a className={`${outlineAction} mt-5`} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.neighborhood)}`}>Explore the neighborhood</a>
        </section>
        <section id="table" className="scroll-m-5 border border-tpl-line bg-tpl-surface p-5 sm:p-7">
          <h2 className="mb-4 font-tpl-display text-3xl text-tpl-accent">Request a table</h2>
          <SampleRequest submitLabel="Try table request" confirmation="Sample table request prepared. No reservation was made." validate={checkTableDate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Date<input className={input} type="date" name="date" required /></label>
              <label className={label}>Party size<input className={input} type="number" name="guests" defaultValue={4} min={1} max={16} required /></label>
              <label className={label}>Preferred time<select className={input} name="time" required><option value="">Choose a time</option>{["11 am", "12 pm", "1 pm", "2 pm", "5 pm", "6 pm", "7 pm", "8 pm"].map((time) => <option key={time}>{time}</option>)}</select></label>
            </div>
          </SampleRequest>
        </section>
      </div>
    </div>
  );
}
