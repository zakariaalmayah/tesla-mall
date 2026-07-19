import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CUSTOMERS_PAGE_SIZE = 20;

export async function getAdminCustomers({ q, page = 1 }: { q?: string; page?: number }) {
  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * CUSTOMERS_PAGE_SIZE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: CUSTOMERS_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        orders: { select: { grandTotal: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers: users.map((user) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      orderCount: user.orders.length,
      totalSpent: user.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0),
    })),
    total,
    page,
    pageSize: CUSTOMERS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / CUSTOMERS_PAGE_SIZE)),
  };
}
