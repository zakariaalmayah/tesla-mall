import type { Metadata } from "next";
import { ShoppingBag, Wallet, Clock, PackageX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getDashboardStats } from "@/lib/queries/admin/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("dashboard")} | ${siteConfig.name[locale]}` };
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const stats = await getDashboardStats();

  const kpis = [
    {
      label: t("todayOrders"),
      value: stats.todayOrdersCount.toLocaleString(locale),
      icon: ShoppingBag,
    },
    {
      label: t("todayRevenue"),
      value: formatCurrency(stats.todayRevenue, locale),
      icon: Wallet,
    },
    {
      label: t("pendingOrders"),
      value: stats.pendingOrdersCount.toLocaleString(locale),
      icon: Clock,
    },
    {
      label: t("lowStock"),
      value: stats.lowStockCount.toLocaleString(locale),
      icon: PackageX,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("overview")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <Icon className="size-4 text-gold-500" />
              </div>
              <p className="mt-3 text-2xl font-bold">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">{t("recentOrders")}</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-gold-600 hover:underline dark:text-gold-400"
          >
            {t("viewAll")}
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t("orderNumber")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("customer")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("date")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("status")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/admin/orders/${order.orderNumber}` as never}
                    className="font-medium text-gold-600 hover:underline dark:text-gold-400"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <div>{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {formatDate(order.createdAt, locale)}
                </td>
                <td className="px-4 py-3.5">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3.5 font-semibold">
                  {formatCurrency(order.grandTotal, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
