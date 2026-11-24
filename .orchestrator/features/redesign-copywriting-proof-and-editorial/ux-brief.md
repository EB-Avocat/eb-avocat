# UX brief — Copywriting, proof and editorial guide (#68)

For `ux` (writer of the guide and the copy) and `ui` (constants-ready file and checks). Read
`spec.md` first: deliverables (§3), decisions (§4), questionnaire (§6).

Read the inputs from `origin/main` (this branch predates them): `git show origin/main:<path>` for
`objectives.md` (#66), `ia.md` and `url-table.md` (#67), `brand.md` (#69), and
`plan-redesign/audit.md` here. Current copy: `frontend/src/lib/constants.ts`.

## Who reads this copy

Prospects first (#66 §1): liberal professionals (health confirmed; others via E2) and
entrepreneurs around Lyon, 35–70, creating or reorganising a practice, a société, a contract, or
facing their Ordre. They are not lawyers: they know their profession's words (« patientèle »,
« remplaçant », « Ordre ») but not « SPFPL » or « apport en société ». They choose a person, and
want to know before writing: does she handle my case, can I trust her, what happens next, what will
it cost me in time and money.

## What good looks like

- **Benefit before service** (A-01): each block starts from the client's situation or result,
  then says what Eva does. « Vous vous associez avec un confrère ? Je rédige des statuts qui
  prévoient… » rather than « Rédaction de statuts ».
- **Plain words, glossed terms** (A-07): short sentences (aim ≤ 20 words), one idea per paragraph,
  every acronym or legal term glossed on its first use on each page.
- **Concrete** (A-07): « pour qui », typical situations, how it goes step by step, what to prepare.
- **Proof without bragging** (A-04): credentials and facts, never superlatives, comparisons or
  promised outcomes (avocat communication rules; Eva has the final word on what is allowed).
- **One voice** (A-30): « je » throughout; the form success message, 404 and error page included
  (today « Eva vous répondra », « Nous n'avons pas trouvé », « nous contacter » break it).
- **Same word, same thing**: one label per concept across nav, CTA, footer, headings, form.

## Constraints

- Positioning A (#66 §3) is approved by Eva: the hero and À propos stay true to it; you may
  shorten and reorder, not change its substance.
- IA (#67) is decided: page list, slugs, home order, page ends, label length limits (nav ≤ 12,
  CTA ≤ 22 characters). Labels in « » in `ia.md` are working labels: you write the final ones.
- Launch gate per domaine page (#67 §2): for whom, what Eva does, how it goes, ≥ 3 situations,
  ≥ 3 FAQ. FAQ answers stay general and verifiable; anything specific to a profession or an
  Ordre is `[À CONFIRMER : …]`.
- Never invent a fact (spec §4.4). Every conditional block has its fallback written (spec §4.5).
- Typography: U+00A0 before » : ; ? ! and after « (brand §1.3); typographic apostrophe ’;
  phone shown as « 07 56 85 62 75 » (tel: link keeps E.164 from `CONTACT.phone`).
- Layout and visuals are out of scope: give lengths and hierarchy (kicker, h1, lead, body), not
  sizes or colours.

## Format of `copy.md`

One section per page, in IA order. Inside, one block per component slot, each with a stable key
that `copy.ts` reuses (e.g. `HERO.heading`, `DOMAINES.items[creation-de-societe].faq[0].q`), its
French text, and a one-line note when a choice needs a reason or depends on Eva (link to the
`eva-content.md` row). Give meta title and description for every indexable page.

## For `ui`

`copy.ts` mirrors `copy.md` key for key; keep today's export names and shapes where a block
survives so #79–#84 can diff it against `constants.ts`. `check-copy.ts` enforces spec §3 rules and
prints each failure with its key. Run with `bun` from the repo root; no new dependency.
