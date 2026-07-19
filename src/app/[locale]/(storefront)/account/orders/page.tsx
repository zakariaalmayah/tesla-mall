import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/queries/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: `${t("myOrders")} | ${siteConfig.name[locale]}` };
}

export default async function AccountOrdersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page: rawPage } = await searchParams;
  const t = await getTranslations({ locale, namespace: "account" });

  const session = await auth();
  const page = Math.max(1, Number(rawPage) || 1);
  const { orders, totalPages } = await getOrdersForUser(session!.user.id, page);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("myOrders")}</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <PackageOpen className="size-10 text-muted-foreground/50" />
          <div>
            <p className="font-semibold">{t("noOrders")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noOrdersHint")}</p>
          </div>
          <Button asChild variant="gold" className="mt-2">
            <Link href="/products">{t("browseProducts")}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-start text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t("orderNumber")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("orderDate")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("orderStatus")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("orderTotal")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(order.createdAt, locale)}
                    </td>
                    <td className="px-4 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {formatCurrency(order.grandTotal, locale)}
                    </td>
                    <td className="px-4 py-4 text-end">
                      <Link
                        href={{
                          pathname: "/checkout/confirmation/[orderNumber]",
                          params: { orderNumber: order.orderNumber },
                        }}
                        className="text-sm font-medium text-gold-600 hover:underline dark:text-gold-400"
                      >
                        {t("viewDetails")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CatalogPagination
            basePath="/account/orders"
            searchParams={{ page: rawPage }}
            currentPage={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
