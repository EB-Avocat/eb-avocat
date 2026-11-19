# UX brief — Plan redesign

Read `spec.md` first. This feature is an audit and a plan, **not** a new design.

## Who the site is for
- **Prospects**: liberal professionals (doctors, dentists, pharmacists, physios, vets, lawyers…)
  and entrepreneurs, mostly around Lyon, looking for a lawyer for company creation (SEL, SCM, SCI,
  SPFPL), sale/loan of a practice, professional contracts, Ordre litigation, patronage, training.
- **Existing clients**: leave a Google review, find contact details, read publications.
- **Networking contacts**: scan the QR card (`/carte`) and save the vCard.
- **Eva**: writes publications in the back-office.

## Main journeys to audit
1. Prospect lands on home → understands the offer → contacts (form, phone, email).
2. Prospect arrives from search on a publication → trusts the expertise → contacts.
3. Client → leaves a review.
4. QR card → saves contact / visits site.
5. Eva → logs in → writes, illustrates and publishes an article.

## Audit lenses (D1)
- Clarity of positioning and offer (hero, À propos, domaines), proof (reviews are a link only,
  no testimonials shown), calls to action and their placement.
- Information architecture: one long home page with anchor nav + `/publications`; are domaines
  deep enough for SEO and prospects?
- Visual system: consistency of tokens, hierarchy, density, imagery (one portrait), brand
  expression vs generic template feel.
- Accessibility (WCAG 2.2 AA / RGAA): contrast of white/60–80 text on teal, focus, motion,
  forms, headings order. The code already has a skip link, focus ring and reduced-motion rules.
- Mobile experience.
- Back-office usability for a non-technical author.
- SEO and content: titles, local SEO, structured data present in `app/layout.tsx`.

## Handoff to ui
UX does not draw. The `ui` node rebuilds the current design in Figcraft from the code in parallel.
When the audit names a screen state that the inventory in `spec.md` misses, message `ui`
with the screen and the source file.

## Issue drafts (D3)
- One file per issue in `issues/`, numbered in execution order; `00-epic.md` is the epic.
- Each body: **Context** (link the audit finding ids), **Scope**, **Out of scope**,
  **Acceptance criteria** (checkable), **Depends on**, **References** (Figcraft page/frame names,
  PNGs in `design/current/`).
- Labels: use only `redesign` plus one of `design`, `content`, `frontend`, `a11y`, `seo`, `backoffice`.
  `create-issues.sh` creates missing labels first (`gh label create --force`).
- `create-issues.sh`: idempotent-ish (skip if an issue with the same title exists), creates the epic,
  captures its number, creates children with `Part of #<epic>` in the body, then edits the epic to
  add a task list of children.
