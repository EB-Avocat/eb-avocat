---
title: Redesign: QA, redirects, launch and monitoring
labels: redesign, frontend
---

## Context

Final step: ship without losing traffic or accessibility.

## Scope

- Full QA on staging: devices and browsers, keyboard, screen reader, 200% zoom, Lighthouse against budgets.
- Redirects from the SEO map configured and tested; sitemap submitted.
- Launch plan with rollback, announcement to Eva's contacts.
- Measure the KPIs against the baseline at 1 and 3 months; Search Console watch.
- Close the epic with a short retrospective.

## Out of scope

New features discovered during QA (new issues).

## Acceptance criteria

- [ ] Every redirect in the map returns a 301 to a live page.
- [ ] Budgets and a11y checks pass on production.
- [ ] No high or critical bug open.
- [ ] 1-month KPI report posted on the epic.

## Depends on

- {{15}} Navigation and home
- {{16}} Domaine pages
- {{17}} Publications
- {{18}} Contact
- {{19}} Utility pages
- {{20}} Back-office

## References

- Audit: all; `design/v2/`; SEO issue redirect map
