"use client";

import { useState } from "react";
import { input, label, pesos } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { menu } from "../content";

const dishes = menu.flatMap(({ items }) => items);

export function TakeoutForm() {
  const [dishName, setDishName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const dish = dishes.find(({ name }) => name === dishName);

  return (
    <SampleRequest submitLabel="Try takeout request" confirmation="Sample takeout request prepared. No order was placed.">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className={label}>Dish<select name="dish" className={input} value={dishName} required onChange={(event) => setDishName(event.target.value)}><option value="">Choose a dish</option>{dishes.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
        <label className={label}>Quantity<select name="quantity" className={input} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count}>{count}</option>)}</select></label>
      </div>
      <p role="status" className="font-semibold">{dish ? `Estimated total ${pesos(dish.price * quantity)}` : "Choose a dish to see the estimated total."}</p>
    </SampleRequest>
  );
}
