---
title: Site redesign
labels: redesign
---

## Context

biezunski-avocat.fr (Eva Biezunski, avocate en droit des sociétés, Lyon) works but reads as a generic template, converts weakly and cannot rank for what prospects search. The audit ([audit.md](@@REPO@@/audit.md)) lists 32 findings, 6 of them high severity: A-01 positioning, A-02 navigation, A-03 no page per domaine, A-04 proof, A-05 CTA that does not match its promise, A-09 articles are dead ends.

The current design is copied screen by screen in Figcraft (`EB-Avocat.figcraft`) with PNG exports in [design/current/](@@REPO@@/design/current). That file is the baseline the redesign starts from.

## Goal

Redesign the site and back-office so that a prospect understands the offer in seconds, trusts it, and contacts Eva, without losing the brand equity (logo, teal palette, Museo, first-person tone) or the existing SEO.

## Scope

Strategy and content, brand direction, design system v2, page designs, back-office, accessibility and performance, SEO preservation, then implementation and rollout. Order: strategy → design → code.

## Out of scope

New business features (online booking, client area, payments), a CMS change, a backend rewrite. Anything that needs them is recorded in the relevant issue as a follow-up.

## Acceptance criteria

- [ ] All child issues below are closed.
- [ ] Every high-severity audit finding (A-01, A-02, A-03, A-04, A-05, A-09) is resolved on the live site.
- [ ] KPIs defined in the objectives issue are measured before and after the launch.
- [ ] No URL that ranks today is lost (redirects verified).
- [ ] WCAG 2.2 AA / RGAA checks pass on the new site.

## Depends on

None. Children are listed in the task list below (added by `create-issues.sh`).

## References

- [Audit](@@REPO@@/audit.md)
- [Spec](@@REPO@@/spec.md)
- Baseline PNGs: [design/current/](@@REPO@@/design/current) ([`cover.png`](@@REPO@@/design/current/cover.png), [`foundations.png`](@@REPO@@/design/current/foundations.png), [`components.png`](@@REPO@@/design/current/components.png), [`home-desktop.png`](@@REPO@@/design/current/home-desktop.png), …)
- Figcraft file: `EB-Avocat.figcraft`, pages `Cover`, `Foundations`, `Components`, `Site — Desktop`, `Site — Mobile`, `Back-office`

![cover](@@REPO@@/design/current/cover.png?raw=true)
