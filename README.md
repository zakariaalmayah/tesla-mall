اول شي شغل المشروع
npm run dev




# Tesla Mall — متجر تسلا مول

Premium multi-category e-commerce platform for Yemen. Arabic-first (RTL), English secondary (LTR).

## Stack

- **Framework:** Next.js 15 (App Router, Server Actions, React 19)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui primitives + Framer Motion
- **i18n:** next-intl (Arabic default `/`, English `/en`)
- **Auth:** Auth.js v5 (phone + password credentials, Google OAuth, JWT sessions)
- **Database:** Supabase PostgreSQL via Prisma ORM
- **Storage:** Supabase Storage
- **Testing:** Vitest (unit) + Playwright (e2e)
- **CI/CD:** GitHub Actions → Vercel, Docker multi-stage build

## Getting started

```bash
cp .env.example .env        # fill in Supabase, Auth.js, payment gateway credentials
npm install
npm run db:generate
npm run db:migrate          # applies prisma/schema.prisma
npm run db:seed             # categories, shipping zones, admin user, sample products
npm run dev
```

Default seeded admin: phone `+967770288967`, password `ChangeMe123!` — **rotate immediately in any real environment.**

## Project structure

```
src/
  app/
    [locale]/            # localized routes (ar default, en secondary)
      layout.tsx          # html shell, fonts, providers, header/footer
      page.tsx             # homepage
    api/
      auth/[...nextauth]/  # Auth.js route handler
    robots.ts / sitemap.ts # SEO metadata routes
  components/
    ui/                    # shadcn-style primitives (Button, ...)
    layout/                # Header, Footer, Logo, locale/theme switchers
    storefront/            # ProductCard and other commerce UI
    providers/              # ThemeProvider etc.
  config/site.ts           # brand config, categories, contact info
  i18n/                    # next-intl routing + request config
  lib/                     # prisma client, auth, utils, fonts
  types/                   # ambient type augmentation
prisma/
  schema.prisma            # full data model
  seed.ts                  # dev seed data
messages/
  ar.json / en.json        # translation catalogs
e2e/                       # Playwright specs
```

## Design system

Colors are derived from the Tesla Mall logo: a metallic gold gradient
(`gold-50`…`gold-950`, core brand tone `gold-500 #C6A048`), pure white, and an
ink-black scale (`ink-50`…`ink-950`) used for dark-mode surfaces and
high-contrast text. Tokens live in `tailwind.config.ts` and
`src/app/globals.css` (HSL CSS variables so `next-themes` dark mode works
without a class-per-color rebuild).

Typography: **Cairo** for Arabic, **Inter** for English/Latin, loaded via
`next/font/google` in `src/lib/fonts.ts` and switched by `dir` on `<html>`.

## What's built so far (Part 1 of the full build)

- Repository scaffold, tooling (ESLint flat config, Prettier + Tailwind
  plugin, Husky/lint-staged), Docker + docker-compose, GitHub Actions CI
  (lint/typecheck/unit/e2e/docker) and a Vercel deploy workflow.
- Full Prisma schema: users/auth, addresses, catalog (categories, brands,
  products, variants, attributes, media, inventory logs), cart/wishlist,
  orders/payments/shipments, coupons, reviews, support tickets,
  notifications, audit log.
- i18n routing (Arabic default, English secondary, localized pathnames),
  translation catalogs, RTL/LTR handling end-to-end.
- Auth.js v5 wired to Prisma with phone+password credentials and Google
  OAuth, JWT session with role.
- Design system tokens (gold/ink palette, Cairo/Inter), dark mode.
- Storefront shell: header (search, cart, wishlist, account, locale/theme
  switch, category nav), footer, homepage (hero, trust strip, featured
  categories, best sellers, new arrivals) backed by real Prisma queries.
- SEO metadata routes (`robots.ts`, `sitemap.ts` generated from live data).
- Seed script with real category tree, Yemen shipping zones, and sample
  catalog data.

## Roadmap (remaining parts)

1. **Storefront depth** — category/listing pages with filters & pagination,
   product detail page (gallery, variants, reviews, related products),
   cart page + Server Actions, multi-step checkout, order confirmation/
   tracking, account area (profile, addresses, order history, wishlist).
2. **Admin dashboard** — products/categories/brands CRUD, order management
   & fulfillment, inventory, customers, coupons, analytics, CMS for
   homepage banners.
3. **API specification** — REST/Server Action contracts, request/response
   schemas (Zod), rate limiting, versioning.
4. **Payments** — Kuraimi Bank, Jawali, Jib Wallet integrations, cash on
   delivery flow, Stripe fallback, webhook handling, reconciliation.
5. **Shipping** — zone-based rate calculation (seeded), carrier tracking
   integration, label generation.
6. **Security hardening** — CSRF, rate limiting, input sanitization audit,
   RBAC middleware, secrets rotation policy, dependency scanning.
7. **Deployment runbook** — Vercel + Supabase production setup, environment
   promotion strategy, monitoring/alerting, backup policy.

This repository is built incrementally so every part ships as real,
runnable code — no placeholder files, no mock pages.
