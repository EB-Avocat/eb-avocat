---
title: Redesign: information architecture and navigation
labels: redesign, content
---

## Context

One long home page with anchors plus `/publications`. Navigation follows the page, not the visitor (A-02), there is no page per domaine (A-03), the navbar has two variants driven by scroll-spy (A-18), and publications come last, after Contact (A-32).

## Scope

- Site map: decide standalone pages (one per domaine d'intervention? per profession? "À propos", "Contact"?), with proposed URLs.
- Primary navigation built around prospect tasks, with one visible contact action (phone on mobile). Move "Votre avis" out of the main nav (footer, end of articles, `/carte`).
- Home page section order and the role of publications (credibility vs conversion).
- Footer structure; single nav model with route-aware active state.
- Output: IA diagram and URL table (new URL, old URL, redirect needed) used by the SEO issue.

## Out of scope

Visual design, page copy, implementation.

## Acceptance criteria

- [ ] Site map and URL table committed under the feature docs.
- [ ] Decision recorded for each domaine: own page or section, with the reason.
- [ ] Navigation items and CTA decided, with mobile behaviour.
- [ ] Home section order decided.
- [ ] Old URLs mapped (feeds the SEO issue).

## Depends on

- {{01}} Objectives, audience and KPIs

## References

- [Audit](@@REPO@@/audit.md): A-02, A-03, A-18, A-32, §1 site map; [`home-desktop.png`](@@REPO@@/design/current/home-desktop.png), [`menu-open-mobile.png`](@@REPO@@/design/current/menu-open-mobile.png); Figcraft `Components` frame `Navbar`

![home-desktop](@@REPO@@/design/current/home-desktop.png?raw=true)
![menu-open-mobile](@@REPO@@/design/current/menu-open-mobile.png?raw=true)
