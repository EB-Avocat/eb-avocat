# Brand direction and moodboard (#69) — brand.md

Status: **draft from task #93 (ux), 2026-11-20.** Sections 1–7 and the handoff are complete; section 8
(decisions log) stays empty until Eva chooses a font and a direction. Task 3 finalises this file for the
chosen font and direction.

Inputs: `spec.md`, `ux-brief.md`, `plan-redesign/audit.md` (§3, §5, A-08, A-12, A-13, A-27, A-28),
`redesign-objectives-audience-and-kpis/objectives.md` (#66, positioning variant A), and measurements on
the real font files and logo files (method in §1.7). Contrast ratios are WCAG 2.x, computed from sRGB
relative luminance, not estimated.

Docs in English; French copy quoted as is. Sample copy is marked « exemple »: #68 owns the final wording.

## 0. What the analysis found (read this first)

1. **The logo lettering is a light humanist sans, not Museo's slab.** The spec says the logo was "set in
   Museo 300". The SVGs carry `font-family:Museo` in their Inkscape styles, but the outlined letters
   ("Eva Biezunski" in `#618983`, "Avocate" in `#264445`) have no slab serifs: they look like Museo *Sans*
   Light. The site font Museo (slab, from `public/fonts/Museo300-Regular.otf`, checked) and the logo
   lettering are therefore two different faces today. **No slab candidate can match the logo lettering**;
   that was already true with Museo. The "closeness to logo" criterion is scored accordingly (§1.3).
2. **Museo 300 is the weight the site reads in, and it is heavier than any candidate's Light.** Measured
   stem width of `l` (units per 1000 em): Museo 300 = 67, 500 = 97, 700 = 127. Aleo 300 = 50, Aleo 400 = 89;
   Bitter 300 = 48, 400 = 80. So Museo 300 ≈ Aleo **350**, Bitter **365**, Zilla 400. A candidate's "300" would
   look thinner than today's site (worse for A-12), and its "400" slightly sturdier. This is an argument
   for a **variable font** (any weight between) and for body at **400**, deliberately.
3. **`primary-light` `#4a7a6f` fails as text on every warm paper** (4.40 on `#F6F3EC`, 4.18 on `#F3EDE0`;
   it only passes on pure white, 4.88). Text and links on tinted surfaces use `primary` `#3f5b57` (6.3–6.8).
4. **Licence trap with Bitter:** its OFL declares the Reserved Font Name "Bitter Pro". Self-subsetting is
   a modification, so our own subset could not keep that name. Aleo, Zilla Slab, Hepta Slab, Podkova
   declare no Reserved Font Name. (Serving Google's own subset through `next/font/google` is fine.)
5. **Size is not the argument against Museo.** Museo subset to Latin is ~16 KB WOFF2 per weight. The
   reason to replace it is the licence (decided by the user), not performance. The current 3 × ~127 KB
   OTF (~381 KB) does become ~31 KB for the replacement (variable roman, §1.6).

## 1. Font: replacing Museo (A-28)

### 1.1 Status of Museo
Not under a free licence, no web licence held, **decided: replace** (user, 2026-11-20). The five OTFs in
`frontend/public/fonts` are served by the site and published in the GitHub repo: removal is code work for
#79 (§1.6), and whether to purge them from git history is a decision for lead and the user (spec,
Question 3). The logo is unaffected: its letters are outlined paths (§2). Open point for lead, low
priority: whether outlining Museo(-Sans) letters into the logo artwork was within the purchase terms; that
is normal practice for a logotype but is not recorded anywhere (Eva or the logo designer would know).

### 1.2 Candidates: kept and dropped
Looked at the five starting candidates plus Rokkitt (variable, light slab) and Arvo (geometric slab),
rendered next to Museo 300/500 at 48px and 20px, and measured.

| Candidate | Decision | Reason |
|---|---|---|
| **Aleo** | **Shortlist** | Same x-height (+1%) and width (−1 to −4%) as Museo; open round shapes, low contrast, soft bracketed slabs; variable 100–900 with true italic; no Reserved Font Name |
| **Bitter** | **Shortlist** | Built for screen reading, best 16px body; width equal to Museo; slightly taller x-height (+4%) and sturdier, more "newspaper" than Museo; variable + italic; RFN "Bitter Pro" |
| **Zilla Slab** | **Shortlist** | Closest to Museo's quirky, friendly slab personality; but x-height −11% and width −6 to −8% (needs a size bump and changes line breaks), 5 static weights, no variable file, heaviest WOFF2 |
| Hepta Slab | Dropped | 19% wider than Museo (0.52 vs 0.43 em avg.), no italic: every line break and card would change; 22 KB per weight; default axis value is 200, not a text weight |
| Podkova | Dropped | Weights 400–800 only (no light), x-height −14%, cap height −16% (looks small and low-contrast at 16px), no italic |
| Rokkitt | Dropped | x-height −20%, condensed: reads as a different, narrower voice |
| Arvo | Dropped | Two weights only (400/700), geometric and mechanical rather than humanist; RFN "Arvo" |
| *A humanist sans (Nunito Sans, Mulish…)* | Not shortlisted | Would match the logo lettering better but is not "close to Museo" (the user's brief) and changes the site's personality from slab to sans. Raised as a question for lead (§9, Q2) |

Shortlist = 3 fonts (the brief allows 3–4; the other candidates fail a hard criterion).

### 1.3 Scoring (shortlist, Museo as reference)
Scores 1–5 (5 best). Measured values are from the files (§1.7); closeness to Museo and to the logo are
judgements from the render (side-by-side render of the candidates at 48px and 20px) and the stem measurement. All three cover é è ê à ç œ « »
’ and U+00A0. **None has U+202F (narrow no-break space), nor has Museo; only Bitter has U+2009 (thin space), and relying on it would make the font choice change the typography**: use U+00A0
before « » : ; ? ! as the site does today; browsers fall back for any U+202F.

| Criterion | Museo (reference) | **Aleo** | **Bitter** | **Zilla Slab** |
|---|---|---|---|---|
| Closeness to Museo (shape, feel) | — | **4** — same geometry and rhythm, softer slabs | 3 — sturdier, more editorial | 3 — friendly but narrow and quirky (`a`, `g`) |
| Closeness to the logo lettering (light humanist sans, §0 item 1) | 5 for the sans variant only | 3 — open round bowls, low contrast | 2 | 2 |
| Body legibility at 16px on screen | Weak at 300 (A-12) | 4 at 400 | **5** at 400 | 3 at 16px (x-height), fine at 17–18px |
| Weights / axis | 300/500/700 loaded | **5** — variable 100–900 | **5** — variable 100–900 | 3 — static 300/400/500/600/700, no axis |
| True italics | none loaded | 5 (variable italic) | 5 (variable italic) | 5 (static italics, all weights) |
| French glyphs and punctuation | ok | 5 | 5 | 5 |
| x-height (Museo 0.500 em) | 0.500 | **0.507 (+1%)** → 5 | 0.522 (+4%) → 4 | 0.445 (−11%) → 2 |
| Width, avg. French text, em (Museo 300 / 500 = 0.435 / 0.447) | 0.435 | 400: 0.430 (−1%); 500: 0.435 (−3%) → **5** | 400: 0.440 (+1%); 500: 0.443 (−1%) → 5 | 400: 0.409 (−6%); 500: 0.412 (−8%) → 3 |
| Cap height (Museo 0.700) | 0.700 | 0.737 | 0.692 | 0.650 |
| WOFF2, Latin + French subset | 16 KB / weight (reference) | variable 300–700: **31 KB** roman, 33 KB italic (static 400: 13 KB) → **5** | variable 300–700: 29 KB roman, 28 KB italic (static 400: 17 KB) → 5 | static: 24–26 KB each; 4 files ≈ 100 KB → 2 |
| OFL 1.1, Reserved Font Name | n/a (not free) | OFL 1.1, **no RFN** → 5 | OFL 1.1, **RFN "Bitter Pro"** → 3 | OFL 1.1 (Mozilla), no RFN → 5 |
| **Total (/50)** | | **46** | 42 | 33 |

### 1.4 Recommendation: **Aleo** (variable roman + italic)
- It is the only candidate that keeps Museo's **proportions**, so layouts, line lengths and card heights
  hold (x-height +1%, width within 4%), and fallback metrics stay simple (§1.6).
- One variable file replaces three static ones: any weight 300–700 in ~31 KB, so the Museo-300 colour
  can be matched (Aleo ≈ 350) while body goes to 400 for legibility (A-12).
- True italic for articles; no Reserved Font Name, so we can instance or subset it ourselves if
  `next/font/google` is ever not wanted.
- Honest limits: Aleo is a little more **calligraphic** than Museo (the `a`, `e` terminals), and its
  caps are 5% taller (0.737 vs 0.700), so all-caps labels look slightly bigger; it will not match the
  logo lettering (no slab can). The specimen board (task 2) makes this visible to Eva before she chooses.
- **Runner-up: Bitter** if Eva finds Aleo too delicate or wants the strongest body text: choose it knowing
  about the RFN rule (use `next/font/google`, never a self-made subset) and the +4% x-height (body can drop
  to 16px without losing size; headings need slightly smaller sizes). Zilla Slab is third: the right
  personality, but at 16px it reads small and its static files cost ~100 KB.

### 1.5 Weight mapping Museo → Aleo (equal stem thickness)
| Museo on the site today | Stem | Aleo variable weight | Use in the new system |
|---|---|---|---|
| 300 (body, most text) | 67 | ≈ 350 | **Do not copy.** Body moves to 400 (stem 89): A-12 |
| 500 | 97 | ≈ 480 | 500 for h3 / UI labels if wanted; 600 for stronger labels |
| 700 | 127 | 700 | 700 for bold emphasis in prose and the strongest headings |

### 1.6 Font plan (decided here, built in #79)
- **Files**: Aleo roman + Aleo italic, variable `wght`, **WOFF2, Latin subset including French glyphs**
  (Basic Latin, Latin-1, œ Œ Ÿ, ’ ‘ “ ” « » – — … €, U+00A0). Limit the axis to **300–700** if self-subsetting
  (saves ~7%). Measured subsets: roman 31.2 KB (300–700) / 33.6 KB (full 100–900); italic 32.6 / 35.3 KB.
- **Delivery**: `next/font/google` (`Aleo`, `weight: "variable"`, `style: ["normal","italic"]`,
  `subsets: ["latin"]`, `display: "swap"`): Next downloads at build time and serves the files from our own
  domain, so **no runtime request to Google and no new vendor** (rule: prefer existing vendors). Fallback:
  `next/font/local` with the files in the repo, adding `OFL.txt` next to them. Latin subset from Google
  includes œ « » ’ (verify in the built CSS `unicode-range`).
- **Preload**: roman only (body + headings), via `next/font`'s default `preload: true`. **Italic is not
  preloaded** (articles only, not above the fold).
- **Fallback metrics** (kills the Georgia-then-font reflow, A-28): use `adjustFontFallback` (automatic for
  `next/font/google`, `"Times New Roman"` for `next/font/local`). Indicative values to check the output
  against (computed on a French sample, regular weight): vs Times New Roman `size-adjust` ≈ 113%,
  `ascent-override` ≈ 80%, `descent-override` ≈ 26%, `line-gap-override` 0%; vs Georgia 103% / 88% / 29% / 0%.
  Remove `ui-serif, Georgia` as the *first* fallback if it creates a second reflow; keep `serif` last.
- **Weights kept**: one variable axis, used at **300 (display only ≥ 40px), 400, 500 (display / H2 in
  direction C, optional h3 and UI labels elsewhere), 600, 700** plus italic 400 (§4). No 100/900 (dead files
  today). **The existing `font-300/500/700` utilities (32/61/31 uses) do not carry over as they are**: Aleo 300
  is thinner than Museo 300 (stem 50 vs 67), so the 32 `font-300` body-text uses (`carte`, error pages,
  `publications`, privacy page…) would get thinner, which is the A-12 problem. #79 maps them to 400 and keeps
  300 only for display; 500 maps to ≈ 480 (§1.5), 700 to 700.
- **`font-feature-settings`**: leave defaults (kerning, ligatures on); use `font-variant-numeric:
  tabular-nums` only in tables and back-office lists.
- **Budget**: ~31 KB preloaded + 33 KB on demand, versus ~381 KB of OTF today.
- **Code places that name Museo** (to change in #79, with the files, together):
  - `frontend/src/app/globals.css`: three `@font-face` (lines 3–26) and `--font-museo` in `@theme` (line 35)
  - `frontend/src/app/layout.tsx:111` and `frontend/src/app/global-error.tsx:23`: `font-museo` on `<body>`
  - `frontend/src/components/ui/PublicationCard.tsx:32`: `font-museo` on the cover placeholder
  - `frontend/src/components/publications/ArticleBody.tsx:9`: `prose-headings:font-museo`
  - `frontend/src/components/backoffice/editor/RichEditor.tsx:113`: `prose-headings:font-museo`
  - `frontend/public/fonts/Museo{100,300,500,700,900}-Regular.otf`: delete (5 files)
  - `README.md:172`: "fonts/ # Museo font family"
  - Logo SVGs (`logo-*.svg`, 5 files): inert `font-family:Museo` in Inkscape style attributes; the letters
    are outlined. Optional clean-up; do not redraw the logo.
  - Rename the token `--font-museo` → e.g. `--font-sans-serif`/`--font-display` (#70 decides the name).

### 1.7 Method
Files from `github.com/google/fonts` (`ofl/aleo`, `ofl/bitter`, `ofl/zillaslab`, `ofl/heptaslab`,
`ofl/podkova`, `ofl/rokkitt`, `ofl/arvo`), Museo from the repo. `fontTools` for metrics (OS/2 `sxHeight`,
`sCapHeight`, hhea, average advance of a 300-character French sample), instances via `varLib.instancer`,
Latin/French subset to WOFF2 with `fontTools.subset`; stem width from a 800px render of `l`. The licence
text was read from each `OFL.txt`. Results are repeatable; sizes vary a few percent with subsetter options.

## 2. Logo rules

The logo is **kept unchanged**. Five stacked variants (mark above "Eva Biezunski" / "Avocate", viewBox
230 × 187 mm, ratio 1.23:1) and two mark-only icons (230 × 126, no lettering).

### 2.1 Variant per surface
| Surface | File | Notes |
|---|---|---|
| White, paper, sand, any light tint (all directions) | `logo-for-white-background` | `#618983` / `#264445` / `#3f5b57` on light. Primary use: navbar (solid), articles, legal, print |
| Dark teal `#162729`, `#264445` | `logo-for-dark-green-background` | white lettering, `#618983` pans (3.99 on `#162729`, 2.71 on `#264445`, only 1.90 on `#3f5b57`: avoid the logo on `#3f5b57`, use it on the two darkest teals). Hero, `/carte`; footer (today `Footer.tsx` uses the `white-for-black` variant on dark teal: switch it in #79) |
| Mid teal `#4a7a6f` (primary-light) and similar mid-tones | `logo-for-light-green-background` | `#264445` lettering + white details (lettering is only 2.16:1 on `#4a7a6f`: logotype, but use the variant only on that exact fill). Check contrast of the lettering on the actual fill; if the surface is darker than `#4a7a6f`, use the dark-green variant |
| Photographs, near-black, any busy dark image | `logo-white-for-black-background` | all white; only over a **darkened area** of the photo (overlay so the logo has ≥ 4.5:1 against the average behind it) |
| One-colour print (fax, stamp, B/W photocopy, embossing) | `logo-black-for-white-background` | `#191919`, never on colour |
| Favicon, app icon, avatar ≤ 48px, `/carte` header on mobile if tight | `favicon.svg` (`favicon-white.svg` on dark) | mark only |

Never use a variant on a surface it was not made for (e.g. the white-surface variant on `#264445`: the
`#264445` "Avocate" disappears at 1.0:1).

### 2.2 Clear space and minimum size
- **Clear space**: 1/6 of the logo's width on all four sides (≈ 2 × the height of the capital A of
  "Avocate"). Nothing enters that margin: no text, edge, photo subject or button.
- **Minimum size, stacked logo**: **96 px wide** on screen (lettering cap-height ≈ 8px; the lettering is a
  light weight, so it is the first thing to disappear) and **30 mm wide** in print. Below that, use the
  mark-only icon.
- **Minimum size, mark only**: 16 px (favicon) on screen, 8 mm in print.
- Maximum: no limit; above 480 px wide, keep the clear space proportional.

### 2.3 Don'ts
Do not: redraw, re-colour, outline or add a shadow/gradient; stretch or rotate; recreate the lettering in
the web font (the new font will **not** match: they sit side by side, §4.1); put the logo on a photo
without the overlay; place it on `primary-light` text-like patterns; crop the mark from the lettering
except via the official mark-only files; change the lettering colours (`#618983` lettering on white is
3.88:1 — it is a logotype so exempt, but **never reuse `#618983` as a text colour**).

### 2.4 Logo and type pairing
The lettering is a light sans; the site text is a slab. Rule: keep the logo apart from headlines (clear
space), never set a headline directly under or over the lettering at a similar size, and pair the logo with
**a rule or a change of surface** rather than with type. Contact blocks may sit to its right, in 400 weight.

### 2.5 Favicon
`favicon.svg` (mark on transparent) stays. Raster sizes and PWA icons exist (`frontend/public/icon-192.png`, `icon-512`,
`icon-maskable-512`, `icon-monochrome-512`, and `src/app/apple-icon.png`; `/images/icons` holds the contact
icons, not app icons); #79 regenerates them only if the teal background changes. In dark-mode tabs the
mark's teals lose contrast on dark chrome: keep `favicon-white.svg` for `prefers-color-scheme: dark` via
`<link media>` (small change for #79).

## 3. Palette

### 3.1 Core (all directions, unchanged) and solid "muted on dark" tokens
| Colour | Hex | vs `#FFFFFF` | vs `#191919` | vs `#162729` | Role |
|---|---|---|---|---|---|
| `primary` | `#3f5b57` | 7.38 | 2.38 | 2.10 | Text/links on any light surface (6.3–6.8 on papers), bands, buttons, focus ring on light |
| `primary-light` | `#4a7a6f` | 4.88 | 3.60 | 3.17 | White-only: button fill (white label 4.88), icons. **Not as text on tinted paper (4.18–4.40)** |
| `dark-teal` | `#264445` | 10.53 | 1.67 | 1.47 | Hero gradient end, dark surfaces |
| `darker-teal` | `#162729` | 15.48 | 1.14 | 1.00 | Hero gradient start, footer, theme-color |
| `near-black` | `#191919` | 17.58 | 1.00 | 1.14 | Body text and headings on light |
| Logo teal (reference only) | `#618983` | 3.88 | 4.53 | 3.99 | Logotype only; never text |
| `mist-100` (new) | `#E4ECEA` | 1.20 | 14.64 | 12.89 | Body/secondary text on dark: 12.89 on `#162729`, 8.76 on `#264445`, **6.15 on `#3f5b57`** |
| `mist-300` (new) | `#B9CBC7` | 1.69 | 10.41 | 9.16 | Muted text on `#162729` (9.16) and `#264445` (6.23) **only**; 4.37 on `#3f5b57` fails: use `mist-100` there |

These two `mist` solids replace the `text-white/60–80` alpha pattern (A-13); no muted text on
`primary-light` other than pure white. **Focus ring** (A-14, raw values for #70): on light surfaces
`primary` `#3f5b57` (≥ 6.3:1 on white and the papers); on dark surfaces `mist-100` `#E4ECEA` (6.15 on
`#3f5b57`, 8.76 on `#264445`, 12.89 on `#162729`). Both ≥ 3:1 everywhere, unlike today's `#4a7a6f`
(1.51 on the "Votre avis" band).

### 3.2 Neutrals, accent, error, success: per direction
Warm neutrals are tinted toward teal (the darker steps pick up green-grey) so they sit with the core.
Each ramp has six steps. Sand/pierre 200 is decorative (hairlines, never the only boundary); step 400 is
the one for **input borders and icons** (≥ 3:1 on white and paper, WCAG 1.4.11). "vs paper" is the contrast
against the direction's own page background, which is what text actually sits on.

#### Direction A — Documentaire
| Colour | Hex | vs `#FFFFFF` | vs `#191919` | vs `#162729` | vs paper | Role / allowed use |
|---|---|---|---|---|---|---|
| Paper | `#F6F3EC` | 1.11 | 15.87 | 13.97 | 1.00 | Page background (warm white) |
| Sand 100 | `#ECE8DE` | 1.22 | 14.37 | 12.65 | 1.10 | Section tint, cards on paper |
| Sand 200 | `#DAD8CC` | 1.43 | 12.29 | 10.82 | 1.29 | Hairlines, dividers (decorative) |
| Sand 400 | `#7F877F` | 3.70 | 4.75 | 4.18 | 3.34 | Input borders, icons (UI ≥ 3:1) |
| Sand 600 | `#5E6B67` | 5.56 | 3.16 | 2.78 | 5.02 | Muted text, dates, captions |
| Sand 800 | `#2D3A39` | 11.83 | 1.49 | 1.31 | 10.67 | Strong text alternative to near-black |
| Ambre | `#B07A22` | 3.71 | 4.73 | 4.17 | 3.35 | Fills, rules, icons. **Never text on white.** Label on it: `#191919` |
| Ambre profond | `#7F5413` | 6.60 | 2.66 | 2.34 | 5.96 | Accent text and links on paper/white |
| Ambre clair (on dark) | `#E3B35B` | 1.93 | 9.10 | 8.01 | 1.74 | Accent on `#162729` (8.01) / `#264445` (5.45) only; 3.82 on `#3f5b57` = large text/UI |
| Error | `#A8322D` | 6.65 | 2.64 | 2.33 | 6.00 | Error text + icon |
| Success | `#2F7D4B` | 5.05 | 3.48 | 3.06 | 4.56 | Success text + icon |

Muted text on paper: Sand 600 on Sand 100 = 4.55 (just passes; do not go lighter).

#### Direction B — Éditorial
| Colour | Hex | vs `#FFFFFF` | vs `#191919` | vs `#162729` | vs paper | Role / allowed use |
|---|---|---|---|---|---|---|
| Paper | `#F8F5EF` | 1.09 | 16.16 | 14.23 | 1.00 | Page background (print-like white) |
| Sand 100 | `#EFEBE2` | 1.19 | 14.78 | 13.01 | 1.09 | Section tint |
| Sand 200 | `#DEDACF` | 1.40 | 12.59 | 11.09 | 1.28 | Hairlines, rules (decorative) |
| Sand 400 | `#7F8680` | 3.73 | 4.71 | 4.15 | 3.43 | Input borders, icons (UI ≥ 3:1) |
| Sand 600 | `#5B6663` | 5.96 | 2.95 | 2.60 | 5.47 | Muted text, captions |
| Sand 800 | `#2A3534` | 12.67 | 1.39 | 1.22 | 11.64 | Strong text alternative |
| Terre cuite | `#B4502D` | 5.09 | 3.45 | 3.04 | 4.68 | Primary CTA fill (white label 5.09), rules, links on paper (4.68) |
| Terre cuite clair (on dark) | `#E8A184` | 2.13 | 8.26 | 7.27 | 1.96 | Accent on `#162729` (7.27) / `#264445` (4.94) only; 3.47 on `#3f5b57` = large/UI |
| Error | `#8F1D2C` | 8.82 | 1.99 | 1.75 | 8.11 | Error text + icon (deeper crimson so it is not read as the accent) |
| Success | `#2D7A55` | 5.22 | 3.37 | 2.97 | 4.79 | Success text + icon |

Risk: terre cuite is close to an error red. Rule: the accent never marks a status; errors always carry an
icon, a text message and a border, not a colour alone.

#### Direction C — Lyon & matière
| Colour | Hex | vs `#FFFFFF` | vs `#191919` | vs `#162729` | vs paper | Role / allowed use |
|---|---|---|---|---|---|---|
| Pierre 50 | `#F3EDE0` | 1.17 | 15.07 | 13.27 | 1.00 | Page background (limestone white) |
| Pierre 100 | `#E9E0CC` | 1.31 | 13.39 | 11.80 | 1.13 | Section tint, motif background |
| Pierre 200 | `#D5CAB0` | 1.63 | 10.80 | 9.51 | 1.39 | Hairlines, motif strokes (decorative) |
| Pierre 400 | `#85806D` | 3.96 | 4.44 | 3.91 | 3.39 | Input borders, icons (UI ≥ 3:1) |
| Pierre 600 | `#625E50` | 6.49 | 2.71 | 2.39 | 5.56 | Muted text, captions |
| Pierre 800 | `#2E332F` | 12.88 | 1.37 | 1.20 | 11.04 | Strong text alternative |
| Beaujolais | `#8C3447` | 7.79 | 2.26 | 1.99 | 6.67 | Accent text, links, CTA fill (white label 7.79) |
| Beaujolais clair (on dark) | `#E2A2AE` | 2.10 | 8.38 | 7.38 | 1.80 | Accent on `#162729` (7.38) / `#264445` (5.02) only |
| Ocre de Lyon | `#C8982F` | 2.63 | 6.69 | 5.89 | 2.25 | **Graphic motif only** (not text on light). Label on it: `#191919` (6.69). On `#162729` 5.89, on `#264445` 4.00 |
| Error | `#B3361C` | 6.07 | 2.90 | 2.55 | 5.20 | Error text + icon |
| Success | `#2A7550` | 5.59 | 3.15 | 2.77 | 4.79 | Success text + icon |

Risk: Beaujolais (wine) is in the same red family as the error. Same rule as B; the accent never marks a
status. `primary-light` text on Pierre 50 is 4.18: use `primary`.

### 3.3 Proportions (of visible area on a typical page)
| Direction | Surfaces (white, paper, tints) | Teal (text, bands, nav, footer) | Imagery / motif | Accent |
|---|---|---|---|---|
| A Documentaire | 60% | 25% | 12% (photos) | **≤ 3%** (links, one rule, tiny marks); CTA stays `primary` teal |
| B Éditorial | 65% | 25% (mostly text in `near-black` / `primary`) | 3% (rare photo) | **≤ 7%** (CTA, rules, pull-quote marks, drop element) |
| C Lyon & matière | 55% | 30% | 12% (motif) | Beaujolais **≤ 3%**; ochre is motif only, ≤ 5% inside the motif |

Rules for all: one accent per page region; no accent text below 4.5:1 **on the surface it sits on**: the
"vs paper" columns above do not hold on the 100 tints (Terre cuite on Sand 100 = 4.28; Success on Sand 100 =
4.13 (A) / 4.38 (B), on Pierre 100 = 4.26 (C)), so accent, success and error text go on paper or white only,
and on tinted sections use `primary` (≥ 5.6) or the darker accent variant (Ambre profond on Sand 100 = 5.40); no colour as the only carrier of
meaning (links stay underlined, status has icon + text); tinted section backgrounds alternate with white,
not with each other; avoid more than one dark band between two light ones.

## 4. Typography role (recommended font: Aleo, variable)

Sizes are a starting point for the specimens; the type scale is #70's. Body ≥ 16px, meta ≥ 14px (A-12).

| Role | Weight | Size (desktop / mobile) | Line height | Notes |
|---|---|---|---|---|
| Display (hero promise) | **300 allowed** (≥ 40px only), or 400 | 48–64 / 34–40 | 1.1 | Light weight only here (thin strokes survive at this size) |
| H1 (page title) | 400 | 40–48 / 30–34 | 1.15 | |
| H2 (section) | 400, or 500 | 30–36 / 26–28 | 1.2 | |
| H3 / card title | 600 | 20–24 / 20 | 1.3 | |
| Body | **400** | 17–18 / 16–17 | 1.6–1.7 | 60–70 characters per line; never 300 (was the A-12 problem) |
| Lead / standfirst | 400 (300 only if ≥ 40px) | 20–24 / 18–20 | 1.5 | |
| Meta (dates, captions, tags) | 400 | 14 / 14 | 1.4 | Never below 14px; `sand-600`/`pierre-600`/`mist` on dark |
| Buttons, form labels, nav | 600 | 16 / 16 | 1.2 | |
| Overline / kicker (uppercase) | 600 | 12–13, tracking +0.08em | 1.3 | Caps look larger in Aleo (cap height 0.737) |
| Italic (emphasis, quotes, titles of works) | 400 italic; 300 italic only ≥ 28px | as parent | as parent | True italic, never synthesised |
| Bold in prose | 700 | as parent | | |
| Numbers in tables | 400, `tabular-nums` | 14–16 | | |

Rule summary: **300 only at ≥ 40px (display) or ≥ 28px italic pull quotes**; 400 is the floor for any text
under 28px. No weight below 400 in the back-office. Headings in the same family, no second typeface.

### 4.1 With the logo
The lettering of the logo is a light sans; the slab is the voice of the site. They are never set
together at the same scale; the logo stays in its clear space (§2).

## 5. Imagery and icons

### 5.1 Imagery options
| Option | Pros | Cons | For this audience / Eva's means |
|---|---|---|---|
| **Documentary photography** (Eva, her office, details, natural light) | Trust through a real person (the positioning is first person); answers A-04 (proof) and the person-led firm; reusable for OG, GBP, cards; no stock clichés | Needs a shoot (cost, timing); weak or generic photos hurt more than none; consent and rights to manage; must be refreshed | Strongest for prospects aged 35–70 choosing a person; budget is a half-day session (§7) |
| **Graphic motif / illustration** (derived from the logo or from Lyon) | Distinctive, ownable, no people to photograph, works at small sizes and on OG; cheap to extend | Does not show Eva (trust gap); needs a designer to draw it well; risk of looking decorative or "agency" | Good complement and good interim; lower trust yield alone |
| **Typography only** | Zero cost, fast, very sober, strongest hierarchy; fits an expertise/publications story | Looks cold or "template" if not very well set; no face of the firm; OG images become repetitive | Fits Eva's means; needs excellent type and rhythm (A-08) |

Recommended combination: **photography for the person (few, good), motif or typography for everything
else**; a direction picks the lead.

### 5.2 Rules (all directions)
- **Subjects**: Eva (portrait, working), the office (entrance, meeting room, desk), hands and documents,
  books, Lyon stone, light. People are real and consenting.
- **Light and framing**: natural window light, soft shadows, eye-level, shallow depth of field on people,
  one subject per image, space for text where used as a hero (rule of thirds, 40% quiet area).
- **Colour treatment**: natural colour, warm but not orange, no filters; one grade for the set (match the
  paper warmth of the direction). B may use a desaturated, slightly warm grade for archive-like details.
  Photos used under type get a `darker-teal` overlay at 40–60% (or a gradient) so text stays ≥ 4.5:1.
- **Never**: gavels, scales, Lady Justice, columns, handshakes, stacks of legal books posed as stock,
  people pointing at laptops, suits-in-glass-offices stock, client faces or files, any photo that implies
  results ("winning") or comparison, stock photos of "lawyers" or of offices that are not Eva's. Unsplash
  images are **mood references only, never site assets** (spec).
- **Alt text**: describes the content ("Eva Biezunski à son bureau, face à la fenêtre"), not "image of".
  Decorative motifs get `alt=""`.

### 5.3 Icons
- **Keep `lucide-react`** (ISC licence, already installed, consistent family, tree-shaken).
- **One stroke width: 1.5** at every size (today: 1.5 on cards, 2 elsewhere, which reads as inconsistent).
  Sizes: **16** inline with text, **20** UI controls (menu, chevrons, external link), **24** contact
  channels (phone, mail, map-pin). No icon above 24px as decoration. Colour `currentColor`; on dark
  `mist-100`. Rounded caps and joins (lucide default). The LinkedIn glyph stays the inline brand SVG.
- **When icons are used**: **function only** — contact channels, navigation controls, status (with text),
  external-link and download hints. **Not** as ornament on cards: the six identical icon cards of the
  current services section are the template look (A-08). Services get typographic numbering, a short label
  or the direction's motif instead.
- Touch targets ≥ 44 × 44 px (24px icon in a 44px hit area); icon-only buttons need an accessible name.

## 6. Directions

All three keep: logo unchanged, teal core and `#191919`, Aleo (or the chosen font) in the roles of §4,
WCAG 2.2 AA, no results claims. Sample copy follows the approved positioning (#66, variant A) and is marked
« exemple »: the hero promise candidate is from #66, #68 writes the final wording.

### Direction A — **Documentaire**
**Keywords**: personne, lumière naturelle, chaleur, confiance, calme.
**Idea**: trust through the person. Eva and her office in natural light; the page is a warm paper, the
teal speaks only in text, nav and one dark band; a very discreet ambre mark.
- **Palette**: §3.2 A. Paper `#F6F3EC`, Sand ramp, teal core, Ambre (≤ 3%), CTA `primary` `#3f5b57` with white label.
- **Type use**: Aleo 400 display 48/54 (hero), H2 32/38 w400, H3 22/28 w600, body 17/28 w400, meta 14/20 w400.
  Light 300 only on a 56px hero line if wanted.
- **Imagery**: documentary photography, 3:2 and 4:5, natural grade; one hero image per page at most.
- **Icons**: functional only (contact, nav).
- **Density / rhythm**: calm and airy, 96–120px between sections, one idea per screen, photo alternates left/right.
- **Moodboard references** (Unsplash, mood only; credits as "Photo by … on Unsplash"):
  1. https://unsplash.com/photos/naL5IO2dT40 — Nathan Van Egmond: warm desk in daylight
  2. https://unsplash.com/photos/loX3-DtMSVg — Khanh Do: window with greenery and books (light, calm)
  3. https://unsplash.com/photos/4tKkBX4PvwA — Romina Mosquera: desk with lamp and book (warm, intimate)
  4. https://unsplash.com/photos/lJc44o_I1hg — X F: sunlight through a window into a dark room (light and shadow)
  5. https://unsplash.com/photos/0Zx1bDv5BNY — WOCinTech Chat: portrait with shallow focus (framing only)
  6. https://unsplash.com/photos/PlikkWB79qs — WOCinTech Chat: seated, smiling, natural light (framing only; stock-like, do not copy the posture)
- **3 applications** (ui draws):
  1. **Hero crop** (1440 × 720): paper left, portrait of Eva right (use `portrait.jpeg` as a placeholder on the board only, or a mood crop; on the site it is never a hero, §7.4), logo `for-white-background` top-left. Copy: H1 « Structurer votre exercice libéral, en accord avec votre Ordre et vos associés. » (exemple). Sub: « Avocate au Barreau de Lyon, j'accompagne les professionnels libéraux et les entrepreneurs, de la création de leur société aux démarches devant leur Ordre. » (exemple). Button « Contacter le cabinet » + « 04 00 00 00 00 » (exemple, placeholder number).
  2. **Publication card** (3:2 photo of a desk detail, category chip « Exercice libéral », title « Cession de patientèle : les points à vérifier avant de signer » (exemple), excerpt « Ce que prévoit le contrat, ce que votre Ordre examinera, et ce qu'il vaut mieux régler avant la signature. » (exemple), meta « Eva Biezunski · 20 novembre 2026 » (exemple)).
  3. **Business card** (85 × 55 mm, recto and verso): verso `darker-teal` with the dark-green logo; recto paper with « Eva Biezunski », « Avocate au Barreau de Lyon », « [adresse du cabinet] · 04 00 00 00 00 · contact@… » (exemple placeholders), a small QR block (to `/carte`), one Ambre rule.

### Direction B — **Éditorial**
**Keywords**: expertise, rigueur, typographie, publications, sobriété.
**Idea**: trust through expertise. A print-like hierarchy (kicker, display, standfirst, rule), generous
white space, almost no photos; the accent is a warm terre cuite used for the CTA and rules.
- **Palette**: §3.2 B. Paper `#F8F5EF`, Sand ramp, teal core, Terre cuite (≤ 7%), CTA terre cuite fill with white label.
- **Type use**: display Aleo 300 64/66 (≥ 40px, allowed), H2 36/42 w400, H3 24/30 w600, body 18/30 w400,
  kicker 13px w600 uppercase +0.08em, pull quote italic 300 28/36 (≥ 28px, allowed), meta 14 w400.
- **Imagery**: typography-led; at most one portrait per page and occasional archival detail (books, paper).
- **Icons**: none beyond function; typographic arrows (→) and numerals replace ornament.
- **Density / rhythm**: editorial grid, narrow measure (≤ 70 characters), long vertical rhythm, hairline
  rules (Sand 200), asymmetric columns.
- **Moodboard references**:
  1. https://unsplash.com/photos/9wqYOKC7oBg — T: old newspapers (print hierarchy)
  2. https://unsplash.com/photos/KNfj7yDVMF0 — Prateek Katyal: hardbound book on a wooden table
  3. https://unsplash.com/photos/aT88kga0g_M — Peter Herrmann: book shelves
  4. https://unsplash.com/photos/_YzGQvASeMk — Prateek Katyal: piled books on a shelf
  5. https://unsplash.com/photos/XFWiZTa2Ub0 — SJ Objio: parchment paper texture
  6. https://unsplash.com/photos/vS3idIiYxX0 — Olga Thelavart: white watercolour paper texture
- **3 applications**:
  1. **Hero crop** (typographic): kicker « Avocate au Barreau de Lyon · Droit des sociétés » (exemple), display « Structurer votre exercice libéral. » then, in italic 300, « En accord avec votre Ordre et vos associés. » (exemple), a Terre cuite rule 64 × 3 px, button « Écrire à Eva » (exemple), no image.
  2. **Publication as an editorial list item**: kicker « Exercice libéral · Déontologie » (exemple), title large « Choisir entre SEL et SCM : ce que votre Ordre regardera » (exemple), standfirst « Deux structures, deux logiques. Une comparaison pour décider avant de signer. » (exemple), « Eva Biezunski · 20 novembre 2026 » (exemple), hairline rule, no image.
  3. **OG image** (1200 × 630): paper background, display line « Structurer votre exercice libéral. » (exemple), logo bottom-left (white-background variant), Terre cuite rule, « biezunski-avocat.fr » small.

### Direction C — **Lyon & matière**
**Keywords**: Lyon, pierre, matière, signature, ancrage.
**Idea**: differentiation through a signature element. A graphic motif of **arcs** drawn from the logo (the
looped stem and the scale pans are arcs) and from Lyon (vaulted traboules, limestone, paper), in pierre
tones; photography minimal; a deep wine accent.
- **Motif spec for ui**: repeating pattern of semicircular arcs (1.5 px stroke, round caps), 48–96px
  module, drawn in Pierre 200 on Pierre 100, or `mist-300` at 25% on teal; one ochre arc (Ocre de Lyon) per
  composition as the "signature"; never behind running text at more than 8% contrast; export as SVG.
- **Palette**: §3.2 C. Pierre 50 `#F3EDE0`, Pierre ramp, teal core (more `darker-teal` bands), Beaujolais
  (≤ 3%), Ocre (motif only), CTA `primary` with white label (or Beaujolais fill).
- **Type use**: Aleo 500 display 52/56, H2 32/38 w500, H3 22/28 w600, body 17/28 w400, meta 14 w400.
- **Imagery**: motif and texture first (stone, paper, macro); one or two photographs of Lyon details or of
  Eva; no clichés.
- **Icons**: replaced by the motif for ornament; functional icons only for contact and nav.
- **Density / rhythm**: medium, modular blocks on a 12-column grid, tinted stone panels, motif crops as
  section dividers.
- **Moodboard references** (Lyon search on Unsplash returned few good traboule photos; ui may search
  « Lyon vieux Lyon », « traboule », « Croix-Rousse », « stone arch » for more):
  1. https://unsplash.com/photos/EdRc5_g-qxo — Kristina Bekher: old townhouses in Lyon in late sun
  2. https://unsplash.com/photos/L-MO5D0NUr0 — Lucas Gallone: European city square, Lyon-based photographer
  3. https://unsplash.com/photos/qv05FvdE26k — Kiwihug: beige recycled paper texture
  4. https://unsplash.com/photos/XFWiZTa2Ub0 — SJ Objio: parchment texture
  5. https://unsplash.com/photos/vS3idIiYxX0 — Olga Thelavart: watercolour paper texture
  6. https://unsplash.com/photos/9wqYOKC7oBg — T: old newspapers (material)
- **3 applications**:
  1. **Hero crop** (1440 × 720): `darker-teal` → `dark-teal` gradient, arc motif in `mist-300` at 25%, one Ocre arc, white text, logo dark-green variant. Copy as in A (exemple), button « Contacter le cabinet » in white with `darker-teal` label.
  2. **Publication card with a motif cover** (no photo): Pierre 100 cover with an arc-pattern crop, category « Exercice libéral » (exemple), title « Cession de patientèle : les points à vérifier avant de signer » (exemple), meta « Eva Biezunski · 20 novembre 2026 » (exemple).
  3. **`/carte` mobile screen** (390 × 844): `darker-teal`, motif at the top, logo dark-green, « Eva Biezunski », « Avocate au Barreau de Lyon » (from `QR_CARD`), buttons « Enregistrer le contact » and « Visiter le site web » (from `QR_CARD`), plus phone and email rows (exemple placeholders).

### Choosing between them (for lead's question to Eva)
| | A Documentaire | B Éditorial | C Lyon & matière |
|---|---|---|---|
| Trust through | the person | expertise, publications | a signature, place |
| Needs a photo shoot to work | **Yes** (hero depends on it) | No | No (nice to have) |
| Works today with one portrait | Partly | **Yes** | **Yes** |
| Fits the A-08 "template" fix | Photos vary the rhythm | Typographic hierarchy | Motif and panels |
| Risk | Weak photos hurt; refresh cost | Cold, text-heavy for some prospects | Motif looks decorative if drawn badly |
| Cost to extend | photo sessions | lowest | motif set to draw once |
Recommendation from ux: **B Éditorial as the base, with the person from A** (one good portrait) and the
motif of C reserved for OG and `/carte`; it matches the strongest KPI path (publications → trust → contact,
J2) and does not wait for a shoot. This is a recommendation, not a decision: the three boards decide.

## 7. Photography needs

### 7.1 Shot list
| Set | Shots | Notes |
|---|---|---|
| **Portrait** (2–3 setups) | (1) Frontal bust, neutral wall, natural light — About, OG, cards, GBP, LinkedIn; (2) **environmental** at the desk or window, reading a file, three-quarter — hero (direction A); (3) candid, listening or looking at a document, shallow depth of field | Same clothes plus one change; a square-safe crop and a vertical 4:5 for each |
| **Office** | Entrance and door plate; meeting-room table, wide and detail; Eva's desk with the window; waiting or reception corner if any; view from a window | No client documents legible; no screens with data; ask co-tenants if shared parts appear |
| **Details** | Hands with a pen or document (Eva's hands only); a book or code, a notebook; documents with out-of-focus text; Lyon stone or doorway near the office; light on a surface | 10–15 images; usable as card covers and section breaks |
| **Total** | **25–30 retouched images**, plus originals | One consistent grade |

### 7.2 Formats and sizes the site needs
| Use | Ratio | Minimum size | Notes |
|---|---|---|---|
| Hero | 3:2 or 16:9 | 2400 px wide | quiet area for text; deliver a 4:5 crop for mobile |
| About / portrait | 4:5 | 1600 × 2000 | replaces `portrait.jpeg` (835 × 1112) |
| Publication cards and article covers | 3:2 | 1200 × 800 | 16:9 crops also ok |
| Open Graph / Twitter | 1.91:1 | 1200 × 630 | text-safe centre; today the portrait is reused (A-29) |
| Google Business Profile | 1:1 and 16:9 | 720 × 720 min; cover 1024 × 576 | verify against Google's current guidelines when uploading |
| Business card / print | any | 300 dpi at final size (business card 85 × 55 mm, plus 3 mm bleed) | deliver full-resolution originals |
Deliver sRGB JPEG, full resolution plus web-ready versions; keep the grade consistent.

### 7.3 Rights to secure
- **Written contract with the photographer, assigning exploitation rights** with each right, scope, place
  and duration spelled out (French IP code art. L131-3): reproduction and communication to the public;
  media: website, social networks (LinkedIn, Google Business Profile), print (cards, brochures), press and
  third parties (Ordre, conferences, publishers); territory: world; duration: **at least 10 years**
  (unlimited if the photographer accepts); modification (crop, colour grade, overlay) permitted;
  exclusivity for these images; credit: none required on the site (state it, because moral rights remain).
- **Image rights**: Eva signs her own release for all uses above. **No other identifiable person** in the
  frame without a written release (employees, clients, passers-by). Premises: release from the building
  owner or co-tenants if common areas appear.
- **Data**: faces are personal data; keep releases and contracts with the photographer's invoice; originals
  stored by the firm.
- **Ethics**: nothing implying results or comparison; no client matter visible.

### 7.4 Plan to get them (to confirm with Eva)
- **Who**: a local photographer in Lyon used to portraits of liberal professionals; 2–3 quotes; check
  portfolio for natural light and for lawyers/doctors rather than studio headshots.
- **When**: shoot **before #71 (home page design)** starts if direction A is chosen; for B or C the shoot can
  follow the design and is not blocking. Winter light in Lyon is weak: plan a morning shoot near a window,
  or accept a small light kit, or schedule late February–March. Allow 2–3 weeks from brief to delivery
  (selection, shoot, retouching).
- **Format**: one **half-day** on site (about 3–4 hours): portraits first, then office, then details.
- **Budget range to confirm with Eva** (ux estimate from general French market ranges, not a quote):
  roughly **500–1 200 € HT** for a half-day with 20–30 retouched images and a web, print and social
  licence; lower for a portrait-only session (about 250–500 € HT). Get quotes before committing.
- **Brief to give the photographer**: this section, the direction board, three references, the "never"
  list (§5.2), the formats (§7.2).
- **Interim plan** (until the photos exist): keep `portrait.jpeg` for About and OG only, never enlarged as a
  hero; build the first designs on direction B or C (typography and motif), which do not need photos; no
  stock people and no stock office photos; for cards and covers use the motif or typography (no phone
  snapshots of the office for hero use). Replace images once the session is delivered; the design must
  not depend on a specific photo to work.

## 8. Decisions log
_Filled in task 3, after Eva's choice. Leave empty until then._

| Date | Decision | Chosen by | Reasons | What Eva changed |
|---|---|---|---|---|
| | Font | | | |
| | Direction | | | |
| | Photography (session yes/no, budget, timing) | | | |
| | Museo files (remove now or with #79, purge history) | | | |

## 9. Open questions for Eva (to lead; the team does not ask the user)
1. **Font**: Aleo recommended (runner-up Bitter). Eva should see the `Type` board with the logo before
   choosing; she should know the logo lettering will not match any slab, as with Museo today.
2. **Logo lettering is a sans**: is a sans companion (for UI and small labels only) worth discussing? ux
   recommendation: no, one family; asked only so the question is on the record.
3. **Direction**: A, B or C (ux recommendation: B as the base with one good portrait, C's motif for OG and
   `/carte`). What would she change?
4. **Photography**: is a photo session acceptable (budget 500–1 200 € HT to confirm), when, does she have
   office photos already, may a photographer enter the office, and can neighbours/co-tenants appear?
5. **Museo files in the repo** (spec Q3): remove the OTFs now or with #79; purge from git history or not.
6. **Logo artwork**: does Eva hold the vector master, and does she know if outlining Museo letters in the
   logo was covered by the font purchase? (low risk, for the record).

## 10. Handoff to ui

Everything ui needs to draw the `Type`, `Moodboard` and `Directions` pages. The Figcraft file stays
`~/Library/CloudStorage/GoogleDrive-…/EB-Avocat.figcraft`; baseline pages are not touched. Download fonts
into your scratchpad, never into the repo.

### 10.1 `Type` board: candidates, downloads, copy
Candidates, left to right, with **Museo as the reference line** (local files in the repo, not for
publication): `frontend/public/fonts/Museo300-Regular.otf`, `…500…`, `…700…`.

| Font | Download (Google Fonts repo, raw files) | Foundry / source | Weights to set |
|---|---|---|---|
| **Aleo** (recommended) | https://github.com/google/fonts/raw/main/ofl/aleo/Aleo%5Bwght%5D.ttf and https://github.com/google/fonts/raw/main/ofl/aleo/Aleo-Italic%5Bwght%5D.ttf (page: https://fonts.google.com/specimen/Aleo) | https://github.com/AlessioLaiso/aleo | variable: show 300, 350, 400, 600, 700 and italic 400 |
| **Bitter** | https://github.com/google/fonts/raw/main/ofl/bitter/Bitter%5Bwght%5D.ttf and https://github.com/google/fonts/raw/main/ofl/bitter/Bitter-Italic%5Bwght%5D.ttf (page: https://fonts.google.com/specimen/Bitter) | https://github.com/solmatas/BitterPro | variable: 300, 400, 600, 700 and italic 400 |
| **Zilla Slab** | https://github.com/google/fonts/tree/main/ofl/zillaslab (files `ZillaSlab-Light.ttf`, `-Regular`, `-Medium`, `-SemiBold`, `-Bold`, `-Italic`) (page: https://fonts.google.com/specimen/Zilla+Slab) | https://github.com/mozilla/zilla-slab | 300, 400, 500, 600, 700 and Italic |
| Museo (reference) | repo files above | exljbris (not free) | 300, 500, 700 |

If your tool does not drive variable axes, instance static weights first (example, in a scratchpad):
`uvx --from fonttools fonttools varLib.instancer "Aleo[wght].ttf" wght=350 -o Aleo-350.ttf` (repeat per
weight). Aleo 350 is the weight that matches Museo 300's stem thickness.

**Specimen copy** (same for every font; each at **16px body** and display sizes; lay the logo
`logo-for-white-background` at the top-left of the board, with clear space):
- **Hero promise** (display, 56px, then 40px): « Structurer votre exercice libéral, en accord avec votre Ordre et vos associés. » (exemple)
- **À propos paragraph** (16px/26 and 18px/30), adapted from `ABOUT` and #66 variant A, not verbatim from `constants.ts` (exemple): « Avocate au Barreau de Lyon, j'aide les professionnels libéraux et les entrepreneurs à structurer leur activité : choix de la société, statuts, contrats, opérations sur leur clientèle ou patientèle. J'anticipe dès la création les ambitions de chacun et je traite en amont les points de friction entre associés. »
- **Publication title** (32px) and **body with italics** (17px/28): title « Cession de patientèle : les points à vérifier avant de signer » (exemple). Body (exemple): « Avant toute signature, le contrat doit tenir compte de la *déontologie* de votre profession et du contrôle de votre Ordre. Il faut aussi anticiper le départ d'un associé, *avant* que la question ne se pose, et prévoir comment la clientèle sera présentée. »
- **Button** (16px, 600): « Contacter le cabinet » and « Enregistrer le contact »
- **French punctuation line** (24px): « Œuvres, cœur, être, où ? — d'accord ; l'Ordre » ’ « guillemets » : à é è ê ë ç î ô û ù, Ç É À, œ Œ, 1 250 € (with no-break spaces before : ; ? ! » and after «).
- **Weights ladder** (one line each, 24px): « Avocate au Barreau de Lyon » at each weight listed above.
- **Small sizes**: meta line at 14px: « Eva Biezunski · 20 novembre 2026 · Exercice libéral » (exemple).
- Annotate under each candidate: x-height (Aleo 0.507, Bitter 0.522, Zilla 0.445, Museo 0.500 em) and
  WOFF2 size (§1.3). Export `design/type-specimens.png`.

### 10.2 `Moodboard` board
Group the references by theme and credit each as "Photo by NAME on Unsplash" with its link. Mood only,
never site assets.
- **Light**: naL5IO2dT40, loX3-DtMSVg, 4tKkBX4PvwA, lJc44o_I1hg
- **Material**: XFWiZTa2Ub0 (parchment), qv05FvdE26k (recycled paper), vS3idIiYxX0 (watercolour paper), 9wqYOKC7oBg (newspapers)
- **Books**: KNfj7yDVMF0, aT88kga0g_M, _YzGQvASeMk
- **Place (Lyon)**: EdRc5_g-qxo, L-MO5D0NUr0
- **People (framing only)**: 0Zx1bDv5BNY, PlikkWB79qs
- **Type and colour**: the three palettes of §3.2 as swatches next to the logo; no extra images needed.
Page URLs are `https://unsplash.com/photos/<id>`; photographers: Nathan Van Egmond (naL5IO2dT40), Khanh Do
(loX3-DtMSVg), Romina Mosquera (4tKkBX4PvwA), X F (lJc44o_I1hg), SJ Objio (XFWiZTa2Ub0), Kiwihug
(qv05FvdE26k), Olga Thelavart (vS3idIiYxX0), T (9wqYOKC7oBg), Prateek Katyal (KNfj7yDVMF0, _YzGQvASeMk),
Peter Herrmann (aT88kga0g_M), Kristina Bekher (EdRc5_g-qxo), Lucas Gallone (L-MO5D0NUr0), WOCinTech Chat
(0Zx1bDv5BNY, PlikkWB79qs). Use Unsplash's own image URLs (`urls.regular`) to place them; the image IDs
resolve at `https://unsplash.com/photos/<id>/download`.

### 10.3 `Directions` board: one frame per direction, same structure
Each frame: **name + keywords on top**; **palette with proportions** (bar of the §3.3 split + swatches with
hex and the three contrast values: use the tables of §3.2 and the core of §3.1, labelled "AA text" /
"AA large/UI" / "decorative"); **type specimen in Aleo** (display, H2, H3, body, meta, a button); **imagery
sample** (2 reference crops or the motif); **icon sample** (4 lucide icons at 24px, stroke 1.5: `phone`,
`mail`, `map-pin`, `arrow-right`, in the direction's tint); then the **3 applications**. Same frame size
(1600 wide) so they compare side by side. Export `design/direction-a.png`, `direction-b.png`,
`direction-c.png`.

Per direction, specimens (Aleo; all text `#191919` unless noted):

| | A Documentaire | B Éditorial | C Lyon & matière |
|---|---|---|---|
| Page bg | `#F6F3EC` | `#F8F5EF` | `#F3EDE0` |
| Tint / hairline | `#ECE8DE` / `#DAD8CC` | `#EFEBE2` / `#DEDACF` | `#E9E0CC` / `#D5CAB0` |
| UI border / muted text | `#7F877F` / `#5E6B67` | `#7F8680` / `#5B6663` | `#85806D` / `#625E50` |
| Strong alt. text | `#2D3A39` | `#2A3534` | `#2E332F` |
| Accent / text variant / on dark | `#B07A22` / `#7F5413` / `#E3B35B` | `#B4502D` / (same) / `#E8A184` | `#8C3447` / (same) / `#E2A2AE` |
| Motif only | — | — | `#C8982F` |
| Error / success | `#A8322D` / `#2F7D4B` | `#8F1D2C` / `#2D7A55` | `#B3361C` / `#2A7550` |
| Core | `#3f5b57`, `#4a7a6f`, `#264445`, `#162729`, `#191919`, `mist-100 #E4ECEA`, `mist-300 #B9CBC7` | same | same |
| Display | Aleo 400, 48/54, −0.01em | Aleo 300, 64/66 | Aleo 500, 52/56 |
| H2 | 32/38, 400 | 36/42, 400 | 32/38, 500 |
| H3 | 22/28, 600 | 24/30, 600 | 22/28, 600 |
| Body | 17/28, 400 | 18/30, 400 | 17/28, 400 |
| Kicker / meta | meta 14/20, 400 | kicker 13, 600, caps, +0.08em; meta 14 | meta 14/20, 400 |
| Button | `#3f5b57` fill, white label 16/600, radius 4 | `#B4502D` fill, white label 16/600, radius 2 | `#3f5b57` fill (or `#8C3447`), white label 16/600, radius 4 |
| Radius / shadow | 8 on images, soft shadow | 0–2, none, hairlines | 4, none, panels |
| Imagery | photography 3:2, 4:5 | typography, rare portrait | motif + texture |

The 3 applications per direction, with their sample copy, are in §6 (hero crop, publication card, and the
third item: A business card, B OG image, C `/carte` screen). Copy is « exemple »: keep the label small on the
board ("exemple"). Use the real logo files from `frontend/public/images`; the portrait placeholder is
`frontend/public/images/portrait.jpeg`.

### 10.4 Sizes for the exports
`design/type-specimens.png`, `moodboard.png`, `direction-a.png`, `direction-b.png`, `direction-c.png` at 1×
or 2× so they read in a GitHub issue (≈ 1600 px wide minimum). Tell `ux` if any rule here is unclear or
needs a change: ux messages ui on any rule change during task 3.
