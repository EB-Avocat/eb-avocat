---
title: Redesign: legal pages, 404/error and QR card design
labels: redesign, design
---

## Context

Legal pages use a different rhythm (A-30). 404, error and `global-error` are three different layouts. `/carte` depends on User-Agent sniffing, shows phone/email on iOS only, and redirects desktop silently (A-11).

## Scope

- Legal template (mentions légales, politique de confidentialité), readable long-form.
- 404, error and global-error aligned on one pattern with useful exits (home, contact, phone).
- QR card: contact links on all platforms, explicit desktop behaviour (a real page or an explanation), vCard states including the Firefox iOS case.

## Out of scope

Legal text changes, code.

## Acceptance criteria

- [ ] Frames exported to `.orchestrator/features/plan-redesign/design/v2/`, desktop and mobile where relevant.
- [ ] `/carte` desktop decision recorded.
- [ ] All error screens share one layout and tokens.
- [ ] Legal pages reuse the article prose styles.

## Depends on

- {{05}} Design system v2

## References

- [Audit](@@REPO@@/audit.md): A-11, A-30, §1 (carte states, global-error); [`mentions-legales-desktop.png`](@@REPO@@/design/current/mentions-legales-desktop.png), [`politique-de-confidentialite-desktop.png`](@@REPO@@/design/current/politique-de-confidentialite-desktop.png), [`404-desktop.png`](@@REPO@@/design/current/404-desktop.png), [`error-desktop.png`](@@REPO@@/design/current/error-desktop.png), [`global-error-desktop.png`](@@REPO@@/design/current/global-error-desktop.png), [`carte-mobile.png`](@@REPO@@/design/current/carte-mobile.png), [`carte-ios-mobile.png`](@@REPO@@/design/current/carte-ios-mobile.png), [`carte-firefox-ios-mobile.png`](@@REPO@@/design/current/carte-firefox-ios-mobile.png)

![carte-mobile](@@REPO@@/design/current/carte-mobile.png?raw=true)
![404-desktop](@@REPO@@/design/current/404-desktop.png?raw=true)
