import type { Metadata } from "next";
import { getAllShippingZonesAdmin } from "@/lib/queries/shipping";
import { ShippingZoneRow } from "@/components/admin/shipping-zone-row";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ locale: "ar" | "en" }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return { title: `الإعدادات | ${siteConfig.name[locale]}` };
}

export default async function AdminSettingsPage() {
  const zones = await getAllShippingZonesAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold">الإعدادات</h1>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="mb-4 font-semibold">معلومات المتجر</h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">اسم المتجر</dt>
              <dd className="mt-1 font-medium">
                {siteConfig.name.ar} / {siteConfig.name.en}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">النطاق</dt>
              <dd className="mt-1 font-medium" dir="ltr">
                {siteConfig.url}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">رقم الهاتف</dt>
              <dd className="mt-1 font-medium" dir="ltr">
                {siteConfig.contact.phone}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">الشعار</dt>
              <dd className="mt-1 font-medium">
                {siteConfig.tagline.ar} / {siteConfig.tagline.en}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            تعديل معلومات المتجر الأساسية غير مفعّل من الواجهة بعد — يتم حاليًا عبر ملف الإعدادات
            في الكود.
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="mb-1 font-semibold">مناطق ورسوم الشحن</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          هذه الرسوم تُستخدم مباشرة في حساب تكلفة الشحن أثناء إتمام الطلب.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-medium">المحافظة</th>
                <th className="px-4 py-3 text-start font-medium">شحن عادي</th>
                <th className="px-4 py-3 text-start font-medium">شحن سريع</th>
                <th className="px-4 py-3 text-start font-medium">حد الشحن المجاني</th>
                <th className="px-4 py-3 text-start font-medium">مدة التوصيل</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {zones.map((zone) => (
                <ShippingZoneRow key={zone.id} zone={zone} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
