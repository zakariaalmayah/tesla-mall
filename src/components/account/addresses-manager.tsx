"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addressFormSchema, type AddressFormInput } from "@/lib/validations/checkout";
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/addresses";

export interface AddressRow {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  district: string | null;
  street: string;
  isDefault: boolean;
}

export function AddressesManager({
  addresses,
  governorates,
}: {
  addresses: AddressRow[];
  governorates: string[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = React.useState(addresses.length === 0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { label: "المنزل" },
  });

  async function onSubmit(values: AddressFormInput) {
    setIsSubmitting(true);
    try {
      const result = await createAddressAction(values);
      if (result.ok) {
        toast.success("تمت إضافة العنوان");
        reset();
        setShowForm(false);
        router.refresh();
      } else {
        toast.error("تعذّرت إضافة العنوان، تحقق من البيانات");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    setPendingId(id);
    deleteAddressAction(id)
      .then((result) => {
        if (result.ok) {
          router.refresh();
        } else if (result.error === "REFERENCED_BY_ORDERS") {
          toast.error("لا يمكن حذف عنوان مرتبط بطلب سابق");
        } else {
          toast.error("حدث خطأ ما");
        }
      })
      .finally(() => setPendingId(null));
  }

  function handleSetDefault(id: string) {
    setPendingId(id);
    setDefaultAddressAction(id)
      .then((result) => {
        if (result.ok) router.refresh();
      })
      .finally(() => setPendingId(null));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {address.label}
                  {address.isDefault && (
                    <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700 dark:bg-gold-500/10 dark:text-gold-400">
                      افتراضي
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{address.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {address.governorate} — {address.city}
                  {address.district ? ` — ${address.district}` : ""}, {address.street}
                </p>
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {address.phone}
                </p>
              </div>
              <button
                onClick={() => handleDelete(address.id)}
                disabled={pendingId === address.id}
                aria-label="حذف"
                className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {!address.isDefault && (
              <button
                onClick={() => handleSetDefault(address.id)}
                disabled={pendingId === address.id}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold-600 hover:underline disabled:opacity-50 dark:text-gold-400"
              >
                <Star className="size-3.5" />
                اجعله الافتراضي
              </button>
            )}
          </div>
        ))}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 rounded-xl border border-border p-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label htmlFor="label">اسم العنوان</Label>
            <Input id="label" className="mt-1.5" {...register("label")} />
            {errors.label && <p className="mt-1 text-xs text-destructive">{errors.label.message}</p>}
          </div>
          <div>
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input id="fullName" className="mt-1.5" {...register("fullName")} />
            {errors.fullName && (
              <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" dir="ltr" className="mt-1.5 text-start" placeholder="+9677xxxxxxxx" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="governorate">المحافظة</Label>
            <select
              id="governorate"
              className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("governorate")}
              defaultValue=""
            >
              <option value="" disabled>
                اختر المحافظة
              </option>
              {governorates.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.governorate && (
              <p className="mt-1 text-xs text-destructive">{errors.governorate.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">المدينة</Label>
            <Input id="city" className="mt-1.5" {...register("city")} />
            {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
          </div>
          <div>
            <Label htmlFor="district">الحي (اختياري)</Label>
            <Input id="district" className="mt-1.5" {...register("district")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="street">الشارع</Label>
            <Input id="street" className="mt-1.5" {...register("street")} />
            {errors.street && <p className="mt-1 text-xs text-destructive">{errors.street.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="landmark">أقرب معلم (اختياري)</Label>
            <Input id="landmark" className="mt-1.5" {...register("landmark")} />
          </div>

          <div className="flex justify-end gap-3 sm:col-span-2">
            {addresses.length > 0 && (
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
            )}
            <Button type="submit" variant="gold" disabled={isSubmitting}>
              {isSubmitting ? "جارٍ الحفظ..." : "حفظ العنوان"}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          إضافة عنوان جديد
        </Button>
      )}
    </div>
  );
}
