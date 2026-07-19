import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@prisma/client";

const variantByStatus: Record<OrderStatus, "success" | "warning" | "destructive" | "default" | "gold"> = {
  PENDING: "warning",
  CONFIRMED: "gold",
  PROCESSING: "gold",
  READY_TO_SHIP: "gold",
  SHIPPED: "gold",
  OUT_FOR_DELIVERY: "gold",
  DELIVERED: "success",
  CANCELLED: "destructive",
  RETURNED: "destructive",
  REFUNDED: "default",
  FAILED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("account.status");
  return <Badge variant={variantByStatus[status]}>{t(status)}</Badge>;
}
