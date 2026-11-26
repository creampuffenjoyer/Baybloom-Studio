import type { StudioSite } from "../_kit/studio/types";

export const BASE = "/demo/afterglow-rental";
export const site = {
  name: "Afterglow Rental",
  description: "Luxury event furniture rental, lighting design and styling for evening gatherings.",
  variant: "events",
  theme: { paper: "#f8f3ea", surface: "#eee3d5", ink: "#282018", muted: "#624c3d", line: "#c9b6a5", accent: "#784932", onAccent: "#fffaf0", deep: "#2f211c", onDeep: "#fff4e1" },
  nav: [{ label: "Cue sheet", href: "/cue-sheet" }, { label: "About", href: "#studio-title" }, { label: "Services", href: "#services" }, { label: "Packages", href: "#packages" }, { label: "FAQ", href: "#faq" }, { label: "Inquire", href: "#request" }],
  mastheadNote: "Event furniture & lighting design",
  sections: [
    { type: "cards", id: "services", eyebrow: "Services", title: "What we bring.", items: [
      { title: "Lighting Design", image: "lighting", meta: "Light plan · installation", description: "Warm uplights, pin spots and dimmed table lighting, set to suit the venue.", link: { label: "See the lighting cues", href: "/cue-sheet" } },
      { title: "Lounge Curation", image: "lounge", meta: "Seating · low tables", description: "Modular sofas, soft armchairs and surfaces arranged for conversation.", link: { label: "See lounge packages", href: "#packages" } },
      { title: "Event Styling", image: "table", meta: "Floor plan · on-site styling", description: "A consistent material palette from arrival drinks to the dinner table.", link: { label: "See styling packages", href: "#packages" } },
    ] },
    { type: "list", id: "approach", title: "Built around the evening.", image: "table", items: [
      { name: "A considered floor plan", description: "We map arrival, conversation and dinner zones before anything gets loaded." },
      { name: "Lighting tested in the room", description: "We set the colour and intensity at the venue and check sight lines from guest seats." },
      { name: "One installation crew", description: "The same team handles delivery, styling and strike." },
      { name: "A flexible furniture inventory", description: "Rearrange the modules for a compact lounge or a larger reception." },
    ] },
    { type: "editorial", id: "evening", title: "Set the room for after dark.", body: "Start with lighting, a furnished lounge or a plan for the full evening.", link: { label: "Compare packages", href: "#packages" } },
    { type: "pricing", id: "packages", eyebrow: "Starting rates", title: "Three ways to set the room.", intro: "For a single evening. Final quotes account for venue access, guest count and the installation window.", link: { label: "Request a quote", href: "#request" }, packages: [
      { name: "Glow", price: "₱32,000", description: "Lighting for one room.", features: ["Lighting plot", "Uplights and room wash", "Installation and strike"] },
      { name: "Gather", price: "₱58,000", description: "A furnished lounge with lighting.", features: ["Modular lounge seating", "Occasional tables", "Ambient lighting and setup"], featured: true },
      { name: "Entire Evening", price: "₱96,000", description: "Full-room styling for dinner and reception.", features: ["Furniture and light plan", "Dinner and lounge zones", "On-site styling lead"] },
    ] },
    { type: "list", id: "occasions", title: "Three ways to use the room.", items: [
      { name: "A long dinner", description: "A warm table wash and an adjacent lounge for a quieter conversation." },
      { name: "A launch", description: "A clear path from arrival to the display, with flexible seating around the edges." },
      { name: "A reception", description: "Low, movable furniture groups that can make room for dancing later in the evening." },
    ] },
    { type: "faq", id: "faq", title: "Before you book.", items: [
      { question: "Do you install and remove the furniture?", answer: "All packages include delivery, installation and strike. Share the venue’s loading window so we can quote accurately." },
      { question: "Can we use our venue’s existing lights?", answer: "Yes. Send the fixture list and floor plan, and we’ll propose a lighting plan around what is already in place." },
      { question: "Can we mix items from different packages?", answer: "Yes. Choose a custom service in the inquiry and tell us what furniture or lighting you have in mind." },
    ] },
    { type: "request", id: "request", title: "Tell us about the room.", intro: "Share your venue, approximate guest count and any access or setup details you know.", optionLabel: "Package or service", options: ["Glow", "Gather", "Entire Evening", "Custom service"], dateLabel: "Event date", notesLabel: "Venue and guest count", submitLabel: "Preview quote request", confirmation: "Your sample event quote request is ready." },
  ],
  footer: "Furniture, light plans and event styling",
  desk: {
    heading: "Production desk",
    lines: ["For a first quote, send the venue, event date and approximate guest count.","Installation and strike are included. Confirm loading access with your venue before the site visit."],
    links: [{ label: "Evening cue sheet", href: "/cue-sheet" }, { label: "Event inquiries", href: "#request" }],
  },
} satisfies StudioSite;
