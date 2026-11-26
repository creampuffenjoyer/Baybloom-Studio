import { menu } from "./content";

export type Bag = Record<string, number>;
export const maxQuantity = 12;

export function branchMenu(branchId: string) {
  return menu.filter((item) => item.branches.includes(branchId));
}

export function readBag(branchId: string, value: string | null): Bag {
  const available = branchMenu(branchId);
  const bag: Bag = {};
  for (const pair of (value ?? "").slice(0, 400).split(",")) {
    const [id, raw] = pair.split(":");
    const count = Number(raw);
    if (available.some((item) => item.id === id) && Number.isInteger(count) && count >= 1 && count <= maxQuantity) {
      bag[id] = count;
    }
  }
  return bag;
}

export function bagQuery(branchId: string, bag: Bag) {
  const params = new URLSearchParams({ branch: branchId });
  const order = Object.entries(bag).map(([id, count]) => `${id}:${count}`).join(",");
  if (order) params.set("order", order);
  return params.toString();
}
