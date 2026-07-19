import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/queries/wishlist";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { WishlistItemCard } from "@/components/storefront/wishlist-item-card";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: `${t("myWishlist")} | ${siteConfig.name[locale]}` };
}

export default async function AccountWishlistPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  const tCatalog = await getTranslations({ locale, namespace: "catalog" });

  const session = await auth();
  const items = await getWishlistProducts(session!.user.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("myWishlist")}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <Heart className="size-10 text-muted-foreground/50" />
          <p className="font-semibold">
            {locale === "ar" ? "قائمة المفضلة فارغة" : "Your wishlist is empty"}
          </p>
          <Button asChild variant="gold" className="mt-2">
            <Link href="/products">{tCatalog("allProducts")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <WishlistItemCard key={item.wishlistItemId} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
