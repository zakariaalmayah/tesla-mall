"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProductStatus, Prisma as PrismaNS } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import type { AdminActionResult } from "@/lib/actions/admin/orders";
import { productFormSchema, type ProductFormInput } from "@/lib/validations/admin/product";

const updateStatusSchema = z.object({
  productId: z.string().cuid(),
  status: z.nativeEnum(ProductStatus),
});

export async function updateProductStatusAction(
  input: z.infer<typeof updateStatusSchema>,
): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/products");
  return { ok: true };
}

const updateStockSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(0).max(1_000_000),
});

export async function updateProductStockAction(
  input: z.infer<typeof updateStockSchema>,
): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = updateStockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const { productId, quantity } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const current = await tx.product.findUniqueOrThrow({
      where: { id: productId },
      select: { quantity: true },
    });

    await tx.product.update({ where: { id: productId }, data: { quantity } });

    await tx.inventoryLog.create({
      data: {
        productId,
        change: quantity - current.quantity,
        reason: "Manual adjustment by admin",
      },
    });
  });

  revalidatePath("/admin/products");
  return { ok: true };
}

function parseImageUrls(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export interface ProductFormResult extends AdminActionResult {
  productId?: string;
}

export async function createProductAction(input: ProductFormInput): Promise<ProductFormResult> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }
  const data = parsed.data;
  const imageUrls = parseImageUrls(data.imageUrls);

  try {
    const product = await prisma.product.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        slug: data.slug,
        sku: data.sku,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        shortDescriptionAr: data.shortDescriptionAr || null,
        shortDescriptionEn: data.shortDescriptionEn || null,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        price: new PrismaNS.Decimal(data.price),
        compareAtPrice: data.compareAtPrice ? new PrismaNS.Decimal(data.compareAtPrice) : null,
        trackInventory: data.trackInventory,
        quantity: data.quantity,
        lowStockThreshold: data.lowStockThreshold,
        allowBackorder: data.allowBackorder,
        status: data.status,
        isFeatured: data.isFeatured,
        isNewArrival: data.isNewArrival,
        seoTitleAr: data.seoTitleAr || null,
        seoTitleEn: data.seoTitleEn || null,
        seoDescriptionAr: data.seoDescriptionAr || null,
        seoDescriptionEn: data.seoDescriptionEn || null,
        publishedAt: data.status === "ACTIVE" ? new Date() : null,
        media: {
          create: imageUrls.map((url, index) => ({ url, sortOrder: index })),
        },
      },
    });

    revalidatePath("/admin/products");
    return { ok: true, productId: product.id };
  } catch (error) {
    if (error instanceof PrismaNS.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "DUPLICATE_SLUG_OR_SKU" };
    }
    return { ok: false, error: "GENERIC" };
  }
}

export async function updateProductAction(
  productId: string,
  input: ProductFormInput,
): Promise<ProductFormResult> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }
  const data = parsed.data;
  const imageUrls = parseImageUrls(data.imageUrls);

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        select: { status: true, publishedAt: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          slug: data.slug,
          sku: data.sku,
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          shortDescriptionAr: data.shortDescriptionAr || null,
          shortDescriptionEn: data.shortDescriptionEn || null,
          descriptionAr: data.descriptionAr,
          descriptionEn: data.descriptionEn,
          price: new PrismaNS.Decimal(data.price),
          compareAtPrice: data.compareAtPrice ? new PrismaNS.Decimal(data.compareAtPrice) : null,
          trackInventory: data.trackInventory,
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold,
          allowBackorder: data.allowBackorder,
          status: data.status,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          seoTitleAr: data.seoTitleAr || null,
          seoTitleEn: data.seoTitleEn || null,
          seoDescriptionAr: data.seoDescriptionAr || null,
          seoDescriptionEn: data.seoDescriptionEn || null,
          publishedAt:
            data.status === "ACTIVE" && existing.status !== "ACTIVE"
              ? new Date()
              : existing.publishedAt,
        },
      });

      await tx.productMedia.deleteMany({ where: { productId } });
      if (imageUrls.length > 0) {
        await tx.productMedia.createMany({
          data: imageUrls.map((url, index) => ({ productId, url, sortOrder: index })),
        });
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { ok: true, productId };
  } catch (error) {
    if (error instanceof PrismaNS.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "DUPLICATE_SLUG_OR_SKU" };
    }
    return { ok: false, error: "GENERIC" };
  }
}

export async function deleteProductAction(productId: string): Promise<AdminActionResult> {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (error) {
    if (error instanceof PrismaNS.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false, error: "REFERENCED_BY_ORDERS" };
    }
    return { ok: false, error: "GENERIC" };
  }
}
