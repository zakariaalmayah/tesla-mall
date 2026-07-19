import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCategoryOptions, getAdminBrandOptions } from "@/lib/queries/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "إضافة منتج | لوحة تحكم تسلا مول" };

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, brands] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminBrandOptions(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">إضافة منتج جديد</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
