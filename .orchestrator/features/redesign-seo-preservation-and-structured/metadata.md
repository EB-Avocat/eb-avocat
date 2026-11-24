# Metadata, robots, sitemap and JSON-LD (#78, task 1)

Owner: `ux`. What every page type tells search engines after launch: title, description, canonical,
robots, sitemap entry, Open Graph / Twitter, structured data. Then the JSON-LD spec, `robots.ts` and
`sitemap.ts`, the changes from the lead's proposals, and the code checklist per implementation issue.
Which URL answers what (status codes, redirects) is in `url-inventory.md`.

Sources: #68 `copy.md` (**copy §n**, keys in code font; approved by Eva 2026-11-24, words not reopened),
`editorial-guide.md` (**G §n**), #67 `ia.md` / `url-table.md`, the code at `aa79811`, the live site
(2026-11-24), Google Search Central structured data docs and schema.org (checked for each type, §4.6).

## 1. Global rules (every page)

| Item | Rule |
|---|---|
| `metadataBase` | `new URL(SITE.url)` (kept). Every canonical, `og:url` and image is absolute through it |
| Title | **Always absolute**: pages pass the full string from `copy.md` (the string Eva approved and the one the length check measures) through `pageMetadata`, which emits `title: { absolute }`. **No root `title.template`** (`title.default` = `SITE.title` only), so a suffix can never be added twice. Articles build their string with `withSuffix(title)` (§2.8). This is the one place the title mechanism is defined; other sections refer to it |
| Description | `copy.md` key per page; unique per URL (one exception: `/publications?page=n` reuses page 1's, P3); ≤ 155 |
| Canonical | **No root default** (`alternates.canonical: "/"` removed). Every indexable route sets its own: absolute, no query string (except `?page=n`, n ≥ 2), no trailing slash, no fragment. Noindex routes set none |
| Robots meta | Root default `index, follow` + `googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }` (kept: lets Google show the large share image and full snippets). Noindex routes override `robots` (Next replaces the whole key, so the `googleBot` part goes with it, which is what we want) |
| `keywords` | **Removed** (ignored by Google, A-22). `authors`, `creator` kept (harmless) |
| Open Graph | `siteName` « Eva Biezunski », `locale` `fr_FR`, `type` `website` (articles: `article`), **`url` = the page's canonical** (today the root sets `og:url` = home on every page: fixed by setting `openGraph.url` per page, or by a helper that builds `alternates` and `openGraph` together), `title` = the page's meta title, `description` = its meta description, `images` = the page's share image (1200 × 630, `ui`'s `design/og/README.md`) with `width`, `height`, `alt` |
| Twitter | `card: "summary_large_image"`, same title, description and image. No `site` / `creator` handle (Eva has no X account) |
| JSON-LD | One `<script type="application/ld+json">` per indexable page holding one `@graph` (§4), rendered server-side **in the page body** by the page (not the root layout: the root does not know the page). Noindex pages carry none |
| `<html lang>` | `fr` (kept; JSON-LD uses `inLanguage: "fr-FR"`) |

Share images, from `ui`'s `design/og/README.md` (authoritative on design, files and build), all 1200 × 630,
`image/png`:

| Page type | Image | Built as | `alt` (README rule 5) |
|---|---|---|---|
| home and every page without its own image (hub, `/a-propos`, `/contact`, `/publications` and its variants, legal, 404) | `/og/default.png` (`frontend/public/og/default.png`) | static PNG | « Eva Biezunski, avocate au Barreau de Lyon. Structurer votre exercice libéral, en accord avec votre Ordre et vos associés. » |
| domaine page, **only when `hasPage`** (a fallback section uses the default) | `/og/domaine-<slug>.png` | static PNG | « [label] — [h1]. Eva Biezunski, avocate au Barreau de Lyon. » |
| article with a cover | the cover (API `cover`) | — | `cover_alt`, else the article title |
| article without a cover | `/publications/<slug>/og-image` | `next/og` **route handler** `frontend/src/app/publications/[slug]/og-image/route.tsx` (not the `opengraph-image.tsx` file convention, which would override covers) | « [full title] — Publications, Eva Biezunski, avocate au Barreau de Lyon » (full title, never the truncated one) |

**Both `openGraph.images` and `twitter.images` are set on every indexable page** (with `width`, `height`,
`alt`). Next replaces nested metadata objects instead of merging them, so a page that sets its own
`openGraph` drops the layout's image: the `pageMetadata` helper (#79) always adds the page's image, the
default when it has none. #86 tests that every indexable route emits `og:image` and `twitter:image`.

## 2. Per page type

Lengths are characters of the exact French string (U+2019 apostrophes and U+00A0 counted as one).
« ✓ » = within the limit (title ≤ 60, description ≤ 155) and unique.

### 2.1 Home `/`

| Field | Value |
|---|---|
| Title | `SITE.title` (= `HOME.metaTitle`), absolute, no suffix: « Eva Biezunski, avocate au Barreau de Lyon » · 41 ✓ |
| Description | `SITE.description` (= `HOME.metaDescription`): « Avocate au Barreau de Lyon, j’accompagne les professionnels libéraux et les entrepreneurs : choix de la société, statuts, contrats, patientèle, Ordre. » · 150 ✓ |
| Canonical | `https://biezunski-avocat.fr/` (Next renders it without the slash; same URL) |
| Robots | index, follow (root default) |
| Sitemap | yes · `lastModified` = newest published article's `updated_at` (the home lists the latest articles); omitted when there is no article |
| OG / Twitter | `website` · `/og/default.png` |
| JSON-LD | `LegalService` `#cabinet`, `Person` `#eva`, `WebSite` `#website`, `WebPage` (`about` → `#cabinet`) |

### 2.2 Hub `/domaines`

| Field | Value |
|---|---|
| Title | `DOMAINES.hub.metaTitle`: « Domaines d’intervention \| Eva Biezunski » · 39 ✓ |
| Description | `DOMAINES.hub.metaDescription`: « Création de sociétés, clientèle ou patientèle, contrats, Ordre et déontologie : les domaines où j’accompagne les professionnels libéraux, à Lyon. » · 145 ✓ |
| Canonical | `/domaines` |
| Robots | index, follow |
| Sitemap | yes · `lastModified` omitted (static) |
| OG / Twitter | `website` · default image |
| JSON-LD | shared nodes + `CollectionPage`. For each domaine whose page **missed the gate**, its hub section (§2.4) adds a `Service` node |

### 2.3 Domaine page `/domaines/<slug>` (only for a page Eva validated, `hasPage: true`)

| Slug | Title (`DOMAINES.items[slug].metaTitle`) | Len | Description (`…metaDescription`) | Len |
|---|---|---|---|---|
| `creation-de-societe` | « Créer une SEL ou une SCM à Lyon \| Eva Biezunski » | 47 ✓ | « Vous vous installez ou vous vous associez ? Avocate à Lyon, je choisis avec vous la société adaptée, je rédige les statuts et je fais les démarches. » | 148 ✓ |
| `cession-clientele-patientele` | « Cession de patientèle ou de clientèle à Lyon \| Eva Biezunski » | 60 ✓ (at the limit) | « Vous cédez ou reprenez une patientèle ? Avocate à Lyon, je vous conseille sur la cession ou l’apport, et je rédige l’acte avec vous. » | 132 ✓ |
| `contrats-professionnels` | « Contrats de collaboration et de remplacement \| Eva Biezunski » | 60 ✓ (at the limit) · **no « Lyon »** (P1) | « Collaboration, remplacement, exercice en commun : avocate à Lyon, je rédige et je négocie les contrats des professionnels libéraux. » | 131 ✓ |
| `ordre-et-deontologie` | « Ordre, déontologie et contentieux ordinal \| Eva Biezunski » | 57 ✓ · **no « Lyon »** (P1) | « Question de déontologie, échange avec votre Ordre, contentieux ordinal : avocate à Lyon, je conseille et je défends les professionnels libéraux. » | 144 ✓ |

