import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import {
  getAdminCategoryOptions,
  getAdminBrandOptions,
  getAdminProductById,
} from "@/lib/queries/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "تعديل منتج | لوحة تحكم تسلا مول" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    getAdminProductById(id),
    getAdminCategoryOptions(),
    getAdminBrandOptions(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">تعديل المنتج</h1>
      <ProductForm
        categories={categories}
        brands={brands}
        productId={product.id}
        defaultValues={{
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          brandId: product.brandId ?? "",
          shortDescriptionAr: product.shortDescriptionAr ?? "",
          shortDescriptionEn: product.shortDescriptionEn ?? "",
          descriptionAr: product.descriptionAr,
          descriptionEn: product.descriptionEn,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
          trackInventory: product.trackInventory,
          quantity: product.quantity,
          lowStockThreshold: product.lowStockThreshold,
          allowBackorder: product.allowBackorder,
          status: product.status,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          seoTitleAr: product.seoTitleAr ?? "",
          seoTitleEn: product.seoTitleEn ?? "",
          seoDescriptionAr: product.seoDescriptionAr ?? "",
          seoDescriptionEn: product.seoDescriptionEn ?? "",
          imageUrls: product.media.map((m) => m.url).join("\n"),
        }}
      />
    </div>
  );
}
