import { z } from "zod";

export const PRODUCT_TYPES = ["WEBSITE", "ARCHITECTURE", "INTERIOR"] as const;
export const TIER_LEVELS = ["STARTER", "STANDARD", "PREMIUM"] as const;
export const PUBLIC_SORTS = ["newest", "popular", "name"] as const;
export const PRICE_SORTS = ["price-asc", "price-desc"] as const;
export const PAGE_SIZE = 9;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(128, { error: "Use at most 128 characters." });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Enter your password." }).max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter your name." }).max(80),
  email: emailSchema,
  password: passwordSchema,
});

/** Accepts `?a=x&a=y` and `?a=x,y` alike. */
const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) =>
    (Array.isArray(v) ? v : v ? [v] : [])
      .flatMap((s) => s.split(","))
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20),
  );

const one = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (Array.isArray(v) ? v[0] : v));

export const catalogQuerySchema = z.object({
  type: csv.transform((v) =>
    v.map((s) => s.toUpperCase()).filter((s): s is (typeof PRODUCT_TYPES)[number] =>
      (PRODUCT_TYPES as readonly string[]).includes(s),
    ),
  ),
  category: csv,
  style: csv,
  tier: csv.transform((v) =>
    v.map((s) => s.toUpperCase()).filter((s): s is (typeof TIER_LEVELS)[number] =>
      (TIER_LEVELS as readonly string[]).includes(s),
    ),
  ),
  features: csv,
  q: one.transform((v) => v?.trim().slice(0, 80) || undefined),
  sort: one.transform((v) =>
    [...PUBLIC_SORTS, ...PRICE_SORTS].includes(v as never)
      ? (v as (typeof PUBLIC_SORTS)[number] | (typeof PRICE_SORTS)[number])
      : "newest",
  ),
  page: one.transform((v) => {
    const n = Number.parseInt(v ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 1;
  }),
});

export type CatalogQuery = z.output<typeof catalogQuerySchema>;

export function parseCatalogQuery(
  input: Record<string, string | string[] | undefined>,
): CatalogQuery {
  const parsed = catalogQuerySchema.safeParse(input);
  return parsed.success ? parsed.data : catalogQuerySchema.parse({});
}

/** Billing countries offered in the account form (ISO 3166-1 alpha-2). */
export const COUNTRIES = [
  "PH", "SG", "MY", "ID", "TH", "VN", "JP", "KR", "AU", "NZ", "AE", "US", "CA", "GB", "DE", "FR",
] as const;
