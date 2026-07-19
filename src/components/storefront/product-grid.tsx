import { useTranslations } from "next-intl";
import { PackageSearch } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  const t = useTranslations("catalog");

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
        <PackageSearch className="size-10 text-muted-foreground/50" />
        <p className="font-medium text-foreground">{t("noResults")}</p>
        <p className="text-sm text-muted-foreground">{t("noResultsHint")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
