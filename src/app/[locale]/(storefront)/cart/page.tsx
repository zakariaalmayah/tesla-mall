import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getCartForUser } from "@/lib/queries/cart";
import { formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/storefront/cart-item-row";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: `${t("title")} | ${siteConfig.name[locale]}` };
}

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const session = await auth();

  const cart = session?.user?.id
    ? await getCartForUser(session.user.id)
    : { cartId: null, items: [], subtotal: 0, itemCount: 0 };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("title") }]} className="mb-6" />
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">{t("title")}</h1>

      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-24 text-center">
          <ShoppingBag className="size-12 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-semibold">{t("empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
          </div>
          <Button asChild variant="gold" className="mt-2">
            <Link href="/products">{t("continueShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="divide-y divide-border">
            <p className="pb-4 text-sm text-muted-foreground">
              {t("itemsCount", { count: cart.itemCount })}
            </p>
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">{t("orderSummary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">{formatCurrency(cart.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("shipping")}</span>
                <span>—</span>
              </div>
            </div>
            <div className="my-4 border-t border-border" />
            <div className="flex justify-between text-base font-bold">
              <span>{t("total")}</span>
              <span>{formatCurrency(cart.subtotal, locale)}</span>
            </div>

            <Button asChild variant="gold" size="lg" className="mt-6 w-full">
              <Link href="/checkout">{t("checkout")}</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
