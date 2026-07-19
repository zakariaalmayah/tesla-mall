import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderStatus } from "@prisma/client";
import { getAdminOrders } from "@/lib/queries/admin/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("orders")} | ${siteConfig.name[locale]}` };
}

const ALL_STATUSES = Object.values(OrderStatus);

export default async function AdminOrdersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q, status: rawStatus, page: rawPage } = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tStatus = await getTranslations({ locale, namespace: "account.status" });

  const status = ALL_STATUSES.includes(rawStatus as OrderStatus) ? (rawStatus as OrderStatus) : undefined;
  const page = Math.max(1, Number(rawPage) || 1);

  const { orders, totalPages } = await getAdminOrders({ q, status, page });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("orders")}</h1>

      <form className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t("searchOrders")}
          className="h-11 min-w-64 flex-1 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("allStatuses")}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {tStatus(s)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 rounded-lg bg-gold-gradient px-5 text-sm font-semibold text-ink-950"
        >
          {t("applyFilters")}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase ">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t("orderNumber")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("customer")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("date")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("status")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("total")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {t("noResults")}
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3.5 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3.5">
                  <div>{order.customerName}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">
                    {order.customerPhone}
                  </div>
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
                <td className="px-4 py-3.5 text-end">
                  <Link
                    href={`/admin/orders/${order.orderNumber}` as never}
                    className="font-medium text-gold-600 hover:underline dark:text-gold-400"
                  >
                    {t("orderDetails")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CatalogPagination
        basePath="/admin/orders"
        searchParams={{ q, status: rawStatus, page: rawPage }}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
