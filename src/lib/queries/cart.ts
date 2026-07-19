import "server-only";
import { prisma } from "@/lib/prisma";

export interface CartLineItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  image: string | null;
  unitPrice: number;
  lineTotal: number;
  availableQuantity: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  variantNameAr: string | null;
  variantNameEn: string | null;
}

export interface CartSummary {
  cartId: string | null;
  items: CartLineItem[];
  subtotal: number;
  itemCount: number;
}

export async function getCartForUser(userId: string): Promise<CartSummary> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: {
      id: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productId: true,
          variantId: true,
          quantity: true,
          product: {
            select: {
              slug: true,
              nameAr: true,
              nameEn: true,
              price: true,
              quantity: true,
              trackInventory: true,
              allowBackorder: true,
              status: true,
              media: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
            },
          },
          variant: {
            select: { nameAr: true, nameEn: true, price: true, quantity: true, image: true },
          },
        },
      },
    },
  });

  if (!cart) {
    return { cartId: null, items: [], subtotal: 0, itemCount: 0 };
  }

  const items: CartLineItem[] = cart.items
    .filter((item) => item.product.status === "ACTIVE")
    .map((item) => {
      const unitPrice = item.variant?.price != null ? Number(item.variant.price) : Number(item.product.price);
      const availableQuantity = item.variant ? item.variant.quantity : item.product.quantity;
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        slug: item.product.slug,
        nameAr: item.product.nameAr,
        nameEn: item.product.nameEn,
        image: item.variant?.image ?? item.product.media[0]?.url ?? null,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        availableQuantity,
        trackInventory: item.product.trackInventory,
        allowBackorder: item.product.allowBackorder,
        variantNameAr: item.variant?.nameAr ?? null,
        variantNameEn: item.variant?.nameEn ?? null,
      };
    });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { cartId: cart.id, items, subtotal, itemCount };
}
