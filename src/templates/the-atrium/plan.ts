import { arrangements, events, spaces, type Arrangement, type Space } from "./content";

export type EventId = (typeof events)[number]["id"];
export type Stage = { space: Space["id"]; setup: Arrangement };
export type Plan = { event: EventId; guests: number; backup: boolean; stages: [Stage, ...Stage[]] };
type SearchValues = { get(name: string): string | null };
export const maxGuests = 250;
export const maxStages = 3;

export function getSpace(id: Stage["space"]) {
  return spaces.find((space) => space.id === id) ?? spaces[0];
}

export function getArrangement(id: Stage["setup"]) {
  return arrangements.find((arrangement) => arrangement.id === id) ?? arrangements[0];
}

function readStages(raw: string | null): Plan["stages"] | undefined {
  if (!raw || raw.length > 120) return;
  const entries = raw.split(",");
  if (entries.length > maxStages) return;
  const stages: Stage[] = [];
  for (const entry of entries) {
    const [setup, room, extra] = entry.split(":");
    const arrangement = arrangements.find((item) => item.id === setup);
    const space = spaces.find((item) => item.id === room);
    if (!arrangement || !space || extra !== undefined) return;
    stages.push({ setup: arrangement.id, space: space.id });
  }
  const [first, ...rest] = stages;
  if (first) return [first, ...rest];
}

export function readPlan(query: SearchValues): Plan {
  const event = events.find((item) => item.id === query.get("event")) ?? events[0];
  const room = spaces.find((item) => item.id === query.get("space"));
  const setup = arrangements.find((item) => item.id === query.get("setup"));
  const guests = Number(query.get("guests"));
  return {
    event: event.id,
    guests: Number.isInteger(guests) && guests >= 1 && guests <= maxGuests ? guests : event.guests,
    backup: query.get("backup") === "1",
    stages: readStages(query.get("stages")) ?? [{ space: room?.id ?? event.space, setup: setup?.id ?? event.arrangement }],
  };
}

export function eventPreset(id: EventId): Plan {
  const event = events.find((item) => item.id === id) ?? events[0];
  const first = { space: event.space, setup: event.arrangement };
  return {
    event: id,
    guests: event.guests,
    backup: id === "wedding",
    stages: id === "wedding"
      ? [first, { setup: "reception", space: "court" }, { setup: "dinner", space: "glasshouse" }]
      : [first],
  };
}

export function planQuery(plan: Plan) {
  const [first] = plan.stages;
  const query = new URLSearchParams({
    space: first.space, setup: first.setup, event: plan.event, guests: String(plan.guests),
  });
  if (plan.backup) query.set("backup", "1");
  if (plan.stages.length > 1) query.set("stages", plan.stages.map(({ setup, space }) => `${setup}:${space}`).join(","));
  return query.toString();
}

export function matchingRooms(setup: Arrangement, guests: number) {
  return spaces.filter((room) => room.capacity[setup] >= guests);
}

export function assessStage({ space, setup }: Stage, guests: number, includeBackup: boolean) {
  const room = getSpace(space);
  const capacity = room.capacity[setup];
  const matches = matchingRooms(setup, guests);
  const needsBackup = includeBackup && room.shelter === "outdoor";
  const backup = needsBackup
    ? matches.filter((option) => option.shelter === "indoor").sort((a, b) => a.capacity[setup] - b.capacity[setup])[0]
    : undefined;

  return { room, capacity, fits: guests <= capacity, alternatives: matches.filter((option) => option.id !== space), needsBackup, backup };
}
