---
title: Redesign: copywriting, proof and editorial guide
labels: redesign, content
---

## Context

Messages describe what the firm does, not what it changes for the client (A-01). Offers are dense with acronyms (SEL, SCM, SCI, SPFPL) and have no example, audience, process or first-meeting information (A-07). Proof is almost absent: the review block shows no review (A-04). Tone is good but inconsistent (A-30).

## Scope

- Editorial guide: first person, plain language, glossary for legal acronyms, consistent terms ("Contact" vs "Coordonnées", "Cabinet" vs "Avocate au Barreau de Lyon").
- Hero message (promise, audience), À propos, each domaine (for whom, what, how it works, example), "how a first contact works", delay and fee information if Eva agrees.
- Proof layer: selected testimonials with written consent, credentials (bar, training), client types, figures, publications as expertise, Google rating if allowed.
- Contact copy: what to prepare, confidentiality, response time, GDPR line (A-17).
- Content list to collect from Eva, with owners and deadlines.

## Out of scope

Layout and visuals, new publications.

## Acceptance criteria

- [ ] Editorial guide committed.
- [ ] Final French copy for home, domaines, contact, approved by Eva, in `constants.ts` ready form.
- [ ] Proof items listed, each with consent status.
- [ ] Every legal acronym is glossed in plain language on first use.

## Depends on

- {{01}} Objectives, audience and KPIs
- {{02}} Information architecture and navigation

## References

- Audit: A-01, A-04, A-07, A-17, A-30; `lib/constants.ts`; `design/current/home-desktop.png`
