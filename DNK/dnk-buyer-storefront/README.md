# Dak Ghar Niryat Kendra (DNK) — Global Buyer Storefront

A Next.js 14 (App Router, TypeScript, Tailwind CSS) buyer-facing storefront
for the DNK cross-border e-commerce platform: overseas buyers purchasing
directly from verified rural Indian artisan exporters, with escrow-protected
payments and automated PBE-III customs filing.

## Folder structure

```text
dnk-buyer-storefront/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout + Currency & Cart providers
│   │   ├── page.tsx                       # Global marketplace landing page
│   │   ├── not-found.tsx                  # Branded 404 page
│   │   ├── globals.css                    # Tailwind directives & slant utility
│   │   ├── [artisanSlug]/page.tsx         # Multi-tenant artisan storefront
│   │   ├── product/[id]/page.tsx          # Product detail page (PDP)
│   │   ├── checkout/page.tsx              # Escrow checkout flow
│   │   └── tracking/[barcode]/page.tsx    # Public postal tracking page
│   ├── components/
│   │   ├── layout/       Header, Footer, CurrencySelector
│   │   ├── home/         HeroSection, CraftCatalog, TrustBadges, OndcSection
│   │   ├── product/      ImageGallery, CustomShippingCalculator, EscrowExplainerModal
│   │   ├── checkout/     AddressForm, OrderSummary, EscrowPaymentForm
│   │   └── ui/           Badge, Button, Card
│   ├── context/          CartContext, CurrencyContext
│   ├── lib/               utils.ts (formatters), mockData.ts (shared products)
│   └── types/             index.ts (Product, Artisan, CartItem, EscrowDetails)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Running locally

This environment has no network access, so dependencies could not be
installed or the dev server started here — but the project is complete and
ready to run on your machine:

```bash
cd dnk-buyer-storefront
npm install
npm run dev
```

Then open `http://localhost:3000`.

## What's implemented

- **Landing page** — postal-branded hero with live CN23 tracking search,
  trust badges (escrow, PBE-III, verified exporters), a 3-item artisan craft
  catalog, and an ONDC cross-border network banner.
- **Product detail page** — image gallery, HS code badge, escrow explainer
  modal, and a live landed-cost calculator (item price + India Post air
  shipping, by destination country).
- **Checkout** — address form, mocked escrow payment vault, and an order
  summary with a landed-cost breakdown; submitting locks funds and shows a
  confirmation screen with a mock CN23 barcode.
- **Tracking page** — a CN23 barcode timeline showing postal acceptance,
  escrow release, customs clearance (LEO), and international handover.
- **Artisan storefront** — a per-artisan page (`/[artisanSlug]`) showing
  their profile (rating, IEC number, facility code) and their own listings.
- **Global state** — `CartContext` (add/remove/clear, persists for the
  session) and `CurrencyContext` (USD/EUR/GBP), both wired into the root
  layout.

## Notes for extending this

- `src/lib/mockData.ts` is the single source of truth for product and
  artisan data — swap it for real API calls when a backend is ready.
- `formatPrice()` and `calculateShippingCost()` in `src/lib/utils.ts` use
  placeholder exchange rates and a flat per-kg postal rate; replace with
  live FX and India Post rate-card lookups for production.
- The escrow and PBE-III flows shown throughout (checkout confirmation,
  tracking timeline) are mocked for demonstration — a production build
  would wire these to the Department of Posts / CBIC webhook events
  described in the architecture spec.
