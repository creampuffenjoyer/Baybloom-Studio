export const branches = [
  { id: "maginhawa", name: "Maginhawa", hours: "Daily, 7 am – 8 pm", pickup: "8 am – 6 pm", cue: "Espresso, fresh bakes and a window seat.", map: "Maginhawa Street, Quezon City" },
  { id: "cubao", name: "Cubao", hours: "Tue–Sun, 9 am – 9 pm", pickup: "10 am – 7 pm", cue: "A smaller bar for slow brews and a quick cup.", map: "Cubao Expo, Quezon City" },
] as const;

export const categories = ["Coffee", "Other drinks", "Bakes"] as const;

export const menu = [
  { id: "flat-white", name: "Flat white", description: "Double espresso and silky steamed milk", category: "Coffee", price: 160, branches: ["maginhawa", "cubao"] },
  { id: "brown-sugar", name: "Brown sugar oat latte", description: "Espresso, oat milk and house-made muscovado syrup", category: "Coffee", price: 195, branches: ["maginhawa", "cubao"] },
  { id: "coffee-tonic", name: "Calamansi espresso tonic", description: "Espresso, fresh calamansi and sparkling tonic", category: "Coffee", price: 190, branches: ["maginhawa"] },
  { id: "pour-over", name: "Guest roast pour-over", description: "A rotating single-origin coffee brewed by hand", category: "Coffee", price: 210, branches: ["cubao"] },
  { id: "chocolate", name: "Iced tablea", description: "Local cacao whisked with milk and served over ice", category: "Other drinks", price: 175, branches: ["maginhawa", "cubao"] },
  { id: "citrus-soda", name: "Ginger calamansi soda", description: "Fresh ginger, citrus and sparkling water", category: "Other drinks", price: 150, branches: ["maginhawa", "cubao"] },
  { id: "croissant", name: "Butter croissant", description: "Hand-laminated and baked each morning", category: "Bakes", price: 135, branches: ["maginhawa", "cubao"] },
  { id: "banana-loaf", name: "Banana espresso loaf", description: "Dark sugar, ripe bananas and a little espresso", category: "Bakes", price: 125, branches: ["maginhawa"] },
  { id: "cookie", name: "Sea salt cacao cookie", description: "Chewy chocolate cookie with flaky sea salt", category: "Bakes", price: 105, branches: ["cubao"] },
];
