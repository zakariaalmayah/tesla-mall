"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ProductStatus } from "@prisma/client";
import { updateProductStatusAction, updateProductStockAction } from "@/lib/actions/admin/products";

const ALL_STATUSES = Object.values(ProductStatus);

export function ProductStatusSelect({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: ProductStatus;
}) {
  const t = useTranslations("admin");
  const tStatuses = useTranslations("admin.productStatuses");
  const [status, setStatus] = React.useState(currentStatus);
  const [isPending, startTransition] = React.useTransition();

  function handleChange(next: ProductStatus) {
    setStatus(next);
    startTransition(async () => {
      const result = await updateProductStatusAction({ productId, status: next });
      if (result.ok) {
        toast.success(t("statusUpdatedProduct"));
      }
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as ProductStatus)}
      className="h-9 rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {tStatuses(s)}
        </option>
      ))}
    </select>
  );
}

export function ProductStockInput({
  productId,
  initialQuantity,
}: {
  productId: string;
  initialQuantity: number;
}) {
  const t = useTranslations("admin");
  const [quantity, setQuantity] = React.useState(initialQuantity);
  const [isPending, startTransition] = React.useTransition();

  function commit() {
    if (quantity === initialQuantity) return;
    startTransition(async () => {
      const result = await updateProductStockAction({ productId, quantity });
      if (result.ok) {
        toast.success(t("stockUpdated"));
      }
    });
  }

  return (
    <input
      type="number"
      min={0}
      value={quantity}
      disabled={isPending}
      onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))}
      onBlur={commit}
      className="h-9 w-20 rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    />
  );
}
