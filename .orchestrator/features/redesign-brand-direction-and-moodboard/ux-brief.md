# UX brief — Brand direction and moodboard (#69)

Read `spec.md` first, then `.orchestrator/features/plan-redesign/audit.md` (§3 tokens, §5, A-08,
A-12, A-13, A-27, A-28) and `.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`
(on the branch of PR #89 if not yet on `main`: `git show 89eb4f3:<path>`).

## Who the brand speaks to
Prospects first: liberal professionals (health first, others to confirm) and entrepreneurs around
Lyon, 35–70, creating or reorganising a practice or société, or facing their Ordre. They want a
lawyer who knows *their* regulated profession, is precise and calm, and is reachable. The brand
must read as **a person-led firm** (Eva, first person), **specialised**, **serious without being
cold**. It must not read as a template (A-08) nor as a generic "law firm" (gavels, columns, scales).

Approved positioning (#66, variant A): structure the activity, anticipate friction between
associates, accompany in front of the Ordre. Proof: Barreau de Lyon, Ordre work.

## Constraints every direction keeps
- Logo unchanged; teal core (`#3f5b57`, `#4a7a6f`, `#264445`, `#162729`) and near-black `#191919`.
- A free-licence (OFL) font close to Museo replaces Museo, which is not licensed (decided by the user).
- WCAG 2.2 AA: every text colour pair ≥ 4.5:1 (3:1 large text / UI); accent never the only
  carrier of meaning. Compute ratios, don't eyeball them.
- Ethics of the profession (RIN): no comparative or results claims, no client imagery without
  consent, sober tone.

## Task 1 (ux) — what `brand.md` must contain
1. **Font**: Museo is out (not free, not licensed for the web). Shortlist 3–4 OFL fonts close to
   Museo (start from Aleo, Zilla Slab, Bitter, Hepta Slab, Podkova; add or drop with reasons) and
   score them on the criteria in `spec.md` §1: closeness to Museo and to the logo lettering
   (Museo 300, outlined), 16px body legibility, weights / variable axis, true italics, French
   glyphs, x-height and width vs Museo, WOFF2 size, licence (OFL 1.1). Recommend one. Write the font
   plan (WOFF2, subset, preload, fallback metrics, weights kept) and the list of code places that
   name Museo, for #79. Give ui, for the `Type` board, the candidates, where to download them
   (Google Fonts or the foundry's GitHub), and the specimen copy.
2. **Logo rules**: variant per surface (white, tint, primary, dark teal, photo), clear space, minimum
   sizes, don'ts, favicon.
3. **Palette**: core + per-direction extensions (accent, 4–6 warm neutrals tinted toward teal,
   error, success), with hex and contrast tables; usage proportions (e.g. 60/30/10).
4. **Typography role** (in the recommended font): weights and where each is allowed (light weights only at large sizes, A-12).
5. **Imagery and icons**: the options (documentary photography, graphic motif/illustration,
   typography-only), pros/cons for this audience and for Eva's means; icon rules.
6. **Directions**: 2–3 briefs, each with a name, 3–5 keywords, palette, type use, imagery, icon use,
   density/rhythm, 4–8 moodboard references (Unsplash links or descriptions; credit them), and the
   3 brand applications ui must draw. Seeds you may refine or replace:
   - *Documentaire* — Eva and her office photographed in natural light, warm neutrals, a discreet
     accent; trust through the person.
   - *Éditorial* — print-like typographic hierarchy, generous white space, few or no photos, a
     warm accent (the teal complement family: terracotta/ochre) used sparingly; trust through
     expertise and publications.
   - *Lyon & matière* — a graphic motif derived from the logo or from Lyon (stone, traboules,
     paper texture), illustration-light; differentiation through a signature element.
7. **Photography needs**: shot list (portrait: 2–3 setups incl. environmental; office: entrance,
   meeting room, desk; details: documents, hands, books, Lyon), ratios/sizes the site needs, rights
   to secure (web, print, social, duration), plan (local photographer, half-day, budget range to
   confirm, timing before #71 page designs if possible), interim plan.
8. **Decisions log**: filled in task 3 (choice, date, reasons, what Eva changed).

Write the direction briefs first and message `ui` as soon as they are stable (use `handoff` or
`send_message`), so ui can start the boards while you finish the rest.

## Handoff to ui
Ui draws, ux does not. Give ui for each direction: hex values, type weights and sizes for the
specimen, the reference images (URLs) for the moodboard, the 3 applications with their sample copy
(French, from `constants.ts` or the approved positioning, marked "exemple").

## Task 2 (ui) — boards
- `Type` page: the font candidates side by side, Museo as the reference line, each set in the same
  specimen copy (hero promise, À propos paragraph, publication title + body with italics, a
  button, French punctuation « » ’ œ), at 16px body and display sizes, next to the logo. Font
  files go in your scratchpad, never in the repo. Export `design/type-specimens.png`.
- `Moodboard` page: references grouped by theme (light, material, people, type, colour), credited.
- `Directions` page: one frame per direction, same structure so they compare side by side: palette
  with proportions and contrast labels, specimen in the recommended font, imagery sample, icon sample, the 3
  applications. Direction name and keywords on top.
- Export `design/moodboard.png`, `design/direction-a.png`, `design/direction-b.png`
  (`direction-c.png` if three), at 1× or 2× so they read in a GitHub issue.
- Don't touch the baseline pages.

## Task 4 (ui) — `Foundations v2`, later
Brand rules for the chosen direction: logo variants and clear space, palette with roles and
proportions, type specimen and weight rules, imagery do/don't, icon set and sizes. Leave room for
#70 (tokens, scale, components). Export `design/foundations-v2.png`.
