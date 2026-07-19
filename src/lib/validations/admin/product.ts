import { z } from "zod";
import { ProductStatus } from "@prisma/client";

export const productFormSchema = z.object({
  nameAr: z.string().trim().min(2).max(200),
  nameEn: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الرابط يجب أن يحتوي أحرفًا إنجليزية صغيرة وأرقامًا وشرطات فقط"),
  sku: z.string().trim().min(2).max(64),
  categoryId: z.string().cuid("اختر قسمًا"),
  brandId: z.string().cuid().optional().or(z.literal("")),
  shortDescriptionAr: z.string().trim().max(500).optional().or(z.literal("")),
  shortDescriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
  descriptionAr: z.string().trim().min(10),
  descriptionEn: z.string().trim().min(10),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("" as unknown as number)),
  trackInventory: z.boolean().default(true),
  quantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  allowBackorder: z.boolean().default(false),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  seoTitleAr: z.string().trim().max(160).optional().or(z.literal("")),
  seoTitleEn: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescriptionAr: z.string().trim().max(320).optional().or(z.literal("")),
  seoDescriptionEn: z.string().trim().max(320).optional().or(z.literal("")),
  /** One image URL per line. */
  imageUrls: z.string().trim().optional().or(z.literal("")),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
