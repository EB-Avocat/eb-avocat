---
title: Redesign: home page design
labels: redesign, design
---

## Context

The home page carries the whole offer in one scroll: generic hero (A-01), CTA with no matching action (A-05), contact channels buried (A-06), six identical offer cards (A-08), a review band with no reviews (A-04), publications after the form (A-32).

## Scope

- Desktop 1440 and mobile 390 designs of the home page in Figcraft, built from design system v2.
- Hero with promise, audience, one primary CTA, phone beside it; persistent contact action in the header.
- Offer section differentiating core and secondary domaines, each linking to its page.
- Proof section (testimonials, credentials), "how it works", contact section with the new form states, publications teaser.
- Scroll-reveal replaced by content that is visible by default (A-16).
- Document states: scrolled navbar, mobile menu open, form states.

## Out of scope

Domaine pages, publications, legal pages, code.

## Acceptance criteria

- [ ] Frames `Site v2 — Desktop / home`, `Site v2 — Mobile / home` exported to `.orchestrator/features/plan-redesign/design/v2/`.
- [ ] Hero shows promise, audience, primary CTA and a phone path without scrolling on mobile.
- [ ] Each high finding A-01, A-04, A-05 is answered visibly in the design.
- [ ] Uses only design system v2 components and tokens.
- [ ] Reviewed by Eva.

## Depends on

- {{02}} Information architecture and navigation
- {{03}} Copywriting, proof and editorial guide
- {{05}} Design system v2

## References

- [Audit](@@REPO@@/audit.md): A-01, A-04, A-05, A-06, A-08, A-16, A-32; Figcraft `Site — Desktop` / `Site — Mobile` frames `home`, `home-states`; [`home-desktop.png`](@@REPO@@/design/current/home-desktop.png), [`home-mobile.png`](@@REPO@@/design/current/home-mobile.png), [`home-scrolled-desktop.png`](@@REPO@@/design/current/home-scrolled-desktop.png), [`home-states-desktop.png`](@@REPO@@/design/current/home-states-desktop.png), [`menu-open-mobile.png`](@@REPO@@/design/current/menu-open-mobile.png)

![home-desktop](@@REPO@@/design/current/home-desktop.png?raw=true)
![home-mobile](@@REPO@@/design/current/home-mobile.png?raw=true)
