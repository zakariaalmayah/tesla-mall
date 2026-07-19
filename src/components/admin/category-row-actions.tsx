"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleCategoryActiveAction, deleteCategoryAction } from "@/lib/actions/admin/categories";

export function CategoryActiveToggle({ categoryId, isActive }: { categoryId: string; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleCategoryActiveAction(categoryId, !isActive);
      if (result.ok) router.refresh();
      else toast.error("حدث خطأ ما");
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
        isActive
          ? "bg-success/15 text-success hover:bg-success/25"
          : "bg-destructive/15 text-destructive hover:bg-destructive/25",
      )}
    >
      {isActive ? "مفعّل" : "معطّل"}
    </button>
  );
}

export function CategoryDeleteButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleDelete() {
    if (!window.confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);
      if (result.ok) {
        router.refresh();
      } else if (result.error === "REFERENCED_BY_PRODUCTS") {
        toast.error("لا يمكن حذف قسم يحتوي على منتجات، انقله أو عطّله بدلًا من ذلك");
      } else {
        toast.error("حدث خطأ ما");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      aria-label="حذف"
      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
