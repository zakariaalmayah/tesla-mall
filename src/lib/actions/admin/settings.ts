"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import type { AdminActionResult } from "@/lib/actions/admin/orders";

const updateZoneSchema = z.object({
  zoneId: z.string().cuid(),
  baseFee: z.coerce.number().nonnegative(),
  expressFee: z.coerce.number().nonnegative().optional(),
  freeThreshold: z.coerce.number().nonnegative().optional(),
});

export async function updateShippingZoneAction(
  input: z.infer<typeof updateZoneSchema>,
): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = updateZoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }
  const { zoneId, baseFee, expressFee, freeThreshold } = parsed.data;

  await prisma.shippingZone.update({
    where: { id: zoneId },
    data: {
      baseFee: new Prisma.Decimal(baseFee),
      expressFee: expressFee != null ? new Prisma.Decimal(expressFee) : null,
      freeThreshold: freeThreshold != null ? new Prisma.Decimal(freeThreshold) : null,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { ok: true };
}
