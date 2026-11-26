import type { StudioSite } from "../_kit/studio/types";

export const BASE = "/demo/form-and-field";
export const site = {
  name: "Form & Field",
  description: "An independent creative studio for brand strategy, visual identity and digital experiences.",
  variant: "agency",
  theme: { paper: "#f4f2e9", surface: "#e8e6db", ink: "#202021", muted: "#4b4d50", line: "#9c9ba0", accent: "#233eaf", onAccent: "#ffffff", deep: "#172352", onDeep: "#faf6e7" },
  nav: [{ label: "Case study", href: "/northline" }, { label: "Work", href: "#work" }, { label: "Services", href: "#services" }, { label: "About", href: "#about" }],
  sections: [
    { type: "editorial", id: "welcome", eyebrow: "Our point of view", title: "Start with what makes you different.", body: "We listen to customers and the people inside your team. What we learn guides the words, visuals and decisions that follow.", image: "circles", detailPhoto: "paper" },
    { type: "editorial", id: "about", eyebrow: "About the studio", title: "A small team stays close to the work.", image: "metal", detailPhoto: "circles", body: "We partner directly with founders and in-house teams. The people in your first workshop are the same people laying out the identity, prototyping the site and preparing your handoff.", link: { label: "Get to know our services", href: "#services" } },
    { type: "cards", id: "services", title: "What we make.", items: [
      { title: "Brand Strategy", image: "circles", meta: "Research & positioning", description: "Audience research, positioning and a voice guide for everyday use." },
      { title: "Visual Identity", image: "paper", meta: "Marks, typography & colour", description: "A visual system that holds together across print and screen." },
      { title: "Digital Experiences", image: "metal", meta: "Websites & design systems", description: "Responsive websites and component libraries built around what visitors need to do." },
    ] },
    { type: "list", id: "framework", eyebrow: "The process", title: "How we get there.", items: [
      { name: "Discover", description: "Learn how the team works, where the brand stands and what the new site needs to do." },
      { name: "Define", description: "Agree on an audience, a position and the decisions that will guide the rest of the project." },
      { name: "Design", description: "Develop the visual system and test it in the places customers will actually see it." },
      { name: "Hand over", description: "Deliver the original assets, component library and guidance to use them." },
    ] },
    { type: "cards", id: "work", eyebrow: "Portfolio", title: "Selected work.", items: [
      { title: "Northline Assembly", image: "circles", meta: "Brand strategy · visual identity", description: "A modular identity for a maker-led design fair.", link: { label: "Read the Northline case study", href: "/northline" } },
      { title: "Edition One", image: "paper", meta: "Visual identity · editorial", description: "A graphic system for an independent publishing imprint.", details: "Offset colour blocks give every series a recognisable spine while leaving room for each author." },
      { title: "Signal Index", image: "metal", meta: "Web design · design system", description: "A searchable digital archive for a materials research team.", details: "A flexible index connects project records, material samples and reading lists." },
    ] },
    { type: "faq", id: "faq", title: "Working together.", items: [
      { question: "Can we start with strategy?", answer: "Yes. You can commission strategy on its own, then decide whether you need an identity or a website." },
      { question: "Can our own team build the website?", answer: "Yes. We can deliver responsive designs, a component library and handoff notes for your developers." },
    ] },
    { type: "request", id: "request", title: "Tell us what you’re building.", intro: "A short project note is enough to start. Include your timing and what you want to be able to hand over at the end.", optionLabel: "Project focus", options: ["Brand Strategy", "Visual Identity", "Digital Experiences", "Brand and website"], notesLabel: "Project notes", submitLabel: "Preview project inquiry", confirmation: "Your sample project inquiry is ready." },
  ],
  footer: "Brand strategy, identity and websites",
  desk: {
    heading: "New business",
    lines: ["We work directly with founders and in-house design teams.","Send a short brief with the launch date, audience and what your team needs to take away."],
    links: [{ label: "Northline case study", href: "/northline" }, { label: "Send a project brief", href: "#request" }],
  },
} satisfies StudioSite;
