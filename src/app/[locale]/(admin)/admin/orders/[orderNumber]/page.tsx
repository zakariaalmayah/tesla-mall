import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAdminOrderByNumber } from "@/lib/queries/admin/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { OrderStatusForm, InternalNoteForm } from "@/components/admin/order-status-form";
import { siteConfig } from "@/config/site";

interface ShippingSnapshot {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  district: string | null;
  street: string;
  landmark: string | null;
}

interface PageProps {
  params: Promise<{ locale: "ar" | "en"; orderNumber: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, orderNumber } = await params;
  return { title: `${orderNumber} | ${siteConfig.name[locale]}` };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { locale, orderNumber } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tCart = await getTranslations({ locale, namespace: "cart" });
  const tCheckout = await getTranslations({ locale, namespace: "checkout" });

  const order = await getAdminOrderByNumber(orderNumber);
  if (!order) notFound();

  const shipping = order.shippingSnapshot as unknown as ShippingSnapshot;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:hidden" />
        <ArrowLeft className="size-4 ltr:hidden" />
        {t("backToOrders")}
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt, locale)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-5">
            <h2 className="mb-4 font-semibold">{t("orderDetails")}</h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{locale === "ar" ? item.nameAr : item.nameEn}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("sku")}: {item.sku} · × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(Number(item.lineTotal), locale)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCart("subtotal")}</span>
                <span>{formatCurrency(Number(order.subtotal), locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCart("shipping")}</span>
                <span>{formatCurrency(Number(order.shippingTotal), locale)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>{tCart("total")}</span>
                <span>{formatCurrency(Number(order.grandTotal), locale)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <h2 className="mb-4 font-semibold">{tCheckout("deliveryAddress")}</h2>
            <p className="text-sm">
              {shipping.fullName} — <span dir="ltr">{shipping.phone}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {shipping.governorate} — {shipping.city}
              {shipping.district ? ` — ${shipping.district}` : ""}, {shipping.street}
            </p>
            {shipping.landmark && (
              <p className="text-sm text-muted-foreground">{shipping.landmark}</p>
            )}
            {order.customerNote && (
              <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-sm">{order.customerNote}</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <h2 className="mb-4 font-semibold">{t("customer")}</h2>
            <p className="text-sm font-medium">{order.user.name}</p>
            <p className="text-sm text-muted-foreground" dir="ltr">
              {order.user.phone}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <h2 className="mb-4 font-semibold">{t("statusHistory")}</h2>
            <ul className="space-y-3">
              {order.statusLogs.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <OrderStatusBadge status={log.status} />
                    {log.note && <p className="mt-1 text-muted-foreground">{log.note}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(log.createdAt, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-5">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <InternalNoteForm orderId={order.id} initialNote={order.internalNote ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
