"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { eventPreset, planQuery } from "../plan";
import photos from "../photos.json";
import { href } from "../site";

const questions = [
  { question: "Which room fits my group?", answer: "Start with a guest count and a setup. The planner compares capacities for seated dinners, ceremonies and standing receptions.", label: "Open the layout planner", path: "/plan" },
  { question: "What if it rains?", answer: "The Garden Court is open air. Choose an indoor backup in your plan and include it in the inquiry. The event team confirms availability for your date.", label: "Plan with a rain backup", path: "/plan?space=court&backup=1" },
  { question: "How can I see the venue?", answer: "Request a walkthrough with your preferred date and room. The host can tailor the visit to your event.", label: "Request a walkthrough", path: "/inquire?kind=tour" },
  { question: "How does the lighting change?", answer: "Drag the divider to compare daylight and evening lighting in the Glasshouse.", label: "Compare the lighting", path: "/tour?view=compare" },
  { question: "How could a wedding flow?", answer: "Try vows in the Glasshouse, drinks in the Garden Court and dinner under the glass. You can edit each stage.", label: "Try the wedding timeline", path: `/plan?${planQuery(eventPreset("wedding"))}` },
] as const;

export function VenueHost() {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [index, choose] = useState(0);
  const selected = questions[index];

  return (
    <>
      <button type="button" className="at-host-launch" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
        <Image src={photos.host.src} alt="" width={40} height={40} className="at-avatar" />
        <span>Ask Mara</span>
      </button>
      <dialog ref={dialog} className="at-host-dialog" aria-labelledby={title}>
        <div className="at-host-head">
          <Image src={photos.host.src} alt="" width={60} height={60} className="at-avatar" />
          <div><h2 id={title}>Mara</h2><p>Venue guide</p></div>
          <button type="button" className="at-host-close" aria-label="Close venue guide" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <div className="at-host-questions" aria-label="Common venue questions">
          {questions.map((question, i) => (
            <button key={question.question} type="button" aria-pressed={index === i} onClick={() => choose(i)}>{question.question}</button>
          ))}
        </div>
        <p className="at-host-answer" role="status">{selected.answer}</p>
        <Link className="at-button" href={href(selected.path)} onClick={() => dialog.current?.close()}>{selected.label} <span aria-hidden="true">↗</span></Link>
      </dialog>
    </>
  );
}
