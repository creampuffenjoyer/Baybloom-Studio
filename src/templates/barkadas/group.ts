import { stays, type Stay } from "./content";

export const MAX_GUESTS = 16;
export const MAX_CARS = 5;

export function groupNumber(value: string | null, min: number, max: number, fallback: number) {
  const number = Number(value);
  return value !== null && value !== "" && Number.isInteger(number) && number >= min && number <= max ? number : fallback;
}

export function groupCapacity(stay: Stay, ownBed: boolean) {
  if (!ownBed) return stay.guests;
  const beds = stay.rooms.reduce((total, room) => total + room.queen + room.single, 0);
  return Math.min(stay.guests, beds);
}

export function findStay(guests: number, cars: number, ownBed: boolean) {
  return stays.find((stay) => guests <= groupCapacity(stay, ownBed) && cars <= stay.parking);
}

export function groupQuery(stay: Stay, guests: number, cars: number, ownBed: boolean) {
  return new URLSearchParams({ stay: stay.id, guests: String(guests), cars: String(cars), ...(ownBed ? { beds: "individual" } : {}) }).toString();
}

export function bedLabel(room: Stay["rooms"][number]) {
  const beds = [];
  if (room.queen) beds.push(`${room.queen} queen ${room.queen === 1 ? "bed" : "beds"}`);
  const singles: number = room.single;
  if (singles) beds.push(`${singles} single ${singles === 1 ? "bed" : "beds"}`);
  return beds.join(" + ");
}
