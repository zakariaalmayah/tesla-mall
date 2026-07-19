"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";

export interface CatalogFilterCategory {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
}

export interface CatalogFilterBrand {
  slug: string;
  nameAr: string;
  nameEn: string;
}

export function CatalogFilters({
  categories,
  activeCategorySlug,
  brands,
}: {
  categories?: CatalogFilterCategory[];
  activeCategorySlug?: string;
  brands: CatalogFilterBrand[];
}) {
  const t = useTranslations("catalog");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const inStockOnly = searchParams.get("inStock") === "1";
  const [minPrice, setMinPrice] = React.useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get("max") ?? "");

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleBrand(slug: string) {
    updateParams((params) => {
      const next = new Set(selectedBrands);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      if (next.size === 0) params.delete("brand");
      else params.set("brand", Array.from(next).join(","));
    });
  }

  function toggleInStock() {
    updateParams((params) => {
      if (inStockOnly) params.delete("inStock");
      else params.set("inStock", "1");
    });
  }

  function applyPriceRange() {
    updateParams((params) => {
      if (minPrice) params.set("min", minPrice);
      else params.delete("min");
      if (maxPrice) params.set("max", maxPrice);
      else params.delete("max");
    });
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasActiveFilters = selectedBrands.length > 0 || inStockOnly || minPrice || maxPrice;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t("filters")}</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
            {t("clearFilters")}
          </button>
        )}
      </div>

      {categories && categories.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("categoryFilter")}
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={{ pathname: "/categories/[slug]", params: { slug: category.slug } }}
                    className={
                      activeCategorySlug === category.slug
                        ? "text-sm font-semibold text-primary"
                        : "text-sm text-foreground transition-colors hover:text-primary"
                    }
                  >
                    {locale === "ar" ? category.nameAr : category.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {brands.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("brandFilter")}
            </h3>
            <ul className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-none">
              {brands.map((brand) => (
                <li key={brand.slug} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`brand-${brand.slug}`}
                    checked={selectedBrands.includes(brand.slug)}
                    onCheckedChange={() => toggleBrand(brand.slug)}
                  />
                  <label htmlFor={`brand-${brand.slug}`} className="cursor-pointer text-sm">
                    {locale === "ar" ? brand.nameAr : brand.nameEn}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Separator className="my-4" />
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("priceRange")}
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={applyPriceRange}>
          {t("apply")}
        </Button>
      </div>

      <Separator className="my-4" />
      <div className="flex items-center gap-2.5">
        <Checkbox id="in-stock-only" checked={inStockOnly} onCheckedChange={toggleInStock} />
        <label htmlFor="in-stock-only" className="cursor-pointer text-sm">
          {t("inStockOnly")}
        </label>
      </div>
    </div>
  );
}
