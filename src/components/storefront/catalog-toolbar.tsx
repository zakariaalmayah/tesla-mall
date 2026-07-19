"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { catalogSortValues, type CatalogSort } from "@/lib/validations/catalog";

export function CatalogToolbar({
  total,
  currentSort,
  onOpenFilters,
}: {
  total: number;
  currentSort: CatalogSort;
  onOpenFilters?: () => void;
}) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const sortLabels: Record<CatalogSort, string> = {
    newest: t("sortNewest"),
    price_asc: t("sortPriceAsc"),
    price_desc: t("sortPriceDesc"),
    best_selling: t("sortBestSelling"),
    top_rated: t("sortTopRated"),
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">{t("resultsCount", { count: total })}</p>

      <div className="flex items-center gap-2">
        {onOpenFilters && (
          <Button variant="outline" size="sm" className="lg:hidden" onClick={onOpenFilters}>
            <SlidersHorizontal className="size-4" />
            {t("filters")}
          </Button>
        )}

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            {catalogSortValues.map((value) => (
              <SelectItem key={value} value={value}>
                {sortLabels[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
