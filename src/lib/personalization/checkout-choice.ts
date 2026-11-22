import { z } from "zod";
import definitions from "./export-templates.json";

const templates = Object.keys(definitions) as [keyof typeof definitions, ...(keyof typeof definitions)[]];
export const checkoutChoiceSchema = z.strictObject({
  savedDraftTemplates: z.array(z.enum(templates)).max(templates.length).default([])
    .refine(items => new Set(items).size === items.length, "Choose each template only once."),
  imageRightsConfirmed: z.boolean().default(false),
}).refine(value => !value.savedDraftTemplates.length || value.imageRightsConfirmed,
  "Confirm you have permission to use your uploaded photos.");
