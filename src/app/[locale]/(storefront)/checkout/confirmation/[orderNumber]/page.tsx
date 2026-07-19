import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getOrderByNumberForUser } from "@/lib/queries/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

interface ShippingSnapshot {
  label: string;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  district: string | null;
  street: string;
  landmark: string | null;
  etaMinDays: number;
  etaMaxDays: number;
}

interface PageProps {
  params: Promise<{ locale: "ar" | "en"; orderNumber: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: `${t("orderSuccess")} | ${siteConfig.name[locale]}` };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { locale, orderNumber } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  const tCart = await getTranslations({ locale, namespace: "cart" });

  const session = await auth();
  if (!session?.user?.id) notFound();

  const order = await getOrderByNumberForUser(orderNumber, session.user.id);
  if (!order) notFound();

  const shipping = order.shippingSnapshot as unknown as ShippingSnapshot;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-9 text-success" />
        </div>
        <h1 className="mt-6 text-2xl font-bold sm:text-3xl">{t("orderSuccess")}</h1>
        <p className="mt-2 text-muted-foreground">{t("orderSuccessHint")}</p>
        <p className="mt-4 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold">
          {t("orderNumber")}: {order.orderNumber}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <MapPin className="size-4 text-gold-500" />
            {t("deliveryAddress")}
          </div>
          <p className="text-sm">
            {shipping.fullName} — {shipping.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {shipping.governorate} — {shipping.city}
            {shipping.district ? ` — ${shipping.district}` : ""}, {shipping.street}
          </p>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <Truck className="size-4 text-gold-500" />
            {t("shippingMethod")}
          </div>
          <p className="text-sm">
            {order.shippingMethod === "EXPRESS" ? t("express") : t("standard")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("eta", { min: shipping.etaMinDays, max: shipping.etaMaxDays })}
          </p>
          <p className="mt-2 text-sm font-medium text-gold-600 dark:text-gold-400">
            {t("cashOnDelivery")}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border p-5">
        <h2 className="mb-4 font-semibold">{t("title")}</h2>
        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                {locale === "ar" ? item.nameAr : item.nameEn} × {item.quantity}
              </span>
              <span className="font-medium">{formatCurrency(Number(item.lineTotal), locale)}</span>
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
        <p className="mt-3 text-xs text-muted-foreground">
          {formatDate(order.createdAt, locale)}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="gold" className="flex-1">
          <Link href="/">{t("backToHome")}</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/account/orders">{t("viewOrders")}</Link>
        </Button>
      </div>
    </div>
  );
}
