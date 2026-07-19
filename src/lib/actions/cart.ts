"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const addToCartSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional().nullable(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export interface CartActionResult {
  ok: boolean;
  error?: "UNAUTHENTICATED" | "OUT_OF_STOCK" | "NOT_FOUND" | "INVALID_INPUT";
  cartItemCount?: number;
}

async function getOrCreateCartId(userId: string): Promise<string> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
  return cart.id;
}

export async function addToCartAction(input: AddToCartInput): Promise<CartActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "UNAUTHENTICATED" };
  }

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }
  const { productId, variantId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      trackInventory: true,
      quantity: true,
      allowBackorder: true,
      status: true,
    },
  });

  if (!product || product.status !== "ACTIVE") {
    return { ok: false, error: "NOT_FOUND" };
  }

  const inStock = !product.trackInventory || product.quantity > 0 || product.allowBackorder;
  if (!inStock) {
    return { ok: false, error: "OUT_OF_STOCK" };
  }

  const cartId = await getOrCreateCartId(session.user.id);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
      variantId: variantId ?? null,
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId: variantId ?? null,
        quantity,
      },
    });
  }

  revalidatePath("/cart");

  const cartItemCount = await prisma.cartItem.aggregate({
    where: { cartId },
    _sum: { quantity: true },
  });

  return { ok: true, cartItemCount: cartItemCount._sum.quantity ?? 0 };
}

const updateQuantitySchema = z.object({
  cartItemId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
});

export async function updateCartItemQuantityAction(
  input: z.infer<typeof updateQuantitySchema>,
): Promise<CartActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHENTICATED" };

  const parsed = updateQuantitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const item = await prisma.cartItem.findUnique({
    where: { id: parsed.data.cartItemId },
    select: { cart: { select: { userId: true } } },
  });
  if (!item || item.cart.userId !== session.user.id) {
    return { ok: false, error: "NOT_FOUND" };
  }

  await prisma.cartItem.update({
    where: { id: parsed.data.cartItemId },
    data: { quantity: parsed.data.quantity },
  });

  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCartItemAction(cartItemId: string): Promise<CartActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHENTICATED" };

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    select: { cart: { select: { userId: true } } },
  });
  if (!item || item.cart.userId !== session.user.id) {
    return { ok: false, error: "NOT_FOUND" };
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
  return { ok: true };
}
