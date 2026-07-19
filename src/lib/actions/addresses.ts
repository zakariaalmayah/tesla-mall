"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addressFormSchema, type AddressFormInput } from "@/lib/validations/checkout";

export interface AddressActionResult {
  ok: boolean;
  error?: "UNAUTHENTICATED" | "INVALID_INPUT" | "NOT_FOUND" | "REFERENCED_BY_ORDERS" | "GENERIC";
}

export async function createAddressAction(input: AddressFormInput): Promise<AddressActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHENTICATED" };

  const parsed = addressFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const data = parsed.data;

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } });

  await prisma.address.create({
    data: {
      userId: session.user.id,
      label: data.label,
      fullName: data.fullName,
      phone: data.phone.startsWith("+") ? data.phone : `+${data.phone}`,
      governorate: data.governorate,
      city: data.city,
      district: data.district || null,
      street: data.street,
      landmark: data.landmark || null,
      isDefault: existingCount === 0,
    },
  });

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddressAction(addressId: string): Promise<AddressActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHENTICATED" };

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) {
    return { ok: false, error: "NOT_FOUND" };
  }

  try {
    await prisma.address.delete({ where: { id: addressId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false, error: "REFERENCED_BY_ORDERS" };
    }
    return { ok: false, error: "GENERIC" };
  }

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddressAction(addressId: string): Promise<AddressActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHENTICATED" };

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) {
    return { ok: false, error: "NOT_FOUND" };
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  return { ok: true };
}
