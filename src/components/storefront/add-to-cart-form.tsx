"use client";

import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { addToCartAction } from "@/lib/actions/cart";
import { toggleWishlistAction } from "@/lib/actions/wishlist";

export interface ProductVariantOption {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number | null;
  quantity: number;
  isDefault: boolean;
}

export function AddToCartForm({
  productId,
  basePrice,
  trackInventory,
  baseQuantity,
  allowBackorder,
  variants,
  isAuthenticated,
  initialWishlisted,
}: {
  productId: string;
  basePrice: number;
  trackInventory: boolean;
  baseQuantity: number;
  allowBackorder: boolean;
  variants: ProductVariantOption[];
  isAuthenticated: boolean;
  initialWishlisted: boolean;
}) {
  const t = useTranslations("product");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();

  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    defaultVariant?.id ?? null,
  );
  const [quantity, setQuantity] = React.useState(1);
  const [isPending, startTransition] = React.useTransition();
  const [isWishlisted, setIsWishlisted] = React.useState(initialWishlisted);
  const [isTogglingWishlist, setIsTogglingWishlist] = React.useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant?.price ?? basePrice;
  const effectiveQuantity = selectedVariant ? selectedVariant.quantity : baseQuantity;
  const inStock = !trackInventory || effectiveQuantity > 0 || allowBackorder;

  function handleAddToCart() {
    if (!isAuthenticated) {
      toast.message(t("signInToAdd"));
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const result = await addToCartAction({
        productId,
        variantId: selectedVariantId,
        quantity,
      });

      if (result.ok) {
        toast.success(t("addedToCart"));
      } else if (result.error === "OUT_OF_STOCK") {
        toast.error(t("outOfStock"));
      } else if (result.error === "UNAUTHENTICATED") {
        router.push("/login");
      } else {
        toast.error(locale === "ar" ? "حدث خطأ ما" : "Something went wrong");
      }
    });
  }

  function handleToggleWishlist() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setIsTogglingWishlist(true);
    toggleWishlistAction(productId)
      .then((result) => {
        if (result.ok) {
          setIsWishlisted(Boolean(result.isWishlisted));
          toast.success(
            result.isWishlisted ? t("addToWishlist") : t("removeFromWishlist"),
          );
        }
      })
      .finally(() => setIsTogglingWishlist(false));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatCurrency(effectivePrice, locale)}</span>
      </div>

      {variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium">{t("selectOption")}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const disabled = trackInventory && variant.quantity <= 0 && !allowBackorder;
              const name = locale === "ar" ? variant.nameAr : variant.nameEn;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    variant.id === selectedVariantId
                      ? "border-gold-500 bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300"
                      : "border-border text-foreground hover:border-gold-400",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <p className="text-sm font-medium">{t("quantity")}</p>
        <div className="flex items-center rounded-lg border border-input">
          <button
            type="button"
            aria-label="decrease"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            aria-label="increase"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {inStock ? (
          <span className="text-sm text-success">{t("inStock")}</span>
        ) : (
          <span className="text-sm text-destructive">{t("outOfStock")}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="lg"
          variant="gold"
          className="flex-1"
          disabled={!inStock || isPending}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="size-4" />
          {isPending ? t("addingToCart") : t("addToCart")}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="size-12 p-0"
          aria-label={t("addToWishlist")}
          disabled={isTogglingWishlist}
          onClick={handleToggleWishlist}
        >
          <Heart className={cn("size-5", isWishlisted && "fill-destructive text-destructive")} />
        </Button>
      </div>
    </div>
  );
}
