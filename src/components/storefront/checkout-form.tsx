"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, formatCurrency } from "@/lib/utils";
import { addressFormSchema, type AddressFormInput } from "@/lib/validations/checkout";
import { placeOrderAction, type PlaceOrderResult } from "@/lib/actions/checkout";

export interface CheckoutAddress {
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

export interface CheckoutShippingZone {
  governorate: string;
  baseFee: number;
  expressFee: number | null;
  freeThreshold: number | null;
  etaMinDays: number;
  etaMaxDays: number;
}

const errorMessageKeys: Record<NonNullable<PlaceOrderResult["error"]>, string> = {
  UNAUTHENTICATED: "errorGeneric",
  INVALID_INPUT: "errorGeneric",
  EMPTY_CART: "errorEmptyCart",
  NO_ADDRESS: "errorNoAddress",
  ADDRESS_NOT_FOUND: "errorNoAddress",
  NO_SHIPPING_ZONE: "errorNoShippingZone",
  OUT_OF_STOCK: "errorOutOfStock",
};

export function CheckoutForm({
  addresses,
  shippingZones,
  subtotal,
}: {
  addresses: CheckoutAddress[];
  shippingZones: CheckoutShippingZone[];
  subtotal: number;
}) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>(
    defaultAddress?.id ?? "new",
  );
  const [shippingMethod, setShippingMethod] = React.useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [customerNote, setCustomerNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { label: locale === "ar" ? "المنزل" : "Home" },
  });

  const watchedGovernorate = watch("governorate");

  const activeGovernorate =
    selectedAddressId === "new"
      ? watchedGovernorate
      : addresses.find((a) => a.id === selectedAddressId)?.governorate;

  const zone = shippingZones.find((z) => z.governorate === activeGovernorate) ?? null;
  const rawShippingFee = zone
    ? shippingMethod === "EXPRESS"
      ? zone.expressFee ?? zone.baseFee
      : zone.baseFee
    : null;
  const isFreeShipping =
    zone?.freeThreshold != null && subtotal >= zone.freeThreshold && rawShippingFee != null;
  const shippingFee = isFreeShipping ? 0 : rawShippingFee;
  const total = subtotal + (shippingFee ?? 0);

  async function submitOrder(newAddress?: AddressFormInput) {
    setIsSubmitting(true);
    try {
      const result = await placeOrderAction({
        addressId: selectedAddressId !== "new" ? selectedAddressId : undefined,
        newAddress: selectedAddressId === "new" ? newAddress : undefined,
        shippingMethod,
        customerNote,
      });

      if (result.ok && result.orderNumber) {
        router.push({
          pathname: "/checkout/confirmation/[orderNumber]",
          params: { orderNumber: result.orderNumber },
        });
        return;
      }

      const messageKey = result.error ? errorMessageKeys[result.error] : "errorGeneric";
      toast.error(t(messageKey));
    } finally {
      setIsSubmitting(false);
    }
  }

  function onNewAddressSubmit(values: AddressFormInput) {
    void submitOrder(values);
  }

  function handlePlaceOrderClick() {
    if (selectedAddressId === "new") {
      void handleSubmit(onNewAddressSubmit)();
    } else {
      void submitOrder();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Address selection */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("deliveryAddress")}</h2>

          <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="gap-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                htmlFor={`address-${address.id}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  selectedAddressId === address.id ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10" : "border-border",
                )}
              >
                <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                <div className="text-sm">
                  <p className="font-semibold">
                    {address.label} · {address.fullName}
                  </p>
                  <p className="text-muted-foreground">
                    {address.governorate} — {address.city}
                    {address.district ? ` — ${address.district}` : ""}, {address.street}
                  </p>
                  <p className="text-muted-foreground">{address.phone}</p>
                </div>
              </label>
            ))}

            <label
              htmlFor="address-new"
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                selectedAddressId === "new" ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10" : "border-border",
              )}
            >
              <RadioGroupItem value="new" id="address-new" />
              <span className="flex items-center gap-2 text-sm font-medium">
                <Plus className="size-4" />
                {t("addNewAddress")}
              </span>
            </label>
          </RadioGroup>

          {selectedAddressId === "new" && (
            <form className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="label">{t("label")}</Label>
                <Input id="label" className="mt-1.5" {...register("label")} />
                {errors.label && <p className="mt-1 text-xs text-destructive">{errors.label.message}</p>}
              </div>

              <div>
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <Input id="fullName" className="mt-1.5" {...register("fullName")} />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input id="phone" placeholder="+9677xxxxxxxx" className="mt-1.5" {...register("phone")} />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div>
                <Label htmlFor="governorate">{t("governorate")}</Label>
                <select
                  id="governorate"
                  className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("governorate")}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t("selectGovernorate")}
                  </option>
                  {shippingZones.map((z) => (
                    <option key={z.governorate} value={z.governorate}>
                      {z.governorate}
                    </option>
                  ))}
                </select>
                {errors.governorate && (
                  <p className="mt-1 text-xs text-destructive">{errors.governorate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">{t("city")}</Label>
                <Input id="city" className="mt-1.5" {...register("city")} />
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
              </div>

              <div>
                <Label htmlFor="district">{t("district")}</Label>
                <Input id="district" className="mt-1.5" {...register("district")} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="street">{t("street")}</Label>
                <Input id="street" className="mt-1.5" {...register("street")} />
                {errors.street && <p className="mt-1 text-xs text-destructive">{errors.street.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="landmark">{t("landmark")}</Label>
                <Input id="landmark" className="mt-1.5" {...register("landmark")} />
              </div>
            </form>
          )}
        </section>

        {/* Shipping method */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("shippingMethod")}</h2>
          <RadioGroup
            value={shippingMethod}
            onValueChange={(v: string) => setShippingMethod(v as "STANDARD" | "EXPRESS")}
            className="gap-3"
          >
            <label
              htmlFor="shipping-standard"
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-colors",
                shippingMethod === "STANDARD" ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10" : "border-border",
              )}
            >
              <span className="flex items-center gap-3">
                <RadioGroupItem value="STANDARD" id="shipping-standard" />
                <Truck className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("standard")}</span>
              </span>
              {zone && (
                <span className="text-sm text-muted-foreground">
                  {t("eta", { min: zone.etaMinDays, max: zone.etaMaxDays })}
                </span>
              )}
            </label>

            {zone?.expressFee != null && (
              <label
                htmlFor="shipping-express"
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-colors",
                  shippingMethod === "EXPRESS" ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10" : "border-border",
                )}
              >
                <span className="flex items-center gap-3">
                  <RadioGroupItem value="EXPRESS" id="shipping-express" />
                  <Truck className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("express")}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(zone.expressFee, locale)}
                </span>
              </label>
            )}
          </RadioGroup>
        </section>

        {/* Payment method */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("paymentMethod")}</h2>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-gold-500 bg-gold-50 p-4 dark:bg-gold-500/10">
            <span className="text-sm font-semibold">{t("cashOnDelivery")}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("cashOnDeliveryNote")}</p>
        </section>

        {/* Note */}
        <section>
          <Label htmlFor="customerNote">{t("customerNote")}</Label>
          <Textarea
            id="customerNote"
            className="mt-1.5"
            placeholder={t("notePlaceholder")}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">{t("title")}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tCart("subtotal")}</span>
            <span className="font-medium">{formatCurrency(subtotal, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tCart("shipping")}</span>
            <span className="font-medium">
              {shippingFee == null ? "—" : isFreeShipping ? t("freeShipping") : formatCurrency(shippingFee, locale)}
            </span>
          </div>
        </div>
        <div className="my-4 border-t border-border" />
        <div className="flex justify-between text-base font-bold">
          <span>{tCart("total")}</span>
          <span>{formatCurrency(total, locale)}</span>
        </div>

        <Button
          variant="gold"
          size="lg"
          className="mt-6 w-full"
          disabled={isSubmitting || !zone}
          onClick={handlePlaceOrderClick}
        >
          {isSubmitting ? t("placingOrder") : t("placeOrder")}
        </Button>
      </aside>
    </div>
  );
}
