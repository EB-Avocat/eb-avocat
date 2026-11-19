---
title: Redesign: contact experience and form design
labels: redesign, design
---

## Context

The form uses native validation only; server messages are never shown (A-17). No required marker, no privacy line, no response-time promise, subject select starts disabled. Phone and email are buried (A-06) and the CTA does not match its action (A-05).

## Scope

- Contact section and, if the IA says so, a `/contact` page: coordinates, map or access info, tel and mail actions first, form second.
- Form states: idle, focus, per-field error, submitting, success, server error, "Autre" subject. Required markers, GDPR line, response-time promise.
- Mobile first: tap-to-call, tap-to-mail.
- New-tab links announce it (A-15).

## Out of scope

Back-end spam handling and delivery (existing), booking tool.

## Acceptance criteria

- [ ] Frames exported to `design/v2/` for every form state, desktop and mobile.
- [ ] Every field has a visible label, a required or optional marker and an error message wording in French.
- [ ] GDPR notice and response time are written and approved by Eva.
- [ ] Phone and email reachable in one tap from the header on mobile.

## Depends on

- {{05}} Design system v2
- {{03}} Copywriting, proof and editorial guide

## References

- Audit: A-05, A-06, A-15, A-17; Figcraft `Components` frame `form fields`; `design/current/home-states-desktop.png`, `home-states-mobile.png`
