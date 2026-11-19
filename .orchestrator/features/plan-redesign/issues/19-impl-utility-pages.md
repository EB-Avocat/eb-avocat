---
title: Implement legal pages, error screens and QR card
labels: redesign, frontend
---

## Context

Aligns the secondary screens on design system v2 and fixes A-11 (`/carte`).

## Scope

- Legal template, 404, `error` and `global-error` on one pattern.
- `/carte`: contact links on every platform, desktop behaviour per the design decision, robust vCard handling; check on iOS Safari, Firefox iOS, Android.

## Out of scope

Legal text changes.

## Acceptance criteria

- [ ] Matches `design/v2/` frames.
- [ ] `/carte` shows phone, email and site on every platform; desktop behaviour as decided.
- [ ] `/carte` robots/noindex pair fixed (A-21).
- [ ] a11y tests pass.

## Depends on

- {{10}} Utility pages design
- {{14}} Implement design system v2

## References

- Audit: A-11, A-21, A-30; `design/v2/`; `app/carte/page.tsx`, `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`