| Field | Value |
|---|---|
| Canonical | `/domaines/<slug>` |
| Robots | index, follow |
| Sitemap | yes, **only when `hasPage`** (built from the one domaine list, `DOMAINES.items`) · `lastModified` omitted |
| OG / Twitter | `website` · `/og/domaine-<slug>.png` (static, `hasPage` only) |
| JSON-LD | shared nodes + `WebPage` (`breadcrumb`, `mainEntity` → `#service`) + `BreadcrumbList` + `Service` + `FAQPage` (the page's visible FAQ, ≥ 3 items by the gate) |

### 2.4 Domaine fallback section `/domaines#<slug>` (a page that missed the gate)

Not a URL of its own: a fragment of `/domaines`. No title, description, canonical or sitemap entry; the
domaine page URL is **not created** (404) and not in the sitemap. On `/domaines`, the section adds one
`Service` node `@id` `https://biezunski-avocat.fr/domaines#<slug>`, `description` = `DOMAINES.items[slug].hubSection.text`
(the text shown there). **No `FAQPage`** (the hub section shows no FAQ). No `BreadcrumbList` (the hub has
no breadcrumb). The `CollectionPage` lists it in `mentions`.

### 2.5 `/a-propos`

| Field | Value |
|---|---|
| Title | `ABOUT.metaTitle`: « Mon parcours d’avocate à Lyon \| Eva Biezunski » · 45 ✓ |
| Description | `ABOUT.metaDescription`: « Eva Biezunski, avocate au Barreau de Lyon : son parcours et sa façon de travailler avec les professionnels libéraux et les entrepreneurs. » · 137 ✓ |
| Canonical / robots / sitemap | `/a-propos` · index, follow · yes, `lastModified` omitted |
| OG / Twitter | `website` · default image |
| JSON-LD | shared nodes + `AboutPage` (`about` and `mainEntity` → `#eva`) |

### 2.6 `/contact`

| Field | Value |
|---|---|
| Title | `CONTACT.metaTitle`: « Contacter le cabinet, avocate à Lyon \| Eva Biezunski » · 52 ✓ |
| Description | `CONTACT.metaDescription`: « Trois façons de joindre Eva Biezunski, avocate au Barreau de Lyon : formulaire, téléphone, email. 29 rue du Président Édouard Herriot, 69002 Lyon. » · 146 ✓ |
| Canonical / robots / sitemap | `/contact` (also for `?origin=…` if ever reached) · index, follow · yes, `lastModified` omitted |
| OG / Twitter | `website` · default image |
| JSON-LD | shared nodes + `ContactPage` (`about` and `mainEntity` → `#cabinet`) |

### 2.7 `/publications` and its query variants

| Variant | Title | Description | Canonical | Robots | Sitemap | JSON-LD |
|---|---|---|---|---|---|---|
| `/publications` | `PUBLICATIONS.metaTitle`: « Publications pour professionnels libéraux \| Eva Biezunski » · 57 ✓ | `PUBLICATIONS.metaDescription`: « Articles d’Eva Biezunski, avocate au Barreau de Lyon, pour les professionnels libéraux : sociétés, contrats, patientèle, Ordre et déontologie. » · 142 ✓ | `/publications` | index, follow | yes · `lastModified` = newest article `updated_at`, omitted when none | shared + `CollectionPage` |
| `?page=n`, 2 ≤ n ≤ pageCount | new key `PUBLICATIONS.metaTitlePage`: « Publications, page 2 \| Eva Biezunski » · 36 ✓ (P3; the list title + « , page n » would be 65) | `PUBLICATIONS.metaDescription` (same as page 1; acceptable on paginated lists, P3) | self `/publications?page=n` | index, follow | no | shared + `CollectionPage` (`@id` = its URL) |
| `?page=1` | as `/publications` | as `/publications` | `/publications` | index, follow | no | as `/publications` |
| `?page=` invalid / out of range | 404 page (§2.12) | — | — | 404 | no | none |
| `?category=<slug>` (± `page`) | as `/publications` | as `/publications` | **none** | **noindex, follow** | no | none (noindex) |
| `?category=<unknown>` | 404 page | — | — | 404 | no | none |

OG / Twitter: `website` · default image. A title must be unique per indexable URL, so page n ≥ 2 needs its
own title; see P3 for the 60-character issue and the chosen fix.

### 2.8 Article `/publications/<slug>`

| Field | Value |
|---|---|
| Title | `withSuffix(article.title)`: `title + SITE.titleSuffix` when the result is ≤ 60 (title ≤ 44), else the bare title (45 to 60 fits; > 60, which G §7 allows up to 70, is truncated by Google). Follow-up field `seo_title` if Search Console shows it hurts (P4) |
| Description | Article `summary`: as is if ≤ 155; else cut to ≤ 154 characters at the last space and « … » added (≤ 155). **Empty summary → no description meta** (Google builds a snippet), never the list's description (today's fallback gives every summary-less article the same description). #85 makes the summary required to publish |
| Canonical | `/publications/<slug>` |
| Robots | index, follow |
| Sitemap | yes · `lastModified` = `updated_at` |
| OG | `type: "article"`, `publishedTime` = `published_at`, `modifiedTime` = `updated_at`, `authors` = [`https://biezunski-avocat.fr/a-propos`] (OG wants profile URLs, not names), `section` = first category name, `tags` = category names; image = cover (`cover_alt`), else the generated fallback |
| Twitter | `summary_large_image`, same image |
| JSON-LD | shared + `WebPage` (`breadcrumb`) + `BreadcrumbList` + `BlogPosting` |
| Missing slug | `generateMetadata` calls `notFound()` too (today it returns a `Publications` title for a 404) |

### 2.9 Legal pages

