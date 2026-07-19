import { getTranslations } from "next-intl/server";
import { LayoutDashboard, Package, ShoppingBag, FolderTree, Users, Archive, Settings } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/layout/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: "ar" | "en" }>;
}) {
  const { locale } = await params;
  const admin = await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  const navItems = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/orders", label: t("orders"), icon: ShoppingBag },
    { href: "/admin/categories", label: t("categories"), icon: FolderTree },
    { href: "/admin/customers", label: t("customers"), icon: Users },
    { href: "/admin/inventory", label: "المخزون", icon: Archive },
    { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="flex min-h-dvh bg-secondary/30">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-background lg:flex">
        <div className="flex h-20 items-center px-6">
          <Link href="/admin">
            <Logo variant="mark" className="w-10" />
          </Link>
          <span className="ms-3 font-semibold">{t("adminPanel")}</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href as never}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Icon className="size-4 text-muted-foreground" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 py-1 text-xs text-muted-foreground">
            {t("welcomeBack")}, {admin.name}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo variant="mark" className="w-8" />
            <span className="font-semibold">{t("adminPanel")}</span>
          </Link>
          <SignOutButton />
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
