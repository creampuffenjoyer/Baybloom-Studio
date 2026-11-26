import type { StudioSite } from "../_kit/studio/types";

export const BASE = "/demo/fern-and-stone";
export const site = {
  name: "Fern & Stone",
  description: "A boutique wellness retreat and spa with soaking rituals, quiet rooms and restorative weekends.",
  variant: "retreat",
  theme: { paper: "#f2f1e7", surface: "#e5e9db", ink: "#282f25", muted: "#4c5948", line: "#a8b3a1", accent: "#365437", onAccent: "#fcfaf0", deep: "#26382b", onDeep: "#f1f4e7" },
  nav: [{ label: "Daybook", href: "/daybook" }, { label: "Spa rituals", href: "#rituals" }, { label: "The retreat", href: "#retreat" }, { label: "Social kit", href: "/social" }],
  sections: [
    { type: "cards", id: "rituals", eyebrow: "The spa", title: "Time for rejuvenation.", items: [
      { title: "Cedar & stone massage", image: "treatment", meta: "75 minutes", description: "Slow, steady pressure with warmed basalt and unscented oil.", link: { label: "Arrange a massage", href: "#request" } },
      { title: "Limestone soak", image: "pool", meta: "45 minutes", description: "An outdoor mineral bath with space to cool down among the ferns.", link: { label: "See the afternoon itinerary", href: "/daybook#afternoon" } },
      { title: "Quiet morning ritual", image: "basin", meta: "60 minutes", description: "Guided breathwork, gentle movement and wild mint tea.", link: { label: "See the morning itinerary", href: "/daybook#morning" } },
    ] },
    { type: "editorial", id: "retreat", eyebrow: "Rest overnight", title: "A room of your own.", image: "room", body: "Arrive in the afternoon and spend two nights in a private timber room. The weekend includes a plant-forward breakfast, a morning stroll and a spa ritual of your choice.", link: { label: "Ask about a weekend", href: "#request" } },
    { type: "request", id: "request", title: "Plan your visit.", intro: "Choose a ritual or an overnight retreat, then tell us when you’d like to come.", optionLabel: "Spa or retreat", options: ["Cedar & stone massage", "Limestone soak", "Quiet morning ritual", "Two-night retreat"], dateLabel: "Preferred date", notesLabel: "Notes for the retreat team", submitLabel: "Preview retreat request", confirmation: "Your sample retreat request is ready." },
  ],
  footer: "Overnight retreats and day spa rituals",
  desk: {
    heading: "Guest desk",
    lines: ["Spa visits by appointment. Leave fifteen minutes to change before your ritual.","Staying overnight? Check in from 3 pm and leave your bags with us on departure day."],
    links: [{ label: "Retreat daybook", href: "/daybook" }, { label: "Plan a retreat", href: "#request" }],
  },
  social: [
    { id: "retreat-open", format: "post", layout: "postcards", photo: "pool", supportingPhotos: ["room", "basin"], label: "Retreat announcement", headline: "A slower kind of stay.", caption: "Two nights among the ferns." },
    { id: "cedar-stone", format: "post", layout: "letter", photo: "treatment", label: "Spa ritual spotlight", headline: "Cedar & stone.", caption: "75 minutes of slow, steady pressure." },
    { id: "quiet-room", format: "post", layout: "journal", photo: "room", supportingPhotos: ["basin"], label: "Retreat room", headline: "Settle in.", caption: "Private timber rooms with space to rest." },
    { id: "soak-story", format: "story", layout: "journal", photo: "basin", supportingPhotos: ["pool"], label: "Wellness ritual", headline: "Take a slow morning.", caption: "Breathwork, gentle movement and mint tea." },
    { id: "arrive-story", format: "story", layout: "letter", photo: "room", label: "Stay invitation", headline: "Leave the weekend open.", caption: "Plan a two-night wellness retreat." },
    { id: "spa-story", format: "story", layout: "photo-notice", photo: "treatment", label: "Spa availability", headline: "Your spa afternoon.", caption: "Choose a soak or a massage." },
  ],
} satisfies StudioSite;
