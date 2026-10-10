# Pixenova

Image optimization & SEO suite for Shopify. Compresses product images to WebP,
writes AI alt text, and reports the measured savings plus live Core Web Vitals.

Embedded Shopify app built on React Router 7 + Polaris, with Prisma/Postgres for
sessions, usage metering and the image-size cache. Deployed as a Docker image.

## Design system

The whole visual identity — "Violet Nova" — lives in `app/styles/pixenova.css`.
Every colour, radius, bevel and shadow is declared in that file's `:root` block
and nowhere else, so re-theming is editing one block rather than hunting hex
codes. Two public stylesheets mirror the same tokens as literals because they
render outside the app shell: `app/routes/_index/styles.module.css` (the
splash) and `app/components/legal.module.css` (privacy / terms / support).

The language is defined by geometry as much as hue, since colour alone reads as
a re-skin:

- **Violet → fuchsia** on a plum ink, amber for attention, and an emerald
  reserved *only* for success, so a success tag can never be mistaken for a
  brand one.
- **Bevelled corners.** Panels cut their top-right corner by `--px-notch`.
- **Hexagonal icon frames**, not rounded squares or ringed circles.
- **Light hero.** Brand presence comes from a lavender wash, a radial nova glow
  and a gradient underline — type is never reversed out of a dark panel.
- **Accents run down the leading edge** of stat tiles, not across the top.
- **The usage meter** (`app/components/UsageMeter.jsx`) is one continuous
  striped track with the percentage called out beside it, not a row of
  segments — an in-track label has nothing to sit on at low usage, which is
  exactly when it matters most.

## Features

| Feature | Route | Plan |
| --- | --- | --- |
| Image optimizer — WebP conversion, smart compression, safe replacement, image order preserved | `/app/productoptimization` | All |
| AI alt text generator — one caption per product, applied to every image | `/app/alttextsuggestions` | Starter+ |
| Auto-optimize new products — background run on `products/create` | toggle on the optimizer page | Growth+ |
| Page Speed reports — measured savings + live PageSpeed Insights test | `/app/pagespeedimpactreports` | Growth+ |
| Analytics — size savings, compression by format, CSV export | `/app/imageoptimizationdashboard` | All |
| Billing — plan, quota meter, managed-pricing links | `/app/billing` | All |
| Help — how it works and FAQ | `/app/additional` | All |

Plan tiers, quotas and entitlements live in `app/plans.server.js`; the display
catalog for the pricing page is `app/planCatalog.js`. Billing is Shopify
**Managed Pricing**, so the app reads the active subscription to gate features
and links out to Shopify's hosted pricing page — it never creates charges.

## Architecture notes

- `app/optimize.server.js` — the encode pipeline. Downloads, re-encodes with
  sharp (two-pass WebP: a second lower-quality pass only for sources that
  compressed poorly), uploads via staged uploads, replaces the original, records
  per-image metafields. Images that would save less than `MIN_GAIN_PERCENT` are
  left alone and cost no quota.
- `app/catalog.server.js` + `app/routes/api.catalog.jsx` — the product list is
  built behind a resource route so the optimizer page paints immediately instead
  of waiting several seconds on the catalog crawl.
- `app/routes/api.optimize.jsx` — per-image API. The browser drives a queue of
  up to 6 concurrent images, so every response is a progress event.
- `app/usage.server.js` — monthly quota metering. Quota is *reserved* before the
  work and refunded if the image is skipped or fails, so concurrent requests
  cannot overshoot the plan limit.
- `app/routes/healthz.jsx` — readiness probe used by the Docker healthcheck and
  the Coolify proxy, so traffic only arrives once the server is actually serving.

## Local development

```bash
npm install
cp .env.example .env     # fill in credentials
npx prisma generate
npm run dev              # shopify app dev
```

`npm run build` produces the production bundle; `npm start` serves it.

## Deployment

Container build is defined by the `Dockerfile` (Node 20 Alpine). The start
command runs `prisma db push` before booting, so the schema is applied on every
deploy.

Required environment variables are listed in `.env.example`. At minimum:
`SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`,
`DATABASE_URL`, `OPENAI_API_KEY`, `PORT`.

`SHOPIFY_APP_URL` must match `application_url` and the `redirect_urls` in
`shopify.app.toml`, and those URLs must be configured in the Partner Dashboard.
