---
title: Redesign: SEO preservation and structured data
labels: redesign, seo
---

## Context

Only home and `/publications/*` can rank today (A-03). Structured data is a single `Attorney` block with a placeholder `priceRange` (A-20); sitemap dates change on every build, the default canonical points to `/` for any new route (A-21); local SEO is thin (A-22). A redesign that moves URLs can lose traffic.

## Scope

- Inventory of indexed URLs and traffic (Search Console, sitemap) before the launch.
- Redirect map from the URL table of the IA issue; no ranking URL left without a 301.
- Per-route titles, descriptions, canonicals; real `lastModified` in the sitemap; fix the `/carte` robots/noindex pair.
- JSON-LD per page type: `Article`/`BlogPosting`, `BreadcrumbList`, `LegalService`/`Service` per domaine, `FAQPage` where there is a FAQ, review `priceRange`.
- Local SEO checklist: title, h1 with Lyon and the audience, NAP consistency, Google Business Profile link, map.
- Post-launch monitoring plan.

## Out of scope

Link building, paid acquisition.

## Acceptance criteria

- [ ] URL inventory and redirect map committed.
- [ ] Metadata and JSON-LD spec per page type.
- [ ] Local SEO checklist done.
- [ ] Monitoring plan for 3 months after launch.

## Depends on

- {{02}} Information architecture and navigation

## References

- [Audit](@@REPO@@/audit.md): A-03, A-18, A-20, A-21, A-22; `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`
