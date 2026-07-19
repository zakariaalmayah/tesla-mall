import type { Metadata } from "next";
import NextLink from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAdminCategoryTree } from "@/lib/queries/admin/categories";
import {
  CategoryActiveToggle,
  CategoryDeleteButton,
} from "@/components/admin/category-row-actions";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("categories")} | ${siteConfig.name[locale]}` };
}

export default async function AdminCategoriesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const categories = await getAdminCategoryTree();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("categories")}</h1>
        <NextLink
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-lg bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          إضافة قسم
        </NextLink>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <ul className="divide-y divide-border">
          {categories.map((category) => (
            <li key={category.id}>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="font-semibold">
                  {locale === "ar" ? category.nameAr : category.nameEn}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {category.productCount} منتج
                  </span>
                  <CategoryActiveToggle categoryId={category.id} isActive={category.isActive} />
                  <NextLink
                    href={`/admin/categories/${category.id}/edit`}
                    className="text-sm font-medium text-gold-600 hover:underline dark:text-gold-400"
                  >
                    تعديل
                  </NextLink>
                  <CategoryDeleteButton categoryId={category.id} />
                </div>
              </div>
              {category.children.length > 0 && (
                <ul className="divide-y divide-border border-t border-border bg-secondary/30 ps-8">
                  {category.children.map((child) => (
                    <li key={child.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <span className="text-sm">
                        {locale === "ar" ? child.nameAr : child.nameEn}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {child.productCount} منتج
                        </span>
                        <CategoryActiveToggle categoryId={child.id} isActive={child.isActive} />
                        <NextLink
                          href={`/admin/categories/${child.id}/edit`}
                          className="text-sm font-medium text-gold-600 hover:underline dark:text-gold-400"
                        >
                          تعديل
                        </NextLink>
                        <CategoryDeleteButton categoryId={child.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
