import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCategoryTree } from "@/lib/queries/admin/categories";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "إضافة قسم | لوحة تحكم تسلا مول" };

export default async function NewCategoryPage() {
  await requireAdmin();
  const tree = await getAdminCategoryTree();
  const parentOptions = tree.map((c) => ({ id: c.id, nameAr: c.nameAr }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">إضافة قسم جديد</h1>
      <CategoryForm parentOptions={parentOptions} />
    </div>
  );
}
