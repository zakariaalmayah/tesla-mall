import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { getCartForUser } from "@/lib/queries/cart";
import { getUserAddresses, getActiveShippingZones } from "@/lib/queries/shipping";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: `${t("title")} | ${siteConfig.name[locale]}` };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const session = await auth();
  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
  }

  const [cart, addresses, shippingZones] = await Promise.all([
    getCartForUser(session!.user.id),
    getUserAddresses(session!.user.id),
    getActiveShippingZones(),
  ]);

  if (cart.items.length === 0) {
    redirect({ href: "/cart", locale });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("cart"), href: "/cart" },
          { label: t("title") },
        ]}
        className="mb-6"
      />
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">{t("title")}</h1>

      <CheckoutForm
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          fullName: a.fullName,
          phone: a.phone,
          governorate: a.governorate,
          city: a.city,
          district: a.district,
          street: a.street,
          isDefault: a.isDefault,
        }))}
        shippingZones={shippingZones.map((z) => ({
          governorate: z.governorate,
          baseFee: z.baseFee,
          expressFee: z.expressFee,
          freeThreshold: z.freeThreshold,
          etaMinDays: z.etaMinDays,
          etaMaxDays: z.etaMaxDays,
        }))}
        subtotal={cart.subtotal}
      />
    </div>
  );
}