| URL | Title | Len | Description | Len |
|---|---|---|---|---|
| `/mentions-legales` | « Mentions légales \| Eva Biezunski » (key to be created by #75; not in `copy.md`, R4 / O7) | 32 ✓ | today's string « Mentions légales du site Eva Biezunski Avocate : éditeur, hébergeur et médiation. » | 81 ✓ (short; fine for a legal page) |
| `/politique-de-confidentialite` | « Politique de confidentialité \| Eva Biezunski » | 44 ✓ | today's « Politique de confidentialité du site Eva Biezunski Avocate : traitement de vos données personnelles (RGPD). » | 107 ✓ |

Canonical self (exists) · index, follow · sitemap yes, `lastModified` omitted · OG `website`, default image ·
JSON-LD shared + `WebPage`. Kept indexable: they are thin but legitimate, and a « mentions légales » query on
the brand should find them.

### 2.10 `/carte`

Title `QR_CARD.metaTitle` « Eva Biezunski, carte de visite » (30, absolute) · no description needed (kept
none) · no canonical · **noindex, nofollow** (kept) · not in sitemap · **allowed** in `robots.txt` (so the
noindex is read) · no OG image of its own (default) · **no JSON-LD**. Answers 200 to every user agent (307
removed, `url-inventory.md` §7).

### 2.11 `/carte/vcard` and `/avis`

`/carte/vcard`: a `.vcf` file, no HTML: response header **`X-Robots-Tag: noindex`**; not in sitemap.
`/avis`: 302 to `REVIEW_URL` with `X-Robots-Tag: noindex`, `Cache-Control: no-store`; not in sitemap, not
linked (E9c).

### 2.12 404 (`not-found.tsx`, any unknown path)

Title `NOT_FOUND.metaTitle` « Page introuvable \| Eva Biezunski » (32) as `{ absolute }` (today the
template doubles it) · description none · **no canonical** (today it inherits `/`) · **noindex, follow**,
one robots meta (today two) · status 404 · no JSON-LD. Next.js already injects `<meta name="robots"
content="noindex">` on every 404 response (that is today's second meta), so `not-found.tsx` sets
`robots: null` (clears the root's `index, follow` without adding its own): Next's injected `noindex` is then
the only robots meta, and `follow` is the default when only `noindex` is given.

### 2.13 Error pages (`error.tsx`, `global-error.tsx`)

Client components cannot export `metadata`: render `<title>` and `<meta name="robots" content="noindex" />`
in the JSX (React 19 hoists them to `<head>`). Title « Une erreur est survenue \| Eva Biezunski » (39, from
`ERROR_PAGE.title` + suffix; `GLOBAL_ERROR.title` the same way). No canonical, no JSON-LD. The status is
500 when the error is thrown before streaming; it is not our concern beyond `noindex`. `error.tsx` renders
inside the root layout, whose metadata (`<title>` default, `index, follow`) is still emitted: the page then has
two titles and two robots metas. Google applies the most restrictive robots value, so `noindex` holds; #86's
« exactly one `<title>` » check applies to indexable routes only, not to error boundaries.

## 3. Title and description check

Every string of §2 against G §7 / spec: title ≤ 60, description ≤ 155, Lyon and the service in each
domaine title, one unique title and description per indexable URL. Checked by script on 2026-11-24 from
`copy.md` at `origin/main` `23fcccc` (#68 merged; same content as `c08716e`). All titles ≤ 60, all descriptions ≤ 155 (and in the 120–155 aim except the legal
pages), all unique except the paginated list's description (P3). Problems:

| # | Problem | Where | Severity | Proposal (lead relays to #68; no wording changed here) |
|---|---|---|---|---|
| P1 | **« Lyon » missing from two domaine titles** (spec rule « Lyon and the service in every domaine title ») | `contrats-professionnels` (60, no room), `ordre-et-deontologie` (57) | Medium: « avocat contrat de collaboration Lyon » style queries match the title first; the description, `LegalService` and GBP carry Lyon, so the page can still rank locally | **Keep at launch** (approved copy; a change costs a round with Eva), and revisit at the month-1 review of `monitoring.md` if those pages get impressions for « … lyon » queries at position > 10. Candidates that fit: « Contrats de collaboration à Lyon \| Eva Biezunski » (48, loses « remplacement »), « Contrats d’exercice libéral à Lyon \| Eva Biezunski » (50); « Ordre et contentieux ordinal à Lyon \| Eva Biezunski » (51), « Déontologie et contentieux ordinal à Lyon \| Eva Biezunski » (57) |
| P2 | Two titles at exactly 60 | `cession-clientele-patientele`, `contrats-professionnels` | Low: Google cuts by pixel width (~580 px desktop); 60 characters of this text fit; if cut, the suffix goes first, which is harmless | None |
| P3 | `/publications?page=n` needs a unique title; `PUBLICATIONS.metaTitle` + « , page n » is 65 | `/publications?page=n` | Low (page 2 exists only after 13 articles, `PAGE_SIZE` 12) | **New key for #68**: `PUBLICATIONS.metaTitlePage` = « Publications, page {{n}} \| Eva Biezunski » (≤ 38). The description stays `PUBLICATIONS.metaDescription` (duplicate descriptions on paginated lists are acceptable) |
| P4 | G §7 asks for a hand-written shorter meta title when an article's page part exceeds 44, but the spec says no new back-office field at launch | articles | Low | Rule of §2.8 (suffix only when it fits, else the bare title). G §7 stays the editorial aim; a `seo_title` field is a follow-up for #76 if Search Console shows truncated titles on articles that rank |
| P5 | Legal pages have no `copy.md` key and descriptions under 120 | legal | Low | Keep today's strings; #75 moves them to `copy.ts` |
| P6 | Home h1 has no « Lyon » (issue asks for it) | home | Low | Lead's proposal held (task 2, `local-seo.md`): Lyon is in the title, description, eyebrow `HERO.kicker`, NAP and `LegalService` |

## 4. JSON-LD spec

### 4.1 Shape

One `@graph` per indexable page, in a single `<script type="application/ld+json">` in the page body,
built by typed helpers (`frontend/src/lib/seo/jsonld.ts`, #79) from constants, copy keys and API fields:
never hand-written per page. The same three shared nodes appear in full on every indexable page, so each
page's graph is self-contained (Google resolves `@id` references within the page only).

| Node | `@type` | `@id` | On |
|---|---|---|---|
| Cabinet | `LegalService` | `https://biezunski-avocat.fr/#cabinet` | every indexable page |
| Eva | `Person` | `https://biezunski-avocat.fr/a-propos#eva` | every indexable page |
| Site | `WebSite` | `https://biezunski-avocat.fr/#website` | every indexable page |
| Page | `WebPage` / `CollectionPage` / `AboutPage` / `ContactPage` | the page's canonical URL | every indexable page |
| Breadcrumb | `BreadcrumbList` | `<page URL>#breadcrumb` | domaine pages, articles |
| Service | `Service` | `<page URL>#service`; hub fallback `https://biezunski-avocat.fr/domaines#<slug>` | domaine pages; hub section of a domaine without page |
| FAQ | `FAQPage` | `<page URL>#faq` | domaine pages |
| Article | `BlogPosting` | `<article URL>#article` | articles |

`@id`s are stable strings (never derived from the database id) so a node keeps its identity across
deploys. Page `@id` = canonical URL (with `?page=n` for page n ≥ 2).

### 4.2 Open points decided

| Point | Decision | Reason |
|---|---|---|
| Cabinet `@type` | **`LegalService` alone**, no `Attorney` | schema.org marks `Attorney` as superseded (« LegalService is more inclusive and less ambiguous »); Google's LocalBusiness docs ask for the most specific subtype and list `LegalService`. A second type adds nothing Google reads |
| Cabinet `name` | « Eva Biezunski » | Must match the GBP name exactly (the GBP place is « Eva Biezunski », from `REVIEW_URL`'s target) and the visible brand. NAP consistency beats a descriptive name |
| `areaServed` | **Lyon only** (`City`, `sameAs` Wikidata Q456) | Structured data must match the visible content: the copy says « à Lyon » and « Barreau de Lyon », never a region or « partout en France ». Add `AdministrativeArea` Auvergne-Rhône-Alpes or `Country` France only when the copy says so |
| `knowsAbout` | « Droit des sociétés », « Exercice libéral » (`HERO.panel.lines`), then the four domaine labels | Visible strings; replaces today's « Droit des affaires » (not on the new site) |
| `geo` | **45.76494, 4.8344** (Base Adresse Nationale, `api-adresse.data.gouv.fr`, match « housenumber », 29 Rue Président Edouard Herriot 69002 Lyon), 5 decimals | Good to ~1 m; computed now rather than waiting for the GBP pin. **But** the GBP place the review link opens carries coordinates **30.6959, −49.8171** (mid-Atlantic) in its Maps URL: the GBP pin or address looks wrong or hidden. Eva checks it (task 2, `local-seo.md`); once fixed, `geo` stays the BAN value unless the GBP pin differs by more than ~50 m |
| `hasMap` | `https://www.google.com/maps?cid=15633752146969655329` | The GBP place's CID, decoded from the place URL `REVIEW_URL` redirects to (`0xd8f63ebf1aa07821`). A stable link to the profile, available now; E9d (place ID) is only needed by the Places API. #86 checks it opens Eva's profile. Kept as constant `GBP_URL` in `constants.ts` |
| `sameAs` (cabinet) | LinkedIn, `GBP_URL` | Profiles that are the same entity. Barreau directory URL added when Eva gives it (task 2) |
| `openingHoursSpecification` | **none** | By appointment only (E4e); no hours to state |
| `priceRange`, `aggregateRating`, `review` | **none** | Fees in a convention d'honoraires (E5); self-served ratings on `LocalBusiness` are ignored and the reviews shown come from Google (marking them up is « self-serving », Google review snippet guidelines) |
| `logo` | `/images/logo-for-white-background.png` (300 × 244) | Google wants ≥ 112 × 112, crawlable, on white: fits |
| `image` (cabinet, Eva) | `/images/portrait.jpeg` (835 × 1112) | The only photo; replace when a photo session exists |
| `memberOf` (Eva) | `Organization` « Barreau de Lyon », `url` `https://www.barreaulyon.com/` | Visible (« Avocate au Barreau de Lyon »). #86 checks the URL |
| Domaine fallback | `Service` on `/domaines` for that section, no `FAQPage` (§2.4) | The section describes the service visibly, so the node matches content; FAQ is not shown there |
| `WebSite` `alternateName` | « Eva Biezunski Avocate » | Google's site-name feature reads `WebSite.name` / `alternateName` on the home; gives it the alternative it may pick |
| `SearchAction` | none | No site search |

### 4.3 Property tables

**`LegalService` `#cabinet`**

| Property | Value | Source | Req. | Why |
|---|---|---|---|---|
| `@type` | `LegalService` | constant | required | §4.2 |
| `@id` | `https://biezunski-avocat.fr/#cabinet` | constant | required | references |
| `name` | « Eva Biezunski » | `SITE.name` | required (Google) | = GBP name |
| `description` | `SITE.description` | copy §1.1 | optional | visible on home (meta + hero meaning) |
| `url` | `https://biezunski-avocat.fr/` | `SITE.url` + `/` | recommended | — |
| `logo` | `ImageObject` url, 300, 244 | constant | recommended | logo in knowledge panel |
| `image` | portrait URL | constant | recommended | LocalBusiness |
| `telephone` | `+33 7 56 85 62 75` | `CONTACT.phone` | recommended | NAP; international form |
| `email` | `eva@biezunski-avocat.fr` | `CONTACT.email` | optional | visible on every page |
| `address` | `PostalAddress`: `streetAddress` « 29 rue du Président Édouard Herriot », `postalCode` « 69002 », `addressLocality` « Lyon », `addressCountry` « FR » | `CONTACT.addressParts` | required (Google) | NAP |
| `geo` | `GeoCoordinates` 45.76494 / 4.8344 | new constant `CONTACT.geo` | recommended | §4.2 |
| `hasMap` | `GBP_URL` | new constant | optional | §4.2 |
| `areaServed` | `City` Lyon | constant | optional | §4.2 |
| `knowsAbout` | 6 strings | `HERO.panel.lines[1]` split + `DOMAINES.items[*].label` | optional | §4.2 |
| `founder` | `{ "@id": "#eva" }` | constant | optional | links the firm to Eva |
| `sameAs` | [LinkedIn, `GBP_URL`] | `LINKEDIN_URL`, `GBP_URL` | optional | entity reconciliation |

**`Person` `#eva`**

| Property | Value | Source | Req. | Why |
|---|---|---|---|---|
| `name` | « Eva Biezunski » | `SITE.name` | required | — |
| `jobTitle` | « Avocate » | constant (copy: « Avocate au Barreau de Lyon ») | optional | visible |
| `url` | `/a-propos` (absolute) | constant | recommended | author URL for articles (Google Article author best practice) |
| `image` | portrait | constant | optional | — |
| `worksFor` | `#cabinet` | constant | optional | — |
| `memberOf` | `Organization` Barreau de Lyon | constant | optional | visible credential |
| `sameAs` | [LinkedIn] | `LINKEDIN_URL` | optional | entity reconciliation |

**`WebSite` `#website`**: `url` home, `name` `SITE.name`, `alternateName` « Eva Biezunski Avocate »,
`inLanguage` « fr-FR », `publisher` → `#cabinet`. All from constants.

**Page node** (`WebPage` and subtypes)

| Property | Value | Source | Req. | Why |
|---|---|---|---|---|
| `@type` | §4.1 per page | constant per route | required | — |
| `@id`, `url` | canonical URL | route | required | — |
| `name` | the page's **h1** | copy key (`*.h1`; home: `SITE.title`) | recommended | visible heading |
| `description` | the page's meta description | copy key / summary | optional | — |
| `inLanguage` | « fr-FR » | constant | optional | — |
| `isPartOf` | `#website` | constant | recommended | — |
| `about` / `mainEntity` | `#cabinet` (home, hub, contact, publications), `#eva` (about), `#service` (domaine) | constant | optional | says what the page is about |
| `breadcrumb` | `#breadcrumb` | constant | domaine, article | — |
| `primaryImageOfPage` | share image | §1 | optional | — |
| `mentions` | hub fallback `Service` ids | `DOMAINES.items` with `!hasPage` | hub only | §2.4 |

**`BreadcrumbList`**: `itemListElement` = `ListItem` with `position` (1…n), `name` (`BREADCRUMB.home`,
`BREADCRUMB.domaines` / `BREADCRUMB.publications`, then the domaine label or the article title) and `item`
(absolute URL) on every crumb but the last (the visible last crumb is not a link; Google allows `item` to be
omitted on the last). Same trail as the visible breadcrumb (ia §9).

**`Service`**: `name` and `serviceType` = `DOMAINES.items[slug].label`; `description` = `.lead` (page) or
`.hubSection.text` (fallback); `url` = page URL (or `/domaines#<slug>`); `provider` → `#cabinet`; `areaServed`
= Lyon; `audience` = `Audience` with `audienceType` « Professionnels de santé libéraux, autres professions
libérales et entrepreneurs » (from `DOMAINES.template.forWhom.intro`).

**`FAQPage`**: `mainEntity` = one `Question` per visible FAQ item, in order: `name` = `.faq[i].q`,
`acceptedAnswer.text` = `.faq[i].a`, both plain text exactly as rendered (same U+00A0 / U+2019 characters,
no HTML). `isPartOf` → the page. A test asserts the questions equal the rendered `<details>` / headings.

**`BlogPosting`**

| Property | Value | Source | Req. | Why |
|---|---|---|---|---|
| `headline` | article title | API `title` | recommended | — |
| `description` | full summary | API `summary` | optional | — |
| `image` | [cover URL] or [fallback image URL] | API `cover` / generated | recommended | Article rich features need an image ≥ 1200 px wide for large previews |
| `datePublished` | ISO 8601 with offset | API `published_at` | recommended | — |
| `dateModified` | ISO 8601 | API `updated_at` | recommended | — |
| `author` | `{ "@id": "#eva" }` | constant (all articles are Eva's; if the API author is ever someone else, emit a `Person` with that name) | recommended | the `#eva` node carries `url` and `sameAs` |
| `publisher` | `#cabinet` | constant | optional | — |
| `mainEntityOfPage` | page `@id` | route | optional | — |
| `articleSection` | category names | API `categories[].name` | optional | — |
| `inLanguage`, `isPartOf` | « fr-FR », `#website` | constant | optional | — |

### 4.4 Rules

- Structured data says only what the page shows (Google's general guidelines). Every string comes from
  the same constant / copy key / API field that renders the visible text.
- Noindex pages (`/carte`, `?category=` lists, 404, errors, back-office) carry no JSON-LD.
- One `<script>` per page; the root layout's `Attorney` block is deleted.
- `JSON.stringify` the graph and escape every `<` as `\u003c` before `dangerouslySetInnerHTML` (an article
  title or summary containing `</script>` would otherwise break out of the tag).
- A unit test per page type (#79 helpers, vitest): output parses as JSON, has `@context` and `@graph`,
  every `{ "@id" }` reference resolves to a node of the same graph, the required properties of §4.3 are
  present, and the output equals the fixture in `jsonld/<type>.json` for the fixture inputs.

### 4.5 Examples

Complete, valid JSON, real values from `constants.ts`, `copy.md` and the research above. The full files
are committed in `jsonld/` next to this file (fixtures for #79's tests); the home example is printed in
full, the domaine page and the article print their page-specific nodes, and a table describes the others
(the three shared nodes are identical in every file).

**No published article exists today** (live API: count 0), so the article example uses an illustrative
article (title, summary, dates invented, in the house style); its structure is what matters.

#### Home `/` (`jsonld/home.json`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LegalService",
      "@id": "https://biezunski-avocat.fr/#cabinet",
      "name": "Eva Biezunski",
      "description": "Avocate au Barreau de Lyon, j’accompagne les professionnels libéraux et les entrepreneurs : choix de la société, statuts, contrats, patientèle, Ordre.",
      "url": "https://biezunski-avocat.fr/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://biezunski-avocat.fr/images/logo-for-white-background.png",
        "width": 300,
        "height": 244
      },
      "image": "https://biezunski-avocat.fr/images/portrait.jpeg",
      "telephone": "+33 7 56 85 62 75",
      "email": "eva@biezunski-avocat.fr",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "29 rue du Président Édouard Herriot",
        "postalCode": "69002",
        "addressLocality": "Lyon",
        "addressCountry": "FR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 45.76494,
        "longitude": 4.8344
      },
      "hasMap": "https://www.google.com/maps?cid=15633752146969655329",
      "areaServed": {
        "@type": "City",
        "name": "Lyon",
        "sameAs": "https://www.wikidata.org/wiki/Q456"
      },
      "knowsAbout": [
        "Droit des sociétés",
        "Exercice libéral",
        "Création de sociétés",
        "Clientèle ou patientèle",
        "Contrats professionnels",
        "Ordre et déontologie"
      ],
      "founder": {
        "@id": "https://biezunski-avocat.fr/a-propos#eva"
      },
      "sameAs": [
        "https://www.linkedin.com/in/eva-biezunski-36a4b691/",
        "https://www.google.com/maps?cid=15633752146969655329"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://biezunski-avocat.fr/a-propos#eva",
      "name": "Eva Biezunski",
      "jobTitle": "Avocate",
      "url": "https://biezunski-avocat.fr/a-propos",
      "image": "https://biezunski-avocat.fr/images/portrait.jpeg",
      "worksFor": {
        "@id": "https://biezunski-avocat.fr/#cabinet"
      },
      "memberOf": {
        "@type": "Organization",
        "name": "Barreau de Lyon",
        "url": "https://www.barreaulyon.com/"
      },
      "sameAs": [
        "https://www.linkedin.com/in/eva-biezunski-36a4b691/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://biezunski-avocat.fr/#website",
      "url": "https://biezunski-avocat.fr/",
      "name": "Eva Biezunski",
      "alternateName": "Eva Biezunski Avocate",
      "inLanguage": "fr-FR",
      "publisher": {
        "@id": "https://biezunski-avocat.fr/#cabinet"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://biezunski-avocat.fr/",
      "url": "https://biezunski-avocat.fr/",
      "name": "Eva Biezunski, avocate au Barreau de Lyon",
      "description": "Avocate au Barreau de Lyon, j’accompagne les professionnels libéraux et les entrepreneurs : choix de la société, statuts, contrats, patientèle, Ordre.",
      "inLanguage": "fr-FR",
      "isPartOf": {
        "@id": "https://biezunski-avocat.fr/#website"
      },
      "about": {
        "@id": "https://biezunski-avocat.fr/#cabinet"
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://biezunski-avocat.fr/og/default.png"
      }
    }
  ]
}
```

#### Domaine page `/domaines/creation-de-societe` (`jsonld/domaine.json`): page-specific nodes

```json
[
  {
    "@type": "WebPage",
    "@id": "https://biezunski-avocat.fr/domaines/creation-de-societe",
    "url": "https://biezunski-avocat.fr/domaines/creation-de-societe",
    "name": "Créer la société qui correspond à votre exercice",
    "description": "Vous vous installez ou vous vous associez ? Avocate à Lyon, je choisis avec vous la société adaptée, je rédige les statuts et je fais les démarches.",
    "inLanguage": "fr-FR",
    "isPartOf": {
      "@id": "https://biezunski-avocat.fr/#website"
    },
    "breadcrumb": {
      "@id": "https://biezunski-avocat.fr/domaines/creation-de-societe#breadcrumb"
    },
    "mainEntity": {
      "@id": "https://biezunski-avocat.fr/domaines/creation-de-societe#service"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://biezunski-avocat.fr/og/domaine-creation-de-societe.png"
    }
  },
  {
    "@type": "BreadcrumbList",
    "@id": "https://biezunski-avocat.fr/domaines/creation-de-societe#breadcrumb",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://biezunski-avocat.fr/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Domaines",
        "item": "https://biezunski-avocat.fr/domaines"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Création de sociétés"
      }
    ]
  },
  {
    "@type": "Service",
    "@id": "https://biezunski-avocat.fr/domaines/creation-de-societe#service",
    "url": "https://biezunski-avocat.fr/domaines/creation-de-societe",
    "name": "Création de sociétés",
    "serviceType": "Création de sociétés",
    "description": "Une société d’exercice libéral (SEL) pour exercer, une société civile de moyens (SCM) pour partager matériel et locaux : je choisis la forme avec vous.",
    "provider": {
      "@id": "https://biezunski-avocat.fr/#cabinet"
    },
    "areaServed": {
      "@type": "City",
      "name": "Lyon",
      "sameAs": "https://www.wikidata.org/wiki/Q456"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Professionnels de santé libéraux, autres professions libérales et entrepreneurs"
    }
  },
  {
    "@type": "FAQPage",
    "@id": "https://biezunski-avocat.fr/domaines/creation-de-societe#faq",
    "url": "https://biezunski-avocat.fr/domaines/creation-de-societe",
    "isPartOf": {
      "@id": "https://biezunski-avocat.fr/domaines/creation-de-societe"
    },
    "inLanguage": "fr-FR",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quelle société choisir pour exercer à plusieurs ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cela dépend de votre profession, du nombre d’associés et de ce que vous mettez en commun. Certaines professions n’ont accès qu’à certaines formes de société. Je compare les options avec vous avant de vous recommander une forme."
        }
      },
      {
        "@type": "Question",
        "name": "Dois-je prévenir mon Ordre quand je crée une société ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dans de nombreuses professions réglementées, oui : l’Ordre doit être informé, parfois autorisé, avant ou après la création. La règle dépend de votre profession. Je vérifie avec vous ce que prévoit la vôtre."
        }
      },
      {
        "@type": "Question",
        "name": "Qu’est-ce qu’un pacte d’associés, et en ai-je besoin ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "C’est un accord privé entre associés qui complète les statuts, par exemple en cas de départ ou de désaccord. Il n’est pas obligatoire. Il règle à l’avance ce qui pourrait vous opposer plus tard."
        }
      },
      {
        "@type": "Question",
        "name": "Combien cela coûte-t-il ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail."
        }
      }
    ]
  }
]
```

#### The other page types

Their files are complete graphs too (shared nodes + page nodes); only the page node differs from the home:

| Fixture | Page-specific nodes | Differs from the nearest example by |
|---|---|---|
| `jsonld/hub.json` | `CollectionPage` | `@type`, `@id` / `url` `/domaines`, hub h1 and description, no image |
| `jsonld/hub-fallback.json` | `CollectionPage` + `Service` `/domaines#ordre-et-deontologie` | as `hub.json`, plus `mentions` → the `Service`, whose `description` is `hubSection.text` (§2.4) |
| `jsonld/a-propos.json` | `AboutPage` | `about` and `mainEntity` → `#eva` |
| `jsonld/contact.json` | `ContactPage` | `about` and `mainEntity` → `#cabinet` |
| `jsonld/publications.json` | `CollectionPage` | list h1 and description |
| `jsonld/publications-page-2.json` | `CollectionPage` | as `publications.json`, `@id` / `url` `/publications?page=2` |
| `jsonld/legal.json` | `WebPage` | no `about`, no image |

