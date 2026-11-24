# Monitoring plan: baseline, launch day, 3 months (#78, task 2)

Owner: `ux` (the plan); **#86** (QA and launch) runs it, with the owners named per check. Inputs: #66
`objectives.md` (**K9** Search Console, **K10** Core Web Vitals, **K11** GBP actions), `url-inventory.md`
(§6 Search Console procedure, §7 redirect map), `metadata.md` (§5 robots, §6 sitemap, §4.6 rich results),
`local-seo.md` (Eva actions A1 to A9), ia §2 (per-profession rule).

**Vocabulary.** `L` = launch day (the day the new site answers on `biezunski-avocat.fr`). `W n` = L + n weeks;
`M n` = L + n months. **Owners:** **#86** = whoever runs the QA and launch issue; **Eva**; **User** = the
person with admin access to Vercel (team `eb-avocat`, CLI only) and to the DNS. Nodes have no access to Search
Console, GBP or Vercel analytics: **#86 asks Eva or the User to export** and pastes the numbers into the log
(§6). Tools stay within what exists: Search Console, GBP, Vercel (Web Analytics, Speed Insights, logs),
`curl`, Playwright, Google's Rich Results Test and the Schema.org validator. No paid rank tracker.

**A rule for small numbers.** The site is small: a week can hold 0 to 20 brand clicks. A threshold in
percent applies only when the baseline is large enough to mean something; each row says the floor. Below the
floor, compare the 28-day total, and read the trend, not one week.

## 1. Pre-launch baseline (L − 14 to L − 1)

Everything is saved in the feature folder under `baseline/` (paths below) and summarised in the log (§6).
**Nothing here needs production code.**

