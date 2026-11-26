import studioCollection from "./studio-collection.json";

export const hospitalityPreviews = {
  "roast-row": { title: "Roast Row", pages: [["","Home"], ["/menu","Menu"], ["/pickup","Pickup"], ["/coffee","Coffee finder"], ["/workshops","Workshops"], ["/visit","Visit"], ["/credits","Photo credits"]] },
  "sunday-table": { title: "Sunday Table", pages: [["","Home"], ["/menu","Menu"], ["/catering","Catering"], ["/gatherings","Gatherings"], ["/kitchen","Our kitchen"], ["/visit","Visit & table requests"], ["/credits","Photo credits"]] },
  "barkadas": { title: "Barkadas", pages: [["","Home"], ["/stays","Stays"], ["/plan","Stay planner"], ["/gallery","Photo gallery"], ["/weekend","Weekend planner"], ["/guide","Guest guide"], ["/credits","Photo credits"]] },
  "the-atrium": { title: "The Atrium", pages: [["","Home"], ["/spaces","Spaces"], ["/tour","Day-to-night tour"], ["/events","Events"], ["/plan","Event planner"], ["/gallery","Photo gallery"], ["/inquire","Venue inquiry"], ["/credits","Photo credits"]] },
} as const;

type TemplatePreview = { title: string; pages: readonly (readonly [string, string])[] };

export const templatePreviews: Record<string, TemplatePreview> = {
  ...hospitalityPreviews,
  ...Object.fromEntries(studioCollection.map(({ slug, title, pages }) => [slug, {
    title,
    pages: [["", "Home"], ...pages, ["/credits", "Image credits"]],
  }])),
};

export function getTemplatePreview(slug: string) {
  return Object.hasOwn(templatePreviews, slug) ? templatePreviews[slug] : undefined;
}
