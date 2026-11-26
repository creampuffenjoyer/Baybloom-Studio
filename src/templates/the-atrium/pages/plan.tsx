"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { input, label } from "../../_kit/hospitality-site";
import { FloorPlan } from "../components/floor-plan";
import { arrangements, events, spaces, type Arrangement } from "../content";
import { assessStage, getArrangement, matchingRooms, maxGuests, maxStages, planQuery, readPlan, type Plan, type Stage } from "../plan";
import { href } from "../site";

type DraftStage = Stage & { id: number };
type Timeline = [DraftStage, ...DraftStage[]];
type Share = { query: string; url: string; copied: boolean };
const setupOrder: Arrangement[] = ["ceremony", "reception", "dinner"];

export function PlanPage() {
  const query = useSearchParams();
  const initial = readPlan(query);
  return <LayoutPlanner key={planQuery(initial)} initial={initial} />;
}

function LayoutPlanner({ initial }: { initial: Plan }) {
  const [first, ...rest] = initial.stages;
  const [stages, setStages] = useState<Timeline>(() => [{ ...first, id: 0 }, ...rest.map((stage, index) => ({ ...stage, id: index + 1 }))]);
  const [active, setActive] = useState(0);
  const nextId = useRef(initial.stages.length);
  const editorTitle = useRef<HTMLHeadingElement>(null);
  const [event, setEvent] = useState(initial.event);
  const [backup, setBackup] = useState(initial.backup);
  const [count, setCount] = useState(String(initial.guests));
  const [share, setShare] = useState<Share>();
  const guests = Number(count);
  const valid = Number.isInteger(guests) && guests >= 1 && guests <= maxGuests;
  const activeIndex = stages.findIndex(({ id }) => id === active);
  const selected = stages[activeIndex] ?? stages[0];
  const arrangement = getArrangement(selected.setup);
  const assessments = stages.map((stage) => assessStage(stage, guests, backup));
  const { room, capacity, fits, alternatives, needsBackup, backup: rainRoom } = assessments[activeIndex] ?? assessments[0];
  const hasOutdoorStage = assessments.some((assessment) => assessment.room.shelter === "outdoor");
  const unfitted = assessments.flatMap((assessment, index) => assessment.fits ? [] : [index + 1]);
  const query = planQuery({ stages, guests, event, backup });
  const currentShare = share?.query === query ? share : undefined;

  function editStage(change: Partial<Stage>) {
    const update = (stage: DraftStage) => stage.id === active ? { ...stage, ...change } : stage;
    setStages(([first, ...rest]) => [update(first), ...rest.map(update)]);
  }

  function openStage(id: number) {
    setActive(id);
    requestAnimationFrame(() => editorTitle.current?.focus());
  }

  function addStage() {
    if (stages.length >= maxStages) return;
    const setup = setupOrder.find((option) => stages.every((stage) => stage.setup !== option)) ?? setupOrder[0];
    const room = valid ? matchingRooms(setup, guests)[0] : undefined;
    const id = nextId.current++;
    setStages([...stages, { id, setup, space: room?.id ?? selected.space }]);
    openStage(id);
  }

  function moveStage(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= stages.length) return;
    const reordered: Timeline = [...stages];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    setStages(reordered);
  }

  function removeStage(index: number) {
    if (stages.length === 1) return;
    const [first, ...rest] = stages.filter((_, position) => position !== index);
    const remaining: Timeline = [first, ...rest];
    setStages(remaining);
    if (stages[index].id === active) setActive(remaining[Math.min(index, remaining.length - 1)].id);
  }

  async function copyPlan() {
    const url = new URL(href(`/plan?${query}`), window.location.href).href;
    try {
      await navigator.clipboard.writeText(url);
      setShare({ query, url, copied: true });
    } catch {
      setShare({ query, url, copied: false });
    }
  }

  return (
    <div className="at-frame at-inner">
      <header className="at-page-heading">
        <p className="at-overline">The Atrium · Event planner</p>
        <h1>Make the room yours.</h1>
        <p>Build your event in order. Try a different room for each stage and check the fit before you inquire.</p>
      </header>
      <div className="at-plan-grid at-planner">
        <section className="at-plan-form at-timeline" aria-labelledby="at-timeline-title">
          <h2 className="at-form-title" id="at-timeline-title" tabIndex={-1}>Your timeline</h2>
          <div className="at-field-pair">
            <label className={label}>Occasion<select className={input} value={event} onChange={(e) => setEvent(e.target.value as Plan["event"])}>{events.map(({ id, label: name }) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className={label}>Guest count<input className={input} type="number" min={1} max={maxGuests} value={count} onChange={(e) => setCount(e.target.value)} aria-invalid={!valid} /></label>
          </div>
          <ol className="at-stage-list" aria-label="Event stages">
            {stages.map((stage, index) => {
              const result = assessments[index];
              const title = getArrangement(stage.setup).label;
              const position = index + 1;
              return (
                <li key={stage.id} className="at-stage" data-active={stage.id === active}>
                  <button type="button" className="at-stage-select" aria-pressed={stage.id === active} aria-controls="at-stage-editor" aria-label={`Edit stage ${position}, ${title}`} aria-describedby={`at-stage-room-${stage.id} at-stage-status-${stage.id}`} onClick={() => openStage(stage.id)}>
                    <span className="at-stage-number" aria-hidden="true">{position}</span>
                    <span><strong>{title}</strong><span className="at-stage-room" id={`at-stage-room-${stage.id}`}>{result.room.name}</span></span>
                    <span className="at-stage-status" id={`at-stage-status-${stage.id}`} data-exceeded={valid && !result.fits}>
                      {valid ? (result.fits ? "Fits" : "Over capacity") : "Capacity"} <span>{result.capacity} max</span>
                    </span>
                  </button>
                  <div className="at-stage-tools">
                    {result.needsBackup && valid && <span>Rain backup · {result.backup?.name ?? "Ask Mara"}</span>}
                    <div>
                      <button type="button" disabled={index === 0} aria-label={`Move stage ${position} up`} onClick={() => moveStage(index, -1)}>↑</button>
                      <button type="button" disabled={index === stages.length - 1} aria-label={`Move stage ${position} down`} onClick={() => moveStage(index, 1)}>↓</button>
                      <button type="button" disabled={stages.length === 1} aria-label={`Remove stage ${position}`} onClick={() => removeStage(index)}>×</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <button className="at-add-stage" type="button" disabled={stages.length >= maxStages} onClick={addStage}>+ Add a stage <span>{stages.length} / {maxStages}</span></button>
          {hasOutdoorStage && <label className="at-check"><input type="checkbox" checked={backup} onChange={(e) => setBackup(e.target.checked)} /> Include indoor rain backups</label>}
        </section>
        <section className="at-plan-form at-stage-editor" id="at-stage-editor" aria-labelledby="at-stage-title">
          <div className="at-editor-heading">
            <p className="at-overline">Stage {activeIndex + 1} of {stages.length}</p>
            <a className="at-text-link" href="#at-timeline-title">Timeline <span aria-hidden="true">↑</span></a>
          </div>
          <h2 className="at-form-title" id="at-stage-title" ref={editorTitle} tabIndex={-1}>{arrangement.label}</h2>
          <div className="at-field-pair">
            <label className={label}>Room<select className={input} value={selected.space} onChange={(e) => editStage({ space: e.target.value as Stage["space"] })}>{spaces.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className={label}>Setup<select className={input} value={selected.setup} onChange={(e) => editStage({ setup: e.target.value as Stage["setup"] })}>{arrangements.map(({ id, label: name }) => <option key={id} value={id}>{name}</option>)}</select></label>
          </div>
          <FloorPlan key={`${selected.id}:${selected.setup}:${selected.space}`} setup={selected.setup} room={room.name} />
          <div className="at-fit" role="status">
            <p><strong>{capacity} guests maximum.</strong> {!valid ? `Enter a guest count from 1 to ${maxGuests}.` : fits ? `Your group of ${guests} fits.` : `Your group exceeds this layout by ${guests - capacity}.`}</p>
            {valid && needsBackup && <p>{rainRoom ? `Rain backup to request: ${rainRoom.name} (${rainRoom.capacity[selected.setup]} guests).` : "Ask Mara about a covered backup for this group."}</p>}
          </div>
          {valid && !fits && (alternatives.length ? <div className="at-alternatives"><p>Try a room with enough space.</p><div className="at-options">
            {alternatives.map((option) => <button type="button" key={option.id} onClick={() => editStage({ space: option.id })}>{option.name} · {option.capacity[selected.setup]}</button>)}
          </div></div> : <p className="at-plan-note">No room fits this group in the selected setup. Try another setup or adjust the guest count.</p>)}
        </section>
        <section className="at-plan-form at-plan-actions" aria-label="Share or inquire">
          <div className="at-page-actions">
            <button className="at-quiet-button" type="button" disabled={!valid} onClick={copyPlan}>Copy plan link</button>
            {valid && unfitted.length === 0 && <Link className="at-button" href={href(`/inquire?${query}`)}>Continue to inquiry <span aria-hidden="true">↗</span></Link>}
          </div>
          {valid && unfitted.length > 0 && <p className="at-plan-note">Adjust {unfitted.length === 1 ? "stage" : "stages"} {unfitted.join(", ")} before requesting an event.</p>}
          {valid && currentShare && (currentShare.copied
            ? <p className="at-plan-note" role="status">Plan link copied.</p>
            : <label className={label}>Select and copy your plan link<input className={input} value={currentShare.url} readOnly onFocus={(event) => event.target.select()} /></label>)}
        </section>
      </div>
    </div>
  );
}
