import { getTranslations, setRequestLocale } from "next-intl/server";
import { Truck, ShieldCheck, BadgeCheck, Headset } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

async function getFeaturedCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });
}

async function getBestSellers(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { soldCount: "desc" },
    take: 8,
    include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    image: p.media[0]?.url ?? null,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    quantity: p.quantity,
    trackInventory: p.trackInventory,
    allowBackorder: p.allowBackorder,
  }));
}

async function getNewArrivals(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", isNewArrival: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    image: p.media[0]?.url ?? null,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    quantity: p.quantity,
    trackInventory: p.trackInventory,
    allowBackorder: p.allowBackorder,
  }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "ar" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  const [categories, bestSellers, newArrivals] = await Promise.all([
    getFeaturedCategories(),
    getBestSellers(),
    getNewArrivals(),
  ]);

  const trustPoints = [
    { icon: Truck, titleKey: "fastDelivery", descKey: "fastDeliveryDesc" },
    { icon: ShieldCheck, titleKey: "securePayment", descKey: "securePaymentDesc" },
    { icon: BadgeCheck, titleKey: "qualityGuarantee", descKey: "qualityGuaranteeDesc" },
    { icon: Headset, titleKey: "support", descKey: "supportDesc" },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-gold-gradient opacity-[0.06]" />
        <div className="container relative flex min-h-[560px] flex-col items-center justify-center gap-6 py-24 text-center">
          <span className="rounded-full border border-gold-500/40 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-400">
            {siteConfig.name.ar} · {siteConfig.name.en}
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold text-white md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-balance text-base text-ink-300 md:text-lg">
            {t("heroSubtitle")}
          </p>
          <Button asChild variant="gold" size="lg" className="mt-4">
            <Link href="/products">{t("shopNow")}</Link>
          </Button>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border/60">
        <div className="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {trustPoints.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="flex flex-col items-center gap-2 text-center md:items-start md:text-start">
              <div className="flex size-11 items-center justify-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-950 dark:text-gold-400">
                <Icon className="size-5" />
              </div>
              <h3 className="text-sm font-semibold">{t(titleKey)}</h3>
              <p className="text-xs text-muted-foreground">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured categories */}
      {categories.length > 0 && (
        <section className="container py-16">
          <h2 className="mb-8 text-2xl font-bold">{t("featuredCategories")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={{ pathname: "/categories/[slug]", params: { slug: cat.slug } }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border p-4 text-center transition-all hover:-translate-y-1 hover:border-gold-400 hover:shadow-gold-sm"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-muted text-2xl">
                  {cat.icon ?? "🛍️"}
                </div>
                <span className="text-xs font-medium">
                  {locale === "ar" ? cat.nameAr : cat.nameEn}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="container py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t("bestSellers")}</h2>
            <Link href="/products" className="text-sm font-medium text-gold-600 hover:underline dark:text-gold-400">
              {tNav("categories")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="container py-16">
          <h2 className="mb-8 text-2xl font-bold">{t("newArrivals")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
