"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productFormSchema, type ProductFormInput } from "@/lib/validations/admin/product";
import { createProductAction, updateProductAction } from "@/lib/actions/admin/products";
import { ImageUploader } from "@/components/admin/image-uploader";

export interface CategoryOption {
  id: string;
  nameAr: string;
  nameEn: string;
  depth: number;
}

export interface BrandOption {
  id: string;
  nameAr: string;
  nameEn: string;
}

const statusLabels: Record<ProductStatus, string> = {
  DRAFT: "مسودة",
  ACTIVE: "نشط",
  OUT_OF_STOCK: "نفدت الكمية",
  ARCHIVED: "مؤرشف",
};

const errorMessages: Record<string, string> = {
  INVALID_INPUT: "تحقق من الحقول المطلوبة",
  DUPLICATE_SLUG_OR_SKU: "الرابط أو رمز المنتج (SKU) مستخدم مسبقًا",
  GENERIC: "حدث خطأ ما، حاول مرة أخرى",
};

export function ProductForm({
  categories,
  brands,
  defaultValues,
  productId,
}: {
  categories: CategoryOption[];
  brands: BrandOption[];
  defaultValues?: Partial<ProductFormInput>;
  productId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      trackInventory: true,
      allowBackorder: false,
      isFeatured: false,
      isNewArrival: false,
      status: ProductStatus.DRAFT,
      quantity: 0,
      lowStockThreshold: 5,
      ...defaultValues,
    },
  });

  const trackInventory = watch("trackInventory");
  const imageUrlsRaw = watch("imageUrls");
  const imageUrls = React.useMemo(
    () => (imageUrlsRaw ? imageUrlsRaw.split("\n").map((u) => u.trim()).filter(Boolean) : []),
    [imageUrlsRaw],
  );

  async function onSubmit(values: ProductFormInput) {
    setIsSubmitting(true);
    try {
      const result = productId
        ? await updateProductAction(productId, values)
        : await createProductAction(values);

      if (result.ok) {
        toast.success(productId ? "تم حفظ التعديلات" : "تم إنشاء المنتج");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(errorMessages[result.error ?? "GENERIC"]);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-4 font-semibold">المعلومات الأساسية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nameAr">الاسم (عربي)</Label>
            <Input id="nameAr" className="mt-1.5" {...register("nameAr")} />
            {errors.nameAr && <p className="mt-1 text-xs text-destructive">{errors.nameAr.message}</p>}
          </div>
          <div>
            <Label htmlFor="nameEn">الاسم (إنجليزي)</Label>
            <Input id="nameEn" dir="ltr" className="mt-1.5 text-start" {...register("nameEn")} />
            {errors.nameEn && <p className="mt-1 text-xs text-destructive">{errors.nameEn.message}</p>}
          </div>

          <div>
            <Label htmlFor="slug">الرابط (Slug)</Label>
            <Input id="slug" dir="ltr" className="mt-1.5 text-start" placeholder="wireless-earbuds-pro" {...register("slug")} />
            {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div>
            <Label htmlFor="sku">رمز المنتج (SKU)</Label>
            <Input id="sku" dir="ltr" className="mt-1.5 text-start" {...register("sku")} />
            {errors.sku && <p className="mt-1 text-xs text-destructive">{errors.sku.message}</p>}
          </div>

          <div>
            <Label htmlFor="categoryId">القسم</Label>
            <select
              id="categoryId"
              className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("categoryId")}
              defaultValue=""
            >
              <option value="" disabled>
                اختر قسمًا
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.depth > 0 ? "— " : ""}
                  {c.nameAr}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="brandId">الماركة (اختياري)</Label>
            <select
              id="brandId"
              className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("brandId")}
              defaultValue=""
            >
              <option value="">بدون ماركة</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-4 font-semibold">الوصف</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="shortDescriptionAr">وصف مختصر (عربي)</Label>
            <Textarea id="shortDescriptionAr" className="mt-1.5" {...register("shortDescriptionAr")} />
          </div>
          <div>
            <Label htmlFor="shortDescriptionEn">وصف مختصر (إنجليزي)</Label>
            <Textarea id="shortDescriptionEn" dir="ltr" className="mt-1.5 text-start" {...register("shortDescriptionEn")} />
          </div>
          <div>
            <Label htmlFor="descriptionAr">الوصف الكامل (عربي)</Label>
            <Textarea id="descriptionAr" className="mt-1.5 min-h-32" {...register("descriptionAr")} />
            {errors.descriptionAr && (
              <p className="mt-1 text-xs text-destructive">{errors.descriptionAr.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="descriptionEn">الوصف الكامل (إنجليزي)</Label>
            <Textarea
              id="descriptionEn"
              dir="ltr"
              className="mt-1.5 min-h-32 text-start"
              {...register("descriptionEn")}
            />
            {errors.descriptionEn && (
              <p className="mt-1 text-xs text-destructive">{errors.descriptionEn.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-4 font-semibold">السعر والمخزون</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">السعر (ر.ي)</Label>
            <Input id="price" type="number" step="0.01" className="mt-1.5" {...register("price")} />
            {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div>
            <Label htmlFor="compareAtPrice">السعر قبل الخصم (اختياري)</Label>
            <Input id="compareAtPrice" type="number" step="0.01" className="mt-1.5" {...register("compareAtPrice")} />
          </div>

          <div className="flex items-center gap-2.5 sm:col-span-2">
            <Checkbox
              id="trackInventory"
              checked={trackInventory}
              onCheckedChange={(v) => setValue("trackInventory", Boolean(v))}
            />
            <Label htmlFor="trackInventory" className="cursor-pointer font-normal">
              تتبّع المخزون لهذا المنتج
            </Label>
          </div>

          {trackInventory && (
            <>
              <div>
                <Label htmlFor="quantity">الكمية المتوفرة</Label>
                <Input id="quantity" type="number" className="mt-1.5" {...register("quantity")} />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold">حد التنبيه بانخفاض المخزون</Label>
                <Input id="lowStockThreshold" type="number" className="mt-1.5" {...register("lowStockThreshold")} />
              </div>
            </>
          )}

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="allowBackorder"
              onCheckedChange={(v) => setValue("allowBackorder", Boolean(v))}
            />
            <Label htmlFor="allowBackorder" className="cursor-pointer font-normal">
              السماح بالطلب حتى مع نفاد الكمية
            </Label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-4 font-semibold">الصور</h2>
        <ImageUploader
          folder="products"
          value={imageUrls}
          onChange={(urls) => setValue("imageUrls", urls.join("\n"))}
        />

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            إضافة روابط صور جاهزة يدويًا
          </summary>
          <Textarea
            id="imageUrls"
            dir="ltr"
            className="mt-2 min-h-20 text-start"
            placeholder={"https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"}
            {...register("imageUrls")}
          />
        </details>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-4 font-semibold">الحالة والظهور</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="status">حالة المنتج</Label>
            <Select
              defaultValue={defaultValues?.status ?? ProductStatus.DRAFT}
              onValueChange={(v) => setValue("status", v as ProductStatus)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2.5">
              <Checkbox id="isFeatured" onCheckedChange={(v) => setValue("isFeatured", Boolean(v))} />
              <Label htmlFor="isFeatured" className="cursor-pointer font-normal">
                منتج مميز (يظهر في الرئيسية)
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox id="isNewArrival" onCheckedChange={(v) => setValue("isNewArrival", Boolean(v))} />
              <Label htmlFor="isNewArrival" className="cursor-pointer font-normal">
                وصل حديثًا
              </Label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-4 font-semibold">تحسين محركات البحث (SEO)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="seoTitleAr">عنوان SEO (عربي)</Label>
            <Input id="seoTitleAr" className="mt-1.5" {...register("seoTitleAr")} />
          </div>
          <div>
            <Label htmlFor="seoTitleEn">عنوان SEO (إنجليزي)</Label>
            <Input id="seoTitleEn" dir="ltr" className="mt-1.5 text-start" {...register("seoTitleEn")} />
          </div>
          <div>
            <Label htmlFor="seoDescriptionAr">وصف SEO (عربي)</Label>
            <Textarea id="seoDescriptionAr" className="mt-1.5" {...register("seoDescriptionAr")} />
          </div>
          <div>
            <Label htmlFor="seoDescriptionEn">وصف SEO (إنجليزي)</Label>
            <Textarea id="seoDescriptionEn" dir="ltr" className="mt-1.5 text-start" {...register("seoDescriptionEn")} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          إلغاء
        </Button>
        <Button type="submit" variant="gold" disabled={isSubmitting}>
          {isSubmitting ? "جارٍ الحفظ..." : productId ? "حفظ التعديلات" : "إنشاء المنتج"}
        </Button>
      </div>
    </form>
  );
}
