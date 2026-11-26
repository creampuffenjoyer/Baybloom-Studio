export const tastes = [
  { id: "bright", label: "Bright & citrusy", matches: ["coffee-tonic", "pour-over"], reason: "Look for a clean finish and a little lift." },
  { id: "classic", label: "Rich & smooth", matches: ["flat-white"], reason: "Steamed milk rounds out a double shot of espresso." },
  { id: "sweet", label: "Sweet & creamy", matches: ["brown-sugar", "chocolate"], reason: "A little sweetness brings out the roast’s softer side." },
] as const;

export const brewRecipes = [
  { method: "Pour-over", ratio: "18 g coffee · 288 g water", tip: "Grind medium-fine. Wet the grounds with 45 g of water, wait 35 seconds, then pour the rest in two slow circles." },
  { method: "French press", ratio: "30 g coffee · 450 g water", tip: "Grind coarse. Stir once after adding the water, steep for four minutes, then lower the press and pour." },
  { method: "Cold brew", ratio: "75 g coffee · 750 g water", tip: "Grind coarse and steep covered in the fridge overnight. Strain and serve over ice with water or milk to taste." },
];

export const workshops = [
  { id: "first-pour", name: "First Pour", branch: "Maginhawa", weekday: "Saturday", day: 6, time: "10 am", minutes: 75, price: 950, group: 6, description: "Taste the same beans at two grind sizes, then brew a cup with a pour-over dripper." },
  { id: "espresso-at-home", name: "Espresso at Home", branch: "Cubao", weekday: "Sunday", day: 0, time: "2 pm", minutes: 90, price: 1350, group: 4, description: "Learn to adjust a shot, troubleshoot a sour pull and steam milk for a flat white." },
] as const;
