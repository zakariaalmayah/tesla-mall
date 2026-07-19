"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction, type AuthActionResult } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/routing";

const errorKeys: Record<NonNullable<AuthActionResult["error"]>, string> = {
  INVALID_INPUT: "errorGeneric",
  INVALID_CREDENTIALS: "errorInvalidCredentials",
  PHONE_TAKEN: "errorPhoneTaken",
  GENERIC: "errorGeneric",
};

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setIsSubmitting(true);
    try {
      const result = await registerAction(values, locale);
      if (!result.ok && result.error) {
        if (result.error === "PHONE_TAKEN") {
          toast.error(t("errorPhoneTaken"));
        } else {
          toast.error(t(errorKeys[result.error]));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" className="mt-1.5" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          dir="ltr"
          placeholder={t("phonePlaceholder")}
          className="mt-1.5 text-start"
          {...register("phone")}
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" type="password" className="mt-1.5" {...register("password")} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input id="confirmPassword" type="password" className="mt-1.5" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-destructive">{t("errorPasswordMismatch")}</p>
        )}
      </div>

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("registering") : t("registerButton")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-gold-600 hover:underline dark:text-gold-400">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
