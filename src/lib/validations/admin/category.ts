import { z } from "zod";

export const categoryFormSchema = z.object({
  nameAr: z.string().trim().min(2).max(100),
  nameEn: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الرابط يجب أن يحتوي أحرفًا إنجليزية صغيرة وأرقامًا وشرطات فقط"),
  parentId: z.string().cuid().optional().or(z.literal("")),
  descriptionAr: z.string().trim().max(500).optional().or(z.literal("")),
  descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().trim().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  seoTitleAr: z.string().trim().max(160).optional().or(z.literal("")),
  seoTitleEn: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescriptionAr: z.string().trim().max(320).optional().or(z.literal("")),
  seoDescriptionEn: z.string().trim().max(320).optional().or(z.literal("")),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
