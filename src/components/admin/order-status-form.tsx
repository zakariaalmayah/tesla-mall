"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  updateOrderStatusAction,
  updateOrderInternalNoteAction,
} from "@/lib/actions/admin/orders";

const ALL_STATUSES = Object.values(OrderStatus);

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const t = useTranslations("admin");
  const tStatus = useTranslations("account.status");
  const [status, setStatus] = React.useState<OrderStatus>(currentStatus);
  const [note, setNote] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId, status, note });
      if (result.ok) {
        toast.success(t("statusUpdated"));
        setNote("");
      } else {
        toast.error(t("statusUpdateError"));
      }
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="order-status">{t("updateStatus")}</Label>
        <select
          id="order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {tStatus(s)}
            </option>
          ))}
        </select>
      </div>
      <Textarea
        placeholder={t("internalNotePlaceholder")}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button variant="gold" onClick={handleSubmit} disabled={isPending} className="w-full">
        {t("updateStatus")}
      </Button>
    </div>
  );
}

export function InternalNoteForm({
  orderId,
  initialNote,
}: {
  orderId: string;
  initialNote: string;
}) {
  const t = useTranslations("admin");
  const [note, setNote] = React.useState(initialNote);
  const [isPending, startTransition] = React.useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateOrderInternalNoteAction({ orderId, internalNote: note });
      if (result.ok) {
        toast.success(t("noteSaved"));
      }
    });
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="internal-note">{t("internalNote")}</Label>
      <Textarea
        id="internal-note"
        placeholder={t("internalNotePlaceholder")}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button variant="outline" onClick={handleSave} disabled={isPending} className="w-full">
        {t("saveNote")}
      </Button>
    </div>
  );
}
