# Redesign: brand direction and moodboard (#69) — spec

Part of #65. Depends on #66 (closed: positioning, audiences, CTA decided in
`.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`, PR #89). Blocks #70
(design system v2).

## Goal

Decide how the brand evolves for the redesign, without losing its equity (logo, teal palette,
first-person tone: audit §5 "Keep"; Museo's *feel*, since the font itself is replaced), so that #70 can build tokens and components on a
settled base. Fix the two open brand risks: the unlicensed Museo web font (A-28), by moving to a free-licence font close to it, and the "template" look
(A-08), and decide imagery (audit §5 "Question").

No production code. Repo changes are docs and PNG exports under this folder. The design work
happens in the Figcraft file.

## What exists (from the code and the audit)

- **Logo**: five variants in `frontend/public/images` (for white, light-green, dark-green, black
  backgrounds, white-on-black), SVG/PNG/WebP; favicon SVG; PWA icons. No usage rules written.
- **Palette** (`frontend/src/app/globals.css` `@theme`): `#3f5b57` primary, `#4a7a6f`
  primary-light, `#264445` dark-teal, `#162729` darker-teal, `#191919` near-black. Neutrals are
  Tailwind grays (cool), errors are two Tailwind reds, no accent (A-27).
- **Type**: Museo 100/300/500/700/900 OTF in `frontend/public/fonts`, ~127 KB each, served as
  OpenType, no `unicode-range`, `font-display: swap` → Georgia first paint then reflow (A-28).
  Only 300/500/700 are loaded; 100 and 900 are dead files. The OTF metadata reads
  "Copyright (c) 2008 Jos Buivenga/exljbris", version 1.071. Licence: not recorded in the repo.
  The repository is on GitHub, so the OTFs in `public/fonts` are also redistributed through it.
  **The user confirmed Museo is not under a free licence**: it has to be replaced.
- **Imagery**: one portrait (`portrait.jpeg`, 835×1112) reused for About, OG, Twitter, JSON-LD.
- **Icons**: `lucide-react`, stroke 1.5 on cards, 2 elsewhere, plus an inline LinkedIn glyph.
- **Figcraft**: `EB-Avocat.figcraft` in the user's Google Drive (`~/Library/CloudStorage/GoogleDrive-…/My Drive/`),
  pages `Cover`, `Foundations`, `Components`, `Site — Desktop`, `Site — Mobile`, `Back-office`
  (baseline, do not modify). PNGs in `.orchestrator/features/plan-redesign/design/current/`.

## Decisions this feature makes

### 1. Replace Museo with a free-licence font (A-28)
**Decided by the user (2026-11-20): Museo is not under a free licence and is not licensed for the
web. The site moves to a font under a free licence (SIL OFL) that is close to Museo.**

- **Shortlist** (ux; at least 3, at most 4): OFL fonts with Museo's feel: semi-slab, humanist,
  soft or rounded serifs, open counters, generous x-height. Starting candidates to evaluate, not a
  decision: **Aleo**, **Zilla Slab**, **Bitter**, **Hepta Slab**, **Podkova**. Avoid "MuseoModerno"
  (unrelated design, confusing name).
- **Criteria**, scored in `brand.md`: closeness to Museo and to the logo lettering (the logo lettering is a
  light humanist sans, likely Museo Sans Light, not Museo's slab: see brand.md §0); legibility of body text at 16px on screen; weights available, at least
  regular / medium / bold, or a variable axis; true italics (articles need them); French glyphs
  (é è ê à ç œ « » ’, non-breaking spaces); x-height and width close to Museo, so layouts and
  fallback metrics stay stable; WOFF2 size per weight; licence text checked (OFL 1.1, no Reserved
  Font Name issue when self-hosting unmodified files).
- **Specimen board** in Figcraft (task 2): the candidates side by side with Museo as the reference,
  set in the real copy (hero promise, a paragraph of À propos, a publication title and body, a
  button, French punctuation), next to the logo.
- **Choice**: ux recommends one; the user and Eva choose (asked together with the direction). The
  directions are drawn in the recommended font, so a different choice does not redo the boards.
- **Font plan** (decided here, implemented in #79): self-hosted WOFF2 (no new vendor: the files
  ship with the site, `next/font/local` or `next/font/google`, which self-hosts at build time),
  Latin subset with French glyphs, preload of the body weight, fallback metrics (`size-adjust`,
  ascent/descent overrides) to remove the Georgia-then-font reflow. Weights kept: the minimum the
  direction needs (target 3, or one variable file), with light weights only at display sizes (A-12).
- **Logo**: the logo SVGs contain outlined paths, not live text (inkscape style attributes still
  name "Museo, Light", but no font file is needed to render them), so the logo is kept unchanged.
  The new font will not match the logo letterforms exactly; the rules say how they sit together.
- **Museo leaves the code**: the five OTFs in `frontend/public/fonts` are served by the site and
  published in the GitHub repo without a web licence. Removing them and every `Museo` reference
  (`globals.css`, `layout.tsx`, `global-error.tsx`, `ArticleBody.tsx`, `PublicationCard.tsx`,
  `RichEditor.tsx`) is code work, so it is out of scope here; recorded as a constraint for #79
  (ship the new font and remove the OTFs together). Whether to remove them earlier, and whether to
  purge them from the git history, was a decision for the user: answered, see Question 3 (wait for #79, no purge).

### 2. What evolves
Each with the rule written in `brand.md` and drawn on `Foundations v2`:
- **Logo**: kept as is (no redraw). Rules: which variant on which surface, clear space, minimum
  size (screen and print), what not to do, favicon / small-size use.
- **Palette**: the four teals and near-black kept as core. Extensions proposed by each direction:
  one **accent** (for emphasis and the primary CTA, if the direction uses one), **warm neutrals**
  tinted toward teal replacing the Tailwind grays, and **one error and one success hue** that sit
  with the palette. Every colour shown with its contrast against white, near-black and the darkest
  teal. Semantic tokens are #70's job; here we only fix the raw palette and its usage proportions.
- **Typography**: role of the new font (family, weights, where light weights are allowed: the audit flags
  light body text, A-12). The type scale itself is #70's.
- **Imagery**: style chosen among documentary photography, illustration/graphic motif, or
  typography-only; rules (subjects, light, framing, colour treatment, what is never used: generic
  stock of handshakes, gavels, scales, Lady Justice).
- **Iconography**: keep `lucide-react` or not, one stroke width, sizes, when icons are used at all
  (A-08: six identical icon cards read as a template).
- **Photography needs**: shot list (portrait, office, details), formats and ratios the site needs
  (hero, cards, OG 1200×630, Google Business Profile), rights to secure, and a plan to obtain them
  (who, when, rough budget, interim solution with the current portrait).

### 3. Moodboard and directions
- One **moodboard**, the **font specimen board** (§1) and **2–3 directions**, each keeping logo, teal and the
  recommended font, and
  differing on accent, neutrals, imagery, icon use, density. Each direction board shows: palette
  with proportions, type specimen, imagery sample, icon sample, and 3 brand applications to judge
  the feel (e.g. a hero crop, a publication card, an OG image or business card). Not page layouts.
- Reference images for the moodboard may come from Unsplash (credited on the board); they are mood
  references only, never site assets.
- **Eva chooses one direction** (relayed by the user). The choice and its reasons are recorded in
  `brand.md`.

## Deliverables

| Id | What | Where | Owner |
|---|---|---|---|
| D1 | Brand decisions doc: font shortlist, scoring and plan, logo / colour / type / imagery / icon rules, direction definitions, photography brief, decisions log | `brand.md` in this folder | ux |
| D2 | Figcraft pages `Moodboard`, `Type` (font specimens) and `Directions` (one frame per direction) | `EB-Avocat.figcraft` | ui |
| D3 | Figcraft page `Foundations v2` — brand rules section (logo, colour, type, imagery, icons) for the chosen direction. #70 adds tokens, type scale and components to the same page later | `EB-Avocat.figcraft` | ui |
| D4 | PNG exports: `moodboard.png`, `type-specimens.png`, `direction-a.png`, `direction-b.png`[, `direction-c.png`], `foundations-v2.png` | `design/` in this folder | ui |

Docs in English (like the code and issues); French copy quoted as is.

## Tasks (planned, created after approval)

| # | Node | Task | Depends on |
|---|---|---|---|
| 1 | ux | Brand analysis and direction briefs: OFL font shortlist + scoring + recommendation + font plan, logo rules, palette extension candidates with contrast, imagery and icon options, 2–3 written direction briefs with moodboard references, photography needs and plan → `brand.md` draft; hands the direction briefs to ui | — |
| 2 | ui | Figcraft `Moodboard`, `Type` specimens and `Directions` boards from the briefs; export PNGs | 1 |
| — | lead | Ask the user for Eva's choice of font and direction (with the PNGs) | 2 |
| 3 | ux | Finalise `brand.md` for the chosen font and direction: rules, final weights, decisions log, photography plan | lead choice |
| 4 | ui | Figcraft `Foundations v2` brand rules for the chosen direction; export PNG | lead choice (parallel with 3; ux messages ui on any rule change) |

Tasks 3 and 4 are created once the direction is chosen, so their brief carries the choice.

## Questions for the user / Eva (asked by lead via `ask_user`, not by the team)
1. **Font and direction**: which font of the shortlist and which of the 2–3 directions Eva picks,
   and what she would change. After task 2, with the PNGs.
2. **Photography**: is a photo session acceptable (budget range, timing), and does Eva have office
   photos already? Asked with question 1.
3. **Museo files already public**: remove the OTFs from the site now (small change, Georgia
   fallback until #79) or with #79; purge them from the git history or not. Asked once the spec is
   approved; the answer becomes a note for #79 or a separate small issue, not work in this feature.
   **Answered (user, 2026-11-20): wait for #79.** #79 ships the new font and removes the Museo OTFs and
   every `Museo` reference in the same change; no early removal, no git-history purge.

## Acceptance criteria (from #69)
Status 2026-11-20: all met (see `brand.md` §1, §8, §2–§6, §7 and `design/foundations-v2.png`).
- [x] Museo licence status recorded (not free, not licensed for the web: replaced); free-licence font
  chosen from a scored shortlist; font plan decided (WOFF2, weights kept).
- [x] Moodboard and chosen direction approved by Eva.
- [x] Rules for logo, colour, imagery, icons documented (`brand.md` + `Foundations v2`).
- [x] Photography needs listed (portrait, office, details), with a plan to obtain them.

## Out of scope
Semantic tokens, type scale and components (#70), page layouts (#71–#76), copywriting (#68),
replacing the font files and removing Museo in the code (#79), the photo session itself.

## Risks and constraints
- **No free font is identical to Museo**: the choice trades closeness for licence safety; the specimen
  board next to the logo is what makes that trade-off visible to Eva.
- **Figcraft file is in Google Drive**, outside the repo. Only `ui` writes it; save after each page.
  If the sandbox blocks the Drive path, ui asks with `request_sandbox_access`.
  The `figcraft` (headless) MCP server is the one that connects in this session; the
  `figcraft-app` server did not.
- Figcraft needs the candidate fonts for the specimens: ui downloads the OFL files (Google Fonts or
  the foundry's repository) into its scratchpad, never into the repo. Museo is used only as the
  reference line on the specimen board (local comparison, not published on the site).
- Parallel issues #67 (IA) and #68 (copy) may change wording used in brand applications; boards use
  the approved positioning (#66, variant A) and mark sample copy as sample.
