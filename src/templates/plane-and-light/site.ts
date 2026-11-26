import type { StudioSite } from "../_kit/studio/types";

export const BASE = "/demo/plane-and-light";
export const site = {
  name: "Plane & Light",
  description: "Architectural and interior photography for designers, practices and editorial commissions.",
  variant: "photo",
  theme: { paper: "#efede7", surface: "#e5e1d8", ink: "#2a2926", muted: "#554e45", line: "#a2998c", accent: "#423a30", onAccent: "#fcf6ed", deep: "#22211e", onDeep: "#f8f2e8" },
  nav: [{ label: "Contact sheet", href: "/contact-sheet" }, { label: "Portfolio", href: "#work" }, { label: "Studio", href: "#studio" }, { label: "Commissions", href: "#request" }],
  sections: [
    { type: "editorial", id: "statement", title: "A building changes with the light.", image: "exterior", detailPhoto: "interior", body: "We photograph the structure, the way people move through it and the materials they see up close.", link: { label: "Browse the contact sheet", href: "/contact-sheet" } },
    { type: "editorial", id: "studio", title: "Built around the site.", image: "stair", detailPhoto: "courtyard", body: "Every shoot starts with a walkthrough to understand how the building is used and when the light reaches each room. Deliveries include a carefully sequenced edit for press, portfolios and publication.", link: { label: "Discuss a commission", href: "#request" } },
    { type: "pricing", id: "commissions", eyebrow: "Coverage", title: "Commission options.", packages: [
      { name: "Material Study", price: "From ₱16,000", description: "A focused visit to document materials and construction details.", features: ["Up to two hours on site", "Twelve edited images"] },
      { name: "Interior Feature", price: "From ₱32,000", description: "Room-by-room coverage for an interiors project.", features: ["A half-day visit", "Twenty-five edited images"] },
      { name: "Building Portfolio", price: "From ₱48,000", description: "Exterior, interior and detail coverage across changing light.", features: ["A full day on site", "Forty edited images"] },
    ], link: { label: "Request a quote", href: "#request" } },
    { type: "gallery", id: "features", eyebrow: "Selected commissions", title: "Three studies in structure.", backdrop: "facade", items: [
      { title: "The Listening Room", image: "interior", meta: "Interiors" },
      { title: "Low Court", image: "exterior", meta: "Architecture" },
      { title: "Stair at No. 12", image: "stair", meta: "Material studies" },
    ] },
    { type: "list", id: "process", title: "From brief to final edit.", items: [
      { name: "Brief", description: "Set the image list and intended uses." },
      { name: "Walkthrough", description: "Plan angles and check the light." },
      { name: "Shoot", description: "Work through the site at the best hour for each view." },
      { name: "Delivery", description: "Review a sequenced, colour-corrected set." },
    ] },
    { type: "gallery", id: "work", eyebrow: "Portfolio", title: "A study in structure.", intro: "Open an image to see its lines, surfaces and light at full size.", items: [
      { title: "Pavilion at dusk", image: "facade", meta: "Exterior" },
      { title: "The Listening Room", image: "interior", meta: "Interior" },
      { title: "Low Court", image: "exterior", meta: "Architecture" },
      { title: "Stair at No. 12", image: "stair", meta: "Material study" },
      { title: "The reflecting court", image: "courtyard", meta: "Architecture" },
    ] },
    { type: "request", id: "request", title: "Commission a shoot.", intro: "Tell us where the project is, when it will be ready and where the images will appear.", optionLabel: "Project type", options: ["Architecture", "Interiors", "Material study", "Editorial commission"], dateLabel: "Target shoot date", notesLabel: "Location and intended use", submitLabel: "Preview photography inquiry", confirmation: "Your sample photography inquiry is ready.", images: ["interior", "stair"] },
  ],
  footer: "Photography of architecture, interiors and materials",
  desk: {
    heading: "Prints & licensing",
    lines: ["For image permissions, include the frame title, intended publication and print run.","For commissions, include the site address and the dates the building is available."],
    links: [{ label: "Contact sheet", href: "/contact-sheet" }, { label: "Commission a shoot", href: "#request" }],
  },
} satisfies StudioSite;
