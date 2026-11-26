import { trays } from "./content";

export const partySizes = [6, 12, 24, 36] as const;
export const maxTrays = 24;
export type TrayOrder = Record<string, number>;

export function partySize(value: string | null) {
  const count = Number(value);
  return Number.isInteger(count) && count >= 6 && count <= 120 ? count : 12;
}

export function suggestedTrays(guests: number): TrayOrder {
  const [first, second = first] = trays.filter((tray) => tray.course === "main");
  const side = trays.find((tray) => tray.course === "side");
  const order: TrayOrder = {};
  if (first) {
    const firstCount = Math.ceil(guests / 2 / first.serves);
    const secondCount = Math.max(0, Math.ceil((guests - firstCount * first.serves) / second.serves));
    order[first.id] = firstCount;
    order[second.id] = (order[second.id] ?? 0) + secondCount;
  }
  if (side) order[side.id] = Math.ceil(guests / (2 * side.serves));
  return order;
}

export function trayTotals(order: TrayOrder) {
  return trays.reduce((result, tray) => {
    const count = order[tray.id] ?? 0;
    return {
      total: result.total + tray.price * count,
      mains: result.mains + (tray.course === "main" ? tray.serves * count : 0),
      count: result.count + count,
    };
  }, { total: 0, mains: 0, count: 0 });
}
