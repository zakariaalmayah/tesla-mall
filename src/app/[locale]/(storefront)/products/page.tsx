import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProducts, getActiveBrands, getNavCategories } from "@/lib/queries/products";
import { parseCatalogSearchParams } from "@/lib/validations/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { CatalogToolbar } from "@/components/storefront/catalog-toolbar";
import { CatalogFilters } from "@/components/storefront/catalog-filters";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return {
    title: `${t("allProducts")} | ${siteConfig.name[locale]}`,
  };
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const filters = parseCatalogSearchParams(rawSearchParams);

  const [{ products, total, page, totalPages }, brands, categories] = await Promise.all([
    getProducts(filters),
    getActiveBrands(),
    getNavCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: tNav("home"), href: "/" }, { label: t("allProducts") }]}
        className="mb-6"
      />

      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("allProducts")}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <CatalogFilters
            categories={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              nameAr: c.nameAr,
              nameEn: c.nameEn,
            }))}
            brands={brands}
          />
        </aside>

        <div>
          <CatalogToolbar total={total} currentSort={filters.sort} />
          <div className="mt-6">
            <ProductGrid products={products} />
          </div>
          <CatalogPagination
            basePath="/products"
            searchParams={rawSearchParams}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
