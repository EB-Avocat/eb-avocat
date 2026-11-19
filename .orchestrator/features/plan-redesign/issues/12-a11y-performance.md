---
title: Redesign: accessibility (WCAG 2.2 AA / RGAA) and performance budgets
labels: redesign, a11y
---

## Context

Basics exist (skip link, reduced motion, labelled fields) but gaps remain: focus ring contrast (A-14), thin small text (A-12), alpha text on teal (A-13), hidden-by-default reveal content (A-16), new-tab links (A-15), heading and alt gaps (A-31). Performance is unmeasured: OTF fonts, large portrait, `100vh` hero (A-28, A-29).

## Scope

- Accessibility checklist for the redesign (WCAG 2.2 AA, RGAA) applied to design and code reviews, with testing method (axe, keyboard, screen reader pass, 200% zoom).
- Performance budgets (LCP, CLS, INP, JS and image weight) measured on the current site first (Lighthouse, field data if available), then set for the new one.
- Font plan (WOFF2, preload, fallback metrics), image policy (sizes, formats, alt text).
- Extend the Playwright a11y tests to the new templates.

## Out of scope

Implementing the fixes (done in the implementation issues).

## Acceptance criteria

- [ ] Baseline measurements recorded.
- [ ] Budgets written with their thresholds.
- [ ] Checklist covers A-12 to A-16 and A-31.
- [ ] CI runs the a11y tests on every new template.
- [ ] An accessibility statement ("déclaration d'accessibilité") need is assessed.

## Depends on

- {{05}} Design system v2

## References

- [Audit](@@REPO@@/audit.md): A-12, A-13, A-14, A-15, A-16, A-28, A-29, A-31, contrast tables in §4; [`foundations.png`](@@REPO@@/design/current/foundations.png)

![foundations](@@REPO@@/design/current/foundations.png?raw=true)
