# URL inventory and redirect map (#78, task 1)

Owner: `ux`. Host: `https://biezunski-avocat.fr`. Inputs: the code at `aa79811` (this branch), the live site
(checked 2026-11-24 with `curl`, codes below), the public web archive (CDX index of the domain), #67
`url-table.md` (cited **url-table §n**) and `ia.md` (**ia §n**), #68 `copy.md` / `eva-content.md` (**E-nn**),
the audit (**A-nn**). Metadata, robots and sitemap rules per page are in `metadata.md`; this file says which
URL answers what.

**Result in one line.** No URL that ranks today changes (url-table holds). The redirect map adds, beyond
#67's list: the `www.` host must move from **307 to 308**, and one legacy URL of a 2022 WordPress site at
this domain (`/avocate`) gets a permanent redirect to `/`. Everything else from that old site stays 404
unless Search Console shows impressions or backlinks.

## 1. How the inventory was built

| Source | What was checked | Result |
|---|---|---|
| Code | every `app/**/page.tsx` and `route.ts`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `proxy.ts`, `next.config.ts`, root `vercel.json` | 7 public pages, 4 route handlers, 1 `vercel.json` redirect (cdn), 1 in-page redirect (`/carte` 307) |
| Live site | `curl -s -o /dev/null -w "%{http_code} %{redirect_url}"` on every URL below, 2026-11-24 ~11:55 UTC; `<head>` of each page (title, description, robots, canonical, og) | Codes in §2 to §5 |
| Live `sitemap.xml` | `https://biezunski-avocat.fr/sitemap.xml` | 4 URLs: `/`, `/publications`, `/mentions-legales`, `/politique-de-confidentialite`, all with `lastmod` = the request time (A-21 confirmed), `changefreq` and `priority` set |
| Live `robots.txt` | `https://biezunski-avocat.fr/robots.txt` | `Allow: /`, `Disallow: /carte`, `Disallow: /api/`, `Host:` line, `Sitemap:` line |
| Live API | `GET /api/v1/articles/?page_size=100` and `/api/v1/categories/` | **0 published articles, 0 categories** today: no article URL exists yet, `/publications` shows its empty state |
| Web archive | `web.archive.org/cdx/search/cdx?url=biezunski-avocat.fr*` and `*.biezunski-avocat.fr` | A **WordPress site (theme « Porto ») existed in Sept.–Oct. 2022**, last capture of `/` in Jan. 2023; captures in 2023-08 and 2024-06 are 404. Its URLs are in §5 |
| Search Console | no access (no property yet, #66 K9) | Procedure and paste table in §6; #86 fills it before launch |
| Eva (E12) | « No contact URL shared anywhere; nothing to redirect beyond the home `#contact` id » | Held. E12 also asked « did another site exist at this domain? »: the answer does not mention the 2022 site found in the archive, see §5 and the note to `lead` in §8 |

Status codes are what the server answers to a plain `curl` (desktop-less user agent) unless a user agent
is named.

## 2. Pages (indexable or meant to be)

Columns: *today* and *after launch* give status · robots · in sitemap · canonical. « root » = the canonical
inherited from the root layout default (`alternates.canonical: "/"`, A-21).

| URL | Type | Today | After launch | Redirect | Source |
|---|---|---|---|---|---|
| `/` | home | 200 · index, follow · yes · `https://biezunski-avocat.fr` (own) | 200 · index, follow · yes · `/` | none | code, live |
| `/domaines` | hub | 404 · — · no · — | 200 · index, follow · yes · `/domaines` | none (new) | url-table §1 |
| `/domaines/creation-de-societe` | domaine page | 404 | 200 · index, follow · yes · self — **only if Eva validates the page** (launch gate, copy §14); else stays 404 and every link goes to `/domaines#creation-de-societe` | none (new) | url-table §1, copy §14 |
| `/domaines/cession-clientele-patientele` | domaine page | 404 | same rule | none (new) | same |
| `/domaines/contrats-professionnels` | domaine page | 404 | same rule | none (new) | same |
| `/domaines/ordre-et-deontologie` | domaine page | 404 | same rule | none (new) | same |
| `/a-propos` | about | 404 | 200 · index, follow · yes · `/a-propos` | none (new) | url-table §1 |
| `/contact` | contact | 404 | 200 · index, follow · yes · `/contact` | none (new) | url-table §1 |
| `/publications` | list | 200 · index, follow · yes · `/publications` | 200 · index, follow · yes · `/publications` | none | code, live |
| `/publications/<slug>` | article | 404 for any slug (0 published) | 200 · index, follow · yes (one per published article) · self | none; **a published slug never changes** (url-table §1, #85 enforces or adds a 301) | API, code |
| `/mentions-legales` | legal | 200 · index, follow · yes · own | 200 · index, follow · yes · own | none | code, live |
| `/politique-de-confidentialite` | legal | 200 · index, follow · yes · own | 200 · index, follow · yes · own | none | code, live |
| `/carte` | QR card | **307 → `/`** for a desktop UA; 200 for a mobile UA (iPhone and Googlebot smartphone both get 200) · noindex, nofollow (meta) · no · root `/` · **disallowed in robots.txt**, so crawlers never read the noindex | 200 for every UA · noindex, nofollow (meta) · no · none · **allowed** in robots.txt | none (the 307 is removed, A-11, ia §10) | code, live |
| `/carte/vcard` | vCard file | 200 `text/vcard` · no `X-Robots-Tag` · no | 200 · `X-Robots-Tag: noindex` · no | none | code, live |
| `/avis` | review short link | 404 | **302 → `REVIEW_URL`** · `X-Robots-Tag: noindex` · `Cache-Control: no-store` (each hit is counted, #80) · no · not linked or printed (E9c skipped) | 302 | url-table §1, E9c |
| any unknown path (`/introuvable-xyz`) | 404 | 404 · `noindex` **twice** (two robots metas) · no · **canonical `https://biezunski-avocat.fr`** (root default) · title doubled « Page introuvable — Eva Biezunski Avocate — Eva Biezunski Avocate » | 404 · noindex, follow (one meta) · no · **no canonical** · title « Page introuvable \| Eva Biezunski » | none | live |
| `/backoffice/*` (direct) | internal | 404 (proxy rewrites to the 404) | same | none | code, live |
| `/${BACKOFFICE_PATH}/*` | back-office | not checked (secret) | unchanged: `X-Robots-Tag: noindex, nofollow` + meta; **never** in robots.txt | none | code |

## 3. Query parameters

| URL | Today | After launch | Redirect | Source |
|---|---|---|---|---|
| `/publications?page=2` | 200 · index, follow · canonical `/publications` | 200 if `2 ≤ n ≤ pageCount` · index, follow · canonical self `/publications?page=n`; **404 if out of range** | none | live, spec §Canonicals 3 |
| `/publications?page=1` | 200 (page 1) · canonical `/publications` | 200 · canonical `/publications` (the pagination never emits it) | none | spec |
| `/publications?page=abc`, `?page=0`, `?page=-1`, `?page=2.5`, `?page=99999` | **200** with page 1 or the empty state · canonical `/publications` | **404** (`notFound()`) when the API answered and `n` is not an integer in `1…max(pageCount, 1)`. If the API fails, never 404 (throw: ISR keeps the last good page) | none | live, spec |
| `/publications?category=<slug>` (± `page`) | 200 · index, follow · canonical `/publications` (unknown category answers 200 too) | 200 · **noindex, follow** · **no canonical** · not in sitemap. Unknown category slug → 404 | none | live, spec §Canonicals 2 |
| `/?p=109` (old WordPress post id) | 200 home · canonical `/` | same (the query is ignored; canonical `/`) | none | archive, live |
| `?utm_*`, `?gclid`, `?fbclid`, any other | page renders · canonical clean | page renders · canonical clean path (static canonicals) | none | url-table §2 |
| `/contact?origin=…` | 404 (no page) | 200 `/contact`, canonical `/contact` (never emitted by the site, ia §12) | none | url-table §2 |

## 4. Technical routes and host variants

| URL | Today | After launch | Notes |
|---|---|---|---|
| `/robots.txt` | 200 | 200, new content (`metadata.md` §5) | — |
| `/sitemap.xml` | 200, 4 URLs, fake `lastmod` | 200, rules of `metadata.md` §6 | — |
| `/manifest.webmanifest`, `/apple-icon.png`, `/icon-192.png`, `/images/*` | 200 | 200, same paths | `/images/icons/*` and logos are hot-linked by Eva's email signature: keep paths (url-table §4) |
| `/og/*.png` | — | 200 (new share images, `design/og/README.md` by `ui`) | Not in sitemap |
| `/media/*` | 404 for an unknown blob, 200 for a real one | same | Covers; also on `cdn.` |
| `/api/contact`, `/api/revalidate` | 405 on GET | same | `Disallow: /api/` |
| `/api/v1/*` | 200 (Django) | same | `Disallow: /api/` |
| `/mcp` | 401 | same | Add `Disallow: /mcp` (not secret, nothing to index) |
| `/publications/`, `/mentions-legales/` (trailing slash) | **308** → no slash | 308 → no slash, every page (`/domaines/`, `/a-propos/`…) | Next default; `skipTrailingSlashRedirect` is only on when `BACKEND_URL` is set (local) |
| `http://biezunski-avocat.fr/*` | **308** → `https://biezunski-avocat.fr/*` | same | Vercel |
| `https://www.biezunski-avocat.fr/*` | **307** → `https://biezunski-avocat.fr/*` | **308** → apex | **Change.** 307 is a temporary redirect: Google keeps the `www` URL as a candidate and does not pass signals as reliably. Set the `www` domain redirect to 308 in Vercel (see §7, R2) |
| `http://www.biezunski-avocat.fr/*` | 308 → `https://www.…` then 307 → apex (2 hops) | 308 → `https://www.…` then 308 → apex | Two hops are fine (Vercel forces HTTPS first) |
| `https://cdn.biezunski-avocat.fr/<not media>` | **308** → `https://biezunski-avocat.fr/<path>` | same | `vercel.json` `permanent: true` gives 308 (url-table said 301: 308 is the permanent code Vercel uses; same effect for Google) |
| `https://cdn.biezunski-avocat.fr/media/*` | 200 / 404 | same | `cdn.…/robots.txt` 308s to the apex robots.txt, which allows `/media/`: cover images stay crawlable |
| `http://cdn.biezunski-avocat.fr/*` | 308 → `https://cdn.…` | same | — |

## 5. Legacy URLs (2022 WordPress site, from the web archive)

The archive holds 33 URLs for the domain, all captured 2022-09-30 to 2022-10-22 (WordPress, « Porto » theme,
Visual Composer, Contact Form 7). Assets (`wp-content/*`, `wp-json/*`, feeds) are left out of the table below
except as a group. What the pages said:

- `/avocate/` — title « Avocate - Eva Biezunski »: a one-page practice presentation (« À propos de moi, Mes
  services, Mes honoraires, Exemples de clients accompagnés, Vos avis, Me contacter »), « j'interviens en
  conseil pour accompagner les professionnels libéraux… droit des sociétés ». Same subject as today's home.
- `/coaching/` — title « Coaching - Eva Biezunski »: CRFPA exam coaching for students and interview
  simulations for associates. Not offered on the new site (no equivalent page; Formations dropped, E6).
- `/test-de-demonstration/`, `/test-de-demonstration-2/`, `/aug-test-de-demonstration/` — theme demo posts.
- Both pages show the phone **+33 (0)4 72 44 44 44**, not today's `CONTACT.phone` (NAP point for task 2,
  `local-seo.md`).

| Legacy URL | Today | After launch | Rule applied |
|---|---|---|---|
| `/avocate/`, `/avocate` | 308 → `/avocate` → **404** | **308 → `/`** (one hop for both forms) | Same content as the home (practice presentation). Old directory or Barreau listings may still link it; a permanent redirect to its equivalent costs nothing. Not « everything to `/` »: this one URL's equivalent *is* the home |
| `/coaching/`, `/coaching` | 308 → 404 | **404**, unless Search Console shows impressions, clicks or backlinks; then 308 → `/a-propos` | No equivalent content. Google treats a redirect to an unrelated page as a soft 404, so a redirect earns nothing without evidence |
| `/test-de-demonstration*/`, `/aug-test-de-demonstration/`, `/coaching0/` | 308 → 404 | 404 | Demo content, never meant to rank |
| `/?p=109` | 200 (home) | 200 (home), canonical `/` | Nothing to do |
| `/comments/feed/`, `/feed/`, `/test-de-demonstration-2/feed/`, `/wp-json/*`, `/wp-admin/` | 308 → 404 | 404 | Machine URLs |
| `/wp-content/*` | **403** (Vercel blocks the path) | 403 or 404 | Assets; nothing links to them |

## 6. Search Console step (procedure, paste table, rule)

**Who and when.** Nobody on the team has access yet (K9 asked to create the property on 2026-11-20). If
the property exists and has data, the user (or Eva) runs the export now and pastes it here; otherwise #86
runs it **no later than one week before launch** and again on launch day (Pages report), and adds any
redirect the rule below calls for to §7 before the DNS / deploy switch.

**Property.** A **Domain property** `biezunski-avocat.fr` (DNS TXT record), so `http`, `https`, `www.` and
`cdn.` are all in one report. A URL-prefix property for `https://biezunski-avocat.fr/` only would hide the
`www.` and `cdn.` URLs.

**Export 1, Performance → Search results.** Date range: **Last 16 months** (the maximum). Search type: Web.
Tab **Pages**: export (Export → Download CSV). Then tab **Queries**: export too (baseline for K9 brand vs
domaine, used by `monitoring.md`). Keep both CSVs in the feature folder as
`gsc/performance-pages-<date>.csv` and `gsc/performance-queries-<date>.csv` (no personal data in them).

**Export 2, Indexing → Pages.** Export the summary, then open and export each of these lists: **Indexed**
(« Pages indexées »), **Not found (404)**, **Page with redirect**, **Alternate page with proper canonical
tag**, **Excluded by ‘noindex’ tag**, **Blocked by robots.txt**, **Crawled – currently not indexed**.

**Export 3, Links → Top linked pages (external).** Export: backlinks per target URL.

**Paste table.** One row per URL that appears in any export (one row per URL, all sources merged):

| URL (as Google shows it) | Clicks (16 mo) | Impressions (16 mo) | Indexed? / Pages-report status | External links | Answers after launch (from §2–§5) | Action | Done by / date |
|---|---|---|---|---|---|---|---|
| *(empty: no export yet)* | | | | | | | |

**Rule per row.**

1. The URL answers **200 after launch** (it is in §2 or §3 as a page, or it is a host / slash variant that
   redirects to one) → no action.
2. It has **clicks > 0, impressions > 0, or ≥ 1 external link**, and **no 200 target** after launch → add a
   **308** (permanent) to the closest page, in this order: the domaine page that covers its subject (or
   `/domaines#<slug>` if that page missed the gate) > `/domaines` > `/a-propos` (content about Eva) > `/`.
   **Never** send unrelated URLs to `/` in bulk (Google treats that as soft 404s and the redirect is lost).
3. It has **none of these** and no 200 target → leave it **404** (or 410 if it is a WordPress machine URL).
   No action.
4. A URL listed under **Indexed** that is meant to be `noindex` after launch (`/carte`, a `?category=` list)
   → no redirect; the new robots rules remove it (check it drops out within 4 weeks, `monitoring.md`).
5. Every row added under rule 2 goes into §7 with its test, before launch.

## 7. Redirect map (final)

Status: **308** = permanent (Vercel's and Next's permanent code; Google treats 301 and 308 the same),
**302** = temporary. « Test » is what #86 runs against the production host after the deploy (and against
the preview URL where the host allows it), with `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n"`,
automated in `frontend/e2e/seo-redirects.spec.ts` (`fetch(url, { redirect: "manual" })`, assert status and
`location`).

| # | Source | Target | Status | Lives in | Test (#86) | Status today |
|---|---|---|---|---|---|---|
| R1 | `https://cdn.biezunski-avocat.fr/<path>` except `/media/*` | `https://biezunski-avocat.fr/<path>` | 308 | root `vercel.json` `redirects` (host condition), exists | `/` and `/publications` on `cdn.` → 308 to the apex path; `cdn.…/media/<real blob>` → 200 | done |
| R2 | `https://www.biezunski-avocat.fr/<path>` | `https://biezunski-avocat.fr/<path>` | **308** (today **307**) | Vercel project → Settings → Domains → `www.biezunski-avocat.fr` → « Redirect to biezunski-avocat.fr », status **308 Permanent** (or API `PATCH /v9/projects/{project}/domains/www.biezunski-avocat.fr` with `redirectStatusCode: 308`); team `eb-avocat` | `https://www.…/` and `https://www.…/publications` → 308, `location` = apex same path | **to change** (#86, or the user: the team is reached by CLI only) |
| R3 | `http://<any host>/<path>` | `https://<same host>/<path>` | 308 | Vercel (automatic HTTPS) | `http://biezunski-avocat.fr/publications` → 308 → `https://biezunski-avocat.fr/publications` | done |
| R4 | `/<path>/` (trailing slash, any page) | `/<path>` | 308 | Next.js default (no config; `skipTrailingSlashRedirect` stays off in production) | `/domaines/`, `/a-propos/`, `/publications/` → 308 to the slash-less URL | done (new pages inherit it) |
| R5 | `/avis` | `REVIEW_URL` (today `https://maps.app.goo.gl/qjynjiyhA1APuACL8`; the direct « write a review » link if E9b ever comes) | 302 | route handler `frontend/src/app/avis/route.ts` (#80): counts the hit, then `new Response(null, { status: 302, headers: { Location: REVIEW_URL, "X-Robots-Tag": "noindex", "Cache-Control": "no-store" } })` (not `Response.redirect()`: its headers are immutable, so adding the two headers afterwards throws) | `/avis` → 302, `location` = `REVIEW_URL`, header `x-robots-tag: noindex`; two hits = two counts | to build (#80) |
| R6 | `/avocate` and `/avocate/` | `https://biezunski-avocat.fr/` | 308 | root `vercel.json` `redirects`: two entries `{ "source": "/avocate", "destination": "/", "permanent": true }` and the same with `"/avocate/"` (Vercel redirects run before Next, so the slash form is one hop, not 308 → 308) | both → 308, `location` `/` (or the absolute apex URL), one hop | to build (#86, or #84 with the other launch config) |
| R7… | any legacy URL that §6 rule 2 adds | closest page (§6) | 308 | root `vercel.json` `redirects` (keeps all permanent redirects in one file, before Next) | same as R6 | after the Search Console export |
| — | `/carte` | — | **removed** (today 307 → `/` for desktop UAs) | delete the UA check and `redirect("/")` in `frontend/src/app/carte/page.tsx` (#84) | `curl -A "Mozilla/5.0 (Macintosh)" /carte` → 200 with `noindex, nofollow` meta | to remove (#84) |
| — | Slug change of a published article | old slug → new slug | 308 | follow-up for #85 / #76: either the back-office forbids editing a published slug (simplest, the url-table rule), or Django keeps a `SlugRedirect(old_slug → article)` table and the article route answers `permanentRedirect()` | change a slug on a staging article: the old URL → 308 to the new one, or the slug field is read-only once published | rule only at launch (#85 makes the field read-only after publication) |

Not redirected, on purpose: old home anchors (`/#contact`, `/#a-propos`, `/#domaines-intervention`, `/#avis`,
`/#accueil`): fragments never reach the server, the ids are kept (url-table §3, E12); `/coaching` and the
WordPress demo / machine URLs (404, §5); `?page=` out of range (404, §3).

## 8. Points for `lead`

1. **A 2022 site existed at this domain** (WordPress, captures 2022-09 to 2023-01). E12's answer does not
   mention it. I redirect `/avocate` (same subject as the home) and leave `/coaching` and demo posts 404.
   Worth asking Eva once, with the GBP and Barreau questions of task 2: is `/avocate/` (or the old phone
   +33 4 72 44 44 44) still in a directory, the Barreau de Lyon profile or an old signature? If the old
   phone is listed anywhere, it is a NAP inconsistency (task 2).
2. **`www.` answers 307** today: R2 needs a Vercel domain setting, which the nodes cannot change (team
   `eb-avocat`, CLI only). The user or #86 sets it.
3. **Search Console export**: if the property already has data (created around 2026-11-20, so at most a
   few days), an export now would only show the last days; I suggest **#86 runs §6 one week before launch**
   rather than asking the user now. If the user wants it now, the procedure is self-contained.
4. **No published article today** (API count 0): the sitemap has no article URL, and the article examples
   in `metadata.md` use an illustrative article. Nothing to preserve for articles yet, so the slug rule only
   matters from the first publication.
