export const stays = [
  {
    id: "garden-room",
    name: "Garden room",
    photo: "detail",
    guests: 4,
    parking: 1,
    price: 3200,
    rooms: [{ name: "Garden bedroom", queen: 2, single: 0 }],
    description: "A private room for small groups with an en-suite bath and a leafy outlook.",
    perks: ["Private bathroom", "Shared veranda", "Wi-Fi"],
  },
  {
    id: "whole-house",
    name: "The whole house",
    photo: "hero",
    guests: 12,
    parking: 3,
    price: 9600,
    rooms: [
      { name: "Garden bedroom", queen: 2, single: 0 },
      { name: "Veranda bedroom", queen: 2, single: 0 },
      { name: "Upstairs bedroom", queen: 1, single: 2 },
    ],
    description: "Take over the house for the weekend with a kitchen, long dining table and a private courtyard.",
    perks: ["Three bathrooms", "Full kitchen", "Private courtyard"],
  },
] as const;

export type Stay = (typeof stays)[number];

export const houseRules = [
  { title: "Check-in / out", detail: "Check in from 3 pm and check out by 11 am. Ask about early arrivals before you travel." },
  { title: "Quiet hours", detail: "Keep outdoor noise low after 10 pm so everyone in the neighborhood can rest." },
  { title: "Parking", detail: "One slot comes with the Garden room. The whole house has three slots." },
  { title: "Guests and gatherings", detail: "Only registered guests can stay overnight. Please ask about day visitors when you inquire." },
];
