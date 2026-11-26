"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { input, pesos } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { bagQuery, branchMenu, maxQuantity, readBag, type Bag } from "../bag";
import { branches, categories } from "../content";
import { href } from "../site";

export function CoffeePage({ pickup = false }: { pickup?: boolean }) {
  const query = useSearchParams();
  const branch = branches.find(({ id }) => id === query.get("branch")) ?? branches[0];
  const order = query.get("order");
  return <CoffeeCounter key={`${branch.id}:${order ?? ""}`} mode={pickup ? "pickup" : "menu"} initialBranch={branch.id} initialBag={readBag(branch.id, order)} />;
}

export function CoffeeCounter({ mode = "home", initialBranch = branches[0].id, initialBag = {} }: {
  mode?: "home" | "menu" | "pickup";
  initialBranch?: string;
  initialBag?: Bag;
}) {
  const [branchId, setBranchId] = useState(initialBranch);
  const [bag, setBag] = useState(initialBag);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const branch = branches.find(({ id }) => id === branchId) ?? branches[0];
  const available = branchMenu(branch.id);
  const items = available.filter((item) => bag[item.id]);
  const count = items.reduce((sum, item) => sum + bag[item.id], 0);
  const total = items.reduce((sum, item) => sum + item.price * bag[item.id], 0);
  const query = search.trim().toLowerCase();
  const matching = available.filter((item) => (category === "All" || item.category === category) &&
    `${item.name} ${item.description}`.toLowerCase().includes(query));
  const filtered = mode === "home" && category === "All" ? matching.slice(0, 4) : matching;
  const pickup = mode === "pickup";
  const Title = mode === "home" ? "h2" : "h1";
  const params = bagQuery(branch.id, bag);

  function chooseBranch(id: string) {
    const next = readBag(id, items.map((item) => `${item.id}:${bag[item.id]}`).join(","));
    setNotice(Object.keys(next).length < items.length ? "Items unavailable at this branch were removed from your bag." : "");
    setBranchId(id);
    setBag(next);
  }

  function changeQuantity(id: string, delta: number) {
    setBag((previous) => {
      const next = { ...previous };
      const amount = Math.min(maxQuantity, (next[id] ?? 0) + delta);
      if (amount > 0) next[id] = amount;
      else delete next[id];
      return next;
    });
  }

  return (
    <section id="counter" className="rr-counter" aria-labelledby="counter-title">
      <div className="rr-counter-head">
        <div>
          <p className="rr-label">Roast Row / {pickup ? "Pickup" : "Order counter"}</p>
          <Title id="counter-title" className="rr-display">{pickup ? "YOUR PICKUP." : mode === "home" ? "AT THE COUNTER." : "THE COUNTER MENU."}</Title>
        </div>
        <fieldset className="rr-branches">
          <legend>Choose a branch</legend>
          <div>
            {branches.map((location) => <button className="rr-chip" key={location.id} type="button" aria-pressed={branch.id === location.id} onClick={() => chooseBranch(location.id)}>{location.name}</button>)}
          </div>
        </fieldset>
      </div>
      <p className="rr-hours" role="status">{branch.name} · {branch.hours} · Pickup {branch.pickup}{notice && <span className="block font-semibold">{notice}</span>}</p>
      <div className="rr-counter-grid">
        <div>
          <div className="rr-menu-tools">
            <div className="rr-categories" aria-label="Menu categories">
              {["All", ...categories].map((name) => <button type="button" className="rr-chip" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}
            </div>
            {mode === "menu" && <label className="rr-search"><span>Search menu</span><input className={input} type="search" placeholder="Try oat or cacao" value={search} onChange={(event) => setSearch(event.target.value)} /></label>}
          </div>
          <ul className="rr-items">
            {filtered.map((item) => (
              <li key={item.id}>
                <div><h3>{item.name}</h3><p>{item.description}</p></div>
                <strong>{pesos(item.price)}</strong>
                <button type="button" className="rr-add" disabled={(bag[item.id] ?? 0) >= maxQuantity} aria-label={`Add ${item.name} to bag`} onClick={() => changeQuantity(item.id, 1)}>+</button>
              </li>
            ))}
          </ul>
          {!filtered.length && <p role="status" className="rr-empty">Nothing matches. Try a different search or category.</p>}
          {mode === "home" && <Link href={href(`/menu?${params}`)} className="rr-text-link">See the full branch menu <span aria-hidden="true">↗</span></Link>}
        </div>
        <aside className="rr-receipt" aria-labelledby="bag-title">
          <div className="rr-receipt-head"><h3 id="bag-title">Your bag</h3><span>{branch.name}</span></div>
          {items.length ? (
            <ul className="rr-bag">
              {items.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <div className="rr-quantity" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>−</button>
                    <span>{bag[item.id]}</span>
                    <button type="button" aria-label={`Add another ${item.name}`} disabled={bag[item.id] >= maxQuantity} onClick={() => changeQuantity(item.id, 1)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="rr-empty">Add a drink or a bake from the counter.</p>}
          <p className="rr-total" role="status"><span>{count} {count === 1 ? "item" : "items"}</span><strong>{pesos(total)}</strong></p>
          {pickup && count > 0 ? (
            <SampleRequest key={branch.id} submitLabel="Try pickup request" confirmation={`Sample pickup request for ${branch.name} prepared. No order was placed.`}>
              <input type="hidden" name="branch" value={branch.id} />
              <input type="hidden" name="order" value={params} />
            </SampleRequest>
          ) : !pickup && count > 0 && <Link className="rr-button" href={href(`/pickup?${params}`)}>Continue to pickup <span aria-hidden="true">↗</span></Link>}
        </aside>
      </div>
    </section>
  );
}
