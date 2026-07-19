import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { nameAr: "إلكترونيات", nameEn: "Electronics", slug: "electronics", icon: "📱" },
  { nameAr: "أجهزة منزلية", nameEn: "Home Appliances", slug: "home-appliances", icon: "🧺" },
  { nameAr: "أدوات مطبخ", nameEn: "Kitchen Tools", slug: "kitchen-tools", icon: "🍳" },
  { nameAr: "ديكور منزلي", nameEn: "Home Decor", slug: "home-decor", icon: "🖼️" },
  { nameAr: "مستحضرات تجميل", nameEn: "Beauty", slug: "beauty", icon: "💄" },
  { nameAr: "هدايا", nameEn: "Gifts", slug: "gifts", icon: "🎁" },
  { nameAr: "إكسسوارات", nameEn: "Lifestyle Accessories", slug: "lifestyle", icon: "👜" },
  { nameAr: "أجهزة ذكية", nameEn: "Smart Gadgets", slug: "smart-gadgets", icon: "⌚" },
] as const;

async function main() {
  console.warn("Seeding Tesla Mall database...");

  // ── Super admin ──────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  const admin = await prisma.user.upsert({
    where: { phone: "+967770288967" },
    update: {},
    create: {
      name: "Tesla Mall Admin",
      phone: "+967770288967",
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      locale: "ar",
    },
  });
  console.warn(`Admin ready: ${admin.phone}`);

  // ── Categories ───────────────────────────────────────────────────────
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        slug: c.slug,
        icon: c.icon,
        sortOrder: i,
        isActive: true,
      },
    });
    categoryMap.set(c.slug, category.id);
  }
  console.warn(`Seeded ${CATEGORIES.length} categories`);

  // ── Shipping zones (Yemen governorates) ─────────────────────────────
  const zones = [
    { governorate: "أمانة العاصمة", baseFee: 1500, expressFee: 3000, etaMinDays: 1, etaMaxDays: 2 },
    { governorate: "عدن", baseFee: 2500, expressFee: 4500, etaMinDays: 1, etaMaxDays: 3 },
    { governorate: "تعز", baseFee: 2000, expressFee: 4000, etaMinDays: 2, etaMaxDays: 3 },
    { governorate: "الحديدة", baseFee: 2500, expressFee: 4500, etaMinDays: 2, etaMaxDays: 4 },
    { governorate: "إب", baseFee: 2000, expressFee: null, etaMinDays: 2, etaMaxDays: 4 },
    { governorate: "حضرموت", baseFee: 3500, expressFee: null, etaMinDays: 3, etaMaxDays: 5 },
  ];
  for (const zone of zones) {
    const existing = await prisma.shippingZone.findFirst({
      where: { governorate: zone.governorate, city: null },
    });
    if (existing) {
      await prisma.shippingZone.update({
        where: { id: existing.id },
        data: {
          baseFee: zone.baseFee,
          expressFee: zone.expressFee ?? undefined,
          etaMinDays: zone.etaMinDays,
          etaMaxDays: zone.etaMaxDays,
        },
      });
    } else {
      await prisma.shippingZone.create({
        data: {
          governorate: zone.governorate,
          city: null,
          baseFee: zone.baseFee,
          expressFee: zone.expressFee ?? undefined,
          etaMinDays: zone.etaMinDays,
          etaMaxDays: zone.etaMaxDays,
        },
      });
    }
  }
  console.warn(`Seeded ${zones.length} shipping zones`);

  // ── Sample products ──────────────────────────────────────────────────
  const sampleProducts = [
    {
      sku: "TM-ELEC-0001",
      slug: "smart-led-bulb-rgb",
      nameAr: "لمبة LED ذكية ملونة",
      nameEn: "Smart RGB LED Bulb",
      descriptionAr: "لمبة إضاءة ذكية بتحكم عبر التطبيق وتغيير الألوان، متوافقة مع الأوامر الصوتية.",
      descriptionEn: "App-controlled smart bulb with full RGB color range and voice assistant support.",
      categorySlug: "smart-gadgets",
      price: 4500,
      compareAtPrice: 6000,
      quantity: 120,
      isFeatured: true,
      isNewArrival: true,
    },
    {
      sku: "TM-KITC-0001",
      slug: "stainless-steel-knife-set",
      nameAr: "طقم سكاكين ستانلس ستيل",
      nameEn: "Stainless Steel Knife Set",
      descriptionAr: "طقم سكاكين مطبخ احترافي من الستانلس ستيل عالي الجودة مع حامل خشبي.",
      descriptionEn: "Professional-grade stainless steel kitchen knife set with a wooden block.",
      categorySlug: "kitchen-tools",
      price: 8900,
      compareAtPrice: null,
      quantity: 60,
      isFeatured: true,
      isNewArrival: false,
    },
    {
      sku: "TM-BEAU-0001",
      slug: "vitamin-c-serum",
      nameAr: "سيروم فيتامين سي للبشرة",
      nameEn: "Vitamin C Facial Serum",
      descriptionAr: "سيروم مركّز بفيتامين سي لتفتيح البشرة وتوحيد لونها.",
      descriptionEn: "Concentrated vitamin C serum for brightening and evening skin tone.",
      categorySlug: "beauty",
      price: 3200,
      compareAtPrice: 4000,
      quantity: 200,
      isFeatured: false,
      isNewArrival: true,
    },
  ];

  for (const p of sampleProducts) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        sku: p.sku,
        slug: p.slug,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        descriptionAr: p.descriptionAr,
        descriptionEn: p.descriptionEn,
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        quantity: p.quantity,
        status: ProductStatus.ACTIVE,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        publishedAt: new Date(),
      },
    });
  }
  console.warn(`Seeded ${sampleProducts.length} sample products`);

  console.warn("Seeding complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
