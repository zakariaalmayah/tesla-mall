"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({ productId: z.string().cuid() });

export interface WishlistActionResult {
  ok: boolean;
  error?: "UNAUTHENTICATED" | "INVALID_INPUT";
  isWishlisted?: boolean;
}

export async function toggleWishlistAction(productId: string): Promise<WishlistActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "UNAUTHENTICATED" };
  }

  const parsed = schema.safeParse({ productId });
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  const userId = session.user.id;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { ok: true, isWishlisted: false };
  }

  await prisma.wishlistItem.create({ data: { userId, productId } });
  revalidatePath("/account/wishlist");
  return { ok: true, isWishlisted: true };
}

export async function getWishlistedProductIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}
