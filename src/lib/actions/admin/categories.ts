"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import type { AdminActionResult } from "@/lib/actions/admin/orders";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validations/admin/category";

export interface CategoryFormResult extends AdminActionResult {
  categoryId?: string;
}

function toData(input: CategoryFormInput) {
  return {
    nameAr: input.nameAr,
    nameEn: input.nameEn,
    slug: input.slug,
    parentId: input.parentId || null,
    descriptionAr: input.descriptionAr || null,
    descriptionEn: input.descriptionEn || null,
    image: input.image || null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    seoTitleAr: input.seoTitleAr || null,
    seoTitleEn: input.seoTitleEn || null,
    seoDescriptionAr: input.seoDescriptionAr || null,
    seoDescriptionEn: input.seoDescriptionEn || null,
  };
}

export async function createCategoryAction(input: CategoryFormInput): Promise<CategoryFormResult> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  try {
    const category = await prisma.category.create({ data: toData(parsed.data) });
    revalidatePath("/admin/categories");
    return { ok: true, categoryId: category.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "DUPLICATE_SLUG" };
    }
    return { ok: false, error: "GENERIC" };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  input: CategoryFormInput,
): Promise<CategoryFormResult> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  if (parsed.data.parentId === categoryId) {
    return { ok: false, error: "INVALID_PARENT" };
  }

  try {
    await prisma.category.update({ where: { id: categoryId }, data: toData(parsed.data) });
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    return { ok: true, categoryId };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "DUPLICATE_SLUG" };
    }
    return { ok: false, error: "GENERIC" };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<AdminActionResult> {
  await requireAdmin();

  try {
    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false, error: "REFERENCED_BY_PRODUCTS" };
    }
    return { ok: false, error: "GENERIC" };
  }
}

export async function toggleCategoryActiveAction(
  categoryId: string,
  isActive: boolean,
): Promise<AdminActionResult> {
  await requireAdmin();

  await prisma.category.update({ where: { id: categoryId }, data: { isActive } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { ok: true };
}
