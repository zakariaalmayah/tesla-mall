import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: `${t("loginTitle")} | ${siteConfig.name[locale]}` };
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div>
      <h1 className="text-center text-2xl font-bold">{t("loginTitle")}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
