import { redirect, Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Package, MapPin, Heart } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: "ar" | "en" }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const tAccount = await getTranslations({ locale, namespace: "account" });

  const navItems = [
    { href: "/account/orders" as const, label: tAccount("myOrders"), icon: Package },
    { href: "/account/addresses" as const, label: tAccount("myAddresses"), icon: MapPin },
    { href: "/account/wishlist" as const, label: tAccount("myWishlist"), icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Icon className="size-4 text-muted-foreground" />
                {item.label}
              </Link>
            );
          })}
          <SignOutButton />
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
