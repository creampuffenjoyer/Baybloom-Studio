import type { StudioSite } from "../_kit/studio/types";

export const BASE = "/demo/root-and-kettle";
export const site = {
  name: "Root & Kettle",
  description: "A seasonal plant-based kitchen and specialty brew bar with market vegetables, pour-over coffee and fresh matcha.",
  variant: "kitchen",
  theme: { paper: "#f9efe3", surface: "#fffbf2", ink: "#3a211d", muted: "#654a42", line: "#bd9e8e", accent: "#742f34", onAccent: "#fff3e6", deep: "#34432c", onDeep: "#f7f3e3" },
  nav: [{ label: "Pairings", href: "/pairings" }, { label: "Menu", href: "#menu" }, { label: "Visit", href: "#visit" }, { label: "Social kit", href: "/social" }],
  sections: [
    { type: "menu", id: "menu", eyebrow: "Kitchen & brew bar", title: "Made today.", intro: "The vegetable plates change with the market. Ask the bar which beans are on today.", groups: [
      { title: "Plant-based kitchen", image: "squash", items: [
        { name: "Charred squash & lentils", price: "₱390", description: "Green lentils, lemon tahini and crisp sage." },
        { name: "Market greens toast", price: "₱320", description: "White bean spread, dressed greens and pickled shallot." },
        { name: "Miso mushroom bowl", price: "₱420", description: "Brown rice, roast mushrooms and sesame cucumber." },
      ] },
      { title: "Specialty brew bar", image: "coffee", items: [
        { name: "Single-origin pour-over", price: "₱190", description: "A rotating light roast, brewed to order." },
        { name: "Iced filter coffee", price: "₱175", description: "Flash-chilled and served over a clear cube." },
        { name: "Mint matcha", price: "₱215", description: "Whisked matcha, oat milk and fresh mint." },
      ] },
    ] },
    { type: "editorial", id: "visit", eyebrow: "Visit the counter", title: "Take a seat at the brew bar.", image: "matcha", body: "Wednesday to Sunday, 9 am to 5 pm. The kitchen serves lunch from 11 am to 3 pm. Walk in for coffee, or send a table request for parties of four to six.", link: { label: "Request a table", href: "#request" } },
    { type: "request", id: "request", title: "Find a table.", intro: "Choose the size of your party and leave a note with your preferred lunch time.", optionLabel: "Party size", options: ["4 guests", "5 guests", "6 guests"], dateLabel: "Preferred date", notesLabel: "Preferred time and dietary notes", submitLabel: "Preview table request", confirmation: "Your sample table request is ready." },
  ],
  footer: "Seasonal plates and small-batch brews",
  desk: {
    heading: "Counter hours",
    lines: ["Wednesday–Sunday · 9 am–5 pm","Lunch 11 am–3 pm. Walk in for brews. Tables for four to six can be requested ahead."],
    links: [{ label: "Counter pairings", href: "/pairings" }, { label: "Request a table", href: "#request" }],
  },
  social: [
    { id: "market-plate", format: "post", layout: "menu-board", photo: "spread", supportingPhotos: ["squash", "matcha"], label: "Market menu", headline: "At the table today.", caption: "A new spread from the morning market." },
    { id: "squash-plate", format: "post", layout: "label", photo: "squash", label: "Kitchen special", headline: "Squash season.", caption: "Charred squash, green lentils and tahini." },
    { id: "bar-pick", format: "post", layout: "photo-notice", photo: "coffee", label: "Brew bar pick", headline: "By the cup.", caption: "Ask about today’s single-origin coffee." },
    { id: "matcha-story", format: "story", layout: "label", photo: "matcha", label: "Craft drink", headline: "Whisked to order.", caption: "Mint matcha with oat milk." },
    { id: "lunch-story", format: "story", layout: "menu-board", photo: "spread", supportingPhotos: ["squash", "coffee"], label: "Lunch service", headline: "Lunch is on.", caption: "Plant-based plates from 11 am to 3 pm." },
    { id: "filter-story", format: "story", layout: "photo-notice", photo: "coffee", label: "Counter hours", headline: "See you at the bar.", caption: "Wednesday through Sunday, 9 am to 5 pm." },
  ],
} satisfies StudioSite;
