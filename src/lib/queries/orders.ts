import "server-only";
import { prisma } from "@/lib/prisma";

const ORDERS_PAGE_SIZE = 10;

export async function getOrdersForUser(userId: string, page = 1) {
  const skip = (page - 1) * ORDERS_PAGE_SIZE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: ORDERS_PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        grandTotal: true,
        currency: true,
        createdAt: true,
        items: { select: { id: true, quantity: true } },
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      grandTotal: Number(order.grandTotal),
      currency: order.currency,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    })),
    total,
    page,
    pageSize: ORDERS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
  };
}

export async function getOrderByNumberForUser(orderNumber: string, userId: string) {
  return prisma.order.findFirst({
    where: { orderNumber, userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      shippingMethod: true,
      subtotal: true,
      shippingTotal: true,
      discountTotal: true,
      grandTotal: true,
      currency: true,
      customerNote: true,
      createdAt: true,
      shippingSnapshot: true,
      items: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
          image: true,
        },
      },
    },
  });
}
