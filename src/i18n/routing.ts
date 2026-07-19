import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed", // ar (default) has no prefix; en is prefixed as /en/*
  pathnames: {
    "/": "/",
    "/products": {
      ar: "/المنتجات",
      en: "/products",
    },
    "/products/[slug]": {
      ar: "/المنتجات/[slug]",
      en: "/products/[slug]",
    },
    "/categories/[slug]": {
      ar: "/الأقسام/[slug]",
      en: "/categories/[slug]",
    },
    "/cart": {
      ar: "/السلة",
      en: "/cart",
    },
    "/checkout": {
      ar: "/الدفع",
      en: "/checkout",
    },
    "/account": {
      ar: "/حسابي",
      en: "/account",
    },
    "/account/orders": {
      ar: "/حسابي/طلباتي",
      en: "/account/orders",
    },
    "/account/addresses": {
      ar: "/حسابي/عناويني",
      en: "/account/addresses",
    },
    "/account/wishlist": {
      ar: "/حسابي/المفضلة",
      en: "/account/wishlist",
    },
    "/orders": {
      ar: "/طلباتي",
      en: "/orders",
    },
    "/login": {
      ar: "/تسجيل-الدخول",
      en: "/login",
    },
    "/register": {
      ar: "/إنشاء-حساب",
      en: "/register",
    },
    "/checkout/confirmation/[orderNumber]": {
      ar: "/الدفع/تأكيد/[orderNumber]",
      en: "/checkout/confirmation/[orderNumber]",
    },
    "/admin": "/admin",
    "/admin/products": "/admin/products",
    "/admin/products/new": "/admin/products/new",
    "/admin/products/[id]/edit": "/admin/products/[id]/edit",
    "/admin/orders": "/admin/orders",
    "/admin/orders/[orderNumber]": "/admin/orders/[orderNumber]",
    "/admin/categories": "/admin/categories",
    "/admin/categories/new": "/admin/categories/new",
    "/admin/categories/[id]/edit": "/admin/categories/[id]/edit",
    "/admin/customers": "/admin/customers",
    "/admin/inventory": "/admin/inventory",
    "/admin/settings": "/admin/settings",
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