#### Article `/publications/<slug>` (`jsonld/article.json`, illustrative article): page-specific nodes

```json
[
  {
    "@type": "WebPage",
    "@id": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs",
    "url": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs",
    "name": "SEL ou SCM : quelle société pour exercer à plusieurs ?",
    "description": "Exercer à plusieurs ne veut pas dire partager les mêmes choses. La société d’exercice libéral et la société civile de moyens répondent à deux besoins…",
    "inLanguage": "fr-FR",
    "isPartOf": {
      "@id": "https://biezunski-avocat.fr/#website"
    },
    "breadcrumb": {
      "@id": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs#breadcrumb"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs/og-image"
    }
  },
  {
    "@type": "BreadcrumbList",
    "@id": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs#breadcrumb",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://biezunski-avocat.fr/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Publications",
        "item": "https://biezunski-avocat.fr/publications"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "SEL ou SCM : quelle société pour exercer à plusieurs ?"
      }
    ]
  },
  {
    "@type": "BlogPosting",
    "@id": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs#article",
    "url": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs",
    "mainEntityOfPage": {
      "@id": "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs"
    },
    "headline": "SEL ou SCM : quelle société pour exercer à plusieurs ?",
    "description": "Exercer à plusieurs ne veut pas dire partager les mêmes choses. La société d’exercice libéral et la société civile de moyens répondent à deux besoins différents : voici comment choisir.",
    "image": [
      "https://biezunski-avocat.fr/publications/sel-ou-scm-quelle-societe-pour-exercer-a-plusieurs/og-image"
    ],
    "datePublished": "2026-12-08T09:00:00+01:00",
    "dateModified": "2026-12-10T17:42:00+01:00",
    "author": {
      "@id": "https://biezunski-avocat.fr/a-propos#eva"
    },
    "publisher": {
      "@id": "https://biezunski-avocat.fr/#cabinet"
    },
    "articleSection": [
      "Création de sociétés"
    ],
    "inLanguage": "fr-FR",
    "isPartOf": {
      "@id": "https://biezunski-avocat.fr/#website"
    }
  }
]
```

