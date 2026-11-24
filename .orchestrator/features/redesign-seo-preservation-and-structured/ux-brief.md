# UX brief — SEO preservation and structured data (#78)

Read `spec.md` first: it lists the inputs (with the git refs to read them from), the deliverables and the
lead's proposed decisions. Docs in English, French copy quoted as is. Cite sources as **A-nn** (audit),
**ia §n** / **url-table §n** (#67), **copy §n** / **E-nn** (#68), **#66 §n**.

## For ux

You own the four docs. For each proposed decision in `spec.md`, **validate it, change it with a reason,
or reject it**, and record which in a short "Changes from the spec" table at the end of `metadata.md`
(as #67 did in ia §14). Don't reopen #67 or #68 decisions without a concrete SEO reason; if you find one,
write it down and tell the lead (`send_message`), who relays it.

### Task 1 — `url-inventory.md` and `metadata.md`

**Inventory.** Sources, in this order:
1. The code: every `app/**/page.tsx`, route handler, `sitemap.ts`, `robots.ts`, `vercel.json`,
   `next.config.ts`, `proxy.ts`.
2. The live site, if the sandbox reaches it: `https://biezunski-avocat.fr/sitemap.xml`, `/robots.txt`,
   and the public article list `https://biezunski-avocat.fr/api/v1/articles/?page_size=100` (published
   slugs). Record the status code each URL answers today (`curl -sI`). If a host is blocked, ask for it
   with `mcp__orch__request_sandbox_access` once, say why; if refused, write what you could not check.
3. Search Console: you have no access. Write the procedure (Performance → Pages and → Queries, last 16
   months; Pages report: indexed, "Not found (404)", "Page with redirect", "Alternate page with proper
   canonical"), the table to paste it into, and the rule per row: a URL with impressions, clicks or
   backlinks that has no 200 target after launch gets a 301 to the closest page (domaine page > hub >
   home), never all to `/`. Tell the lead if you want the user to supply the export now.

Columns: URL · type · today (status, index, in sitemap, canonical) · after launch (status, index,
sitemap, canonical) · redirect · source of the row. Then the **redirect map** (source, target, status,
where it lives, test). Include host variants: `http://`, `www.` (say what Vercel does today, or that #86
must check it), `cdn.` (existing 301), trailing slash (308).

**Metadata.** One table per page type (home, hub, domaine page, domaine fallback section, `/a-propos`,
`/contact`, `/publications` and its query variants, article, legal, `/carte`, `/carte/vcard`, `/avis`,
404, error), with: title (the `copy.md` key and the resolved string), length, description (key, length),
canonical, robots, sitemap + `lastModified` source, OG type and image, JSON-LD nodes. Check every
title and description against the limits and the rules in `spec.md`; list any problem for the lead.

**JSON-LD.** For each page type, a complete example (valid JSON, real values from `CONTACT`, `copy.md`
and one real published article from the live API if reachable), and a property table: property ·
value · source (constant / API field / copy key) · required or optional · why. Decide the open points:
`@type` of the cabinet (`LegalService` alone or with `Attorney`), `areaServed`, `knowsAbout`, `geo`
(compute the coordinates of 29 rue du Président Édouard Herriot, 69002 Lyon, or leave them for Eva's GBP
pin), `hasMap` (needs the GBP place URL: E9d is pending; say what to use meanwhile), the domaine
fallback case. Check each type against Google's structured data docs and schema.org; note what earns a
rich result and what doesn't.

**Code checklist.** End `metadata.md` with the list of code changes, grouped by the issue that makes them
(#79 helpers and root layout, #80 home and header, #81 domaine pages, #82 publications and sitemap
`updated_at`, #83 contact, #84 legal/404/`/carte`, #85 back-office slug rule, #86 tests and validation).
Each item names the file and the expected behaviour, so those issues can copy it.

### Task 2 — `local-seo.md` and `monitoring.md`

**Local SEO checklist** (table: item · today, with evidence · target · owner issue · status). At least the
items in `spec.md` "Local SEO", plus: GBP primary and secondary categories, GBP services and description
in line with the 4 domaines, GBP website field (`https://biezunski-avocat.fr/`, optionally with UTM
`?utm_source=gbp` so K11 shows in analytics; the canonical ignores it), review link (E9b), photos;
consistency with the Barreau de Lyon directory and other listings Eva already has. Mark each Eva action
plainly, worded so the lead can send it to her.

**Monitoring plan.** Baseline (what, from where, who, when), launch-day checklist, then the schedule to
month 3 as in `spec.md`. For each check: tool, metric, threshold, action, owner (#86 or Eva). Tie it to
K9, K10, K11 of #66. Include the "a formerly ranking URL now 404s" and "brand clicks drop" playbooks, and
when to revisit per-profession pages (ia §2: steady profession-specific impressions for 3 months).

## For ui

### Task 3 — Social share images

Inputs: `spec.md` "Social share images", `brand.md` (Direction A, Aleo, palette, logo rules), the
design system v2 if merged (`mcp__orch__sync_integration` won't bring it: read it from `origin/main`
when it lands, else work from `brand.md`), the copy strings in `copy.md` (§1 global, domaine labels and
h1, the home positioning).

- In `EB-Avocat.figcraft`, add a page `Social` with a 1200 × 630 frame per template: default, domaine
  (one per domaine page, using the real labels), article fallback (one with a short title, one with a
  90-character title). Show the safe area for a square crop (630 × 630 centred) and keep all text in it.
- Text ≥ 48 px for titles at 1200 wide; contrast AA on the chosen background; no photo (no session for
  now, `brand.md`).
- Export each frame to `.orchestrator/features/redesign-seo-preservation-and-structured/design/og/`
  (`default.png`, `domaine-<slug>.png`, `article-short.png`, `article-long.png`), each under 300 KB.
- Write `design/og/README.md`: fixed vs variable parts, font files and weights, colours (token names),
  title wrapping and truncation rule, and your recommendation for #79: static PNGs (default, domaine)
  vs `next/og` `ImageResponse` (article fallback), with the reason.
