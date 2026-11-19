---
title: Implement domaine d'intervention pages
labels: redesign, frontend
---

## Context

Delivers the fix for A-03: landing pages that can rank and convert.

## Scope

- Route and template for domaine pages per the IA and design issues; content in the repo or API (decide in the IA issue).
- Breadcrumb, FAQ, related publications, contact CTA, per-page metadata and JSON-LD from the SEO issue.
- Add to the sitemap.

## Out of scope

Redirect configuration (rollout issue).

## Acceptance criteria

- [ ] All planned domaine pages live in staging with approved copy.
- [ ] One h1 per page, valid JSON-LD, canonical and title set.
- [ ] Home offer section links to each page.
- [ ] a11y tests cover the template.

## Depends on

- {{07}} Domaine page template design
- {{13}} SEO preservation
- {{14}} Implement design system v2

## References

- Audit: A-03, A-07, A-20; `.orchestrator/features/plan-redesign/design/v2/`
