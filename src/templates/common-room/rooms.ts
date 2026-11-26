import photos from "./photos.json";

export const rooms = [
  {
    name: "Co-Living Studio",
    code: "S",
    area: 24,
    people: "One resident",
    rate: 27500,
    image: "studio",
    space: "A queen bed, a work desk and a compact kitchenette for one resident.",
  },
  {
    name: "Urban Suite",
    code: "U",
    area: 33,
    people: "Up to two residents",
    rate: 34000,
    image: "suite",
    space: "A separate seating area and extra storage, with room for two residents.",
  },
] satisfies {
  name: string; code: string; area: number; people: string;
  rate: number; image: keyof typeof photos; space: string;
}[];

export const money = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});
