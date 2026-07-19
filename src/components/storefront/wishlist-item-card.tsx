"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { formatCurrency } from "@/lib/utils";
import { toggleWishlistAction } from "@/lib/actions/wishlist";
import type { ProductCardData } from "@/components/storefront/product-card";

export function WishlistItemCard({ product }: { product: ProductCardData }) {
  const t = useTranslations("product");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const name = locale === "ar" ? product.nameAr : product.nameEn;

  function handleRemove() {
    startTransition(async () => {
      const result = await toggleWishlistAction(product.id);
      if (result.ok) {
        router.refresh();
      } else {
        toast.error(locale === "ar" ? "حدث خطأ ما" : "Something went wrong");
      }
    });
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border">
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        aria-label={t("removeFromWishlist")}
        className="absolute end-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-destructive disabled:opacity-50"
      >
        <X className="size-4" />
      </button>

      <Link href={{ pathname: "/products/[slug]", params: { slug: product.slug } }}>
        <div className="relative aspect-square bg-muted">
          {product.image && (
            <Image src={product.image} alt={name} fill sizes="240px" className="object-cover" />
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-medium">{name}</p>
          <p className="mt-1 font-semibold">{formatCurrency(product.price, locale)}</p>
        </div>
      </Link>
    </div>
  );
}
