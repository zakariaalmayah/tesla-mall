import "server-only";
import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const ADMIN_PAGE_SIZE = 20;

export interface AdminOrderFilters {
  status?: OrderStatus;
  q?: string;
  page?: number;
}

export async function getAdminOrders(filters: AdminOrderFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * ADMIN_PAGE_SIZE;

  const where: Prisma.OrderWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.q
      ? {
          OR: [
            { orderNumber: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
            { user: { name: { contains: filters.q, mode: Prisma.QueryMode.insensitive } } },
            { user: { phone: { contains: filters.q, mode: Prisma.QueryMode.insensitive } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        grandTotal: true,
        createdAt: true,
        user: { select: { name: true, phone: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt,
      customerName: o.user.name,
      customerPhone: o.user.phone,
    })),
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

export async function getAdminOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      shippingMethod: true,
      subtotal: true,
      shippingTotal: true,
      discountTotal: true,
      grandTotal: true,
      currency: true,
      customerNote: true,
      internalNote: true,
      shippingSnapshot: true,
      createdAt: true,
      user: { select: { id: true, name: true, phone: true, email: true } },
      items: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          sku: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
          image: true,
        },
      },
      statusLogs: {
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, note: true, createdAt: true },
      },
    },
  });
}
