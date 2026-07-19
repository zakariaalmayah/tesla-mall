import { z } from "zod";

export const catalogSortValues = [
  "newest",
  "price_asc",
  "price_desc",
  "best_selling",
  "top_rated",
] as const;

export type CatalogSort = (typeof catalogSortValues)[number];

export const PAGE_SIZE = 24;

/**
 * Parses `?category=&brand=&min=&max=&inStock=&sort=&page=&q=` search params
 * shared by the /products and /categories/[slug] routes.
 */
export const catalogSearchParamsSchema = z.object({
  brand: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v ? (Array.isArray(v) ? v : v.split(",")).filter(Boolean) : [])),
  min: z.coerce.number().nonnegative().optional().catch(undefined),
  max: z.coerce.number().nonnegative().optional().catch(undefined),
  inStock: z
    .union([z.literal("1"), z.literal("0")])
    .optional()
    .transform((v) => v === "1"),
  sort: z
    .enum(catalogSortValues)
    .optional()
    .catch(undefined)
    .default("newest"),
  page: z.coerce.number().int().positive().optional().catch(1).default(1),
  q: z.string().trim().min(1).max(120).optional().catch(undefined),
});

export type CatalogSearchParams = z.infer<typeof catalogSearchParamsSchema>;

export function parseCatalogSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CatalogSearchParams {
  return catalogSearchParamsSchema.parse(raw);
}
