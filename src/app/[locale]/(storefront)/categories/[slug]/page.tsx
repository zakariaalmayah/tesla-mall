import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getCategoryBySlug,
  getCategoryIdsIncludingChildren,
  getProducts,
  getActiveBrands,
} from "@/lib/queries/products";
import { parseCatalogSearchParams } from "@/lib/validations/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { CatalogToolbar } from "@/components/storefront/catalog-toolbar";
import { CatalogFilters } from "@/components/storefront/catalog-filters";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en"; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const name = locale === "ar" ? category.nameAr : category.nameEn;
  const seoTitle = (locale === "ar" ? category.seoTitleAr : category.seoTitleEn) ?? name;
  const seoDescription =
    (locale === "ar" ? category.seoDescriptionAr : category.seoDescriptionEn) ??
    (locale === "ar" ? category.descriptionAr : category.descriptionEn) ??
    undefined;

  return {
    title: `${seoTitle} | ${siteConfig.name[locale]}`,
    description: seoDescription,
    openGraph: category.image
      ? { images: [{ url: category.image }] }
      : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  const rawSearchParams = await searchParams;
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseCatalogSearchParams(rawSearchParams);
  const categoryIds = await getCategoryIdsIncludingChildren(category.id);

  const [{ products, total, page, totalPages }, brands] = await Promise.all([
    getProducts({ ...filters, categoryIds }),
    getActiveBrands(),
  ]);

  const name = locale === "ar" ? category.nameAr : category.nameEn;
  const description = locale === "ar" ? category.descriptionAr : category.descriptionEn;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("categories"), href: "/products" },
          { label: name },
        ]}
        className="mb-6"
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <CatalogFilters
            categories={category.children.map((c) => ({
              id: c.id,
              slug: c.slug,
              nameAr: c.nameAr,
              nameEn: c.nameEn,
            }))}
            activeCategorySlug={slug}
            brands={brands}
          />
        </aside>

        <div>
          <CatalogToolbar total={total} currentSort={filters.sort} />
          <div className="mt-6">
            <ProductGrid products={products} />
          </div>
          <CatalogPagination
            basePath={`/categories/${slug}`}
            searchParams={rawSearchParams}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
