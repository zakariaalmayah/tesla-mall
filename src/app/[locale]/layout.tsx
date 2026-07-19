import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import "@/app/globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!rawLocale || !(routing.locales as readonly string[]).includes(rawLocale)) notFound();
  const locale = rawLocale as (typeof routing.locales)[number];

  const t = await getTranslations({ locale, namespace: "site" });
  const title = locale === "ar" ? "تسلا مول | Tesla Mall" : "Tesla Mall | متجر تسلا مول";

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s | ${siteConfig.name[locale]}`,
    },
    description: t("tagline"),
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en" },
    },
    openGraph: {
      title,
      description: t("tagline"),
      url: `${siteConfig.url}/${locale}`,
      siteName: siteConfig.name[locale],
      locale: locale === "ar" ? "ar_YE" : "en_US",
      type: "website",
      images: [{ url: "/logo/tesla-mall-logo.png", width: 1024, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("tagline"),
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  if (!rawLocale || !(routing.locales as readonly string[]).includes(rawLocale)) notFound();
  const locale = rawLocale as (typeof routing.locales)[number];

  // Enables static rendering for this locale's server components.
  setRequestLocale(locale);

  // Fetch translation messages for client components.
  const messages = await getMessages();

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-dvh flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster position={dir === "rtl" ? "bottom-left" : "bottom-right"} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
