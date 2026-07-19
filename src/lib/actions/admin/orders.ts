"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

const updateStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.nativeEnum(OrderStatus),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export interface AdminActionResult {
  ok: boolean;
  error?: string;
}

export async function updateOrderStatusAction(
  input: z.infer<typeof updateStatusSchema>,
): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }
  const { orderId, status, note } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const data: Parameters<typeof tx.order.update>[0]["data"] = { status };
    if (status === "DELIVERED") data.deliveredAt = new Date();
    if (status === "CANCELLED") data.cancelledAt = new Date();

    const order = await tx.order.update({ where: { id: orderId }, data });

    await tx.orderStatusLog.create({
      data: { orderId: order.id, status, note: note || null },
    });

    if (status === "DELIVERED") {
      await tx.payment.updateMany({
        where: { orderId: order.id, method: "CASH_ON_DELIVERY" },
        data: { status: "PAID", paidAt: new Date() },
      });
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");

  return { ok: true };
}

const updateNoteSchema = z.object({
  orderId: z.string().cuid(),
  internalNote: z.string().trim().max(1000),
});

export async function updateOrderInternalNoteAction(
  input: z.infer<typeof updateNoteSchema>,
): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { internalNote: parsed.data.internalNote || null },
  });

  revalidatePath("/admin/orders");
  return { ok: true };
}
