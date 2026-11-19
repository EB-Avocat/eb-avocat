---
title: Redesign: domaine d'intervention page template
labels: redesign, design
---

## Context

There is no page per domaine (A-03), so searches like "créer une SEL Lyon" or "contentieux ordinal" cannot land on the site. Offers lack audience, process and examples (A-07).

## Scope

- One reusable page template (desktop and mobile): plain-language intro, for whom, what is included, how it works, typical situations, FAQ, related publications, contact CTA.
- Apply it to the domaines decided in the IA issue; list required content per page.
- Breadcrumb and internal linking pattern.

## Out of scope

Writing every page's final copy (content issue), code.

## Acceptance criteria

- [ ] Template frames exported to `.orchestrator/features/plan-redesign/design/v2/`, desktop and mobile.
- [ ] Content blocks listed with their source and owner per domaine.
- [ ] Each page has one primary CTA and a visible phone path.
- [ ] Matches the SEO needs: one h1, FAQ-ready, breadcrumb.

## Depends on

- {{02}} Information architecture and navigation
- {{03}} Copywriting, proof and editorial guide
- {{05}} Design system v2

## References

- Audit: A-03, A-07, A-20; Figcraft `Components` frame `ServiceCard`; `design/current/home-desktop.png`
