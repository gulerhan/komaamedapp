# Koma Amed

Official multilingual website for the music group **Koma Amed**. Built as a fully static/SSG Next.js app (Turkish, English, German) and ready to deploy on Vercel.

Dark, cinematic, contemporary — inspired by Amed / Mesopotamia without costume folklore.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS 4 (design tokens as CSS variables)
- Motion + Lenis
- next-intl (`/ku`, `/tr`, `/en`, `/de` — default: `ku`)
- Radix UI dialog for the product drawer
- No backend, no database

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The proxy redirects `/` to `/ku`.

```bash
npm run build
npm run start
npm run lint
```

## Change musician / product content

1. **IDs, images, prices, categories** live in typed files:
   - `data/members.ts` — slugs, Unsplash (or local) images, gallery, featured flag
   - `data/products.ts` — slugs, category, price (TRY), image, featured flag
2. **All visible copy** lives in translation files:
   - `messages/tr.json`
   - `messages/en.json`
   - `messages/de.json`

Keep the same keys in all three JSON files. Member keys sit under `MembersContent.<slug>`. Product keys sit under `ProductsContent.<slug>`.

Musician pages use researched public biographies. If a quote, birthplace, or timeline item is not documented, leave the field empty — the UI hides empty blocks. Gallery images are atmospheric (stage, landscape, instrument), not substitute portraits.

If you add a new member slug, add it to:

- `data/types.ts` (`MemberSlug`)
- `data/members.ts`
- `MembersContent` in `tr.json`, `en.json`, `de.json`

Same pattern for products (`ProductSlug` + `ProductsContent`).

## Add a language

1. Add the locale to `i18n/routing.ts` (`locales` array).
2. Duplicate `messages/tr.json` to `messages/<locale>.json` and translate.
3. Keep every key in sync.

The navbar language switcher stays on the same page (`usePathname` + `router.replace`).

## Music embeds

Spotify artist embed and social URLs live in `lib/site.ts`. YouTube iframe is omitted until a verified clip URL is set.

## Contact form

Client-side validation only. By default the form opens a `mailto:` to `hello@komaamed.com`.

To use [Formspree](https://formspree.io):

```bash
NEXT_PUBLIC_FORMSPREE_ID=your_form_id
```

See `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to the production domain for canonical URLs, sitemap, and Open Graph.

## Deploy on Vercel

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Import the project in Vercel (Next.js preset).
3. Set environment variables:
   - `NEXT_PUBLIC_SITE_URL` — e.g. `https://komaamed.com`
   - `NEXT_PUBLIC_FORMSPREE_ID` — optional
4. Deploy. All locale routes are prerendered with `generateStaticParams` (SSG). Locale prefixing is handled by `proxy.ts` (next-intl).

## Project structure

```
app/[locale]/     pages, layout, OG image
components/       layout, sections, ui
data/             members, products, types
messages/         tr, en, de
i18n/             routing, navigation, request
lib/              fonts, seo, schema, site
public/
```
