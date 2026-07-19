import { z } from "zod";

export const addressFormSchema = z.object({
  label: z.string().trim().min(1).max(40),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^(?:\+?967|0)?7\d{8}$/, "رقم هاتف غير صحيح (مثال: 770288967)"),
  governorate: z.string().trim().min(1),
  city: z.string().trim().min(1),
  district: z.string().trim().max(100).optional().or(z.literal("")),
  street: z.string().trim().min(2).max(200),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
});

export type AddressFormInput = z.infer<typeof addressFormSchema>;

export const placeOrderSchema = z.object({
  addressId: z.string().cuid().optional(),
  newAddress: addressFormSchema.optional(),
  shippingMethod: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
  customerNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
