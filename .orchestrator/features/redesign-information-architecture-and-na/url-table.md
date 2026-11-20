# URL table (#67 → input of #78)

Owner: `ux`. Decisions and reasons are in `ia.md` (cited as §n). Host: `https://biezunski-avocat.fr`.
Conventions: French slugs, lowercase, hyphenated, no accents, **no trailing slash** (Next.js
answers `/x/` with a 308 to `/x`, keep it). Every indexable page sets its **own** canonical:
today the root layout defaults `canonical: "/"` for any route that forgets it (A-21), so a new
route without one would claim the home page.

Columns: *redirect* = what the old URL does after launch (none / 301 / 302 / client-side).
*Indexable* = `index` in robots meta. *Sitemap* = listed in `sitemap.xml`.

**No URL that ranks today changes.** No 301 is needed by this IA: every current page keeps its
URL, the new pages are new URLs, and the old home sections stay reachable through kept ids.

## 1. Pages

| New URL | Old URL | Redirect | Indexable | Sitemap | Canonical | Notes |
|---|---|---|---|---|---|---|
| `/` | `/` | none | yes | yes | `/` | Home, new section order (ia §6) |
| `/domaines` | — (was `/#domaines-intervention`) | none (new) | yes | yes | `/domaines` | Hub; holds `#mecenat` and, for any domaine page that misses the launch gate, its section (ia §2) |
| `/domaines/creation-de-societe` | — | none (new) | yes | yes | self | Only if it passes the launch gate (ia §2); else not created and links go to `/domaines#creation-de-societe` |
| `/domaines/cession-clientele-patientele` | — | none (new) | yes | yes | self | Same gate |
| `/domaines/contrats-professionnels` | — | none (new) | yes | yes | self | Same gate |
| `/domaines/ordre-et-deontologie` | — | none (new) | yes | yes | self | Same gate; replaces the « Contentieux » card (ia §2) |
| `/a-propos` | — (was `/#a-propos`) | none (new) | yes | yes | `/a-propos` | Holds `#formations` |
| `/contact` | — (was `/#contact`) | none (new) | yes | yes | `/contact` | The only form; no query parameter (origin: ia §12) |
| `/publications` | `/publications` | none | yes | yes | `/publications` | Unchanged |
| `/publications/[slug]` | same | none | yes | yes (one per published article) | `/publications/[slug]` | Unchanged; slugs come from the back-office and must not be edited once published (or #76 adds a 301 on slug change) |
| `/mentions-legales` | same | none | yes | yes | self (exists) | Unchanged |
| `/politique-de-confidentialite` | same | none | yes | yes | self (exists) | Unchanged |
| `/carte` | `/carte` | none — **remove** today's 307 to `/` for non-mobile User-Agents (A-11, ia §10) | no (`noindex, nofollow`, kept) | no | — | Printed QR code: URL must never change. #78 decides whether to drop `/carte` from `robots.txt` `disallow` so crawlers can read the noindex (A-21) |
| `/carte/vcard` | `/carte/vcard` | none | no (send `X-Robots-Tag: noindex`; it is a `.vcf`, no meta tag possible) | no | — | Must stay dynamic, one count per 200 (#66 K7) |
| `/avis` | — | **302** → Google review URL (`REVIEW_URL`, or the direct "write a review" link if Eva provides it, ia Q8) | no (redirect) | no | — | New printable short link (ia §5); server counts hits (#80) |
| 404 (any unknown path) | same | none | no (`noindex, follow`, kept) | no | — | Links: home, `/domaines`, `/publications`, `/contact`, phone (ia §8). Today it links to `/#contact` |

## 2. Query parameters

| New URL | Old URL | Redirect | Indexable | Sitemap | Canonical | Notes |
|---|---|---|---|---|---|---|
| `/publications?category=<slug>` | same | none | follow; not meant to rank | no | `/publications` (as today) | Kept as today. Domaine pages, not category lists, target topic queries (ia §8 rule 2), so the list must not compete with them. Linked from domaine pages and article category chips |
| `/publications?page=<n>` (n ≥ 2) | same | none | yes | no | **self** (`/publications?page=n`) — **change**: today canonical is `/publications` | Google treats page 2+ as distinct content; pointing them to page 1 hides older articles' list context. Articles are in the sitemap anyway |
| `/publications?category=<slug>&page=<n>` | same | none | follow; not meant to rank | no | `/publications` | Same as `?category=` |
| `/publications?page=1` | same | none | — | no | `/publications` | The pagination never emits `page=1`; canonical to the clean URL |
| `/publications?page=<invalid or out of range>` | same | none | no (#78 picks: 404, or `noindex`) | no | `/publications` | Today `parsePage` falls back and the page answers 200 with the first page or the empty state |
| `/contact?origin=…` | — | **not used** | — | — | — | The CTA origin travels in `sessionStorage` + same-origin referrer, not in the URL (ia §12). If such a URL is ever reached (hand-typed), it renders `/contact` with canonical `/contact` |
| Any other parameter (`utm_*`, `fbclid`, `gclid`…) on any page | same | none | follows the page | no | the page's clean URL | Canonicals never include query strings, except `?page=n` above |

## 3. Old hash anchors (home)

Fragments never reach the server, so no HTTP redirect is possible. Decision (ia §14): **keep each
id on the new page, no client-side redirect script.** An unknown fragment simply leaves the page
at the top, which is the right result for `#accueil`.

| Old URL | Where it lands after launch | Redirect | Likely in use? | Notes |
|---|---|---|---|---|
| `/#accueil` | Top of home: id kept on the hero | none (id kept) | Low: the old logo link on home; not shared | — |
| `/#a-propos` | Home À propos teaser (id `a-propos`), which links to `/a-propos` | none (id kept) | Low-medium: old nav link, could be in shares | — |
| `/#domaines-intervention` | Home Domaines section (id kept), links to each domaine page | none (id kept) | Low-medium: old nav link | — |
| `/#avis` | Footer « Le cabinet » group on home (id `avis` on the review link group) | none (id moved to the footer) | Medium: the old « Votre avis » nav link; Eva may have sent it to clients (ia Q6) | The home band is removed (ia §5) |
| `/#contact` | Home contact band (id kept): CTA to `/contact`, phone, email | none (id kept) | **High**: the current 404 page links to it; likely in emails / signature / GBP (ia Q6) | From launch, the site itself links to `/contact`, never to `/#contact` |
| `/publications#…`, `/mentions-legales#…` | Same page | none | Low | In-page headings only |

## 4. Technical routes

| URL | Redirect | Indexable | Sitemap | Notes |
|---|---|---|---|---|
| `/sitemap.xml` | none | — | — | Add the new pages (§1). #78: real `lastModified` (article `updatedAt`), not build time (A-21) |
| `/robots.txt` | none | — | — | Today `disallow: /carte, /api/`. #78 reviews `/carte` (A-21) |
| `/manifest.webmanifest`, `/apple-icon.png`, `/icon-*.png`, `/images/favicon*.svg` | none | no | no | Keep paths |
| `/images/*` | none | no | no | **Keep paths**: `/images/icons/*` and logos are hot-linked by Eva's email signature (`scripts/generate-signature-images.ts`) |
| `/fonts/*` | none | no | no | May change with #69 (WOFF2); not linked from outside |
| `/media/*` | none | no | no | Covers and avatars (Vercel Blob); also served on `cdn.biezunski-avocat.fr/media/*` |
| `cdn.biezunski-avocat.fr/<anything but media/>` | **301** → `https://biezunski-avocat.fr/<path>` (exists in `vercel.json`) | no | no | Existing redirect; `spec.md` says none exist: this is the one |
| `/api/contact`, `/api/revalidate` | none | no | no | Next route handlers; `disallow: /api/` |
| `/api/v1/*`, `/mcp` | none | no | no | Django (Vercel Services rewrite) |
| `/backoffice/*` | none | no (`noindex, nofollow`, kept) | no | Not linked from the public site |
| `/_next/*` | none | no | no | Framework assets |

## 5. Legacy URLs (#78 must pull them)

URLs that existed **before this codebase** (an older site at this domain, if any) are unknown here.
There is no Search Console property yet (#66 K9, to be created now). #78 must, once it exists:

1. Export the pages with impressions or clicks (Performance → Pages, max range) and the "Not
   found (404)" and "Page with redirect" lists (Pages report).
2. Add a 301 for every legacy URL that has impressions, backlinks or clicks, to the closest new
   page (domaine page > hub > home). Never redirect everything to `/`.
3. Until the property has data: Eva's answer to ia Q6 (old site? links shared with anchors? GBP
   website field), and the old URLs the public web archive holds for the domain, are the only
   sources. Record the result in this table.

Flagged rows for that check: every `/#…` anchor in §3 (shared links), `/carte` (printed),
`/avis` (to be printed), and any legacy path found.
