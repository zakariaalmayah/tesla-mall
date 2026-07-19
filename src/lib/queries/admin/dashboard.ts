import "server-only";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todayOrdersCount, todayRevenueAgg, pendingOrdersCount, trackedActiveProducts, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfToday }, status: { notIn: ["CANCELLED", "FAILED"] } },
        _sum: { grandTotal: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.findMany({
        where: { trackInventory: true, status: "ACTIVE" },
        select: { quantity: true, lowStockThreshold: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          grandTotal: true,
          createdAt: true,
          user: { select: { name: true, phone: true } },
        },
      }),
    ]);

  const lowStockCount = trackedActiveProducts.filter((p) => p.quantity <= p.lowStockThreshold).length;

  return {
    todayOrdersCount,
    todayRevenue: Number(todayRevenueAgg._sum.grandTotal ?? 0),
    pendingOrdersCount,
    lowStockCount,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt,
      customerName: o.user.name,
      customerPhone: o.user.phone,
    })),
  };
}
