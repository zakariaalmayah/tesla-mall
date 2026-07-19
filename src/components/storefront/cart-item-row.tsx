"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { formatCurrency, cn } from "@/lib/utils";
import { updateCartItemQuantityAction, removeCartItemAction } from "@/lib/actions/cart";
import type { CartLineItem } from "@/lib/queries/cart";

export function CartItemRow({ item }: { item: CartLineItem }) {
  const t = useTranslations("cart");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [quantity, setQuantity] = React.useState(item.quantity);

  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const variantName = locale === "ar" ? item.variantNameAr : item.variantNameEn;
  const exceedsStock = item.trackInventory && !item.allowBackorder && quantity > item.availableQuantity;

  function commitQuantity(next: number) {
    const clamped = Math.max(1, Math.min(99, next));
    setQuantity(clamped);
    startTransition(async () => {
      const result = await updateCartItemQuantityAction({ cartItemId: item.id, quantity: clamped });
      if (!result.ok) {
        toast.error(t("outOfStockNotice"));
      }
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeCartItemAction(item.id);
      router.refresh();
    });
  }

  return (
    <div className={cn("flex gap-4 py-5", isPending && "opacity-60")}>
      <Link
        href={{ pathname: "/products/[slug]", params: { slug: item.slug } }}
        className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {item.image && (
          <Image src={item.image} alt={name} fill sizes="96px" className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={{ pathname: "/products/[slug]", params: { slug: item.slug } }}
          className="line-clamp-2 font-medium transition-colors hover:text-gold-600 dark:hover:text-gold-400"
        >
          {name}
        </Link>
        {variantName && <p className="text-sm text-muted-foreground">{variantName}</p>}
        {exceedsStock && <p className="text-xs text-destructive">{t("outOfStockNotice")}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center rounded-lg border border-input">
            <button
              type="button"
              aria-label="decrease"
              disabled={isPending}
              onClick={() => commitQuantity(quantity - 1)}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              aria-label="increase"
              disabled={isPending}
              onClick={() => commitQuantity(quantity + 1)}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold">{formatCurrency(item.unitPrice * quantity, locale)}</span>
            <button
              type="button"
              aria-label={t("remove")}
              disabled={isPending}
              onClick={handleRemove}
              className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
