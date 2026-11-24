# Redesign: SEO preservation and structured data — spec

Issue: [#78](https://github.com/EB-Avocat/eb-avocat/issues/78), part of epic #65. Blocks #81, #82, #84
and #86 (they implement what this feature decides).

This feature produces **docs and design files only**: no production code. It decides, for the new site,
which URL answers what, what every page tells search engines (title, description, canonical, robots,
sitemap, JSON-LD), what local SEO needs, and how the launch is watched for 3 months. The implementation
issues (#79–#85) build it; #86 (QA and launch) runs the checks and the monitoring.

## State of the branches

This integration branch was cut at `aa79811` (PR #64). The orchestrator only brings `main` in at
integration time, so nodes read the inputs from git refs until then:

| Input | Ref | Path |
|---|---|---|
| #66 objectives and KPIs (K9 Search Console, K11 GBP) | `origin/main` (`23fcccc`) | `.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md` |
| #67 IA (site map, URL table, breadcrumbs) | `origin/main` | `.orchestrator/features/redesign-information-architecture-and-na/ia.md`, `url-table.md` |
| #69 brand (fonts Aleo + Direction A, palette) | `origin/main` | `.orchestrator/features/redesign-brand-direction-and-moodboard/brand.md` |
| #68 copy: meta titles and descriptions, h1, FAQ, Eva's answers (**approved by Eva as is, 2026-11-24**, PR not merged yet) | `origin/orch/redesign-copywriting-proof-and-editorial/integration` (`c08716e`) | `.orchestrator/features/redesign-copywriting-proof-and-editorial/copy.md`, `eva-content.md`, `editorial-guide.md` |
| Audit | this branch | `.orchestrator/features/plan-redesign/audit.md` (A-03, A-11, A-18, A-20, A-21, A-22) |

Read them with `git show <ref>:<path>`.

## Problems it resolves (audit)

- **A-03** only `/` and `/publications/*` can rank → the new pages (`/domaines`, 4 domaine pages,
  `/a-propos`, `/contact`) each get a full metadata set and their own JSON-LD.
- **A-20** one `Attorney` block on every page, placeholder `priceRange: "$$"`, no `Article`,
  `BreadcrumbList`, `Service`, `FAQPage`.
- **A-21** `lastModified: new Date()` on every sitemap URL; root layout defaults `canonical: "/"` for
  every route; `robots.txt` disallows `/carte`, so crawlers never see its `noindex`.
- **A-22** thin local SEO: no GBP link besides reviews, no map, `keywords` meta (ignored by Google),
  home h1 without Lyon, `SITE.title` 64 characters.

## What is already decided (inputs, not reopened)

- **#67 `url-table.md`: no URL that ranks today changes, so the IA needs no 301.** Old home anchors keep
  their ids; `/avis` is a 302 to Google; `/carte` keeps its URL (printed QR code) and loses the 307 for
  desktop user agents; `?page=n` is self-canonical; no `?origin` on `/contact`; secret back-office prefix
  never in `robots.txt`; breadcrumbs (and so `BreadcrumbList`) on domaine pages and articles only.
- **#68 `copy.md`** owns the words: every meta title and description, h1, FAQ items, NAP strings. Title
  pattern `<page part> | Eva Biezunski` (` | Eva Biezunski` = `SITE.titleSuffix`); home title
  « Eva Biezunski, avocate au Barreau de Lyon » (41 characters) without the suffix. Limits: title ≤ 60,
  description ≤ 155. Mécénat is **dropped** (E7): no `/domaines#mecenat`.
- **#68 `eva-content.md` E12 (answered 2026-11-24):** Eva has shared no contact URL anywhere; nothing to
  redirect beyond the kept `#contact` id. E9d (GBP place ID) is still pending.
- **#66:** nothing stored on the visitor's device without consent (no cookie banner) → no third-party
  embed that sets cookies (Google Maps iframe, etc.). K9 = Search Console, brand vs domaine queries.

## Deliverables

All in `.orchestrator/features/redesign-seo-preservation-and-structured/`.

| File | Owner | Content | Acceptance criterion of #78 |
|---|---|---|---|
| `url-inventory.md` | ux | Every URL the current site exposes (code, live `sitemap.xml`, published article slugs from the live API), its status code, index status, and what it does after launch. A Search Console section: how to export Performance → Pages and the Pages report, where to paste it, and the rule for each row (below); filled now if the export exists, else by #86 before launch. **Redirect map**: final list of 301 / 302 / 308 (expected short: the `cdn.` host 301, `/avis` 302, trailing slash 308, plus any legacy URL Search Console shows), each with source, target, status, where it lives (`vercel.json`, `next.config.ts` `redirects()`, route handler), and how #86 tests it | URL inventory and redirect map committed |
| `metadata.md` | ux | Per route type: title (key into `copy.md`), description, canonical, robots, sitemap entry and `lastModified` source, Open Graph / Twitter (type, image), JSON-LD types. Then the **JSON-LD spec**: the `@graph`, ids, every property and its source (constant, API field, copy key), and one complete example per page type, valid JSON. Then `robots.ts` and `sitemap.ts` target behaviour, and a checklist of code changes per implementation issue | Metadata and JSON-LD spec per page type |
| `local-seo.md` | ux | Local SEO checklist: each item, its current state (from the code / copy), target, owner issue, and status (done in copy / to build / Eva action) | Local SEO checklist done |
| `monitoring.md` | ux | Pre-launch baseline, launch-day checks, then a 3-month plan: what to look at, when, in which tool, the threshold that triggers action, and the action | Monitoring plan for 3 months |
| `design/og/*.png` + Figcraft frames | ui | Open Graph / social share images (see "Social share images") | supports A-20 / A-22 (shares and previews) |

## Decisions the lead proposes (ux validates, changes with a reason, or rejects)

### Canonicals and robots

1. **Remove the root default `alternates.canonical: "/"`** from `app/layout.tsx`. Each indexable route
   sets its own canonical (absolute through `metadataBase`, no query string, no trailing slash). A test
   in #86 (or the first implementation issue that touches metadata) fails if an indexable route has no
   canonical or a canonical that is not its own path.
2. **`/publications?category=…` (with or without `page`) → `noindex, follow`, no canonical.** Change
   from `url-table.md`, which canonicalised them to `/publications`: a filtered list is not a duplicate of
   the full list, so Google treats that canonical as a weak hint and may index the variants anyway, and
   `noindex` + a canonical to another URL is a contradictory pair. `noindex, follow` keeps the article
   links crawlable and keeps category lists from competing with domaine pages (ia §8 rule 2).
3. **`?page=n`:** `n ≥ 2` and within range → self-canonical, `index, follow` (as `url-table.md`).
   `page=1` → canonical `/publications`. Out of range or not a positive integer → **404** (`notFound()`),
   instead of today's 200 with page 1.
4. **Tracking parameters** (`utm_*`, `gclid`, `fbclid`…) never appear in a canonical (they don't, once
   canonicals are static paths).
5. **`/carte`: drop it from `robots.txt` `disallow`** so crawlers can read its `noindex, nofollow`
   meta. Keep `/api/` disallowed. **`/carte/vcard`** sends `X-Robots-Tag: noindex`. The `host` line goes
   (Yandex only). The secret back-office prefix is never listed (it already sends `X-Robots-Tag`).
6. **404, `error.tsx`, `global-error`:** `noindex` (404 keeps `follow`).

### Sitemap

- Lists only indexable, canonical URLs: `/`, `/domaines`, every domaine page **that passed the launch
  gate** (built from the one domaine list, `hasPage`), `/a-propos`, `/contact`, `/publications`, every
  published article, the two legal pages. Never `?page=`, `?category=`, `/carte`, `/avis`.
- **`lastModified` must be true or absent**, never the build time: articles → `updated_at`;
  `/publications` and `/` → the newest article's `updated_at` (both list the latest articles); static
  pages → omitted. Google ignores `changeFrequency` and `priority`: drop them.
- API gap: the public list (`PublicArticleList`) has no `updated_at`, only the detail has it. #82 adds
  it to the list serializer (`tox -e api-types`) and `getPublicationSlugs` returns `{ slug, updatedAt }`.
- A backend outage still falls back to the static entries (today's behaviour); the stale Notion comment
  goes.

### Titles and descriptions

- Words come from `copy.md`; this feature only checks them against SEO rules (≤ 60 / ≤ 155, Lyon and the
  service in every domaine title, one unique title and description per URL) and flags problems to the
  lead (the lead relays to #68; no wording change here).
- Root template becomes `%s | Eva Biezunski` (matches `SITE.titleSuffix`); home uses an absolute title.
- **Articles:** title = article title + suffix; description = `summary`, cut at a word boundary at
  155 characters. No new back-office field at launch (follow-up if Search Console shows truncated
  titles on articles that rank).
- Remove the `keywords` meta (ignored by Google, A-22).

### JSON-LD

One `@graph` per page, rendered server-side in the page body, with stable `@id`s so nodes reference each
other instead of repeating:

| Node | `@id` | On | Notes |
|---|---|---|---|
| `LegalService` (the cabinet) | `https://biezunski-avocat.fr/#cabinet` | every page | Replaces `Attorney` (`LegalService` is the `LocalBusiness` subtype Google reads for a firm; `Attorney` is kept as a second `@type` only if ux finds a reason). NAP from `CONTACT`, `geo`, `hasMap` (GBP URL), `sameAs` (LinkedIn, GBP), `founder` → `#eva`, `areaServed` Lyon / Auvergne-Rhône-Alpes / France (ux decides with the copy), `knowsAbout`. `openingHoursSpecification` only if Eva gives hours. **No `priceRange`**: fees are discussed in a convention d'honoraires (E5), and a `$$` placeholder says nothing true. **No `aggregateRating`**: Google ignores self-served ratings on `LocalBusiness` / `Organization` and treats marking up reviews shown on the site as self-serving |
| `Person` (Eva) | `https://biezunski-avocat.fr/a-propos#eva` | every page | `jobTitle` « Avocate », `worksFor` → `#cabinet`, `memberOf` Barreau de Lyon, `image`, `sameAs` LinkedIn, `url` `/a-propos` |
| `WebSite` | `https://biezunski-avocat.fr/#website` | every page | `name`, `inLanguage: "fr-FR"`, `publisher` → `#cabinet`. No `SearchAction` (no site search) |
| `WebPage` subtype | page URL | every page | `WebPage` (home, legal), `CollectionPage` (`/domaines`, `/publications`), `AboutPage` (`/a-propos`), `ContactPage` (`/contact`), `isPartOf` → `#website`, `breadcrumb` when there is one |
| `Service` | `<page URL>#service` | each domaine page | `name`, `serviceType`, `description` (copy), `provider` → `#cabinet`, `areaServed`, `audience` (professions libérales) |
| `FAQPage` | `<page URL>#faq` | each domaine page (≥ 3 FAQ by the launch gate) | Mirrors the visible FAQ exactly. No rich result expected (Google shows FAQ results only for government and health sites since 2023); kept because it is cheap, matches visible content and helps other engines |
| `BlogPosting` | `<article URL>#article` | each article | `headline`, `description` (summary), `datePublished` (`published_at`), `dateModified` (`updated_at`), `image` (cover, else the OG fallback), `author` → `#eva`, `publisher` → `#cabinet`, `mainEntityOfPage`, `articleSection` (categories), `inLanguage` |
| `BreadcrumbList` | `<page URL>#breadcrumb` | domaine pages and articles only | Same trail as the visible breadcrumb (ia §9) |

Rules: structured data matches visible content; "every page" means every indexable page: `/carte`, 404
and error pages carry no JSON-LD at all; built from typed helpers (#79 or the first page issue) with a unit test per page type that the output is
valid JSON and has the required properties. #86 runs Google's Rich Results Test and the Schema.org
validator on one URL of each page type.

### Local SEO

`local-seo.md` covers at least: home title and description with Lyon (done in copy); **home h1**;
NAP identical everywhere (site footer, `/contact`, JSON-LD, vCard, GBP, LinkedIn, Barreau de Lyon
directory, email signature) in one format from `CONTACT`; GBP link from the site (address link, `sameAs`,
`hasMap`) and the site link from GBP (it must point to `https://biezunski-avocat.fr/`, no `/#contact`);
GBP category and services aligned with the 4 domaines; **map**: a static map image (no iframe, nothing
set on the device, #66) linking to the GBP place, on `/contact` (design #74); métro / access line on
`/contact`; the Barreau de Lyon and other directory listings (Eva actions, not link building).

**Home h1 and Lyon:** the issue asks for an h1 "with Lyon and the audience". The Eva-approved h1
(« Structurer votre exercice libéral, en accord avec votre Ordre et vos associés. ») names the audience,
not Lyon. The lead's proposal: **keep the approved h1**; Lyon is carried by the home title, the
description, the eyebrow « Avocate au Barreau de Lyon » right above the h1 (#68 `HERO`), the NAP and
`LegalService`. Google weighs the title and the local signals far more than the h1 for "avocat … Lyon"
queries, and reopening approved copy costs a round with Eva. ux records this as the checklist status.

### Social share images

Today every page shares the portrait (835 × 1112, portrait ratio) as a `summary_large_image`, which
social networks crop. Target: 1200 × 630 images, under 300 KB, text inside a safe area that survives a
square crop:

- **default** (home and every page without its own): logo, « Eva Biezunski, avocate au Barreau de Lyon »,
  the positioning line;
- **domaine** template: domaine label (+ page h1 or short line), same frame; one image per domaine page;
- **article fallback** for articles without a cover: article title (template with a long-title case),
  « Publications » label. Articles with a cover share the cover.

ui designs them in Figcraft on Direction A / Aleo (`brand.md`; tokens from #70 if merged), exports PNGs
of each (with real titles: the longest domaine label, a 90-character article title), and writes a short
`design/og/README.md` for implementation: what is fixed and what is text, sizes, fonts, and whether #79
builds them as static PNGs (default, domaine) or with `next/og` `ImageResponse` (article fallback).

### Monitoring (outline; ux details it)

Baseline right before launch (Search Console 3-month Performance export by page and by query, brand vs
domaine split K9; Pages report; GBP insights K11; CrUX if any). Launch day: sitemap submitted, URL
Inspection on one URL per page type, redirect and status checks from the inventory, Rich Results Test.
Then weekly for 4 weeks, every 2 weeks to week 8, monthly to month 3: thresholds (for example brand
clicks below 80 % of baseline for 2 weeks running, any formerly ranking URL returning 404, coverage
errors, CWV regression) with the action for each. Owner of execution: #86.

## Tasks (after approval)

| # | Node | Task | Depends on |
|---|---|---|---|
| 1 | ux | `url-inventory.md` (with redirect map) and `metadata.md` (routes, sitemap, robots, JSON-LD with examples, code checklist per implementation issue) | — |
| 2 | ux | `local-seo.md` and `monitoring.md` | 1 |
| 3 | ui | Social share images in Figcraft + `design/og/*.png` + `design/og/README.md` | — |

ux and ui touch different files, so tasks 1 and 3 run in parallel. When they are merged, the lead
posts a summary comment on #78 with links, and on #81, #82, #84, #86 the parts each must build.

## Out of scope

Link building and paid acquisition (issue); any production code (implementation issues); copy wording
(#68); page layouts (#71–#75). Live access to Search Console and GBP: nodes do not have it; the
Search Console export is provided by the user or done by #86 (see `ux-brief.md`).

## Risks

- **Search Console may not exist yet** (K9 asked to create it on 2026-11-20). Without it, the inventory
  rests on the code, the live sitemap and Eva's E12 answer; #86 must re-run the Search Console step
  before launch and add a 301 for any legacy URL with impressions.
- **Domaine pages behind the launch gate**: metadata, sitemap and JSON-LD are specified for both cases
  (page exists / hub section fallback); the hub section never carries `Service` or `FAQPage` for a
  domaine without a page unless the FAQ is shown there.
- **Article slugs**: changing a published slug loses its ranking. Already a rule in `url-table.md`;
  `metadata.md` restates it and lists the 301-on-slug-change follow-up for #76 / #85.
