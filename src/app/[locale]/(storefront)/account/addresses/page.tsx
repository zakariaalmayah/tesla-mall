import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getUserAddresses, getActiveShippingZones } from "@/lib/queries/shipping";
import { AddressesManager } from "@/components/account/addresses-manager";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: `${t("myAddresses")} | ${siteConfig.name[locale]}` };
}

export default async function AccountAddressesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  const session = await auth();
  const [addresses, zones] = await Promise.all([
    getUserAddresses(session!.user.id),
    getActiveShippingZones(),
  ]);

  const governorates = Array.from(new Set(zones.map((z) => z.governorate)));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("myAddresses")}</h1>
      <AddressesManager
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
        governorates={governorates}
      />
    </div>
  );
}
