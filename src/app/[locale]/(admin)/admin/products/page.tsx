import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProductStatus } from "@prisma/client";
import { getAdminProducts } from "@/lib/queries/admin/products";
import { formatCurrency } from "@/lib/utils";
import {
  ProductStatusSelect,
  ProductStockInput,
} from "@/components/admin/product-inline-controls";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
  searchParams: Promise<{ q?: string; status?: string; lowStock?: string; page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("products")} | ${siteConfig.name[locale]}` };
}

const ALL_STATUSES = Object.values(ProductStatus);

export default async function AdminProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q, status: rawStatus, lowStock, page: rawPage } = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tStatuses = await getTranslations({ locale, namespace: "admin.productStatuses" });

  const status = ALL_STATUSES.includes(rawStatus as ProductStatus)
    ? (rawStatus as ProductStatus)
    : undefined;
  const lowStockOnly = lowStock === "1";
  const page = Math.max(1, Number(rawPage) || 1);

  const { products, totalPages } = await getAdminProducts({ q, status, lowStockOnly, page });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("products")}</h1>
        <NextLink
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          إضافة منتج
        </NextLink>
      </div>

      <form className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t("searchProducts")}
          className="h-11 min-w-64 flex-1 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("allStatuses")}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {tStatuses(s)}
            </option>
          ))}
        </select>
        <label className="flex h-11 items-center gap-2 rounded-lg border border-input px-4 text-sm">
          <input type="checkbox" name="lowStock" value="1" defaultChecked={lowStockOnly} />
          {t("lowStockOnly")}
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg bg-gold-gradient px-5 text-sm font-semibold text-ink-950"
        >
          {t("applyFilters")}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t("product")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("sku")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("price")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("stock")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("productStatus")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {t("noResults")}
                </td>
              </tr>
            )}
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
                <td className="px-4 py-3 font-semibold">{formatCurrency(product.price, locale)}</td>
                <td className="px-4 py-3">
                  {product.trackInventory ? (
                    <div className="flex items-center gap-2">
                      <ProductStockInput productId={product.id} initialQuantity={product.quantity} />
                      {product.isLowStock && (
                        <span className="text-xs font-medium text-warning">{t("lowStock")}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ProductStatusSelect productId={product.id} currentStatus={product.status} />
                </td>
                <td className="px-4 py-3 text-end">
                  <NextLink
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm font-medium text-gold-600 hover:underline dark:text-gold-400"
                  >
                    تعديل
                  </NextLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CatalogPagination
        basePath="/admin/products"
        searchParams={{ q, status: rawStatus, lowStock, page: rawPage }}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
