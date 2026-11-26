"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { todayInManila } from "../../_kit/demo-form";
import { input, label, SitePhoto } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { events } from "../content";
import { assessStage, getArrangement, planQuery, readPlan } from "../plan";
import photos from "../photos.json";
import { href } from "../site";

export function InquirePage() {
  const query = useSearchParams();
  const plan = readPlan(query);
  const kind = query.get("kind") === "tour" ? "tour" : "event";
  const stages = plan.stages.map((stage) => ({ ...stage, ...assessStage(stage, plan.guests, plan.backup) }));
  const [first] = stages;
  const unfitted = stages.flatMap((stage, index) => stage.fits ? [] : [index + 1]);
  const event = events.find(({ id }) => id === plan.event) ?? events[0];
  const serialized = planQuery(plan);

  function validate(form: FormData) {
    if (form.get("kind") === "event" && unfitted.length) {
      return `Adjust ${unfitted.length === 1 ? "stage" : "stages"} ${unfitted.join(", ")} or change the guest count before requesting an event.`;
    }
    if (String(form.get("date")) < todayInManila()) return "Choose today or a future date.";
  }

  return (
    <div className="at-frame at-inner">
      <header className="at-page-heading"><p className="at-overline">The Atrium · Inquiries</p><h1>{kind === "tour" ? "See it in person." : "Tell us what you’re planning."}</h1><p>Share a date and a few details for a venue walkthrough or an event proposal.</p></header>
      <div className="at-plan-grid">
        <section className="at-plan-form" aria-labelledby="at-inquiry-title">
          <h2 id="at-inquiry-title" className="at-form-title">Your request</h2>
          <SampleRequest key={`${kind}:${serialized}`} submitLabel="Try venue inquiry" confirmation="Sample inquiry prepared. No message was sent and no date was held." validate={validate}>
            <input type="hidden" name="plan" value={serialized} />
            <div className="at-field-pair">
              <label className={label}>Request type<select className={input} name="kind" defaultValue={kind}><option value="event">Event proposal</option><option value="tour">Venue walkthrough</option></select></label>
              <label className={label}>Preferred date<input className={input} name="date" type="date" required /></label>
            </div>
            <label className={label}>Anything else? <span className="sr-only">Optional</span><textarea className={input} name="notes" rows={4} maxLength={800} placeholder="Timing, must-haves, or questions for the host" /></label>
          </SampleRequest>
        </section>
        <aside className="at-inquiry-summary" aria-labelledby="at-summary-title">
          <div className="at-inquiry-photo"><SitePhoto photo={photos[first.room.photo]} sizes="(min-width: 850px) 40vw, 100vw" /></div>
          <div>
            <p className="at-overline">{event.label} · {plan.guests} guests</p><h2 id="at-summary-title">Your plan.</h2>
            <ol className="at-summary-stages" aria-label="Planned stages">
              {stages.map((stage, index) => (
                <li key={index}>
                  <span className="at-stage-number" aria-hidden="true">{index + 1}</span>
                  <div><h3>{getArrangement(stage.setup).label}</h3>
                    <p>{stage.room.name} · {stage.capacity} guests max</p>
                    {!stage.fits && <p className="at-over-capacity">Over capacity by {plan.guests - stage.capacity}</p>}
                    {stage.needsBackup && <p>Rain backup · {stage.backup?.name ?? "Ask Mara about a covered space"}</p>}
                  </div>
                </li>
              ))}
            </ol>
            <Link className="at-text-link" href={href(`/plan?${serialized}`)}>Edit your layout <span aria-hidden="true">↗</span></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
