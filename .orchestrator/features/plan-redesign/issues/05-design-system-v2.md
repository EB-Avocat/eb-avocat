---
title: Redesign: design system v2 in Figcraft
labels: redesign, design
---

## Context

The token model is thin and partly bypassed by Tailwind grays and two reds (A-27). Body text is light, small and low-emphasis (A-12). White-alpha utilities are used as a general style on teal (A-13). The focus ring fails 3:1 on most dark surfaces and reshapes focused elements (A-14). Hacks signal missing pieces: `-mt-6`, inline transitions, hard-coded scroll padding (A-26).

## Scope

- Semantic tokens: surface, text, muted text (solid, contrast-checked per surface), border, success, error, focus ring per light/dark surface.
- Type scale based on the chosen brand direction: body ≥ 16px, meta ≥ 14px, heading scale and line heights, weights actually used.
- Spacing, radius, shadow and motion tokens (no `transition-all`, no inline overrides).
- Components with variants and states: Button, Navbar (single model + mobile), SectionHeading (with subtitle), cards, chips, pagination, form fields (default / focus / error / success / required), Footer, article blocks, back-office controls.
- Contrast table for every text/background pair.

## Out of scope

Page layouts, code.

## Acceptance criteria

- [ ] Figcraft page `Foundations v2` and `Components v2` created from the baseline.
- [ ] Every text/background pair documented at ≥ 4.5:1 (≥ 3:1 for large text and UI).
- [ ] Focus style defined for light and dark surfaces, no radius change.
- [ ] Each component shows all states, including disabled and error.
- [ ] Token names map one-to-one to the planned CSS variables.

## Depends on

- {{04}} Brand direction and moodboard

## References

- Audit: A-12, A-13, A-14, A-26, A-27, §3 and the contrast tables; Figcraft `Foundations`, `Components`; `design/current/foundations.png`, `components.png`
