---
title: Implement navigation, header and home page
labels: redesign, frontend
---

## Context

Delivers the fixes for the home-page high findings: A-01 message, A-02 navigation, A-04 proof, A-05 CTA, and A-06 contact access, using the new design and copy.

## Scope

- New navigation and header (contact action, phone on mobile) per the IA issue; route-aware active state, no scroll-spy hack (A-18).
- Home page sections in the decided order with the final copy in `constants.ts`.
- Proof section, offer section linking to domaine pages, publications teaser.
- Footer v2 (review ask moved here).
- Event tracking for the KPIs.

## Out of scope

Domaine pages, publications, contact form logic.

## Acceptance criteria

- [ ] Matches `design/v2/` home frames at desktop 1440 and mobile 390.
- [ ] Hero shows the approved promise and a CTA whose label matches its action.
- [ ] Phone and contact reachable from the header on every page.
- [ ] Lighthouse accessibility and performance meet the budgets.
- [ ] Playwright a11y passes.

## Depends on

- {{06}} Home page design
- {{14}} Implement design system v2

## References

- Audit: A-01, A-02, A-04, A-05, A-06, A-18; `design/v2/`; `components/Navbar.tsx`, `app/page.tsx`
