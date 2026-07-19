import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAdminCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getAdminCategoryTree() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      slug: true,
      parentId: true,
      isActive: true,
      _count: { select: { products: true } },
    },
  });

  const topLevel = categories.filter((c) => !c.parentId);
  const byParent = new Map<string, typeof categories>();
  for (const c of categories) {
    if (!c.parentId) continue;
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }

  return topLevel.map((parent) => ({
    ...parent,
    productCount: parent._count.products,
    children: (byParent.get(parent.id) ?? []).map((child) => ({
      ...child,
      productCount: child._count.products,
    })),
  }));
}
