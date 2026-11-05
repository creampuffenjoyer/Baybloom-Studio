import { z } from "zod";

// Store overrides rather than copies of template content. Missing fields retain
// the template default, including its existing translations.
const shortText = z.string().trim().min(1).max(120);
const longText = z.string().trim().min(1).max(500);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const harborDraftSchema = z.strictObject({
  version: z.literal(1),
  template: z.literal("harbor-house"),
  business: z.strictObject({
    name: shortText.optional(),
    tagline: longText.optional(),
    hosts: shortText.optional(),
    phone: shortText.optional(),
    email: z.email().max(254).optional(),
  }),
  home: z.strictObject({
    headline: shortText.optional(),
    welcome: longText.optional(),
  }),
  theme: z.strictObject({ accent: hexColor.optional() }),
});

export type HarborDraft = z.infer<typeof harborDraftSchema>;

export function emptyHarborDraft(): HarborDraft {
  return { version: 1, template: "harbor-house", business: {}, home: {}, theme: {} };
}

/** Validate untrusted input before saving or rendering a draft. */
export function parseHarborDraft(value: unknown) {
  return harborDraftSchema.safeParse(value);
}
