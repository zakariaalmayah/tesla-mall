import { getTranslations } from "next-intl/server";
import { Search, ShoppingCart, Heart, User } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  const session = await auth();
  let cartUserId = session?.user?.id;
  if (!cartUserId) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cartUserId = cookieStore.get("guest_user_id")?.value;
  }

  let cartCount = 0;
  if (cartUserId) {
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId: cartUserId },
        select: {
          items: {
            select: { quantity: true },
          },
        },
      });
      if (cart) {
        cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    } catch {
      // If DB is unreachable, silently show 0 so the page still renders
      cartCount = 0;
    }
  }

  const navItems = [
    { key: "electronics", href: "/categories/electronics" },
    { key: "homeAppliances", href: "/categories/home-appliances" },
    { key: "kitchenTools", href: "/categories/kitchen-tools" },
    { key: "homeDecor", href: "/categories/home-decor" },
    { key: "beauty", href: "/categories/beauty" },
    { key: "gifts", href: "/categories/gifts" },
    { key: "smartGadgets", href: "/categories/smart-gadgets" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      {/* Top utility bar */}
      <div className="hidden border-b border-border/40 bg-ink-900 text-ink-100 md:block">
        <div className="container flex h-9 items-center justify-between text-xs">
          <span>{siteConfig.tagline.ar}</span>
          <div className="flex items-center gap-4">
            <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-gold-400">
              {siteConfig.contact.phoneDisplay}
            </a>
            <LocaleSwitcher variant="minimal" />
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <Logo className="w-32 md:w-36" />
        </Link>

        <form
          action="/search"
          className="hidden max-w-xl flex-1 items-center rounded-full border border-input bg-muted/50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-ring md:flex"
        >
          <Search className="size-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder={t("search")}
            className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>

        <nav className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/account/wishlist"
            className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label={t("wishlist")}
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/account"
            className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label={t("account")}
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/cart"
            className="relative flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label={t("cart")}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-600 text-[10px] font-bold text-white ring-2 ring-background transition-transform duration-300">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Category nav */}
      <div className="container hidden border-t border-border/40 md:block">
        <ul className="flex items-center gap-8 overflow-x-auto py-3 text-sm font-medium scrollbar-none">
          {navItems.map((item) => (
            <li key={item.key} className="shrink-0">
              <Link
                href={item.href as never}
                className="text-muted-foreground transition-colors hover:text-gold-600 dark:hover:text-gold-400"
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