### 4.6 What earns a rich result (Google, checked 2026-11)

| Type | Google feature | Expected |
|---|---|---|
| `LegalService` | Local business details (knowledge panel, with GBP as the main source); logo | Supports the GBP panel; no snippet change |
| `WebSite` (name, alternateName) | Site name shown above the result | Yes, on the home |
| `BreadcrumbList` | Breadcrumb path instead of the URL | Desktop results only (Google dropped it on mobile in 2025) |
| `BlogPosting` | Article features (title, image, date in Discover / Top stories understanding) | No dedicated snippet; helps date and author display |
| `FAQPage` | FAQ rich result | **None** (only government and health sites since Aug. 2023); kept, cheap and matches content |
| `Service`, `Person`, `AboutPage`, `ContactPage`, `CollectionPage` | none | Entity understanding only (Google, Bing, other engines and LLM crawlers read them) |

#86 runs Google's Rich Results Test and validator.schema.org on one URL per page type (home, hub,
one domaine page, `/a-propos`, `/contact`, `/publications`, one article, one legal page): no error; warnings
only for optional properties.

## 5. `robots.ts` target

```ts
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/mcp"] },
		sitemap: `${SITE.url}/sitemap.xml`,
	};
}
```

Renders:

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /mcp

Sitemap: https://biezunski-avocat.fr/sitemap.xml
```

- `/carte` **removed** from `disallow`: a disallowed URL is never fetched, so its `noindex` is never read
  and the URL can still be indexed from links (« Indexed, though blocked by robots.txt »). Allowed, it is
  fetched and dropped.
- `host` **removed** (Yandex-only, and deprecated there).
- `/api/` kept (route handlers and Django; nothing to index). `/mcp` added (401, nothing to index).
- The secret back-office prefix is **never** listed (it would publish it); it sends `X-Robots-Tag`.
- `/media/`, `/images/`, `/_next/` stay allowed (Google needs CSS/JS/images to render; covers are
  images to index).

## 6. `sitemap.ts` target

```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const articles = await getPublicationSlugs(); // [{ slug, updatedAt }]; [] when the backend fails
	// Compare instants, not strings: the API emits +01:00 / +02:00 offsets (Europe/Paris).
	const newest = articles.length
		? new Date(Math.max(...articles.map((a) => Date.parse(a.updatedAt))))
		: undefined;

	return [
		{ url: absoluteUrl("/"), lastModified: newest },
		...SEO_ROUTES.filter((r) => r.inSitemap).map((r) => ({ url: absoluteUrl(r.path) })),
		{ url: absoluteUrl("/publications"), lastModified: newest },
		...articles.map((a) => ({
			url: absoluteUrl(`/publications/${a.slug}`),
			lastModified: a.updatedAt,
		})),
	];
}
```

`SEO_ROUTES` (§8 #79) holds `/domaines`, the domaine pages with `hasPage`, `/a-propos`, `/contact` and the
two legal pages; `absoluteUrl(path)` = `SITE.url + path`.

- Lists only indexable, canonical URLs; anything not `inSitemap` in `SEO_ROUTES` (`?page=`, `?category=`,
  `/carte`, `/avis`, a domaine page with `hasPage: false`) is out by construction.
- `lastModified` is **true or absent** (Next omits `<lastmod>` when `undefined`): articles `updated_at`;
  `/` and `/publications` the newest article's `updated_at`; static pages none. Never `new Date()`.
- No `changeFrequency`, no `priority` (Google ignores both).
- Home `loc` `https://biezunski-avocat.fr/` (with the slash or without: same URL; keep what Next renders).
- `getPublicationSlugs` returns `{ slug, updatedAt }[]` and `[]` on a backend failure (it reads through
  `getJson`), so an outage still serves the static entries. The stale « Notion » comment goes.
