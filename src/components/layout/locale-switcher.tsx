"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ variant = "default" }: { variant?: "default" | "minimal" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(nextLocale: "ar" | "en") {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        variant === "minimal" ? "text-ink-200" : "rounded-full border border-input p-1",
      )}
    >
      <button
        type="button"
        onClick={() => switchTo("ar")}
        className={cn(
          "rounded-full px-2 py-1 transition-colors",
          locale === "ar" ? "text-gold-500" : "hover:text-gold-400",
        )}
        aria-current={locale === "ar"}
      >
        العربية
      </button>
      <span aria-hidden>/</span>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={cn(
          "rounded-full px-2 py-1 transition-colors",
          locale === "en" ? "text-gold-500" : "hover:text-gold-400",
        )}
        aria-current={locale === "en"}
      >
        English
      </button>
    </div>
  );
}
