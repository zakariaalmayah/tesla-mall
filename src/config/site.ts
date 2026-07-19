export const siteConfig = {
  name: {
    ar: "تسلا مول",
    en: "Tesla Mall",
  },
  tagline: {
    ar: "كل ما تحتاجه في مكان واحد",
    en: "Everything you need, in one place",
  },
  domain: "teslamall.com",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://teslamall.com",
  country: "YE",
  defaultCurrency: "YER",
  contact: {
    phone: "+967770288967",
    phoneDisplay: "770288967",
    whatsapp: "+967770288967",
  },
  social: {
    facebook: "https://facebook.com/teslamall",
    instagram: "https://instagram.com/teslamall",
    tiktok: "https://tiktok.com/@teslamall",
  },
  categories: [
    { key: "electronics", slugAr: "الكترونيات", slugEn: "electronics" },
    { key: "homeAppliances", slugAr: "اجهزة-منزلية", slugEn: "home-appliances" },
    { key: "kitchenTools", slugAr: "ادوات-مطبخ", slugEn: "kitchen-tools" },
    { key: "homeDecor", slugAr: "ديكور-منزلي", slugEn: "home-decor" },
    { key: "beauty", slugAr: "مستحضرات-تجميل", slugEn: "beauty" },
    { key: "gifts", slugAr: "هدايا", slugEn: "gifts" },
    { key: "lifestyle", slugAr: "اكسسوارات", slugEn: "lifestyle" },
    { key: "smartGadgets", slugAr: "اجهزة-ذكية", slugEn: "smart-gadgets" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
