import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Star } from "lucide-react";

import { Link } from "@/i18n/routing";
import { formatCurrency, cn } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  ratingAverage: number;
  ratingCount: number;
  quantity: number;
  trackInventory: boolean;
  allowBackorder: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("product");

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const inStock =
    !product.trackInventory || product.quantity > 0 || product.allowBackorder;
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.price)) /
          Number(product.compareAtPrice)) *
          100,
      )
    : 0;

  return (
    <Link
      href={{ pathname: "/products/[slug]", params: { slug: product.slug } }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            {name}
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-3 rounded-full bg-gold-gradient px-2.5 py-1 text-xs font-bold text-ink-950 ltr:left-3 rtl:right-3">
            -{discountPercent}%
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{name}</h3>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-gold-500 text-gold-500" />
          <span>{product.ratingAverage.toFixed(1)}</span>
          <span className="ltr:before:content-['('] ltr:after:content-[')'] rtl:before:content-['('] rtl:after:content-[')']">
            {product.ratingCount}
          </span>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {formatCurrency(product.price, locale)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice!, locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border">
      <div className={cn("aspect-square animate-pulse bg-muted")} />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
