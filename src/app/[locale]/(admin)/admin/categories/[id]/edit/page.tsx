import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCategoryTree, getAdminCategoryById } from "@/lib/queries/admin/categories";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "تعديل قسم | لوحة تحكم تسلا مول" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [category, tree] = await Promise.all([getAdminCategoryById(id), getAdminCategoryTree()]);
  if (!category) notFound();

  const parentOptions = tree.map((c) => ({ id: c.id, nameAr: c.nameAr }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">تعديل القسم</h1>
      <CategoryForm
        parentOptions={parentOptions}
        categoryId={category.id}
        defaultValues={{
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          slug: category.slug,
          parentId: category.parentId ?? "",
          descriptionAr: category.descriptionAr ?? "",
          descriptionEn: category.descriptionEn ?? "",
          image: category.image ?? "",
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          seoTitleAr: category.seoTitleAr ?? "",
          seoTitleEn: category.seoTitleEn ?? "",
          seoDescriptionAr: category.seoDescriptionAr ?? "",
          seoDescriptionEn: category.seoDescriptionEn ?? "",
        }}
      />
    </div>
  );
}
