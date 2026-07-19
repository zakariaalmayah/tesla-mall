"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validations/admin/category";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions/admin/categories";
import { ImageUploader } from "@/components/admin/image-uploader";

export interface ParentOption {
  id: string;
  nameAr: string;
}

const errorMessages: Record<string, string> = {
  INVALID_INPUT: "تحقق من الحقول المطلوبة",
  DUPLICATE_SLUG: "الرابط مستخدم مسبقًا لقسم آخر",
  INVALID_PARENT: "لا يمكن أن يكون القسم أبًا لنفسه",
  GENERIC: "حدث خطأ ما، حاول مرة أخرى",
};

export function CategoryForm({
  parentOptions,
  defaultValues,
  categoryId,
}: {
  parentOptions: ParentOption[];
  defaultValues?: Partial<CategoryFormInput>;
  categoryId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      sortOrder: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  const isActive = watch("isActive");
  const imageValue = watch("image");

  async function onSubmit(values: CategoryFormInput) {
    setIsSubmitting(true);
    try {
      const result = categoryId
        ? await updateCategoryAction(categoryId, values)
        : await createCategoryAction(values);

      if (result.ok) {
        toast.success(categoryId ? "تم حفظ التعديلات" : "تم إنشاء القسم");
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast.error(errorMessages[result.error ?? "GENERIC"]);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <Input id="slug" dir="ltr" className="mt-1.5 text-start" placeholder="electronics" {...register("slug")} />
            {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div>
            <Label htmlFor="parentId">القسم الأب (اختياري)</Label>
            <select
              id="parentId"
              className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("parentId")}
              defaultValue=""
            >
              <option value="">بدون (قسم رئيسي)</option>
              {parentOptions
                .filter((p) => p.id !== categoryId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr}
                  </option>
                ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label>صورة القسم (اختياري)</Label>
            <div className="mt-1.5">
              <ImageUploader
                folder="categories"
                maxImages={1}
                value={imageValue ? [imageValue] : []}
                onChange={(urls) => setValue("image", urls[0] ?? "")}
              />
            </div>
            {errors.image && <p className="mt-1 text-xs text-destructive">{errors.image.message}</p>}
          </div>
          <div>
            <Label htmlFor="sortOrder">ترتيب الظهور</Label>
            <Input id="sortOrder" type="number" className="mt-1.5" {...register("sortOrder")} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <Checkbox id="isActive" checked={isActive} onCheckedChange={(v) => setValue("isActive", Boolean(v))} />
          <Label htmlFor="isActive" className="cursor-pointer font-normal">
            القسم مفعّل ويظهر في المتجر
          </Label>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-4 font-semibold">الوصف</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="descriptionAr">الوصف (عربي)</Label>
            <Textarea id="descriptionAr" className="mt-1.5" {...register("descriptionAr")} />
          </div>
          <div>
            <Label htmlFor="descriptionEn">الوصف (إنجليزي)</Label>
            <Textarea id="descriptionEn" dir="ltr" className="mt-1.5 text-start" {...register("descriptionEn")} />
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
          {isSubmitting ? "جارٍ الحفظ..." : categoryId ? "حفظ التعديلات" : "إنشاء القسم"}
        </Button>
      </div>
    </form>
  );
}
