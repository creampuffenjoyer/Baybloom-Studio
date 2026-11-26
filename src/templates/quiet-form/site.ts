import type { StudioSite } from "../_kit/studio/types";

export const BASE = "/demo/quiet-form";
export const site = {
  name: "Quiet Form",
  description: "A minimalist fashion label concept with a small collection, a layered lookbook and clear product details.",
  variant: "fashion",
  theme: { paper: "#f4f1e9", surface: "#eae5da", ink: "#303128", muted: "#58584b", line: "#a9a695", accent: "#4e543d", onAccent: "#fdf9e9", deep: "#33362a", onDeep: "#f5f1e7" },
  nav: [{ label: "Fabric library", href: "/fabric-library" }, { label: "The picks", href: "#collection" }, { label: "Collections", href: "#edits" }, { label: "Materials", href: "#materials" }],
  sections: [
    { type: "links", id: "edits", title: "Shop by collection.", items: [
      { label: "Conscious Collection", image: "shirt", href: "#collection" },
      { label: "Ethical Essentials", image: "scarf", href: "#essentials" },
      { label: "The lookbook", image: "look", href: "#lookbook" },
    ] },
    { type: "cards", id: "collection", title: "Conscious Collection.", intro: "Open each piece for fabric, fit and care. We may earn a commission on purchases made through a marked affiliate link.", items: [
      { title: "The Day Shirt", image: "shirt", meta: "Oat linen · ₱3,450", description: "An easy button-through shirt with a dropped shoulder.", details: "100% linen. Relaxed fit through the body. Cold wash on a gentle cycle and hang to dry." },
      { title: "The Straight Trouser", image: "trouser", meta: "Olive linen · ₱3,650", description: "A straight leg with a flat front and room at the hip.", details: "100% linen. Use a cold gentle wash, then reshape and hang to dry." },
      { title: "The Rib Crew", image: "knit", meta: "Slate cotton · ₱2,950", description: "A soft midweight knit with a high crew neck.", details: "Cotton knit in a regular fit with a rib edge. Wash cold and dry flat." },
      { title: "The Carry Tote", image: "tote", meta: "Bone canvas · ₱1,250", description: "A structured everyday tote with an inside pocket.", details: "Heavy cotton canvas with reinforced handles. Spot clean and air-dry." },
      { title: "The Work Jacket", image: "jacket", meta: "Sand linen · ₱4,200", description: "A relaxed jacket with a soft collar and patch pockets.", details: "Linen canvas. Wash gently and line-dry out of direct sun." },
      { title: "The Linen Square", image: "scarf", meta: "Undyed linen · ₱980", description: "A lightweight square with a simple finished edge.", details: "Undyed linen. Cold hand wash and lay flat to dry." },
    ] },
    { type: "cards", id: "essentials", title: "Ethical Essentials.", intro: "Three everyday pieces to start with, each chosen to work alongside what you already own.", items: [
      { title: "Start with linen", image: "shirt", meta: "The first layer", description: "An easy shirt for warm days or under a jacket.", link: { label: "See the Day Shirt", href: "#collection" } },
      { title: "Add a useful layer", image: "jacket", meta: "The outside layer", description: "Soft construction with room to roll up the cuff.", link: { label: "See the Work Jacket", href: "#collection" } },
      { title: "Carry what you need", image: "tote", meta: "The everyday carry", description: "Simple canvas for commuting, errands and weekends.", link: { label: "See the Carry Tote", href: "#collection" } },
    ] },
    { type: "gallery", id: "lookbook", title: "Shop the look.", intro: "Four ways to put the collection into rotation.", items: [
      { title: "The off-duty uniform", image: "look", meta: "Oat linen & olive", description: "Wear the shirt loose over an olive trouser with a clean hem." },
      { title: "A cooler morning", image: "knit", meta: "Slate cotton", description: "Layer a soft rib knit over a tucked white tee." },
      { title: "A day in the city", image: "jacket", meta: "Sand linen", description: "Leave the jacket open and roll each cuff once." },
      { title: "A quiet finishing touch", image: "belt", meta: "Walnut leather", description: "Pair a warm leather belt with charcoal or ecru trousers." },
    ] },
    { type: "cards", id: "gifts", title: "The small gift edit.", items: [
      { title: "The Linen Square", image: "scarf", meta: "For a light packer", link: { label: "See collection", href: "#collection" } },
      { title: "The Carry Tote", image: "tote", meta: "For the daily commute", link: { label: "See collection", href: "#collection" } },
      { title: "The Walnut Belt", image: "belt", meta: "For a favourite pair of trousers", link: { label: "See the lookbook", href: "#lookbook" } },
    ] },
    { type: "list", id: "materials", title: "Care guide.", items: [
      { name: "Linen", description: "Wash cold, reshape while damp and hang to dry. Keep the natural crease." },
      { name: "Cotton knit", description: "Wash on a gentle cycle and dry flat so the ribbing keeps its shape." },
    ] },
    { type: "editorial", id: "about", title: "About Quiet Form.", image: "look", body: "Quiet Form is a small wardrobe of linen, canvas and cotton separates. We share fibre and care information with every piece so you can choose what you’ll wear often and maintain over time.", link: { label: "Explore the fabric library", href: "/fabric-library" } },
    { type: "note", id: "disclosure", title: "Affiliate disclosure", body: "This sample collection includes displayed prices for illustration. If Quiet Form adds links to partner shops, we may earn a commission when you buy through a link marked as an affiliate link, at no extra cost to you." },
  ],
  footer: "A small wardrobe of everyday layers",
  desk: {
    heading: "Garment care",
    lines: ["Find the fibre, wash method and drying instructions with each piece.","Prices are illustrative. Our disclosure explains how marked partner links work."],
    links: [{ label: "Fabric library", href: "/fabric-library" }, { label: "Affiliate disclosure", href: "#disclosure" }],
  },
} satisfies StudioSite;
