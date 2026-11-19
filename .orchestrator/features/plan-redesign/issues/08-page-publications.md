---
title: Redesign: publications list and article design
labels: redesign, design
---

## Context

Articles are the main SEO entry (J2) but are dead ends: no author block, no contact CTA, no related or next article (A-09). Wayfinding loses filter state (A-10), articles carry no structured data (A-20), and prose uses a separate type system (§3).

## Scope

- Publications list: intro, category filter, cards with and without cover, pagination, empty state, in desktop and mobile.
- Article template: cover, categories, author, reading time, body with design system v2 prose styles, author card with credentials, contextual CTA to contact, related articles, next article, back link that keeps list state.
- Share and "updated on" if useful.

## Out of scope

Back-office editor (see back-office issue), code.

## Acceptance criteria

- [ ] Frames for list, empty state and article exported to `.orchestrator/features/plan-redesign/design/v2/`, desktop and mobile.
- [ ] High finding A-09 answered: author block, CTA, related content below every article.
- [ ] Prose styles come from the design system (no separate typography plugin look).
- [ ] Article page has room for JSON-LD data (author, dates, image) without visible change.

## Depends on

- {{05}} Design system v2
- {{03}} Copywriting, proof and editorial guide

## References

- [Audit](@@REPO@@/audit.md): A-09, A-10, A-20, A-32; Figcraft `Site — Desktop` frames `publications`, `article`; [`publications-desktop.png`](@@REPO@@/design/current/publications-desktop.png), [`publications-mobile.png`](@@REPO@@/design/current/publications-mobile.png), [`publications-empty-desktop.png`](@@REPO@@/design/current/publications-empty-desktop.png), [`article-desktop.png`](@@REPO@@/design/current/article-desktop.png), [`article-mobile.png`](@@REPO@@/design/current/article-mobile.png)

![publications-desktop](@@REPO@@/design/current/publications-desktop.png?raw=true)
![article-desktop](@@REPO@@/design/current/article-desktop.png?raw=true)
