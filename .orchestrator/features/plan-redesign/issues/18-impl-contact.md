---
title: Implement contact form and states
labels: redesign, frontend
---

## Context

Delivers A-17 (form states) and A-15 (new-tab announcements); completes the A-05 and A-06 fixes started in the header.

## Scope

- Form per design: required markers, inline errors tied with `aria-describedby`, server field messages displayed, success and failure states, GDPR line, response-time promise.
- Tap-to-call and tap-to-mail actions; map or access information.
- Tests for each state.

## Out of scope

Booking tool, change of delivery provider.

## Acceptance criteria

- [ ] Every state of the design is reachable and tested.
- [ ] Server validation errors appear on the right field.
- [ ] Screen-reader pass: errors announced, focus moved to the first error.
- [ ] External links announce a new tab.

## Depends on

- {{09}} Contact design
- {{14}} Implement design system v2

## References

- [Audit](@@REPO@@/audit.md): A-15, A-17; `.orchestrator/features/plan-redesign/design/v2/`; `components/Contact.tsx`, `lib/contact.ts`

![home-states-desktop](@@REPO@@/design/current/home-states-desktop.png?raw=true)
