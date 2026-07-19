import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getProductBySlug,
  getRelatedProducts,
  incrementProductViewCount,
} from "@/lib/queries/products";
import { getWishlistedProductIds } from "@/lib/actions/wishlist";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/config/site";

import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { StarRating } from "@/components/storefront/star-rating";
import { ReviewList } from "@/components/storefront/review-list";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PageProps {
  params: Promise<{ locale: "ar" | "en"; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const seoTitle = (locale === "ar" ? product.seoTitleAr : product.seoTitleEn) ?? name;
  const description =
    (locale === "ar" ? product.seoDescriptionAr : product.seoDescriptionEn) ??
    (locale === "ar" ? product.shortDescriptionAr : product.shortDescriptionEn) ??
    undefined;
  const image = product.media[0]?.url;

  return {
    title: `${seoTitle} | ${siteConfig.name[locale]}`,
    description,
    openGraph: image
      ? { images: [{ url: image, width: 1200, height: 1200, alt: name }] }
      : undefined,
    alternates: {
      canonical: `/${locale}/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations({ locale, namespace: "product" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const session = await auth();

  const [relatedProducts, wishlistedIds] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    getWishlistedProductIds(session?.user?.id),
  ]);

  incrementProductViewCount(product.id).catch(() => {});

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const categoryName = locale === "ar" ? product.category.nameAr : product.category.nameEn;
  const brandName = product.brand
    ? locale === "ar"
      ? product.brand.nameAr
      : product.brand.nameEn
    : null;

  const hasDiscount =
    product.compareAtPrice != null && Number(product.compareAtPrice) > Number(product.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description ?? undefined,
    sku: product.sku,
    image: product.media.map((m) => m.url),
    brand: brandName ? { "@type": "Brand", name: brandName } : undefined,
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAverage,
            reviewCount: product.ratingCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: Number(product.price),
      availability:
        !product.trackInventory || product.quantity > 0 || product.allowBackorder
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/${locale}/products/${slug}`,
    },
  };

  return (
    <>
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <Breadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          {
            label: categoryName,
            href: { pathname: "/categories/[slug]", params: { slug: product.category.slug } },
          },
          { label: name },
        ]}
        className="mb-6"
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery
          media={product.media.map((m) => ({
            id: m.id,
            url: m.url,
            alt: (locale === "ar" ? m.altAr : m.altEn) ?? name,
          }))}
          fallbackAlt={name}
        />

        <div>
          {brandName && (
            <p className="mb-1 text-sm font-medium text-gold-600 dark:text-gold-400">{brandName}</p>
          )}
          <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating value={product.ratingAverage} count={product.ratingCount} size="md" />
            {hasDiscount && <Badge variant="gold">{t("onSale")}</Badge>}
          </div>

          {product.shortDescriptionAr && (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {locale === "ar" ? product.shortDescriptionAr : product.shortDescriptionEn}
            </p>
          )}

          <div className="mt-6">
            <AddToCartForm
              productId={product.id}
              basePrice={Number(product.price)}
              trackInventory={product.trackInventory}
              baseQuantity={product.quantity}
              allowBackorder={product.allowBackorder}
              isAuthenticated={Boolean(session?.user)}
              initialWishlisted={wishlistedIds.has(product.id)}
              variants={product.variants.map((v) => ({
                id: v.id,
                nameAr: v.nameAr,
                nameEn: v.nameEn,
                price: v.price != null ? Number(v.price) : null,
                quantity: v.quantity,
                isDefault: v.isDefault,
              }))}
            />
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            {t("sku")}: {product.sku}
          </p>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-16">
        <TabsList>
          <TabsTrigger value="description">{t("description")}</TabsTrigger>
          {product.attributes.length > 0 && (
            <TabsTrigger value="specifications">{t("specifications")}</TabsTrigger>
          )}
          <TabsTrigger value="reviews">
            {t("reviews")} ({product.ratingCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <div className="prose max-w-none dark:prose-invert">
            <p className="leading-relaxed">{description}</p>
          </div>
        </TabsContent>

        {product.attributes.length > 0 && (
          <TabsContent value="specifications">
            <Accordion type="single" collapsible className="max-w-2xl">
              {product.attributes.map((attribute) => (
                <AccordionItem key={attribute.id} value={attribute.id}>
                  <AccordionTrigger>
                    {locale === "ar" ? attribute.keyAr : attribute.keyEn}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {locale === "ar" ? attribute.valueAr : attribute.valueEn}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        )}

        <TabsContent value="reviews">
          <ReviewList reviews={product.reviews} />
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold">{t("relatedProducts")}</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
    </>
  );
}
