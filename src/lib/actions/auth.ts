"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPathname, type Locale } from "@/i18n/routing";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations/auth";

export interface AuthActionResult {
  ok: boolean;
  error?: "INVALID_INPUT" | "INVALID_CREDENTIALS" | "PHONE_TAKEN" | "GENERIC";
}

import { normalizePhone } from "@/lib/utils";

export async function loginAction(input: LoginInput, locale: Locale): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  const redirectTo = getPathname({ locale, href: "/" });

  try {
    await signIn("credentials", {
      phone: normalizePhone(parsed.data.phone),
      password: parsed.data.password,
      redirectTo,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, error: "INVALID_CREDENTIALS" };
        default:
          return { ok: false, error: "GENERIC" };
      }
    }
    // NEXT_REDIRECT (and any other Next.js internal control-flow signal) must propagate.
    throw error;
  }
}

export async function signOutAction(locale: Locale): Promise<void> {
  const redirectTo = getPathname({ locale, href: "/" });
  await signOut({ redirectTo });
}

export async function registerAction(input: RegisterInput, locale: Locale): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  const { name, phone, password } = parsed.data;
  const normalizedPhone = normalizePhone(phone);

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        phone: normalizedPhone,
        passwordHash,
        role: "CUSTOMER",
        locale,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "PHONE_TAKEN" };
    }
    return { ok: false, error: "GENERIC" };
  }

  const redirectTo = getPathname({ locale, href: "/" });

  try {
    await signIn("credentials", { phone: normalizedPhone, password, redirectTo });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "GENERIC" };
    }
    throw error;
  }
}
