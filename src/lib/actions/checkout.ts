"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCartForUser } from "@/lib/queries/cart";
import { getShippingZoneForGovernorate } from "@/lib/queries/shipping";
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/validations/checkout";
import { generateOrderNumber } from "@/lib/utils";

export interface PlaceOrderResult {
  ok: boolean;
  error?:
    | "UNAUTHENTICATED"
    | "INVALID_INPUT"
    | "EMPTY_CART"
    | "NO_ADDRESS"
    | "ADDRESS_NOT_FOUND"
    | "NO_SHIPPING_ZONE"
    | "OUT_OF_STOCK";
  outOfStockItems?: string[];
  orderNumber?: string;
}

import { normalizePhone } from "@/lib/utils";

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const session = await auth();
  let userId = session?.user?.id;
  let cartUserId = userId;

  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }
  const { addressId, newAddress, shippingMethod, customerNote } = parsed.data;

  if (!userId) {
    // Guest checkout: must have a new address
    if (!newAddress) {
      return { ok: false, error: "NO_ADDRESS" };
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const guestUserIdCookie = cookieStore.get("guest_user_id")?.value;
    if (!guestUserIdCookie) {
      return { ok: false, error: "UNAUTHENTICATED" };
    }
    cartUserId = guestUserIdCookie;

    // Resolve or create user by phone number
    const phone = normalizePhone(newAddress.phone);
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: newAddress.fullName,
          phone,
          role: "CUSTOMER",
        },
      });
    }
    userId = user.id;
  } else {
    // Logged in user: must have either addressId or newAddress
    if (!addressId && !newAddress) {
      return { ok: false, error: "NO_ADDRESS" };
    }
  }

  const cart = await getCartForUser(cartUserId!);
  if (cart.items.length === 0) {
    return { ok: false, error: "EMPTY_CART" };
  }

  // Re-validate stock at the moment of purchase.
  const outOfStockItems = cart.items.filter((item) => {
    if (!item.trackInventory || item.allowBackorder) return false;
    return item.quantity > item.availableQuantity;
  });
  if (outOfStockItems.length > 0) {
    return {
      ok: false,
      error: "OUT_OF_STOCK",
      outOfStockItems: outOfStockItems.map((i) => i.nameAr),
    };
  }

  // Resolve delivery address.
  let address;
  if (addressId) {
    address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      return { ok: false, error: "ADDRESS_NOT_FOUND" };
    }
  } else if (newAddress) {
    const existingCount = await prisma.address.count({ where: { userId } });
    address = await prisma.address.create({
      data: {
        userId,
        label: newAddress.label,
        fullName: newAddress.fullName,
        phone: normalizePhone(newAddress.phone),
        governorate: newAddress.governorate,
        city: newAddress.city,
        district: newAddress.district || null,
        street: newAddress.street,
        landmark: newAddress.landmark || null,
        isDefault: existingCount === 0,
      },
    });
  }
  if (!address) {
    return { ok: false, error: "NO_ADDRESS" };
  }

  const zone = await getShippingZoneForGovernorate(address.governorate);
  if (!zone) {
    return { ok: false, error: "NO_SHIPPING_ZONE" };
  }

  let shippingTotal = shippingMethod === "EXPRESS" ? zone.expressFee ?? zone.baseFee : zone.baseFee;
  if (zone.freeThreshold != null && cart.subtotal >= zone.freeThreshold) {
    shippingTotal = 0;
  }

  const grandTotal = cart.subtotal + shippingTotal;
  const orderNumber = generateOrderNumber();

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: address.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "CASH_ON_DELIVERY",
        shippingMethod,
        subtotal: new Prisma.Decimal(cart.subtotal),
        shippingTotal: new Prisma.Decimal(shippingTotal),
        grandTotal: new Prisma.Decimal(grandTotal),
        currency: "YER",
        shippingSnapshot: {
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          governorate: address.governorate,
          city: address.city,
          district: address.district,
          street: address.street,
          landmark: address.landmark,
          etaMinDays: zone.etaMinDays,
          etaMaxDays: zone.etaMaxDays,
        },
        customerNote: customerNote || null,
      },
    });

    for (const item of cart.items) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          sku: item.slug,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          quantity: item.quantity,
          lineTotal: new Prisma.Decimal(item.lineTotal),
          image: item.image,
        },
      });

      if (item.trackInventory) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: item.variantId ? undefined : { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { soldCount: { increment: item.quantity } },
        });
      }
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        method: "CASH_ON_DELIVERY",
        status: "PENDING",
        amount: new Prisma.Decimal(grandTotal),
        currency: "YER",
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        note: "تم إنشاء الطلب — الدفع عند الاستلام",
      },
    });

    if (cart.cartId) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } });
    }
  }, {
    maxWait: 15000, // 15 seconds max wait to acquire connection
    timeout: 30000, // 30 seconds transaction timeout
  });

  revalidatePath("/cart");
  revalidatePath("/account/orders");

  return { ok: true, orderNumber };
}
