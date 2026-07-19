"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/routing";

export function SignOutButton() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = React.useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction(locale))}
      className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {t("logout")}
    </button>
  );
}
