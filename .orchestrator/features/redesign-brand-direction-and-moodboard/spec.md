# Redesign: brand direction and moodboard (#69) — spec

Part of #65. Depends on #66 (closed: positioning, audiences, CTA decided in
`.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`, PR #89). Blocks #70
(design system v2).

## Goal

Decide how the brand evolves for the redesign, without losing its equity (logo, teal palette,
Museo, first-person tone: audit §5 "Keep"), so that #70 can build tokens and components on a
settled base. Fix the two open brand risks: the Museo web licence (A-28) and the "template" look
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
  "Copyright (c) 2008 Jos Buivenga/exljbris", version 1.071. Licence: **not recorded anywhere**.
  The repository is on GitHub, so the OTFs in `public/fonts` are also redistributed through it.
- **Imagery**: one portrait (`portrait.jpeg`, 835×1112) reused for About, OG, Twitter, JSON-LD.
- **Icons**: `lucide-react`, stroke 1.5 on cards, 2 elsewhere, plus an inline LinkedIn glyph.
- **Figcraft**: `~/Library/CloudStorage/GoogleDrive-…/My Drive/EB-Avocat.figcraft`,
  pages `Cover`, `Foundations`, `Components`, `Site — Desktop`, `Site — Mobile`, `Back-office`
  (baseline, do not modify). PNGs in `.orchestrator/features/plan-redesign/design/current/`.

## Decisions this feature makes

### 1. Museo licence and font plan (A-28)
- Record the licence status in `brand.md` §Font: where Eva's files came from (MyFonts/exljbris
  purchase, free download, designer handover), which EULA applies, and whether it allows
  **web embedding (@font-face)**, **conversion to WOFF2**, **subsetting**, and **hosting the files in
  a public repository**. Evidence: invoice, EULA text or the foundry's answer. Lead to check:
  exljbris has distributed some Museo weights (300/500/700) under a free-font EULA; 100 and 900
  are commercial. Verify the EULA terms, don't assume them.
- **Font plan** (decided here, implemented in #79): self-hosted WOFF2 (no new vendor: served by
  Next/Vercel via `next/font/local`), Latin subset with French glyphs, preload of the body weight,
  fallback metrics (`size-adjust`, ascent/descent overrides) to remove the reflow. Weights kept:
  proposed 300/500/700, the final list fixed by ux with the direction (100 and 900 removed from the
  repo unless the direction uses them and the licence covers them).
- **If the licence does not cover the web**: present to the user, with prices, (a) buying the
  Museo webfont licence for the weights kept, (b) an OFL alternative close to Museo's semi-slab
  humanist feel (ux shortlists two, specimen in Figcraft). The user and Eva choose.
- If the files cannot stay in a public repo, #79 must handle that (private package or an
  allowed host); recorded as a constraint for #79, not solved here.

### 2. What evolves
Each with the rule written in `brand.md` and drawn on `Foundations v2`:
- **Logo**: kept as is (no redraw). Rules: which variant on which surface, clear space, minimum
  size (screen and print), what not to do, favicon / small-size use.
- **Palette**: the four teals and near-black kept as core. Extensions proposed by each direction:
  one **accent** (for emphasis and the primary CTA, if the direction uses one), **warm neutrals**
  tinted toward teal replacing the Tailwind grays, and **one error and one success hue** that sit
  with the palette. Every colour shown with its contrast against white, near-black and the darkest
  teal. Semantic tokens are #70's job; here we only fix the raw palette and its usage proportions.
- **Typography**: role of Museo (family, weights, where light weights are allowed: the audit flags
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
- One **moodboard** and **2–3 directions**, each keeping logo, teal and Museo (or its fallback) and
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
| D1 | Brand decisions doc: licence & font plan, logo / colour / type / imagery / icon rules, direction definitions, photography brief, decisions log | `brand.md` in this folder | ux |
| D2 | Figcraft pages `Moodboard` and `Directions` (one frame per direction) | `EB-Avocat.figcraft` | ui |
| D3 | Figcraft page `Foundations v2` — brand rules section (logo, colour, type, imagery, icons) for the chosen direction. #70 adds tokens, type scale and components to the same page later | `EB-Avocat.figcraft` | ui |
| D4 | PNG exports: `moodboard.png`, `direction-a.png`, `direction-b.png`[, `direction-c.png`], `foundations-v2.png` | `design/` in this folder | ui |

Docs in English (like the code and issues); French copy quoted as is.

## Tasks (planned, created after approval)

| # | Node | Task | Depends on |
|---|---|---|---|
| 1 | ux | Brand analysis and direction briefs: font licence research + font plan, logo rules, palette extension candidates with contrast, imagery and icon options, 2–3 written direction briefs with moodboard references, photography needs and plan → `brand.md` draft; hands the direction briefs to ui | — |
| 2 | ui | Figcraft `Moodboard` + `Directions` boards from the briefs; export PNGs | 1 |
| — | lead | Ask the user for Eva's choice of direction (with the PNGs) and the licence answer | 2 |
| 3 | ux | Finalise `brand.md` for the chosen direction: rules, final weights, decisions log, photography plan | lead choice |
| 4 | ui | Figcraft `Foundations v2` brand rules for the chosen direction; export PNG | lead choice (parallel with 3; ux messages ui on any rule change) |

Tasks 3 and 4 are created once the direction is chosen, so their brief carries the choice.

## Questions for the user / Eva (asked by lead via `ask_user`, not by the team)
1. **Museo licence**: where did the Museo files come from (purchase on MyFonts / exljbris, free
   download, the logo designer)? Is there an invoice or a licence file? Asked at the start of task 1.
2. **Direction**: which of the 2–3 directions Eva picks, and what she would change. After task 2.
3. **Photography**: is a photo session acceptable (budget range, timing), and does Eva have office
   photos already? Asked with question 2.

## Acceptance criteria (from #69)
- [ ] Museo licence status recorded with its evidence; font plan decided (WOFF2, weights kept).
- [ ] Moodboard and chosen direction approved by Eva.
- [ ] Rules for logo, colour, imagery, icons documented (`brand.md` + `Foundations v2`).
- [ ] Photography needs listed (portrait, office, details), with a plan to obtain them.

## Out of scope
Semantic tokens, type scale and components (#70), page layouts (#71–#76), copywriting (#68),
converting or replacing the font files in the code (#79), the photo session itself.

## Risks and constraints
- **Licence answer depends on Eva**: if it does not come, task 1 still delivers the analysis and
  both fallback options; the criterion stays open until the answer is recorded.
- **Figcraft file is in Google Drive**, outside the repo. Only `ui` writes it; save after each page.
  If the sandbox blocks the Drive path, ui asks with `request_sandbox_access`.
  The `figcraft` (headless) MCP server is the one that connects in this session; the
  `figcraft-app` server did not.
- Museo must be loadable by Figcraft for the specimens; use the OTFs from `frontend/public/fonts`.
- Parallel issues #67 (IA) and #68 (copy) may change wording used in brand applications; boards use
  the approved positioning (#66, variant A) and mark sample copy as sample.
