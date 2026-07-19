"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleCustomerActiveAction } from "@/lib/actions/admin/customers";

export function CustomerActiveToggle({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleCustomerActiveAction(userId, !isActive);
      if (!result.ok) {
        toast.error("حدث خطأ ما");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
        isActive ? "bg-success/15 text-success hover:bg-success/25" : "bg-destructive/15 text-destructive hover:bg-destructive/25",
      )}
    >
      {isActive ? "نشط" : "محظور"}
    </button>
  );
}
