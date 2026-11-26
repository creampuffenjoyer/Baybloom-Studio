export const gatherings = [
  { id: "lunch", name: "Family lunch", min: 6, max: 12, price: 650, menu: ["Chicken inasal", "Garlic rice", "Leche flan"], description: "A long lunch with room for extra rice and a round of dessert." },
  { id: "birthday", name: "Birthday table", min: 10, max: 20, price: 780, menu: ["Crispy pork belly", "Beef kare-kare", "Garlic rice", "Leche flan"], description: "Set aside a table for friends, family and a candle in the flan." },
  { id: "reunion", name: "Family reunion", min: 18, max: 32, price: 920, menu: ["Crispy pork belly", "Chicken inasal", "Beef kare-kare", "Gising-gising", "Leche flan"], description: "Reserve the side room for a family-style spread and a slower afternoon." },
] as const;

export const kitchenNotes = [
  { name: "The slow pot", detail: "We serve the kare-kare with greens and bagoong on the side, so everyone can finish their own plate." },
  { name: "At the grill", detail: "The chicken sits in calamansi and aromatics before it meets the charcoal. Ask for garlic rice to catch the drippings." },
  { name: "Something sweet", detail: "The flan sets overnight. We turn it out when you order so the caramel runs over the sides." },
];
