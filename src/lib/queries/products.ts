import "server-only";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, type CatalogSearchParams } from "@/lib/validations/catalog";

const ACTIVE_STATUS: ProductStatus = ProductStatus.ACTIVE;

/** Shared select — matches the shape ProductCard expects. */
const productCardSelect = {
  id: true,
  slug: true,
  nameAr: true,
  nameEn: true,
  price: true,
  compareAtPrice: true,
  ratingAverage: true,
  ratingCount: true,
  quantity: true,
  trackInventory: true,
  allowBackorder: true,
  media: {
    take: 1,
    orderBy: { sortOrder: Prisma.SortOrder.asc },
    select: { url: true },
  },
} satisfies Prisma.ProductSelect;

export type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export function toProductCardData(row: ProductCardRow) {
  return {
    id: row.id,
    slug: row.slug,
    nameAr: row.nameAr,
    nameEn: row.nameEn,
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null,
    image: row.media[0]?.url ?? null,
    ratingAverage: row.ratingAverage,
    ratingCount: row.ratingCount,
    quantity: row.quantity,
    trackInventory: row.trackInventory,
    allowBackorder: row.allowBackorder,
  };
}

interface GetProductsOptions extends CatalogSearchParams {
  categorySlug?: string;
  /** Include descendant categories when filtering by a parent category. */
  categoryIds?: string[];
}

function buildOrderBy(sort: CatalogSearchParams["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "best_selling":
      return { soldCount: "desc" };
    case "top_rated":
      return { ratingAverage: "desc" };
    case "newest":
    default:
      return { publishedAt: "desc" };
  }
}

export async function getProducts(options: GetProductsOptions) {
  const { brand, min, max, inStock, sort, page, q, categoryIds } = options;

  const where: Prisma.ProductWhereInput = {
    status: ACTIVE_STATUS,
    ...(categoryIds && categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
    ...(brand && brand.length > 0 ? { brand: { slug: { in: brand } } } : {}),
    ...(min != null || max != null
      ? {
          price: {
            ...(min != null ? { gte: new Prisma.Decimal(min) } : {}),
            ...(max != null ? { lte: new Prisma.Decimal(max) } : {}),
          },
        }
      : {}),
    ...(inStock ? { OR: [{ trackInventory: false }, { quantity: { gt: 0 } }, { allowBackorder: true }] } : {}),
    ...(q
      ? {
          OR: [
            { nameAr: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { nameEn: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { sku: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy: buildOrderBy(sort),
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: rows.map(toProductCardData),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      slug: true,
      descriptionAr: true,
      descriptionEn: true,
      image: true,
      seoTitleAr: true,
      seoTitleEn: true,
      seoDescriptionAr: true,
      seoDescriptionEn: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, nameAr: true, nameEn: true, slug: true, image: true },
      },
    },
  });
}

/** Returns [categoryId, ...descendantIds] so a parent category page includes subcategory products. */
export async function getCategoryIdsIncludingChildren(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });
  return [categoryId, ...children.map((c) => c.id)];
}

export async function getActiveBrands() {
  return prisma.brand.findMany({
    where: { isActive: true, products: { some: { status: ACTIVE_STATUS } } },
    orderBy: { nameEn: "asc" },
    select: { id: true, nameAr: true, nameEn: true, slug: true },
  });
}

export async function getNavCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, nameAr: true, nameEn: true, slug: true, icon: true },
  });
}

const productDetailSelect = {
  id: true,
  slug: true,
  sku: true,
  nameAr: true,
  nameEn: true,
  descriptionAr: true,
  descriptionEn: true,
  shortDescriptionAr: true,
  shortDescriptionEn: true,
  price: true,
  compareAtPrice: true,
  currency: true,
  trackInventory: true,
  quantity: true,
  lowStockThreshold: true,
  allowBackorder: true,
  status: true,
  ratingAverage: true,
  ratingCount: true,
  seoTitleAr: true,
  seoTitleEn: true,
  seoDescriptionAr: true,
  seoDescriptionEn: true,
  categoryId: true,
  category: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
  brand: { select: { nameAr: true, nameEn: true, slug: true } },
  media: {
    orderBy: { sortOrder: Prisma.SortOrder.asc },
    select: { id: true, url: true, altAr: true, altEn: true, type: true },
  },
  variants: {
    orderBy: { createdAt: Prisma.SortOrder.asc },
    select: {
      id: true,
      sku: true,
      nameAr: true,
      nameEn: true,
      price: true,
      quantity: true,
      image: true,
      optionsJson: true,
      isDefault: true,
    },
  },
  attributes: {
    select: { id: true, keyAr: true, keyEn: true, valueAr: true, valueEn: true },
  },
  reviews: {
    where: { isApproved: true },
    orderBy: { createdAt: Prisma.SortOrder.desc },
    take: 20,
    select: {
      id: true,
      rating: true,
      titleAr: true,
      titleEn: true,
      bodyAr: true,
      bodyEn: true,
      isVerified: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  },
} satisfies Prisma.ProductSelect;

export type ProductDetail = Prisma.ProductGetPayload<{ select: typeof productDetailSelect }>;

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return prisma.product.findFirst({
    where: { slug, status: ACTIVE_STATUS },
    select: productDetailSelect,
  });
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 8) {
  const rows = await prisma.product.findMany({
    where: { categoryId, status: ACTIVE_STATUS, id: { not: excludeProductId } },
    select: productCardSelect,
    orderBy: { soldCount: "desc" },
    take: limit,
  });
  return rows.map(toProductCardData);
}

export async function incrementProductViewCount(productId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { viewCount: { increment: 1 } },
  });
}
