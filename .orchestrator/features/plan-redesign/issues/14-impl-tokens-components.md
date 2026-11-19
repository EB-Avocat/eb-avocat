---
title: Implement design system v2 (tokens, fonts, components)
labels: redesign, frontend
---

## Context

First implementation step: everything else builds on it. Today the tokens are 5 colours in `globals.css`, Tailwind grays, two reds, and `BRAND_COLORS` duplicated in `constants.ts` (A-27); hacks exist in components (A-26); Museo is served as unoptimised OTF (A-28).

## Scope

- `@theme` tokens from the Figcraft design system v2 (semantic colours, type, spacing, radius, shadow, motion); remove raw Tailwind grays and the duplicated `BRAND_COLORS`.
- Fonts: WOFF2, preload, fallback metrics, drop unused weights.
- Components: Button, Navbar (single model), SectionHeading with subtitle, cards, chips, pagination, form fields, Footer, article prose; one focus style (A-14), no inline transitions (A-26).
- Reveal animations replaced by content visible by default (A-16).
- Update unit and a11y tests.

## Out of scope

Page layouts and new pages.

## Acceptance criteria

- [ ] No hard-coded gray or red utility left in `components/` and `app/` outside the token layer.
- [ ] Contrast table of the design system respected (checked by test or script).
- [ ] Focus ring visible at ≥ 3:1 on every surface, no radius change.
- [ ] `tox -e frontend` passes; Playwright a11y passes.
- [ ] Site renders unchanged in structure (visual diff reviewed) before page work starts.

## Depends on

- {{05}} Design system v2
- {{12}} Accessibility and performance budgets

## References

- [Audit](@@REPO@@/audit.md): A-13, A-14, A-16, A-26, A-27, A-28; Figcraft `Foundations v2`, `Components v2`; `frontend/src/app/globals.css`
