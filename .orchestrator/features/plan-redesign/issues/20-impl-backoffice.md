---
title: Implement back-office alignment and editor changes
labels: redesign, backoffice
---

## Context

Implements the decisions of the back-office design issue (A-19, A-23, A-24, A-25).

## Scope

- Tokens and logo applied across `backoffice/**`; contrast fixes.
- Publishing flow and editor vocabulary changes; autosave if decided.
- Backend changes only if the flow needs them, with tests and regenerated API types.

## Out of scope

New permissions, MCP changes.

## Acceptance criteria

- [ ] Matches `.orchestrator/features/plan-redesign/design/v2/` back-office frames.
- [ ] Publishing flow as decided, covered by tests.
- [ ] Eva validates the flow on staging.
- [ ] `tox -e lint,type,test`, `tox -e frontend` pass.

## Depends on

- {{11}} Back-office design
- {{14}} Implement design system v2

## References

- [Audit](@@REPO@@/audit.md): A-19, A-23, A-24, A-25; `.orchestrator/features/plan-redesign/design/v2/`; `components/backoffice/**`, `app/backoffice/**`

![bo-article-editeur-desktop](@@REPO@@/design/current/bo-article-editeur-desktop.png?raw=true)