| # | What | Tool and where | Metric / output | Who | When | KPI |
|---|---|---|---|---|---|---|
| B0 | Search Console property exists, verified, with 2 owners | Search Console, Domain property `biezunski-avocat.fr` (`local-seo.md` A8) | Property visible; creation date noted (history starts that day) | Eva or User; #86 confirms | **as soon as possible**, no later than L − 14 | K9 |
| B1 | Performance by page and by query, 16 months | Search Console → Performance → Search results, Web, last 16 months; export Pages and Queries (`url-inventory.md` §6, Export 1) | `baseline/gsc/performance-pages-<date>.csv`, `performance-queries-<date>.csv` | #86 (Eva or User gives access or exports) | **L − 7** and again **L − 1** | K9 |
| B2 | Brand vs domaine split | the B1 query CSV | **Brand** = query contains « biezunski » (any spelling or typo of it, plus « eva b… » forms found by eye). **Domaine** = everything else. Record, per 28 days and per week: clicks, impressions, average position of each group; the 5 top brand queries and the 10 top domaine queries; the **weekly brand clicks average** (`B_w`) used by C4 | #86 | L − 7 | K9 |
| B3 | Pages report and legacy URLs | Search Console → Indexing → Pages; the exports of `url-inventory.md` §6 (Export 2) | `baseline/gsc/pages-*.csv`; the paste table of §6 filled; every row with clicks, impressions or links that has no 200 target gets its redirect (R7…) **before L** | #86 | L − 7 | K9 |
| B4 | **Formerly ranking list** | B1 pages CSV filtered `clicks > 0 or impressions > 0`, plus the Links export (external links) | `baseline/ranking-urls.txt`: one URL per line. Input of C3 and playbook A | #86 | L − 7, refreshed L − 1 | K9 |
| B5 | Backlinks | Search Console → Links → Top linked pages (external); Export 3 | `baseline/gsc/links-*.csv` | #86 | L − 7 | K9 |
| B6 | Status of today's URLs | `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n"` on every URL of `url-inventory.md` §2 to §5, against the **old** site | `baseline/status-before.txt`; compare with the same run on L | #86 | L − 1 | K9 |
| B7 | Brand SERP snapshot | Incognito, `google.fr`, French: « eva biezunski », « eva biezunski avocate », « eva biezunski lyon » | Screenshot and position of the site, the GBP panel, the title and snippet shown; stored in `baseline/serp/` | #86 | L − 1 | K9, K11 |
| B8 | Domaine and local query snapshot | Same, for the list in C11 | Position of the site and of the GBP in the local pack (`baseline/serp/`). Expect « not found » for most | #86 | L − 1 | K9 |
| B9 | GBP insights | GBP dashboard → Performance, last 6 months: calls, website clicks, direction requests, searches; review count and rating (`local-seo.md` A9) | `baseline/gbp-insights-<date>.png` or CSV; the monthly average (`G_m`) | **Eva** (sends to #86) | L − 7 | K11, K8 proxy |
| B10 | Core Web Vitals of the old site | PageSpeed Insights (Lighthouse + CrUX field data when it exists) on `/`, `/carte`; one article if any | `baseline/cwv-before.json`; CrUX can be empty for a small site: write « no field data » | #86 | L − 7 | K10 |
| B11 | Index size | Search Console → Pages: number of indexed URLs | One number | #86 | L − 1 | K9 |
| B12 | Preview gate | Preview deployment of the launch branch, before the DNS switch: `robots.txt` equals `metadata.md` §5, no `noindex` and no `X-Robots-Tag` on indexable pages (a preview host often sends `noindex`; **the production build must not**), sitemap equals §6, canonical equals own URL on one page per type, JSON-LD parses | Playwright `seo-meta.spec.ts`, `seo-redirects.spec.ts`; Rich Results Test and validator on one URL per type (`metadata.md` §4.6) | #86 | L − 2 | K9 |

**Gate.** If B0 or B1 cannot be done (no property, no data), launch is not blocked, but the log says « no
baseline » for K9 and the brand rule C4 falls back to the B7 SERP snapshot plus GBP B9. Tell `lead`.

## 2. Launch-day checklist (L)

In this order. A step marked **stop** must pass before the next block.

| # | Step | Tool | Pass condition | Owner |
|---|---|---|---|---|
| D1 | Deploy and DNS switch done; production answers the new site | browser, `curl -I https://biezunski-avocat.fr/` | 200, new home | User |
| D2 | **`robots.txt`** | `curl https://biezunski-avocat.fr/robots.txt` | Equals `metadata.md` §5: `Allow: /`, `Disallow: /api/`, `Disallow: /mcp`, **no** `/carte`, **no** `Host:`, no back-office prefix, one `Sitemap:` line | #86 (**stop**) |
| D3 | **No noindex leaked from preview** | `curl -sI` on `/`, `/domaines`, `/a-propos`, `/contact`, `/publications` + `view-source` | No `X-Robots-Tag: noindex`, no `<meta name="robots" content="noindex">` on these five | #86 (**stop**) |
| D4 | Redirect suite | `seo-redirects.spec.ts` with `BASE_URL=https://biezunski-avocat.fr` (`url-inventory.md` §7: R1 to R6, every R7 row, `/carte` 200 for a desktop UA) | All pass. Compare with B6 (nothing that was 200 and ranked is now 404) | #86 (**stop**) |
| D5 | **`www.` 307 → 308** (one-off) | After R2 is deployed (`vercel.json`), the **User** removes the 307 redirect from the `www.biezunski-avocat.fr` domain's settings in the Vercel project (team `eb-avocat`, CLI only), keeping the domain attached. Then `curl -sI https://www.biezunski-avocat.fr/publications` | `308`, `location: https://biezunski-avocat.fr/publications` | **User**, #86 checks |
| D6 | Sitemap | `curl https://biezunski-avocat.fr/sitemap.xml` | Exactly the URLs of `metadata.md` §6 (only domaine pages that passed the gate), no `lastmod` equal to the request time, no `changefreq`, no `priority` | #86 |
| D7 | Submit the sitemap | Search Console → Sitemaps → `sitemap.xml` | Status « Success », discovered = count of D6 | #86 (or User) |
| D8 | URL Inspection, live test, one URL per page type | Search Console → URL Inspection → « Test live URL » on `/`, `/domaines`, one domaine page, `/a-propos`, `/contact`, `/publications`, one article (if any), `/mentions-legales`; plus `/carte` | Crawl allowed, indexing allowed, **user-declared canonical = the URL itself**, page fetch successful; `/carte` says « noindex » | #86 |
| D9 | Request indexing | URL Inspection → « Request indexing » on `/`, `/domaines`, each live domaine page, `/a-propos`, `/contact` (about 10 a day is the quota) | Requested; note the time | #86 |
| D10 | Rich Results Test and Schema.org validator | one URL per type (`metadata.md` §4.6) | Breadcrumbs valid on domaine and article; no error on `LegalService`, `Person`, `WebSite`, `Service`, `FAQPage`, `BlogPosting`; warnings noted | #86 |
| D11 | Canonical and share check | `curl` + `view-source` on one URL per type; Facebook / LinkedIn share debugger on `/` | One `<title>`, one canonical equal to the URL, `og:image` 1200 × 630 resolves | #86 |
| D12 | **GBP website field** → `https://biezunski-avocat.fr/?utm_source=gbp` | GBP dashboard (`local-seo.md` A3), then click the link from the public profile | Opens the new home | **Eva**, #86 checks |
| D13 | `GBP_URL` link on the site | Click the footer and `/contact` address link and the map image | Opens Eva's profile with the pin on the cabinet (A1 done) | #86 |
| D14 | Analytics and Speed Insights on | Vercel dashboard | Events and Speed Insights receive data; the `utm_source=gbp` visit from D12 appears | User, #86 |
| D15 | Log the status snapshot | `curl` suite output; `baseline/status-after-L.txt` | Compared with B6 | #86 |
| D16 | Nothing else changes for 48 hours (no copy edit, no URL change) so the first weeks' data stays readable | — | — | #86 tells `lead` |

## 3. The checks (catalogue)

Each check says the tool, the metric, the **threshold that triggers action**, the action, the owner, and the
KPI. **Run at** points to the calendar in §4.

| # | Check | Tool | Metric | Threshold | Action | Owner | KPI |
|---|---|---|---|---|---|---|---|
| C1 | Indexing of the new site | Search Console → Indexing → Pages | Indexed count vs the number of sitemap URLs (D6); reasons for non-indexed URLs | Any **indexable** sitemap URL with reason 404, 5xx, redirect error, blocked by robots.txt, « noindex », or « Duplicate / Google chose different canonical »; or indexed < 70 % of sitemap URLs at **W4** | Open the URL in URL Inspection, read the reason, fix the cause (D2, D3 again; canonical; thin page); request indexing once after the fix. « Discovered / Crawled – currently not indexed » on a new page before W4 is normal: wait, do not request more than once | #86 | K9 |
| C2 | Sitemap read | Search Console → Sitemaps | Status, last read, discovered URLs | Not « Success », or last read older than 7 days, or discovered ≠ D6 | Fetch `/sitemap.xml` by hand; if valid, resubmit; if the count differs, find the missing URL (gate, API outage fallback) | #86 | K9 |
| C3 | **Formerly ranking URLs** | `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n"` over `baseline/ranking-urls.txt`; Pages report « Not found (404) » | Status of each URL; count of 404 in the Pages report | **Any** URL of B4 not 200 and not an intended 308 | **Playbook A** (§5), same working day | #86 | K9 |
| C4 | **Brand clicks** | Search Console → Performance, queries containing « biezunski », last 7 days vs `B_w` (B2) | Weekly brand clicks, impressions, average position | Clicks **< 80 % of `B_w` for 2 consecutive weeks**, if `B_w ≥ 5` (else: 28-day brand clicks < 80 % of the baseline 28-day figure); or average position of the exact brand query worse than 3 for 2 weeks | **Playbook B** (§5) | #86; Eva reads the summary | K9 |
| C5 | Domaine queries and pages | Search Console → Performance, domaine queries (B2) and the pages `/domaines*` | Impressions, clicks, position per query group (SEL, SCM, patientèle, Ordre, contentieux ordinal, collaboration, remplacement, « avocat … Lyon »); which pages get impressions | **Information, not an alarm**: target = up vs baseline. Action triggers: (a) a domaine page with impressions for « … lyon » queries at position > 10 at **M1** and **M2** → try the title candidates of `metadata.md` §3 P1 (for `contrats-professionnels`, `ordre-et-deontologie`) or the h1 or kicker variant of `local-seo.md` L3 for the home, with Eva; (b) a domaine page with 0 impressions at **W6** while indexed → check internal links (header, footer, « Autres domaines »), content gate, title | Propose the change to `lead` (copy belongs to #68; Eva approves) | #86 | K9 |
| C6 | New pages indexed | URL Inspection (not live test) on `/domaines`, each live domaine page, `/a-propos`, `/contact` | « URL is on Google » | Not indexed at **W2**: request indexing once (D9 again). Not indexed at **W4**: check internal links, canonical, robots, content duplicate; ask `lead` | Fix and recheck at the next point | #86 | K9 |
| C7 | Google-selected canonical | URL Inspection on one URL per page type; Pages report « Duplicate, Google chose different canonical than user » | Selected canonical = ours | Any difference | Find the competing URL (`?page=`, `?category=`, `www.`, trailing slash); fix the redirect or canonical (`url-inventory.md` §3, §4) | #86 | K9 |
| C8 | Structured data | Search Console → Enhancements (Breadcrumbs, FAQ if shown, any « Unparsable structured data »); Rich Results Test after every template change | Errors and warnings | Any **error**, or any item that was valid and is now invalid | Fix the JSON-LD helper (#79, `metadata.md` §4), redeploy, Validate fix | #86 | K9 |
| C9 | **Core Web Vitals** | Vercel Speed Insights (p75, mobile and desktop, 28-day window); Search Console → Core Web Vitals | LCP, INP, CLS | Any metric outside the #77 budgets, or worse than the B10 / launch-week value by more than 10 % for 2 weeks. Fallback if no budget is set: Google's « good » bounds (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) | Find the page and the cause (image weight, font, third-party script, layout shift); fix in the issue that owns the component; recheck 7 days later | #86 | K10 |
| C10 | **GBP actions** | GBP dashboard → Performance (monthly) | Calls, website clicks, direction requests, searches; review count and rating | Any of calls, website clicks or direction requests **< 80 % of `G_m`** for a month (if `G_m ≥ 10`) | Check the GBP website field still = `https://biezunski-avocat.fr/?utm_source=gbp` (A3), the pin (A1), the hours; check the profile has not been suspended or edited by a suggestion; compare with the Vercel visits from `utm_source=gbp` | **Eva** reads and exports, #86 analyses | K11, K8 proxy |
| C11 | SERP snapshot (manual) | Incognito `google.fr`, French; queries: « eva biezunski », « eva biezunski avocate lyon », « avocat sociétés professions libérales lyon », « avocat création sel lyon », « avocat cession patientèle lyon », « avocat contrat de collaboration lyon », « avocat contentieux ordinal lyon », « avocat déontologie professions libérales lyon » | Position of the site and of the GBP; title and snippet displayed; site name and sitelinks for the brand query; **Search results are personalised: compare only with the B7 / B8 snapshots taken the same way** | Brand query: the site not in the top 3, or the GBP panel gone | Playbook B (§5), step 2 | #86 | K9, K11 |
| C12 | Redirect and status regression | `seo-redirects.spec.ts` on production | Status and `location` of R1 to R6, every R7, `/carte` | Any failure | Fix `vercel.json` or the route; if a ranking URL is affected, Playbook A | #86 | K9 |
| C13 | `robots.txt` and sitemap content | `curl` | Equal to `metadata.md` §5 and §6 | Any difference (a deploy changed them) | Revert the change in the file that produces them | #86 | K9 |
| C14 | New 404s in the logs | Vercel logs, filtered `status 404`, 7 days | Paths that 404 and their referrers | A path hit **≥ 3 times** in the week, or with an external referrer, or listed in the Search Console 404 report | If a real page moved: R7 to its closest page (`url-inventory.md` §6 rule 2). If a bad internal link: fix the link. Otherwise leave the 404 | #86 | K9 |
| C15 | Backlinks to missing pages | Search Console → Links → Top linked pages | New external link pointing to a 404 | Any | Add R7 to the closest page | #86 | K9 |
| C16 | `noindex` URLs leave the index | Search Console → Pages: « Excluded by ‘noindex’ tag »; `site:biezunski-avocat.fr/carte` | `/carte` and the `?category=` lists | Still indexed at **W4** | Check Googlebot can fetch them (not in `robots.txt`: D2); request indexing once so it recrawls the `noindex` | #86 | K9 |
| C17 | Articles (once at least one is published) | URL Inspection on each new article; sitemap | Indexed ≤ 14 days after publication; `lastmod` = `updated_at`; JSON-LD valid (C8) | Not indexed after 14 days | Check internal links from `/publications` and the home, the sitemap entry, the canonical; request indexing once | #86 | K4, K9 |
| C18 | **Per-profession pages** | Search Console → Performance → Queries, monthly | Queries naming one profession (médecin, kinésithérapeute, infirmier, dentiste, pharmacien, sage-femme, vétérinaire, expert-comptable, architecte, … any profession Eva confirms) grouped by profession | **Rule (ia §2):** a profession has **≥ 30 impressions in each of 3 consecutive months** (proposed floor for a small site; `lead` may change it) **and** Eva confirms she serves that profession and can supply specific content | Send `lead` a one-page proposal (profession, queries, impressions per month, the domaine page it would hang under, what content Eva must supply). **No URL is reserved and none is created before Eva agrees.** Without the second condition: reinforce the « Pour qui » block of the domaine page instead | #86 prepares, **Eva** decides | K9 |
| C19 | GBP reviews count | GBP, or the on-site block once #80 reads the Places API | Reviews and rating | Count did not rise in 3 months | Information only: tell Eva; no tactic here (out of scope) | Eva | K8 |

## 4. Calendar

`✓` = run the check at that point. Each point takes about 30 minutes when nothing is wrong. W1 to W4 weekly,
W6 and W8 (every 2 weeks), then **M3** (about L + 90 days). M1 = W4 and M2 = W8: those two points also carry
the monthly reads (C5, C10, C18).

| Check | L (§2) | W1 | W2 | W3 | W4 (M1) | W6 | W8 (M2) | M3 |
|---|---|---|---|---|---|---|---|---|
| C1 Indexing | D8, D9 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C2 Sitemap read | D7 | ✓ | ✓ | | ✓ | | ✓ | ✓ |
| C3 Formerly ranking URLs | D4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C4 Brand clicks | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C5 Domaine queries and pages | | | | | ✓ | ✓ | ✓ | ✓ |
| C6 New pages indexed | | | ✓ | | ✓ | | | |
| C7 Selected canonical | D8 | | ✓ | | ✓ | | | ✓ |
| C8 Structured data | D10 | ✓ | ✓ | | ✓ | | | ✓ |
| C9 Core Web Vitals | D14 | | ✓ | | ✓ | ✓ | ✓ | ✓ |
| C10 GBP actions | D12, D13 | | | | ✓ | | ✓ | ✓ |
| C11 SERP snapshot | | ✓ | | | ✓ | | ✓ | ✓ |
| C12 Redirect regression | D4 | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| C13 robots and sitemap content | D2, D6 | ✓ | | | ✓ | | | ✓ |
| C14 New 404s | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C15 Backlinks to 404 | | | | | ✓ | | ✓ | ✓ |
| C16 `noindex` URLs leave | | | | | ✓ | | | |
| C17 Articles | | when one exists, at each point | | | | | | |
| C18 Per-profession rule | | | | | ✓ (month 1) | | ✓ (month 2) | ✓ (month 3: the decision) |
| C19 GBP reviews count | | | | | ✓ | | ✓ | ✓ |

**Weeks 1 to 4 are the risk window** (redirect and indexing problems show here); from W6 the checks are
about growth. **M3 closes the plan:** #86 writes a one-page report for `lead` and Eva: K9, K10, K11 against
their baselines (`objectives.md` §5, K1 to K11 report at +1 and +3 months), the playbooks triggered, and the
open decisions (C5 title tests, C18 profession pages). After M3 the checks continue only through the normal
KPI report.

## 5. Playbooks

### A. A formerly ranking URL now 404s (C3, C12, C14, C15)

**Aim:** the same working day, no ranking lost to an avoidable 404.

1. **Confirm.** `curl -sI <url>` from outside; check the URL is in `baseline/ranking-urls.txt` (B4). If it
   already answered 404 on `baseline/status-before.txt` (B6), it is **not a regression**: log it, do nothing.
2. **Find the cause**, in this order:
   a. **A slug changed** (article): `git log`/back-office history; the slug of a published article must never
      change (`url-inventory.md` §7, #85). → restore the old slug **or** add a 308 old → new.
   b. **A route or page disappeared** (domaine page that missed the gate, `/a-propos`, a renamed route). →
      restore the route, or 308 to the closest page.
   c. **A redirect is wrong** (`vercel.json` typo, R2 or R6 shape, a rule shadowing a page). → fix the rule.
   d. **The backend was down** while the article route ran (an uncached article answers 404 or 5xx). → check
      `/api/v1/articles/` and the backend status; the pages come back with the backend; ISR keeps the last
      good page, so a lasting 404 means a real removal.
   e. **None of the above:** the URL was never ours (an old WordPress URL, `url-inventory.md` §5). Go to 4.
3. **Fix.** Restore the content when the page is wanted. Otherwise add **one** 308 in `vercel.json` to the
   closest page by the `url-inventory.md` §6 rule 2: domaine page that covers the subject > `/domaines` >
   `/a-propos` (content about Eva) > `/`. **Never** a bulk redirect to `/`: Google treats unrelated
   redirects as soft 404s. Add the row to `url-inventory.md` §7 (R7…) with its test.
4. **Decide for an old URL with impressions or links.** Rule 2 of §6 applies as at baseline: any clicks,
   impressions or external link → 308 to the closest page; none → leave it 404.
5. **Deploy, then verify:** `curl` shows the 308 and the target answers 200; Search Console → Pages →
   « Not found (404) » → **Validate fix**; URL Inspection → live test on the target.
6. **Log it** (§6) with the cause. If the cause was a code change, add a test to `seo-redirects.spec.ts` so it
   cannot return; tell `lead` which issue shipped the regression.

### B. Brand clicks drop (C4, C11)

Brand queries are the part of K9 that must not fall (`objectives.md`: « Brand ≥ baseline »).

1. **Is it real?** Compare the same weekdays, impressions and clicks together. Same impressions with fewer
   clicks = a CTR issue. Fewer impressions = demand or ranking. Check whether the brand clicks moved to the
   profile: add **GBP website clicks and calls** (C10) to the Search Console brand clicks and compare the sum
   with `B_w + G_m / 4.3`. If the sum holds, nothing is lost: log it.
2. **Position.** Is the exact brand query still position 1 to 3 (C11, incognito)? Is the site name,
   title and snippet as in B7? If the site is gone or lower:
   - URL Inspection on `/`: indexed? Google-selected canonical = `https://biezunski-avocat.fr/`? Live test
     reports « Indexing allowed »? (D3: a `noindex` on `/` explains a drop within days.)
   - `robots.txt` (C13) and the status of `/` and of `www.` (C12): a 307 or 5xx on `www.` or an apex outage.
   - Vercel logs: 5xx on `/` or on the API fallback.
3. **CTR with a stable position.** The new title is « Eva Biezunski, avocate au Barreau de Lyon » (41 characters)
   against the old « Eva Biezunski Avocate, Cabinet dédié aux professionnels libéraux ». If the position
   holds and CTR falls for 2 weeks, check what the SERP shows (a GBP panel and reviews take clicks that now go
   to the profile: that is K11, not a loss). Only then consider a title test, with Eva and `lead`.
4. **Fix** the cause found (reopen D2/D3, restore a redirect, correct the canonical or the title), then
   re-inspect `/` and request indexing once.
5. **Escalate to `lead` and Eva** if, after the fix, the brand clicks are still < 80 % of `B_w` two weeks later,
   or if the cause is outside the code (Google penalty or manual action in Search Console → Security and manual
   actions; a GBP suspension: C10). A drop in the first 2 weeks after a migration is common; do not revert the
   redesign for a drop that only shows in a single week.
6. **Log it** (§6).

### C. Other triggers (short)

| Trigger | Action |
|---|---|
| Coverage error on an indexable URL (C1) | Read the reason in URL Inspection; D2 and D3 again; fix; request indexing once |
| CWV regression (C9) | Find the page in Speed Insights; fix in the issue that owns the component (images and fonts #77/#79, scripts #80); recheck at the next point |
| Structured-data error (C8) | Fix the helper, rerun the Rich Results Test on one URL per type, Validate fix |
| GBP calls or clicks fall (C10) | A3 (website field), A1 (pin), suspension or suggested edit; Eva checks the dashboard |
| New external link to a 404 (C15) | R7 to the closest page |

## 6. Log

#86 keeps `.orchestrator/features/redesign-seo-preservation-and-structured/monitoring-log.md`, one row per
check run (no personal data in it, numbers and decisions only):

| Date | Point (L, W1…M3) | Check | Result (numbers) | Threshold hit? | Action and issue | Owner | Done |
|---|---|---|---|---|---|---|---|

At each point, #86 sends `lead` three lines: what ran, what triggered, what is open. Eva gets a message only
when an action needs her (A1 to A9, C10 summary, C18 decision).

## 7. Owners at a glance (every item has one)

| Owner | Items |
|---|---|
| **#86** | B1 to B8, B10 to B12; D2 to D4, D6 to D11, D13 to D16; C1 to C9, C11 to C18; playbooks A and B; the log and the M3 report |
| **Eva** | B9 (GBP insights export), D12 (GBP website field), C10 (GBP read), C18 (profession decision), C19; `local-seo.md` A1 to A7, A9 |
| **User** (Vercel team `eb-avocat`, DNS) | D1, D5 (remove the `www.` 307), D14 (analytics and Speed Insights); B0 and `local-seo.md` A8 with Eva |
| **lead** | Relays copy changes to #68 (C5 title tests, C18); decides the floor of C18 |

**KPI map.** K9 (Search Console): B0 to B5, B7, B8, B11, C1 to C8, C11 to C18, playbooks A and B. K10
(Core Web Vitals): B10, C9. K11 (GBP actions): B9, C10, C11, D12, D13. K8 proxy (review count): C10, C19.