- Nothing to add for freshness: `getPublicationSlugs` fetches with the `articles` tag that
  `app/api/revalidate/route.ts` already busts when content changes.

## 7. Changes from the spec

| # | Lead proposal (`spec.md`) | Verdict | Reason / detail |
|---|---|---|---|
| C1 | Remove root `alternates.canonical: "/"`; each indexable route sets its own | **Validate** | Live check: the 404 page today declares canonical `https://biezunski-avocat.fr` |
| C2 | `?category=` → `noindex, follow`, no canonical | **Validate** | Plus: unknown category slug → 404 |
| C3 | `?page=n` self-canonical; `page=1` → `/publications`; invalid / out of range → 404 | **Validate, with two details** | (a) 404 only when the API answered; on a backend failure throw, so ISR keeps the last good page (a 404 there would deindex pages during an outage). (b) `n = 1` is valid even when there are 0 articles (empty state stays 200). Page n needs a unique title (P3, new copy key) |
| C4 | Tracking parameters never in a canonical | **Validate** | Holds with static canonicals |
| C5 | `/carte` out of `disallow`; keep `/api/`; `/carte/vcard` `X-Robots-Tag: noindex`; drop `host`; never the secret prefix | **Validate, plus** `Disallow: /mcp` | — |
| C6 | 404, `error.tsx`, `global-error` noindex (404 keeps `follow`) | **Validate, with how** | §2.12, §2.13 |
| C7 | Sitemap content and `lastModified` true or absent; drop `changeFrequency` / `priority`; `updated_at` in the list serializer | **Validate** | §6 |
| C8 | Titles from `copy.md`; root template `%s \| Eva Biezunski`; home absolute | **Change: no template** | §1. `copy.md` stores full strings (suffix included); a template would add it a second time, which is today's doubled 404 title |
| C9 | Article title = title + suffix | **Change** | §2.8 `withSuffix`: title + suffix would exceed 60 for most real article titles (G §7 allows 70) |
| C10 | Article description = summary cut at 155 | **Validate, plus** | Empty summary → no description meta (not the list description: duplicates across articles); #85 requires a summary to publish |
| C11 | Remove `keywords` | **Validate** | — |
| C12 | `LegalService` replaces `Attorney`, `Attorney` only if a reason | **Validate: `LegalService` alone** | §4.2 |
| C13 | `areaServed` Lyon / Auvergne-Rhône-Alpes / France (ux decides) | **Change: Lyon only** | §4.2 |
| C14 | `hasMap` = GBP URL (E9d pending) | **Validate, resolved now** | CID URL decoded from `REVIEW_URL`: no need to wait for E9d |
| C15 | No `priceRange`, no `aggregateRating` | **Validate** | Also no `review` |
| C16 | `WebSite` without `SearchAction` | **Validate, plus** `alternateName` | Site-name feature |
| C17 | Hub section of a gated domaine: no `Service` or `FAQPage` unless the FAQ is shown | **Change** | `Service` yes (its text is shown in the section), `FAQPage` no (§2.4) |
| C18 | `FAQPage`, `BlogPosting`, `BreadcrumbList` as specified | **Validate** | `BreadcrumbList` last item without `item`; `BlogPosting.author` → `#eva` |
| C19 | (not in spec) `og:url` | **Add** | Today every page's `og:url` is the home: shares of any page are attributed to `/` by some networks. Per-page `openGraph.url` |
| C20 | (not in spec) `www.` redirect | **Add** | Live answers 307; must be 308, versioned in `vercel.json` (`url-inventory.md` R2) |
| C21 | (not in spec) legacy `/avocate` | **Add** | 2022 WordPress page with the home's content → 308 to `/` (`url-inventory.md` R6) |

