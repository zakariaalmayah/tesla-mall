import { getTranslations } from "next-intl/server";
import { Phone, MapPin, Facebook, Instagram } from "lucide-react";

import NextLink from "next/link";
import { Logo } from "@/components/layout/logo";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/config/site";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60 bg-ink-950 text-ink-200">
      <div className="container grid gap-10 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <Logo theme="dark" className="w-32" />
          <p className="max-w-xs text-sm leading-relaxed text-ink-300">
            {siteConfig.tagline.ar} · {siteConfig.tagline.en}
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href={siteConfig.social.facebook}
              className="flex size-9 items-center justify-center rounded-full border border-ink-700 transition-colors hover:border-gold-500 hover:text-gold-400"
              aria-label="Facebook"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href={siteConfig.social.instagram}
              className="flex size-9 items-center justify-center rounded-full border border-ink-700 transition-colors hover:border-gold-500 hover:text-gold-400"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">{tNav("categories")}</h3>
          <ul className="space-y-2 text-sm text-ink-300">
            {siteConfig.categories.slice(0, 6).map((c) => (
              <li key={c.key}>
                <Link href={{ pathname: "/categories/[slug]", params: { slug: c.slugEn } }} className="hover:text-gold-400">
                  {tNav(c.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">{t("about")}</h3>
          <ul className="space-y-2 text-sm text-ink-300">
            <li>
              <NextLink href="/about" className="hover:text-gold-400">
                {t("about")}
              </NextLink>
            </li>
            <li>
              <NextLink href="/terms" className="hover:text-gold-400">
                {t("terms")}
              </NextLink>
            </li>
            <li>
              <NextLink href="/privacy" className="hover:text-gold-400">
                {t("privacy")}
              </NextLink>
            </li>
            <li>
              <NextLink href="/returns" className="hover:text-gold-400">
                {t("returns")}
              </NextLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">{t("contact")}</h3>
          <ul className="space-y-3 text-sm text-ink-300">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-gold-500" />
              <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-gold-400">
                {siteConfig.contact.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-gold-500" />
              <span>Sana&apos;a, Yemen</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800 py-6">
        <p className="container text-center text-xs text-ink-400">
          © {year} {siteConfig.name.ar} · {siteConfig.name.en} — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
