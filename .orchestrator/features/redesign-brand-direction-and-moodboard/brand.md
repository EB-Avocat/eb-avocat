# Brand direction and moodboard (#69) — brand.md

Status: **final, 2026-11-20 (task #96, ux).** Eva chose **Aleo** and **Direction A, Documentaire**, with
**no photo session for now** (decisions log, §8). The rules below are final for Aleo + A only; B and C are
kept for the record in Appendix A, marked "not retained". Source of truth for #70 (design system v2) and
`Foundations v2`; the last section is the hand-off to ui.


Inputs: `spec.md`, `ux-brief.md`, `plan-redesign/audit.md` (§3, §5, A-08, A-12, A-13, A-27, A-28),
`redesign-objectives-audience-and-kpis/objectives.md` (#66, positioning variant A; lives on the branch of PR #89, not on this one), and measurements on
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
   it only passes on pure white, 4.88). Text and links on tinted surfaces use `primary` `#3f5b57` (6.0–7.4).
4. **Licence:** Aleo declares no Reserved Font Name, so we may subset or instance it ourselves. (Bitter's
   "Bitter Pro" RFN point is moot now that Aleo is chosen.)
5. **Size is not the argument against Museo.** Museo subset to Latin is ~16 KB WOFF2 per weight. The
   reason to replace it is the licence (decided by the user), not performance. The current 3 × ~127 KB
   OTF (~381 KB) does become ~31 KB for the replacement (variable roman, §1.6).


## 1. Font: replacing Museo with Aleo (A-28) — decided

### 1.1 Status of Museo
Not under a free licence, no web licence held, **decided: replace** (user, 2026-11-20). The five OTFs in
`frontend/public/fonts` are served by the site and published in the GitHub repo: **#79 removes them together
with the font swap** (no earlier removal, **no purge of git history**: user decision, spec Question 3, §8). The logo is unaffected: its letters are outlined paths (§2). Open point for lead, low
priority: whether outlining Museo(-Sans) letters into the logo artwork was within the purchase terms; that
is normal practice for a logotype but is not recorded anywhere (Eva or the logo designer would know).

### 1.2 Candidates: kept and dropped
Looked at the five starting candidates plus Rokkitt (variable, light slab) and Arvo (geometric slab),
rendered next to Museo 300/500 at 48px and 20px, and measured.

| Candidate | Decision | Reason |
|---|---|---|
| **Aleo** | **Shortlist** | Same x-height (+1%) and width (−1 to −3%) as Museo; open round shapes, low contrast, soft bracketed slabs; variable 100–900 with true italic; no Reserved Font Name |
| **Bitter** | **Shortlist** | Built for screen reading, best 16px body; width equal to Museo; slightly taller x-height (+4%) and sturdier, more "newspaper" than Museo; variable + italic; RFN "Bitter Pro" |
| **Zilla Slab** | **Shortlist** | Closest to Museo's quirky, friendly slab personality; but x-height −11% and width −6 to −8% (needs a size bump and changes line breaks), 5 static weights, no variable file, heaviest WOFF2 |
| Hepta Slab | Dropped | 19% wider than Museo (0.52 vs 0.43 em avg.), no italic: every line break and card would change; 22 KB per weight; default axis value is 200, not a text weight |
| Podkova | Dropped | Weights 400–800 only (no light), x-height −14%, cap height −16% (looks small and low-contrast at 16px), no italic |
| Rokkitt | Dropped | x-height −20%, condensed: reads as a different, narrower voice |
| Arvo | Dropped | Two weights only (400/700), geometric and mechanical rather than humanist; RFN "Arvo" |
| *A humanist sans (Nunito Sans, Mulish…)* | Not shortlisted | Would match the logo lettering better but is not "close to Museo" (the user's brief) and changes the site's personality from slab to sans. Question closed: one family (§9) |

Shortlist = 3 fonts (the brief allows 3–4; the other candidates fail a hard criterion).

### 1.3 Scoring (shortlist, Museo as reference)
Scores 1–5 (5 best). Measured values are from the files (§1.7); closeness to Museo and to the logo are
judgements from the render (side-by-side render of the candidates at 48px and 20px) and the stem measurement. All three cover é è ê à ç œ « »
’ and U+00A0. **None has U+202F (narrow no-break space), nor has Museo; only Bitter has U+2009 (thin space), and relying on it would make the font choice change the typography**: use U+00A0
before » : ; ? ! and after « (the site does **not** do this today: `constants.ts` uses ordinary spaces there, so #68/#79
add the U+00A0); browsers fall back for any U+202F.

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

### 1.4 Decision: **Aleo** (variable roman + italic), chosen by Eva 2026-11-20
- It is the only candidate that keeps Museo's **proportions**, so layouts, line lengths and card heights
  hold (x-height +1%, width within 3%), and fallback metrics stay simple (§1.6).
- One variable file replaces three static ones: any weight 300–700 in ~31 KB, so the Museo-300 colour
  can be matched (Aleo ≈ 350) while body goes to 400 for legibility (A-12).
- True italic for articles; no Reserved Font Name, so we can instance or subset it ourselves if
  `next/font/google` is ever not wanted.
- Honest limits: Aleo is a little more **calligraphic** than Museo (the `a`, `e` terminals), and its
  caps are 5% taller (0.737 vs 0.700), so all-caps labels look slightly bigger; it will not match the
  logo lettering (no slab can). Eva saw this on the `Type` board before choosing.
- Not retained: Bitter (runner-up: sturdier, +4% x-height, RFN "Bitter Pro") and Zilla Slab (reads small at
  16px, ~100 KB static files). Scoring kept above for the record.

### 1.5 Weight mapping Museo → Aleo (equal-stem value, then the role actually used)
| Museo on the site today | Stem | Aleo variable weight | Use in the new system |
|---|---|---|---|
| 300 (body, most text) | 67 | ≈ 350 | **Do not copy.** Body moves to 400 (stem 89): A-12. 300 is dropped (§1.6) |
| 500 | 97 | ≈ 480 | Existing `font-500` uses (61) map to 600 for H3, buttons, nav and labels (§4); 500 stays available only as an optional H2 weight |
| 700 | 127 | 700 | 700 for bold emphasis in prose and the strongest headings |

### 1.6 Font plan (decided here, built in #79)
- **Files**: Aleo roman + Aleo italic, variable `wght`, **WOFF2, Latin subset including French glyphs**
  (Basic Latin, Latin-1, œ Œ Ÿ, ’ ‘ “ ” « » – — … €, U+00A0). Limit the axis to **400–700** if self-subsetting (300 is dropped, §1.6)
  (saves ~7%). Measured subsets: roman 31.2 KB (300–700) / 33.6 KB (full 100–900); italic 32.6 / 35.3 KB.
- **Delivery**: `next/font/google` (`Aleo`, `weight: "variable"`, `style: ["normal","italic"]`,
  `subsets: ["latin"]`, `display: "swap"`): Next downloads at build time and serves the files from our own
  domain, so **no runtime request to Google and no new vendor** (rule: prefer existing vendors). Fallback:
  `next/font/local` with the files in the repo, adding `OFL.txt` next to them. Latin subset from Google
  includes œ « » ’ but not Ÿ (U+0178 is in Google's `latin-ext`, loaded on demand only); verify in the built CSS
  `unicode-range`.
- **Preload**: roman only (body + headings). **Italic is not preloaded** (articles only, not above the fold).
  Caution: `next/font` preloads every file a loader declares, so a single `Aleo({ style: ["normal","italic"] })`
  call preloads the italic too. To keep it off the preload list, use two loaders (roman with `preload: true`,
  italic with `preload: false`, e.g. `next/font/local`) and map `em, i, cite` in prose to the italic loader's
  family; or accept both files preloaded (~69 KB). #79 decides.
- **Fallback metrics** (kills the Georgia-then-font reflow, A-28): use `adjustFontFallback` (automatic for
  `next/font/google`, `"Times New Roman"` for `next/font/local`). Indicative values to check the output
  against (computed on a French sample, regular weight): vs Times New Roman `size-adjust` ≈ 113%,
  `ascent-override` ≈ 80%, `descent-override` ≈ 26%, `line-gap-override` 0%; vs Georgia 103% / 88% / 29% / 0%.
  Remove `ui-serif, Georgia` as the *first* fallback if it creates a second reflow; keep `serif` last.
- **Weights kept** (final, one variable axis): **400** (body, H1, H2, lead, meta), **600** (H3, card titles,
  buttons, nav, form labels, kickers), **700** (bold in prose), plus **italic 400**. **500** is optional for
  H2 only (A's scale uses 400). **300 and italic 300 are dropped**: A's display is 400 and B's light pull
  quote is not retained. No 100/200/300/800/900. When self-subsetting, limit the axis to **400–700**. **The
  existing `font-300/500/700` utilities (32/61/31 uses) do not carry over as they are**: Aleo 300 is thinner
  than Museo 300 (stem 50 vs 67), so #79 maps `font-300` to 400, `font-500` to 600 (§1.5) and `font-700` to 700.
- **`font-feature-settings`**: leave defaults (kerning, ligatures on); use `font-variant-numeric:
  tabular-nums` only in tables and back-office lists.
- **Budget**: ~31 KB preloaded + 33 KB on demand when self-subset to 400–700 (measured at 300–700, so an
  upper bound); via `next/font/google` the full 100–900 axis is served (~34 KB roman + ~35 KB italic). Either
  way versus ~381 KB of OTF today.
- **Code places that name Museo** (to change in #79, with the files, together):
  - `frontend/src/app/globals.css`: three `@font-face` (lines 3–26) and `--font-museo` in `@theme` (line 35)
  - `frontend/src/app/layout.tsx:111` and `frontend/src/app/global-error.tsx:23`: `font-museo` on `<body>`
  - `frontend/src/components/ui/PublicationCard.tsx:32`: `font-museo` on the cover placeholder
  - `frontend/src/components/publications/ArticleBody.tsx:9`: `prose-headings:font-museo` (and override the Typography plugin weights to §4: headings H1/H2 400, H3 600, and `prose-strong:font-700`, since the plugin's default `strong` is 600)
  - `frontend/src/components/backoffice/editor/RichEditor.tsx:113`: `prose-headings:font-museo` (same weight override)
  - `frontend/public/fonts/Museo{100,300,500,700,900}-Regular.otf`: delete (5 files)
  - `README.md:172`: "fonts/ # Museo font family"
  - Logo SVGs (`logo-*.svg`, 5 files): inert `font-family:Museo` in Inkscape style attributes; the letters
    are outlined. Optional clean-up; do not redraw the logo.
  - `text-primary-light` / `hover:text-primary-light` used as **text** on paper or tints (fails 4.5:1, §0 item 3): `ArticleBody.tsx:9`
    (`hover:prose-a:`), `Contact.tsx:88` and `:221`, `publications/[slug]/page.tsx:55`, `mentions-legales/page.tsx:16`,
    `politique-de-confidentialite/page.tsx:17`. Use `primary` or `dark-teal` (hover) instead; icons stay allowed (§3.1).
  - `frontend/src/app/globals.css`: the `:focus-visible` outline (line 54) and the editor's selected-figure
    outline (line 126) use `--color-primary-light` (1.51:1 on `primary` bands): switch to the focus ring of §3.1;
    the `.skip-link` `font-weight: 500` (line 70) is raw CSS, not a `font-500` utility, so map it to 600 by hand.
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
| White, paper, sand, any light tint | `logo-for-white-background` | `#618983` / `#264445` / `#3f5b57` on light. Primary use: navbar (solid), articles, legal, print |
| Dark teal `#162729`, `#264445` | `logo-for-dark-green-background` | white lettering, `#618983` pans (3.99 on `#162729`, 2.71 on `#264445`, only 1.90 on `#3f5b57`: avoid the logo on `#3f5b57`, use it on the two darkest teals). `/carte`, a dark band if one carries the logo (the home hero is paper under Direction A: `Hero.tsx` switches to the white-background variant in #79); footer (today `Footer.tsx` uses the `white-for-black` variant on dark teal: switch it in #79) |
| Mid teal `#4a7a6f` (primary-light) and similar mid-tones | `logo-for-light-green-background` | `#264445` lettering + white details (lettering is only 2.16:1 on `#4a7a6f`: logotype, but use the variant only on that exact fill). **No logo on `primary` `#3f5b57`** (no variant works: dark-green 1.90:1, white-surface variant disappears): put the logo on paper or on a darkest teal, never on a `primary` band |
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
without the overlay; place it on a busy or patterned background (motifs, textures, text); crop the mark from the lettering
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

## 3. Palette (core + Direction A)

### 3.1 Core (unchanged) and solid "muted on dark" tokens
| Colour | Hex | vs `#FFFFFF` | vs `#191919` | vs `#162729` | Role |
|---|---|---|---|---|---|
| `primary` | `#3f5b57` | 7.38 | 2.38 | 2.10 | Text/links on any light surface (6.0–6.7 on papers and sand tints), bands, buttons, focus ring on light |
| `primary-light` | `#4a7a6f` | 4.88 | 3.60 | 3.17 | White-only: icons, small marks (white on it 4.88). **CTAs move from `primary-light` to `primary` (hover `dark-teal` `#264445`)**. **Not as text on tinted paper (4.18–4.40)** |
| `dark-teal` | `#264445` | 10.53 | 1.67 | 1.47 | Hero gradient end, dark surfaces |
| `darker-teal` | `#162729` | 15.48 | 1.14 | 1.00 | Hero gradient start, footer, theme-color |
| `near-black` | `#191919` | 17.58 | 1.00 | 1.14 | Body text and headings on light |
| Logo teal (reference only) | `#618983` | 3.88 | 4.53 | 3.99 | Logotype only; never text |
| `mist-100` (new) | `#E4ECEA` | 1.20 | 14.64 | 12.89 | Body/secondary text on dark: 12.89 on `#162729`, 8.76 on `#264445`, **6.15 on `#3f5b57`** |
| `mist-300` (new) | `#B9CBC7` | 1.69 | 10.41 | 9.16 | Muted text on `#162729` (9.16) and `#264445` (6.23) **only**; 4.37 on `#3f5b57` fails: use `mist-100` there |

These two `mist` solids replace the `text-white/60–80` alpha pattern (A-13); no muted text on
`primary-light` other than pure white. **Focus ring** (A-14, raw values for #70): on light surfaces
`primary` `#3f5b57` (≥ 6.0:1 on white, the papers and Sand 100); on dark surfaces `mist-100` `#E4ECEA` (6.15 on
`#3f5b57`, 8.76 on `#264445`, 12.89 on `#162729`). Both ≥ 3:1 everywhere, unlike today's `#4a7a6f`
(1.51 on the "Votre avis" band).

### 3.2 Neutrals, accent, error, success: Direction A (final)
Warm neutrals are tinted toward teal (the darker steps pick up green-grey) so they sit with the core.
Each ramp has six steps. Sand/pierre 200 is decorative (hairlines, never the only boundary); step 400 is
the one for **input borders and icons** (≥ 3:1 on white and paper, WCAG 1.4.11). "vs paper" is the contrast
against the direction's own page background, which is what text actually sits on.

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

### 3.3 Proportions (of visible area on a typical page)
| Surfaces (paper, sand tints, white) | Teal (text, bands, nav, footer) | Imagery | Ambre |
|---|---|---|---|
| **60%** | **25%** | **12% when photos exist; today 0–4% (one portrait), the 8–12% goes to paper/sand panels** | **≤ 3%** (links, one rule, tiny marks); the CTA stays `primary` teal |

Rules: one accent per page region; no accent text below 4.5:1 **on the surface it sits on**: the "vs paper"
column does not hold on Sand 100 (Success on Sand 100 = 4.13), so accent, success and error text go on paper
or white only, and on tinted sections use `primary` (≥ 6.0) or Ambre profond (5.40 on Sand 100); no colour as
the only carrier of meaning (links stay underlined, status has icon + text); tinted sections alternate with
paper, not with each other; avoid more than one dark band between two light ones.


## 4. Typography (Aleo, variable; Direction A's scale)

Sizes are A's starting scale; #70 owns the final type scale and token names. Body ≥ 16px, meta ≥ 14px (A-12).

| Role | Weight | Size (desktop / mobile) | Line height | Notes |
|---|---|---|---|---|
| Display (hero promise) | 400 | 48 (max 56) / 34–36 | 1.1 (48/54), tracking −0.01em | No light weight (§1.6) |
| H1 (page title) | 400 | 40 / 30–32 | 1.15 | |
| H2 (section) | 400 (500 optional) | 32 / 26–28 | 1.2 (32/38) | |
| H3 / card title | 600 | 22 / 20 | 1.3 (22/28) | |
| Body | **400** | 17 / 16–17 | 1.65 (17/28) | 60–70 characters per line; never 300 (was the A-12 problem) |
| Lead / standfirst | 400 | 20–22 / 18–20 | 1.5 | |
| Meta (dates, captions, tags) | 400 | 14 / 14 | 1.4 | Never below 14px; `sand-600`; `mist-300` on `#162729` / `#264445` only, `mist-100` on `primary` (§3.1) |
| Buttons, form labels, nav | 600 | 16 / 16 | 1.2 | |
| Overline / kicker (uppercase) | 600 | 14, tracking +0.06em | 1.3 | Caps look larger in Aleo (cap height 0.737) |
| Italic (emphasis, quotes, titles of works) | 400 italic | as parent | as parent | True italic, never synthesised |
| Bold in prose | 700 | as parent | | |
| Numbers in tables | 400, `tabular-nums` | 14–16 | | |

Rule summary: **400 is the floor for any text** (no 300, no italic 300); 600 for H3, buttons, nav and labels; 700 for
bold in prose. Headings in the same family, no second typeface. H1 and Display are the same style on
different pages (Display = home hero only).

### 4.1 With the logo
The lettering of the logo is a light sans; the slab is the voice of the site. They are never set
together at the same scale; the logo stays in its clear space (§2).

## 5. Imagery and icons (Direction A)

### 5.1 Imagery options
| Option | Pros | Cons | For this audience / Eva's means |
|---|---|---|---|
| **Documentary photography** (Eva, her office, details, natural light) | Trust through a real person (the positioning is first person); answers A-04 (proof) and the person-led firm; reusable for OG, GBP, cards; no stock clichés | Needs a shoot (cost, timing); weak or generic photos hurt more than none; consent and rights to manage; must be refreshed | Strongest for prospects aged 35–70 choosing a person; budget is a half-day session (§7) |
| **Graphic motif / illustration** (derived from the logo or from Lyon) | Distinctive, ownable, no people to photograph, works at small sizes and on OG; cheap to extend | Does not show Eva (trust gap); needs a designer to draw it well; risk of looking decorative or "agency" | Good complement and good interim; lower trust yield alone |
| **Typography only** | Zero cost, fast, very sober, strongest hierarchy; fits an expertise/publications story | Looks cold or "template" if not very well set; no face of the firm; OG images become repetitive | Fits Eva's means; needs excellent type and rhythm (A-08) |

Retained for A: **documentary photography of the person (few, good) is the lead, with typography and
paper/sand panels for everything else**. Photos do not exist yet beyond one portrait, so §6.2–6.4 define how
the design works **without** them and what changes when they arrive. The motif option (C) is not retained.

### 5.2 Rules
- **Subjects**: Eva (portrait, working), the office (entrance, meeting room, desk), hands and documents,
  books, Lyon stone, light. People are real and consenting.
- **Light and framing**: natural window light, soft shadows, eye-level, shallow depth of field on people,
  one subject per image, space for text where used as a hero (rule of thirds, 40% quiet area).
- **Colour treatment**: natural colour, warm but not orange, no filters; one grade for the set (match the
  paper warmth `#F6F3EC`). Photos used under type get a `darker-teal` overlay (start at 40–60%, or a gradient), then **measure**: text must reach ≥ 4.5:1 against the lightest area under it.
- **Never**: gavels, scales, Lady Justice, columns, handshakes, stacks of legal books posed as stock,
  people pointing at laptops, suits-in-glass-offices stock, client faces or files, any photo that implies
  results ("winning") or comparison, stock photos of "lawyers" or of offices that are not Eva's. Unsplash
  images are **mood references only, never site assets** (spec); neither in the interim (§6.3).
- **Single-portrait rules** (until a session): see §6.2. One photo, one place at a time; never enlarged, never
  stretched, never cropped tighter than the original crop below, never recoloured.
- **Alt text**: describes the content ("Eva Biezunski à son bureau, face à la fenêtre"), not "image of".
  Decorative motifs get `alt=""`.

### 5.3 Icons
- **Keep `lucide-react`** (ISC licence, already installed, consistent family, tree-shaken).
- **One stroke width: 1.5 px** at every size (today: 1.5 on cards, 2 elsewhere, which reads as inconsistent):
  in code `strokeWidth={1.5}` **with `absoluteStrokeWidth`**, so the line stays 1.5 px at 16, 20 and 24 (lead decision, 2026-11-20).
  Sizes: **16** inline with text, **20** UI controls (menu, chevrons, external link), **24** contact
  channels (phone, mail, map-pin). No icon above 24px as decoration. Colour `currentColor`; on dark
  `mist-100`. Rounded caps and joins (lucide default). The LinkedIn glyph stays the inline brand SVG.
- **When icons are used**: **function only** — contact channels, navigation controls, status (with text),
  external-link and download hints. **Not** as ornament on cards: the six identical icon cards of the
  current services section are the template look (A-08). Services get typographic numbering or a short label instead.
- Touch targets ≥ 44 × 44 px (24px icon in a 44px hit area); icon-only buttons need an accessible name.

## 6. Direction A — **Documentaire** (final)

**Keywords**: personne, lumière naturelle, chaleur, confiance, calme.
**Idea**: trust through the person. The page is a warm paper, the teal speaks in text, nav and one dark
band, a very discreet Ambre mark. Eva appears in natural light when photos exist; **until then the page is
typographic and calm, and the one portrait does the work of "a person".**
Keeps: logo unchanged, teal core and `#191919`, Aleo in the roles of §4, WCAG 2.2 AA, no results claims.
Sample copy follows the approved positioning (#66, variant A), marked « exemple »: #68 writes the final wording.

### 6.1 Rules
- **Palette**: §3. Paper `#F6F3EC`, Sand ramp, teal core, Ambre (≤ 3%), CTA `primary` `#3f5b57` with white label.
- **Type**: §4 (display 48/54 w400, H2 32/38 w400, H3 22/28 w600, body 17/28 w400, meta 14/20 w400).
- **Icons**: functional only (§5.3).
- **Density / rhythm**: calm and airy, 96–120px between sections, one idea per screen. With photos: image
  alternates left/right. Without: **panels alternate** (paper, Sand 100, one `darker-teal` band) and a
  Sand 200 hairline separates blocks.
- **Radius / shadow**: 8 on images and cards, soft shadow on cards only; buttons radius 4.

### 6.2 The one portrait (`frontend/public/images/portrait.jpeg`, 835 × 1112)
What it is: a studio bust on a **deep navy background**, face centred in the upper half, blue-teal textured
jacket, black top, soft frontal light. Vertical (3:4). It was shot for LinkedIn-type use, not for a hero.
- **Where it is used**: About (the person), OG image (§6.5), JSON-LD / Twitter (already), and **at most one
  per page**: the About block (a section of the home page today; its own page if #67 creates one), or, when
  About is not on the page, the foot of the home page ("Eva Biezunski, avocate" block) or the contact block.
  On the current single-page home that means one slot only: About. **Never the home hero, never a card cover, never a background, never behind text.**
- **Maximum display size** (so it stays sharp at 2× density): **417 CSS px wide × 556 tall** in 3:4 (835 × 1112 / 2; 417 × 522 in the 4:5 crop). At
  1× screens it could go to 835, but design for 417 max. **No full-bleed, no `object-fit: cover` stretch
  into a wider box**: use the frame in the next bullet. On mobile: full width of the content column, max 390 px
  wide, never scaled up past 100% of its natural pixels on a 2× phone (≤ 417 px).
- **Frame**: 3:4 as is, or 4:5 crop (835 × 1044, drop the bottom 68 px), corner radius 8, no border, no shadow
  beyond the card shadow. The navy background is dark and saturated, so it reads as **a dark panel**: pair
  it with a `darker-teal` band or sit it as a framed object on paper with 32px clear space; do not tint
  or colour-match the navy to the teal (no overlay, no filter, no recolour).
- **Never**: enlarge above the max, crop to a face-only square under 835 × 835 source or to a banner
  (3:1) crop, blur it as a background, duplicate it on the same page, use a different crop of it as "second
  photo", put the logo on it.
- **Alt text**: « Eva Biezunski, avocate au Barreau de Lyon ». Decorative repeats get `alt=""`.
- **When it is replaced** (session delivered): same slot, new file.

### 6.3 What replaces photos (interim rules, valid until a session happens)
| Place | Interim |
|---|---|
| **Home hero** | Typographic. Paper, logo top-left, Ambre rule 64 × 3 px, display H1, sub, button + phone. **Right column: a Sand 100 panel** with a short proof block (« Barreau de Lyon », « Droit des sociétés, exercice libéral », contact line), set in type, 8px radius, no image. Becomes a text-led two-column hero, still calm. |
| **Publication cards and article covers** | **Typographic cover**: Sand 100 panel (3:2), category in 600 caps (kicker), Ambre rule, no image. Article without cover: no placeholder photo. Replaces the current `PublicationCard.tsx` placeholder, with the same shape. |
| **Section breaks / "about" blocks** | Sand 100 or `darker-teal` full-width band with large type (a figure or a short statement); hairline rules. |
| **`/carte`** | `darker-teal`, dark-green logo, type only (no portrait). |
| **Stock people, stock offices, Unsplash images** | **Not used.** The Unsplash moodboard was mood only. No phone snapshots of the office either. |
| **Icons as decoration** | Not used (§5.3); do not fill empty image slots with icons. |

### 6.4 When photos exist: what changes
Everything in §6.3 keeps working; photos **replace panels in these slots only**, nothing else is redrawn:
| Rule | Without photos (now) | With photos (after a session) |
|---|---|---|
| Home hero | Typographic, Sand 100 proof panel | Photo right (3:2 / 4:5 on mobile, from §7.2), one per page, Sand panel removed |
| Portrait | One portrait (≤ 417 px wide) on About | New 1600 × 2000 portrait; may appear at up to **560 px wide** and in the hero |
| Publication covers | Typographic cover | 3:2 detail photo, or keep the typographic cover for articles with no fitting detail |
| Imagery share (§3.3) | 0–4% | up to 12% |
| OG image | Portrait + type (§6.5) | Same layout, new portrait |
| Moodboard Unsplash images | not used | still not used (own photos only) |
The design must stand without photos; photos raise the warmth, they do not carry the layout.

### 6.5 OG image (1200 × 630), built from the portrait and typography
- Left 55%: Paper `#F6F3EC`, logo `for-white-background` top-left (clear space respected, ≥ 160 px wide),
  display line in Aleo 400 at 56/62 (« Structurer votre exercice libéral. » (exemple), max 3 lines), an Ambre
  rule 64 × 3, then « biezunski-avocat.fr » in 600 at 24/32 `primary`.
- Right 45%: the portrait in a **3:4 frame 417 px wide × 556 px tall** (native pixels /2, no enlargement), 8px
  radius, vertically centred, 48 px from the right edge; navy background sits against paper like a framed
  print. Contrast on paper: display line ≥ 15:1, URL in `primary` 6.66:1.
- Build note: `next/og` (satori) reads TTF/OTF/WOFF only, not WOFF2 and not variable axes. If the OG image is
  generated in code, ship a static Aleo 400 and 600 TTF instance for it (instancer command in §10).
- The same template (Display left, portrait right) serves Twitter. Without the portrait (articles): left
  column full width on Sand 100 with the article title.

### 6.6 The 3 applications (ui redraws without new photos)
1. **Hero crop** (1440 × 720), **typographic**: paper left, logo `for-white-background` top-left, Ambre rule,
   H1 « Structurer votre exercice libéral, en accord avec votre Ordre et vos associés. » (exemple), sub « Avocate au Barreau de Lyon, j'accompagne les professionnels libéraux et les entrepreneurs, de la création de leur société aux démarches devant leur Ordre. » (exemple), button « Contacter le cabinet » + « 04 00 00 00 00 » (exemple). Right: Sand 100 proof panel (§6.3). **No portrait.**
2. **Publication card**, typographic cover: Sand 100 3:2 panel with kicker « EXERCICE LIBÉRAL » (600 caps) and Ambre rule, title « Cession de patientèle : les points à vérifier avant de signer » (exemple), excerpt « Ce que prévoit le contrat, ce que votre Ordre examinera, et ce qu'il vaut mieux régler avant la signature. » (exemple), meta « Eva Biezunski · 20 novembre 2026 » (exemple). No photo.
3. **Business card** (85 × 55 mm, recto and verso) **unchanged from the board** (it had no photo): verso `darker-teal` with the dark-green logo; recto paper with « Eva Biezunski », « Avocate au Barreau de Lyon », placeholders, small QR block to `/carte`, one Ambre rule.
Plus a fourth, small: **About block** with the portrait at 417 × 556 on a `darker-teal` band next to the About text.

### 6.7 Mood references (Unsplash, mood only, never site assets; credit "Photo by … on Unsplash")
1. https://unsplash.com/photos/naL5IO2dT40 — Nathan Van Egmond: warm desk in daylight
2. https://unsplash.com/photos/loX3-DtMSVg — Khanh Do: window with greenery and books (light, calm)
3. https://unsplash.com/photos/4tKkBX4PvwA — Romina Mosquera: desk with lamp and book (warm, intimate)
4. https://unsplash.com/photos/lJc44o_I1hg — X F: sunlight through a window into a dark room
5. https://unsplash.com/photos/0Zx1bDv5BNY — WOCinTech Chat: portrait, shallow focus (framing only)
6. https://unsplash.com/photos/PlikkWB79qs — WOCinTech Chat: seated, natural light (framing only; do not copy the posture)
They describe the target for a future session (light, desk, window), not the interim site.


## 7. Photography needs

### 7.1 Shot list
| Set | Shots | Notes |
|---|---|---|
| **Portrait** (2–3 setups) | (1) Frontal bust, neutral wall, natural light — About, OG, cards, GBP, LinkedIn; (2) **environmental** at the desk or window, reading a file, three-quarter — hero (A, once photos exist); (3) candid, listening or looking at a document, shallow depth of field | Same clothes plus one change; a square-safe crop and a vertical 4:5 for each |
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

### 7.4 Deferred plan (decision: no session for now)
**Decision (user, 2026-11-20): no photo session now; "we'll do with the current one"** (`portrait.jpeg`,
835 × 1112, the only photo). Acceptance for this task = needs listed (§7.1–7.3) + a plan to obtain them (this
section, deferred with its triggers).
- **Triggers to schedule the session** (any one): (1) #71 (home page design) needs a photo to work, which the
  interim rules (§6.3) should avoid, so the trigger is a **ux/ui call at #71 start**; (2) Eva sets a target
  date (e.g. before a launch or a communication push); (3) the portrait is judged too small or too studio-like
  for a use that matters (hero, OG refresh, Google Business Profile); (4) a publication push needs card
  covers and typographic covers look repetitive.
- **Until then**: interim rules in §6.2–6.3 (one portrait, ≤ 417 px wide, no hero, typographic panels, no stock).
- **When triggered**: who (local Lyon photographer used to liberal professionals; 2–3 quotes; portfolio with
  natural light), format (half-day on site, portraits, then office, then details), timing (allow 2–3 weeks
  from brief to delivery; winter light is weak: a morning near a window, or late February–March), brief
  (this section, §5.2 "never" list, §7.2 formats).
- **Budget range to confirm with Eva** (ux estimate from general French market ranges, not a quote): roughly
  **500–1 200 € HT** for a half-day, 20–30 retouched images, web + print + social licence; about 250–500 € HT
  for a portrait-only session. Get quotes first.
- **Cheaper partial option** if the trigger is only the portrait or OG: a portrait-only session (setup 1 and
  3 of §7.1), which also upgrades the hero for §6.4.
- **What changes when it happens**: §6.4.


## 8. Decisions log
| Date | Decision | Chosen by | Reasons | What Eva changed |
|---|---|---|---|---|
| 2026-11-20 | **Font: Aleo** (variable roman + italic, `next/font/google` or local, §1.6) | Eva, relayed by the user | Only candidate that keeps Museo's proportions (x-height +1%, width within 3%): layouts, line lengths and card heights hold; one variable file, ~31 KB vs ~381 KB OTF; true italic; OFL 1.1, no RFN; scored 46/50 (§1.3, §1.4) | Nothing; the recommendation was kept |
| 2026-11-20 | **Direction: A Documentaire** (palette §3, scale §4, rules §6; B and C not retained, Appendix A) | Eva, relayed by the user | Trust through the person fits the positioning (#66 variant A, first person) and the audiences choosing an avocat by person; warm paper keeps the site calm and distinct from the template look (A-08) | Chose A over ux's recommendation (B with A's portrait); the cost is that A is photo-led, handled by §6.2–6.4 |
| 2026-11-20 | **Photography: no session for now**, use the current portrait | Eva, relayed by the user | Cost and timing; "we'll do with the current one". Deferred plan with triggers in §7.4; interim rules in §6.2–6.3 | Direction A made to work without new photos |
| 2026-11-20 | **Museo files**: removed by #79 with the new font; no early removal; **no purge of git history** | User | Spec Question 3: removal is code work together with the font swap (§1.6); history purge not worth the disruption | |

## 9. Open points
1. **Logo artwork** (low priority, for the record): does Eva hold the vector master, and was outlining
   Museo(-Sans) letters in the logo within the font purchase? Not blocking.
2. **Trigger date for a photo session** (§7.4): none set; ux/ui revisit at #71 start.
3. **Sans companion for small labels** (was a question): ux recommends no; one family, so not pursued.


## 10. Handoff to ui — Foundations v2

Everything ui needs to draw `Foundations v2` (Figcraft file `EB-Avocat.figcraft`, baseline pages not
touched; download Aleo into your scratchpad, never into the repo). Fonts: Aleo variable roman and italic
from https://github.com/google/fonts/tree/main/ofl/aleo (OFL 1.1). If your tool does not drive variable
axes, instance static weights first: `uvx --from fonttools fonttools varLib.instancer "Aleo[wght].ttf" wght=600 -o Aleo-600.ttf`.
Copy is « exemple ».

### 10.1 Logo (§2)
- Variants: `logo-for-white-background` (paper, white, sand), `logo-for-dark-green-background` (`#162729`,
  `#264445` only; never `#3f5b57`), `logo-for-light-green-background` (only on exactly `#4a7a6f`),
  `logo-white-for-black-background` (only over a darkened photo area), `logo-black-for-white-background` (one-colour
  print), `favicon.svg` / `favicon-white.svg` (mark only).
- Sizes: stacked min **96 px** (30 mm in print); mark only min **16 px** (8 mm). Clear space **1/6 of the
  logo width** on all sides. Show the do/don't: no redraw, no recolour, no logo on `#3f5b57`, no headline
  directly beside the lettering (§2.3, §2.4).

### 10.2 Palette with roles and proportions (§3)
- **Core**: `primary #3f5b57`, `primary-light #4a7a6f` (white-on-it only), `dark-teal #264445`, `darker-teal #162729`, `near-black #191919`, `mist-100 #E4ECEA`, `mist-300 #B9CBC7`; logo teal `#618983` shown as reference, "never text".
- **A neutrals**: Paper `#F6F3EC`, Sand 100 `#ECE8DE`, 200 `#DAD8CC` (decorative), 400 `#7F877F` (borders, icons), 600 `#5E6B67` (muted text), 800 `#2D3A39`.
- **Accent**: Ambre `#B07A22` (fills, rules, icons; never text), Ambre profond `#7F5413` (text, links), Ambre clair `#E3B35B` (on dark only). **Error** `#A8322D`, **Success** `#2F7D4B`.
- **Proportions**: surfaces 60%, teal 25%, imagery 12% (0–4% now, panels fill the rest), Ambre ≤ 3% (§3.3).
- Label each swatch with its contrast (use the §3 tables) as "AA text" / "AA large/UI" / "decorative". Focus ring: `#3f5b57` on light, `#E4ECEA` on dark.

### 10.3 Type specimen and weights (§4, §1.6)
Aleo only, weights **400, 600, 700 + italic 400** (500 optional H2). Show the role table: Display 48/54 w400
(−0.01em), H1 40/46 w400, H2 32/38 w400, H3 22/28 w600, body 17/28 w400, lead 20/30 w400, meta 14/20 w400
(`#5E6B67`), button 16/600, kicker 14/600 caps +0.06em. Include the French punctuation line (« », œ, é, U+00A0
before : ; ? !) and the weights ladder 400/600/700. **No 300.** Show the logo beside it with clear space,
labelled "different faces; kept apart" (§4.1).

### 10.4 Imagery do/don't, single-portrait rules (§5.2, §6.2)
- Do: portrait ≤ **417 × 556 px** (4:5 crop: 417 × 522), 3:4 or 4:5, radius 8, one per page, on paper or on a `darker-teal` band;
  typographic panels (Sand 100, Ambre rule) for covers and heroes; real alt text.
- Don't: enlarge or full-bleed the portrait; use it as a hero, card cover or background; overlay or recolour it;
  put the logo on it; stock people, stock offices, Unsplash images as assets; icons as decoration.
- Show one frame "now" (no photos) and one "with photos" (§6.4) side by side.

### 10.5 Icons (§5.3)
`lucide-react`, **stroke 1.5 at all sizes**, sizes **16** (inline), **20** (controls), **24** (contact), colour
`currentColor`, `mist-100` on dark; set shown: `phone`, `mail`, `map-pin`, `arrow-right`; touch area ≥ 44 × 44;
LinkedIn glyph stays the inline brand SVG. Functional only.

### 10.6 The 3 applications, redrawn without new photos (§6.6)
Hero (typographic, Sand 100 proof panel, no portrait), publication card (typographic cover), business card
(unchanged), plus the About block with the portrait at 417 × 556. Also the **OG image** (§6.5, 1200 × 630,
portrait 417 × 556 right, type left). Drawn on `Foundations v2` §6 (`design/foundations-v2.png`), which is the
reference. **`design/direction-a.png` is kept as the board Eva chose from and is superseded** where it shows a
portrait hero or an Unsplash card cover (lead decision, 2026-11-20).
Tell `ux` if a rule is unclear or needs a change.


## Appendix A — Directions B and C (**not retained**, kept for the record)
Eva chose A (§8). The three boards are in `design/` (`direction-a.png`, `direction-b.png`, `direction-c.png`,
`moodboard.png`, `type-specimens.png`). Nothing below applies to the site.

### A.1 Palettes B and C
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

### A.2 Directions B and C
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
J2) and does not wait for a shoot. This was a recommendation, not a decision; superseded by §8 (Eva chose A).