## 8. Code checklist per issue

Each item: file · expected behaviour. Tests named here are for #86 unless the issue says otherwise.

### #79 helpers and root layout

- [ ] `frontend/src/app/layout.tsx` · remove `alternates.canonical`, `keywords`, `title.template` and the
  `<script>`; **move** the `Attorney` `jsonLd` object into `lib/seo/jsonld.ts` as `cabinetNode()` and adapt it
  (§4.3: `LegalService`, add `geo`, `hasMap`, `logo`, `founder`; drop `priceRange`) rather than rewriting the
  `CONTACT` mapping; `title: { default: SITE.title }`; `openGraph` / `twitter` defaults with the default share image 1200 × 630
  (`/og/default.png`), no `url` at root level; keep `metadataBase`, `robots` + `googleBot`, icons.
- [ ] `frontend/src/lib/seo/routes.ts` (new) · `SEO_ROUTES`: one entry per static route (`path`,
  `indexable`, `inSitemap`, page `@type`, title and description copy keys, share image), domaine pages
  derived from `DOMAINES.items` with `hasPage`. `absoluteUrl(path)` (= `SITE.url + path`), `domaineUrl(d)`
  (`/domaines/<slug>` or `/domaines#<slug>`) and `domaineShareImage(d)` live here and are the only places
  these URLs are built (links, sitemap, JSON-LD, metadata). The sitemap, the metadata tests and the length
  check all iterate this list.
- [ ] `frontend/src/lib/seo/metadata.ts` (new) · `pageMetadata({ path, title, description, image?, indexable = true, type? })`
  emits `title: { absolute }` (§1); `indexable` → `alternates.canonical` = path and `openGraph.url` = path,
  else `robots: { index: false, follow: true }` and no canonical (never both); `openGraph` (title,
  description, `images`, `type`) and `twitter` (`card`, `images`) always set, `image` defaulting to
  `DEFAULT_SHARE_IMAGE` (§1). `withSuffix(title)` (§2.8) and `cutAtWord(text, max)` (word-boundary cut +
  « … », used with 155 for descriptions and with 85 by the og-image route) are exported from here.
- [ ] `frontend/src/lib/seo/jsonld.ts` (new) · typed builders: `cabinetNode()`, `evaNode()`, `websiteNode()`,
  `pageNode(type, { path, name, description, … })`, `breadcrumbNode(path, trail)`, `serviceNode(domaine, { fallback })`,
  `faqNode(path, faq)`, `blogPostingNode(article)`, `graph(...nodes)` (adds the three shared nodes) and
  `<JsonLd graph={…} indexable={…} />` (escapes per §4.4; renders nothing when the page is not indexable).
