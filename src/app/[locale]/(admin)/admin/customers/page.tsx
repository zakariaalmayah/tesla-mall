import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAdminCustomers } from "@/lib/queries/admin/customers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerActiveToggle } from "@/components/admin/customer-active-toggle";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("customers")} | ${siteConfig.name[locale]}` };
}

export default async function AdminCustomersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q, page: rawPage } = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin" });

  const page = Math.max(1, Number(rawPage) || 1);
  const { customers, totalPages } = await getAdminCustomers({ q, page });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("customers")}</h1>

      <form className="mb-5">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="ابحث بالاسم أو الهاتف أو البريد الإلكتروني"
          className="h-11 w-full max-w-md rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto"
        />
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-medium">الاسم</th>
              <th className="px-4 py-3 text-start font-medium">الهاتف</th>
              <th className="px-4 py-3 text-start font-medium">عدد الطلبات</th>
              <th className="px-4 py-3 text-start font-medium">إجمالي المشتريات</th>
              <th className="px-4 py-3 text-start font-medium">تاريخ التسجيل</th>
              <th className="px-4 py-3 text-start font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  لا يوجد عملاء مطابقون
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                  {customer.phone}
                </td>
                <td className="px-4 py-3">{customer.orderCount}</td>
                <td className="px-4 py-3 font-semibold">
                  {formatCurrency(customer.totalSpent, locale)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(customer.createdAt, locale)}
                </td>
                <td className="px-4 py-3">
                  <CustomerActiveToggle userId={customer.id} isActive={customer.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CatalogPagination
        basePath="/admin/customers"
        searchParams={{ q, page: rawPage }}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
