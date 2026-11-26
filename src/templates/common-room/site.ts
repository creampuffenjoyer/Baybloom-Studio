import type { StudioSite } from "../_kit/studio/types";

import { rooms, money } from "./rooms";

export const BASE = "/demo/common-room";
export const site = {
  name: "Common Room",
  description: "Furnished co-living studios and urban suites with shared workspaces and everyday amenities.",
  variant: "living",
  theme: { paper: "#f3eee4", surface: "#fffaf2", ink: "#282622", muted: "#5c5147", line: "#c7b7a8", accent: "#8d3d2b", onAccent: "#fff8ea", deep: "#30251f", onDeep: "#faefe2" },
  nav: [{ label: "Compare rooms", href: "/room-finder" }, { label: "About", href: "#about" }, { label: "Amenities", href: "#amenities" }, { label: "Studios", href: "#stays" }, { label: "Gallery", href: "#gallery" }],
  sections: [
    { type: "editorial", id: "about", eyebrow: "About the space", title: "A place to settle into the city.", image: "workspace", body: "Close the door on a private furnished studio, then head downstairs to the workroom and shared kitchen. The building is set up for people spending a month or more in the city.", link: { label: "Compare space and monthly cost", href: "/room-finder" } },
    { type: "list", id: "amenities", eyebrow: "Included in your stay", title: "Made for everyday living.", items: [
      { name: "Shared workspace", description: "A communal desk, power at every seat and reliable fibre internet." },
      { name: "Kitchen and lounge", description: "Cook a proper meal, store groceries or sit down with a neighbour." },
      { name: "Laundry room", description: "Resident access to shared washers, dryers and a folding counter." },
      { name: "Flexible stays", description: "Book a month at a time, with utilities included in the displayed rate." },
      { name: "Secure access", description: "Keycard access to the building and your private room." },
      { name: "Bike storage", description: "An indoor rack near the lobby for residents on two wheels." },
    ] },
    { type: "cards", id: "stays", title: "Choose your space.", intro: "Both room types include a private bathroom and access to the common areas.", items: rooms.map(room => ({
      title: room.name,
      image: room.image,
      meta: `${room.area} m² · from ${money.format(room.rate)} / month`,
      description: room.space,
      link: { label: "Compare stay costs", href: "/room-finder" },
    })) },
    { type: "gallery", id: "gallery", title: "Take a look around.", items: [
      { title: "Resident lounge", image: "lounge", meta: "Shared space" },
      { title: "Furnished studio", image: "studio", meta: "Private space" },
      { title: "The workroom", image: "workspace", meta: "Shared space" },
    ] },
    { type: "editorial", id: "neighborhood", eyebrow: "A city base", title: "Make the neighborhood yours.", image: "lounge", body: "Ask the host about local produce shops, a quiet lunch counter and the quickest route to public transit. We’ll share a short list when you arrive.", link: { label: "Ask about a stay", href: "#request" } },
    { type: "faq", id: "policies", title: "Before you move in.", items: [
      { question: "How long can I stay?", answer: "Start with a month and ask about extending once your dates are clear." },
      { question: "What is included in the rate?", answer: "The advertised rate includes utilities, fibre internet and access to the shared spaces." },
      { question: "Can I view a room first?", answer: "Mention a viewing in your booking request and include the days you can visit." },
    ] },
    { type: "request", id: "request", title: "Ask about available dates.", intro: "Choose the room you’re interested in and share your move-in date and length of stay.", optionLabel: "Room type", options: ["Co-Living Studio", "Urban Suite", "Either room type"], dateLabel: "Preferred move-in date", notesLabel: "Expected length of stay and any questions", submitLabel: "Preview booking request", confirmation: "Your sample booking request is ready." },
  ],
  footer: "Private studios and shared space for month-long city stays",
  desk: {
    heading: "Resident desk",
    lines: ["Furnished stays start at one month. Utilities, fibre and shared workspaces are included.","To arrange a viewing, include your preferred day and move-in month in a stay request."],
    links: [{ label: "Compare studios", href: "/room-finder" }, { label: "Ask about a viewing", href: "#request" }],
  },
} satisfies StudioSite;