- [ ] `frontend/src/lib/constants.ts` / `copy.ts` · add `GBP_URL` = `https://www.google.com/maps?cid=15633752146969655329`,
  `CONTACT.geo` = `{ latitude: 45.76494, longitude: 4.8344 }`, `SITE.titleSuffix`; `SITE.title` /
  `SITE.description` from `copy.md` §1.1 (#68 strings).
- [ ] `frontend/src/lib/seo/jsonld.test.ts` · one test per page type against `jsonld/<type>.json` (copy the
  fixtures from the feature folder into `frontend/src/lib/seo/__fixtures__/`); every `@id` reference
  resolves; required properties present; serialised output contains no raw `</script`.
- [ ] Share images `frontend/public/og/default.png` and `domaine-<slug>.png` (from `ui`'s exports);
  `frontend/src/app/publications/[slug]/og-image/route.tsx` for the article fallback (`ui`'s README), cached:
  `export const revalidate = 3600`, fonts read once at module scope, the title read through
  `getPublicationBySlug` (tagged `articles`, so the existing `/api/revalidate` refreshes it).
- [ ] `frontend/src/lib/seo/metadata.test.ts` (vitest, no network) · over `SEO_ROUTES` and every page's
  `metadata` / `generateMetadata`: title equals the copy string, one suffix at most, ≤ 60; description ≤ 155
  and unique (except `?page=n`); canonical = `og:url`; `openGraph.images` and `twitter.images` set;
  `withSuffix` and `cutAtWord` cases (37, 44, 45, 70 characters; the 185-character summary of §4.5).
- [ ] `frontend/src/app/manifest.ts` · `name` follows the new `SITE.title` (no SEO effect; keep in sync).

### #80 home and header

- [ ] `frontend/src/app/page.tsx` · `metadata = pageMetadata({ path: "/", title: SITE.title, description: SITE.description })`
  (absolute title, no suffix); `<JsonLd graph={graph(pageNode("WebPage", { path: "/", name: SITE.title, about: CABINET_ID }))} />`.
- [ ] `frontend/src/app/avis/route.ts` (new, if `/avis` is built) · count the hit, then return
  `new Response(null, { status: 302, headers: { Location: REVIEW_URL, "Cache-Control": "no-store" } })`
  (`Response.redirect()` returns immutable headers). `X-Robots-Tag` comes from `vercel.json` (#86). Not linked (E9c).
- [ ] Footer and address links · the address links to `GBP_URL` (task 2 detail in `local-seo.md`).

### #81 domaine pages and hub

- [ ] `frontend/src/app/domaines/page.tsx` · hub metadata (§2.2); `CollectionPage`; for each domaine with
  `!hasPage`, a `serviceNode(d, { fallback: true })` and `mentions` on the page node; never `FAQPage`.
- [ ] `frontend/src/app/domaines/[slug]/page.tsx` · `generateStaticParams` = domaines with `hasPage` only;
  `dynamicParams = false` (any other slug → 404); metadata §2.3 with the domaine share image; JSON-LD
  `WebPage` + `BreadcrumbList` (Accueil › Domaines › label) + `Service` (`.lead`) + `FAQPage` (`.faq`, exactly
  the rendered items).
- [ ] Test · each shipped domaine page's `FAQPage` questions equal its rendered FAQ questions.

### #82 publications and sitemap

- [ ] `backend/articles/serializers.py` · add `updated_at` to `PublicArticleSerializer.Meta.fields` and drop it
  from `PublicArticleDetailSerializer`'s extra fields (it inherits it; listing it twice duplicates the name); then
  `tox -e api-types` (never hand-edit `schema.ts`); backend test that the list exposes it.
- [ ] `frontend/src/lib/publications.ts` · `getPublicationSlugs()` returns `{ slug, updatedAt }[]`;
  `generateStaticParams` in `[slug]/page.tsx` maps `.slug`.
- [ ] `frontend/src/app/sitemap.ts` · §6.
- [ ] `frontend/src/app/robots.ts` · §5 (no `/carte`, no `host`, add `/mcp`).
- [ ] `frontend/src/app/publications/page.tsx` · `generateMetadata({ searchParams })`: `?category=` →
  `robots: { index: false, follow: true }`, no canonical; `?page=n` (n ≥ 2) → canonical
  `/publications?page=n`, title `PUBLICATIONS.metaTitlePage` (P3); `page=1` → canonical `/publications`.
  Build that URL with `buildHref(page)` from `components/publications/Pagination.tsx` (export it to
  `lib/publications-parse.ts`), so the canonical, the JSON-LD `@id` and the pagination links share one rule.
  Metadata and body decide from one `resolvePublicationsView(searchParams, list)` → `{ indexable, path } | notFound`.
  Page body: invalid / out-of-range `page` or unknown `category` → `notFound()` **only when the API
  answered** (backend error → throw). JSON-LD `CollectionPage` on indexable variants only.
- [ ] `frontend/src/lib/publications.ts` · `getPublications` uses `getJsonOrThrow` (not `getJson`, which turns
  every failure into an empty list) so the page can tell « the API answered » from « the backend failed »; a
  `null` list (the API's 404 for an out-of-range page) means 404, a thrown error means throw.
- [ ] `frontend/src/lib/publications-parse.ts` · `parsePage` returns `null` (not 1) for a non-integer or
  < 1 value so the page can 404 it; `"1"` → 1.
- [ ] `frontend/src/app/publications/[slug]/page.tsx` · metadata §2.8 (title length rule, summary cut,
  no fallback description, OG article fields, cover or fallback image); missing slug → `notFound()` in
  `generateMetadata` too; JSON-LD `WebPage` + `BreadcrumbList` (Accueil › Publications › title) +
  `BlogPosting`; the visible breadcrumb replaces « ← Retour aux publications » (ia §9).
### #83 contact and à propos

- [ ] `frontend/src/app/contact/page.tsx` · metadata §2.6 (canonical `/contact` regardless of query);
  `ContactPage` with `mainEntity` → `#cabinet`.
- [ ] `frontend/src/app/a-propos/page.tsx` · metadata §2.5; `AboutPage` with `mainEntity` → `#eva`.
  (If `/a-propos` ships in another issue, the item moves with it.)

### #84 legal, 404, error, `/carte`

- [ ] `frontend/src/app/carte/page.tsx` · remove the user-agent check and `redirect("/")` (200 for every UA);
  `robots: { index: false, follow: false }` kept; title `{ absolute: QR_CARD.metaTitle }`; no JSON-LD.
- [ ] `frontend/src/app/carte/vcard/route.ts` · `export const dynamic = "force-static"` (pure constants,
  served from the CDN); `X-Robots-Tag` comes from `vercel.json` (#86).
- [ ] `frontend/src/app/not-found.tsx` · §2.12 (absolute title, `robots: null`, no canonical).
- [ ] `frontend/src/app/error.tsx`, `global-error.tsx` · `<title>` and `<meta name="robots" content="noindex" />` in JSX.
- [ ] `frontend/src/app/mentions-legales/page.tsx`, `politique-de-confidentialite/page.tsx` · `pageMetadata` with
  the §2.9 strings (absolute, with suffix), `WebPage` JSON-LD.

### #85 back-office slug and summary rules

- [ ] Article form · the `slug` field becomes read-only once the article has been published (`published_at`
  set); the API refuses a slug change on a published article (400). Follow-up (#76) only if editing is
  needed: a redirect table and `permanentRedirect()` from the old slug.
- [ ] Article form · publishing requires a non-empty `summary`; the form shows the 155 limit as a guide
  (counter), without blocking longer summaries (they are cut, §2.8).

### #86 tests, validation and launch

- [ ] `frontend/e2e/seo-redirects.spec.ts` (Playwright, `BASE_URL` = preview or production; `redirect: "manual"`) ·
  every row of `url-inventory.md` §7 (R1 to R6 and the `/carte` 200): status and `location`.
- [ ] `frontend/e2e/seo-meta.spec.ts` · what only a real render shows, on **one URL per page type** (the
  §4.6 list, plus `/carte`, a `?category=` list and a 404): exactly one `<title>`, one robots meta (or header),
  one canonical equal to its own absolute URL or none when noindex, `og:image` and `twitter:image` present,
  one `application/ld+json` that parses (none when noindex). The per-route data checks are the vitest of #79.
- [ ] Sitemap / robots test · `sitemap.xml` has exactly the §6 URLs, no `lastmod` equal to the request
  time, no `changefreq` / `priority`; `robots.txt` equals §5.
- [ ] `vercel.json` · add R2 (`www.` host → apex, permanent, next to R1), R6 (`/avocate`, `/avocate/` → `/`,
  permanent), any R7 row from the Search Console step, and one `headers` entry `X-Robots-Tag: noindex` for
  `/carte/vcard` and `/avis` (one place for non-HTML noindex; the proxy keeps the back-office's). With the
  user (team `eb-avocat`): remove the 307 redirect from the `www` domain's settings once R2 is deployed.
- [ ] Search Console step of `url-inventory.md` §6, one week before launch and on launch day.
- [ ] Rich Results Test + validator.schema.org on one URL per page type (§4.6); URL Inspection on the same.
