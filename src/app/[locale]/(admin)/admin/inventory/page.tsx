import type { Metadata } from "next";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAdminProducts } from "@/lib/queries/admin/products";
import { formatCurrency } from "@/lib/utils";
import { ProductStockInput } from "@/components/admin/product-inline-controls";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return { title: `المخزون | ${siteConfig.name[locale]}` };
}

export default async function AdminInventoryPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page: rawPage } = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin" });

  const page = Math.max(1, Number(rawPage) || 1);
  const { products, total, totalPages } = await getAdminProducts({ lowStockOnly: true, page });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">المخزون</h1>
        {total > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
            <AlertTriangle className="size-3.5" />
            {total} منتج بحاجة لإعادة تعبئة
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
          كل المنتجات ضمن المستوى الآمن للمخزون 🎉
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t("product")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("sku")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("price")}</th>
                  <th className="px-4 py-3 text-start font-medium">حد التنبيه</th>
                  <th className="px-4 py-3 text-start font-medium">الكمية الحالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {product.image && (
                            <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />
                          )}
                        </div>
                        <span className="line-clamp-2 font-medium">
                          {locale === "ar" ? product.nameAr : product.nameEn}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(product.price, locale)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.lowStockThreshold}</td>
                    <td className="px-4 py-3">
                      <ProductStockInput productId={product.id} initialQuantity={product.quantity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CatalogPagination
            basePath="/admin/inventory"
            searchParams={{ page: rawPage }}
            currentPage={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
