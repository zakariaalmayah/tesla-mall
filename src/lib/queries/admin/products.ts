import "server-only";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const ADMIN_PAGE_SIZE = 20;

export interface AdminProductFilters {
  status?: ProductStatus;
  q?: string;
  lowStockOnly?: boolean;
  page?: number;
}

export async function getAdminProducts(filters: AdminProductFilters) {
  const page = Math.max(1, filters.page ?? 1);

  const baseWhere: Prisma.ProductWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.q
      ? {
          OR: [
            { nameAr: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
            { nameEn: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
            { sku: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const selectFields = {
    id: true,
    sku: true,
    nameAr: true,
    nameEn: true,
    price: true,
    quantity: true,
    lowStockThreshold: true,
    trackInventory: true,
    status: true,
    media: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
  } satisfies Prisma.ProductSelect;

  function toRow(p: Prisma.ProductGetPayload<{ select: typeof selectFields }>) {
    return {
      id: p.id,
      sku: p.sku,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      price: Number(p.price),
      quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold,
      trackInventory: p.trackInventory,
      status: p.status,
      image: p.media[0]?.url ?? null,
      isLowStock: p.trackInventory && p.quantity <= p.lowStockThreshold,
    };
  }

  if (filters.lowStockOnly) {
    // Low-stock is a computed condition (quantity vs. its own threshold column),
    // which Prisma can't express in `where` — filter and paginate in JS instead.
    const candidates = await prisma.product.findMany({
      where: { ...baseWhere, trackInventory: true },
      orderBy: { quantity: "asc" },
      select: selectFields,
    });
    const lowStock = candidates.map(toRow).filter((p) => p.isLowStock);
    const total = lowStock.length;
    const start = (page - 1) * ADMIN_PAGE_SIZE;
    return {
      products: lowStock.slice(start, start + ADMIN_PAGE_SIZE),
      total,
      page,
      pageSize: ADMIN_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    };
  }

  const skip = (page - 1) * ADMIN_PAGE_SIZE;
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_PAGE_SIZE,
      select: selectFields,
    }),
    prisma.product.count({ where: baseWhere }),
  ]);

  return {
    products: rows.map(toRow),
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getAdminCategoryOptions() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    select: { id: true, nameAr: true, nameEn: true, parentId: true },
  });

  const parents = categories.filter((c) => !c.parentId);
  const byParent = new Map<string, typeof categories>();
  for (const c of categories) {
    if (!c.parentId) continue;
    byParent.set(c.parentId, [...(byParent.get(c.parentId) ?? []), c]);
  }

  return parents.flatMap((parent) => [
    { id: parent.id, nameAr: parent.nameAr, nameEn: parent.nameEn, depth: 0 },
    ...(byParent.get(parent.id) ?? []).map((child) => ({
      id: child.id,
      nameAr: child.nameAr,
      nameEn: child.nameEn,
      depth: 1,
    })),
  ]);
}

export async function getAdminBrandOptions() {
  return prisma.brand.findMany({
    orderBy: { nameEn: "asc" },
    select: { id: true, nameAr: true, nameEn: true },
  });
}
