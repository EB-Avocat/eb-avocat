---
title: Implement publications list and article template
labels: redesign, frontend
---

## Context

Delivers the fix for A-09 (articles that lead nowhere) and A-10, A-20 for articles. May require small API additions (author bio, related articles): if so, run `tox -e api-types`.

## Scope

- Publications list and article template per design: author card, contextual CTA, related and next articles, reading time, back link that keeps list state.
- `Article`/`BlogPosting` and `BreadcrumbList` JSON-LD, real `lastModified` in the sitemap (A-21).
- Back-end changes only if needed for author card or related content, with tests (coverage ≥ 90%).

## Out of scope

Editor changes.

## Acceptance criteria

- [ ] Every article ends with author block, contact CTA and related content.
- [ ] List filter state survives the article round-trip.
- [ ] Structured data validated.
- [ ] `tox -e lint,type,test` and `tox -e frontend` pass; API types regenerated if changed.

## Depends on

- {{08}} Publications design
- {{13}} SEO preservation
- {{14}} Implement design system v2

## References

- Audit: A-09, A-10, A-20, A-21; `design/v2/`; `app/publications/`
