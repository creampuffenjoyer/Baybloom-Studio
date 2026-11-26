"use client";

import { useState } from "react";
import Link from "next/link";
import { pesos } from "../../_kit/hospitality-site";
import { bagQuery, branchMenu } from "../bag";
import { branches } from "../content";
import { tastes } from "../experiences";
import { href } from "../site";

export function CoffeeFinder() {
  const [taste, setTaste] = useState<(typeof tastes)[number]["id"]>("bright");
  const [branch, setBranch] = useState<string>(branches[0].id);
  const selected = tastes.find(({ id }) => id === taste) ?? tastes[0];
  const match = branchMenu(branch).find((drink) => selected.matches.some((id) => id === drink.id));

  return (
    <section className="rr-panel" aria-labelledby="rr-finder-title">
      <h2 id="rr-finder-title">Find your cup.</h2>
      <fieldset className="rr-editor-field"><legend>What do you like?</legend><div className="rr-categories">{tastes.map((option) => <button className="rr-chip" type="button" key={option.id} aria-pressed={taste === option.id} onClick={() => setTaste(option.id)}>{option.label}</button>)}</div></fieldset>
      <fieldset className="rr-editor-field"><legend>Which branch?</legend><div className="rr-categories">{branches.map((option) => <button className="rr-chip" type="button" key={option.id} aria-pressed={branch === option.id} onClick={() => setBranch(option.id)}>{option.name}</button>)}</div></fieldset>
      <div className="rr-finder-result">
        {match ? <>
          <div aria-live="polite"><p className="rr-label">Try this</p><h3>{match.name} <span>{pesos(match.price)}</span></h3><p>{match.description}. {selected.reason}</p></div>
          <Link className="rr-button" href={href(`/pickup?${bagQuery(branch, { [match.id]: 1 })}`)}>Try it in your bag <span aria-hidden="true">↗</span></Link>
        </> : <p role="status">Try a different taste or visit the other branch for this style.</p>}
      </div>
    </section>
  );
}
