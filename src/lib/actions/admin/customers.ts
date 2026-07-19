"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import type { AdminActionResult } from "@/lib/actions/admin/orders";

export async function toggleCustomerActiveAction(
  userId: string,
  isActive: boolean,
): Promise<AdminActionResult> {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  revalidatePath("/admin/customers");
  return { ok: true };
}
