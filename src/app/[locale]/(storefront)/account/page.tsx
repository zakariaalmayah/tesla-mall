import { redirect } from "@/i18n/routing";

export default async function AccountIndexPage({
  params,
}: {
  params: Promise<{ locale: "ar" | "en" }>;
}) {
  const { locale } = await params;
  redirect({ href: "/account/orders", locale });
}
