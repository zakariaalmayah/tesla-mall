import "server-only";
import { prisma } from "@/lib/prisma";
import { toProductCardData, type ProductCardRow } from "@/lib/queries/products";
import { Prisma } from "@prisma/client";

export async function getWishlistProducts(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      product: {
        select: {
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
          media: { take: 1, orderBy: { sortOrder: Prisma.SortOrder.asc }, select: { url: true } },
        },
      },
    },
  });

  return items.map((item) => ({
    wishlistItemId: item.id,
    product: toProductCardData(item.product as ProductCardRow),
  }));
}
