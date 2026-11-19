---
title: Redesign: back-office alignment and editor polish
labels: redesign, backoffice
---

## Context

The back-office is functional but looks like another product: no logo, gray neutrals, a second red, a green palette (A-19). The publishing model is ambiguous (A-23), editor vocabulary is technical and there is no autosave (A-24), mobile editing is unverified (A-25). These findings come from a screen-level read: confirm with Eva before scoping.

## Scope

- Short session with Eva to validate A-23, A-24, A-25.
- Align the back-office on design system v2 tokens (colour, type, radius, states) while keeping admin density; add the logo.
- Clear status model ("Brouillon" / "En ligne"), one primary action, explanation of what is public, slug and date helpers.
- Slash menu reduced and renamed for a legal author; autosave and publication undo evaluated.
- Decide whether mobile editing is supported.

## Out of scope

New back-office features, MCP endpoint, permissions.

## Acceptance criteria

- [ ] Eva's feedback recorded.
- [ ] Back-office frames updated in Figcraft (`Back-office v2`) and exported to `design/v2/`.
- [ ] Placeholder and disabled text meet contrast (gray-400 case from the audit fixed).
- [ ] Publishing flow decided and written down.
- [ ] Mobile editing decision recorded.

## Depends on

- {{05}} Design system v2

## References

- Audit: A-19, A-23, A-24, A-25, J5; Figcraft `Back-office`; `design/current/bo-articles-desktop.png`, `bo-article-editeur-desktop.png`, `bo-article-editeur-slash-desktop.png`, `bo-connexion-desktop.png`, `bo-menu-mobile.png`
