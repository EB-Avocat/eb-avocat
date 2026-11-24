# Social share images (Open Graph / Twitter), 1200 × 630

Source: `EB-Avocat.figcraft` (Google Drive), page **`Social`**. Frames `og/default`,
`og/domaine-<slug>` (4), `og/article-short`, `og/article-long`; master component
`OG/Logo (logo-for-white-background, 128 w)` to the left of the frames. Inputs: `spec.md` « Social share
images », `ux-brief.md` Task 3, `brand.md` (Direction A, Aleo, palette, logo rules) and `copy.md` (#68).
Design system v2 is not on `main` yet, so the colour names below are the `brand.md` §3 names.

| File | Page(s) | Kicker | Title | Size |
|---|---|---|---|---|
| `default.png` | `/` and every page without its own image | — | `HERO.heading` | 78 KB |
| `domaine-creation-de-societe.png` | `/domaines/creation-de-societe` | « Création de sociétés » | « Créer la société qui correspond à votre exercice » | 70 KB |
| `domaine-cession-clientele-patientele.png` | `/domaines/cession-clientele-patientele` | « Clientèle ou patientèle » | « Céder ou reprendre une clientèle ou une patientèle » | 68 KB |
| `domaine-contrats-professionnels.png` | `/domaines/contrats-professionnels` | « Contrats professionnels » | « Poser par écrit les règles de votre exercice » | 69 KB |
| `domaine-ordre-et-deontologie.png` | `/domaines/ordre-et-deontologie` | « Ordre et déontologie » | « Face à votre Ordre : un conseil, et une défense si besoin » | 71 KB |
| `article-short.png` | article without a cover (37-character title, sample) | « Publications » | « SEL ou SCM : quelle société choisir ? » | 59 KB |
| `article-long.png` | article without a cover (90-character title, sample) | « Publications » | « Cession de patientèle : les points à vérifier avant de signer, et ce que l’Ordre examinera » | 87 KB |
| `_safe-area-guide.png` | reference only (default at 50 % with the safe area dashed); not an OG image | | | 38 KB |

All OG images are 1200 × 630 px and under 300 KB (checked with `sips` and `stat`). Kickers are the
`DOMAINES.items[slug].label` values and titles the `.h1` values from `copy.md`. A domaine image is only used
if that domaine page passed the launch gate (`hasPage`). Otherwise the hub section uses `default.png`.
Articles **with** a cover share the cover, not these images.

## Layout (identical on every template)

```
0          285 317                         883 915         1200
|  band     |  | logo 128 w (y 48)          |  |   band     |
| darker-   |  |                            |  | darker-    |
|  teal     |  | ── Ambre rule 64 × 3       |  |  teal      |
|           |  | KICKER (optional)          |  |            |
|           |  | Title, 48/54, ≤ 4 lines    |  |            |
|           |  | Signature 24/32            |  |            |
|           |  |      (bottom at y 582)     |  |            |
```

- **Safe area**: the centred 630 × 630 square (x 285–915) is the sheet. All text and the logo sit in it,
  in a 566 px column (x 317–883: safe area minus 32 px each side), with 48 px padding top and bottom. A square
  crop (WhatsApp, LinkedIn mobile, some Slack and iMessage previews) shows the whole sheet and cuts only
  the bands.
- Column: vertical auto layout, `space-between`. The logo is pinned to the top, and the text block (rule, kicker,
  title, signature, 24 px gap) to the bottom. A short title leaves the space above the rule, so the
  bottom line never moves.

## Fixed vs variable

| Part | Fixed / variable | Spec |
|---|---|---|
| Side bands | fixed | `darker-teal` `#162729`, 0–285 and 915–1200, full height |
| Sheet | fixed per template | `paper` `#F6F3EC` (default, domaine); **`sand-100` `#ECE8DE` for the article fallback** (brand §6.5: articles on Sand 100), so a publication reads differently from a page |
| Logo | fixed | `logo-for-white-background.svg` (brand §2.1: paper and sand), **128 px wide** (≥ 96 minimum), top-left of the column at (317, 48). Clear space 1/6 width = 21 px is kept. Never on the bands |
| Rule | fixed | `ambre` `#B07A22`, 64 × 3 |
| Kicker | **variable**, hidden on `default` | domaine label, or « Publications » for articles. Aleo **600**, 22/28, uppercase (CSS `text-transform`, source text in sentence case), letter-spacing +0.06em, `ambre-profond` `#7F5413`. One line |
| Title | **variable** | Aleo **400**, **48/54**, letter-spacing −0.01em, `near-black` `#191919`, left-aligned, max 4 lines (rule below) |
| Signature | fixed | « Eva Biezunski, avocate au Barreau de Lyon » (`SITE.title`), Aleo **600**, 24/32, `primary` `#3f5b57` |

Contrast (WCAG 2.x, computed): title 15.87:1 on paper / 14.37:1 on Sand 100; signature 6.66 / 6.03;
kicker 5.96 / 5.40. All text passes AA at any size, and the titles also pass AAA. Sheet against band: 13.97:1.

## Fonts

- **Aleo** (OFL, Google Fonts `ofl/aleo`), weights **400** (title) and **600** (kicker, signature). No
  italic, no 300.
- Static PNGs: nothing to ship, the text is in the pixels.
- `next/og` (satori) **cannot read WOFF2 or variable fonts**. Ship two static TTF instances for it (brand.md
  §6.5), cut from `Aleo[wght].ttf`:
  ```sh
  uvx --from fonttools fonttools varLib.instancer "Aleo[wght].ttf" wght=400 -o Aleo-Regular.ttf
  uvx --from fonttools fonttools varLib.instancer "Aleo[wght].ttf" wght=600 -o Aleo-SemiBold.ttf
  # optional: subset to Latin + French (see brand.md §1.6 for the glyph list)
  ```
  Put them under `frontend/src/app/publications/[slug]/` (or `frontend/assets/fonts/`) with `OFL.txt`, and
  read them with `readFile` in the route (Node runtime).

## Title wrapping and truncation (article fallback)

1. Break lines at spaces only (no hyphenation) in the 566 px column at 48/54.
2. Replace the space before `: ; ? ! »` and after `«` with a no-break space (U+00A0, or U+202F if Eva
   prefers the narrow one), so punctuation never starts a line. The sample titles use U+00A0.
3. **At most 4 lines** (216 px, what the layout reserves; about 85–95 characters depending on the
   letters). **The size never shrinks** below 48.
4. Longer titles: cut in code at the last whole word so the result, ellipsis included, is ≤ 85
   characters, then append « … » (U+2026) with no space (« … examinera… »). Also set satori's
   `lineClamp: 4` on the title as a guard for wide-letter titles; check its ellipsis in a test render.
5. The `og:image:alt` / `twitter:image:alt` is the **full** title (never the truncated one), for example
   « SEL ou SCM : quelle société choisir ? — Publications, Eva Biezunski, avocate au Barreau de Lyon ».
   Default: « Eva Biezunski, avocate au Barreau de Lyon. Structurer votre exercice libéral, en accord avec
   votre Ordre et vos associés. » Domaine: « [label] — [h1]. Eva Biezunski, avocate au Barreau de Lyon. »

Domaine h1 and default heading fit in 3–4 lines with no truncation. If `copy.md` changes them, re-export the
PNG from Figcraft and check the title still fits in 4 lines (the layer's `maxLines: 4` truncates silently).

## Recommendation for #79: static PNG vs `next/og`

| Template | Build as | Why |
|---|---|---|
| **default** | **Static PNG** `frontend/public/og/default.png` (1200 × 630, `type: image/png`, alt above), exported once from the #79 metadata helpers (for example `DEFAULT_SHARE_IMAGE`) and set in `app/layout.tsx` **and** in every page that defines its own `openGraph` / `twitter` (see the note below the table) | The copy is fixed and changes only with `copy.md`. The pixels are exactly what was designed: real logo SVG with its gradient, Aleo's kerning. It needs no font files, no runtime work and no satori quirks. 78 KB |
| **domaine** (4) | **Static PNG** `frontend/public/og/domaine-<slug>.png`, set in each domaine page's `metadata` `openGraph.images` **and** `twitter.images` (from the one domaine list, only when `hasPage`) | Same reasons. Four files that change only when Eva edits a label or h1, which already means a copy release. A test can assert that each `hasPage` domaine has a file |
| **article fallback** | **`next/og` `ImageResponse`** in a **route handler**, for example `app/publications/[slug]/og-image/route.tsx` (served at `/publications/<slug>/og-image`), **only referenced for articles without a cover**. `generateMetadata` sets both `openGraph.images` and `twitter.images` (with `twitter.card: "summary_large_image"`): the cover when there is one, else the route URL with `width: 1200`, `height: 630` and the full-title alt (rule 5). **Do not use the `opengraph-image.tsx` / `twitter-image.tsx` file convention here**: file-based metadata takes priority over `generateMetadata`, so it would replace the cover on every article that has one, and its `alt` export is static | Titles come from the back-office and are unbounded, so they cannot be pre-drawn. Satori renders this layout easily (flex column, 3 rects, 3 text blocks, one `<img>`). Pass the logo as a PNG data URL (128 w, or 256 w drawn at 128) rather than the SVG, because satori's SVG support skips some of the Inkscape gradient defs. Generated on demand and cached. Add `revalidate`, or tag it with the article, so a title edit updates the image; an unknown or unpublished slug returns 404 |

**Next.js replaces nested metadata objects, it does not merge them**: a page that sets `openGraph` (type,
url, title…) drops the layout's `openGraph.images`, and the same for `twitter`. So the one helper that
builds each page's `openGraph` / `twitter` adds the default image unless the page has its own, and a test
asserts every indexable route outputs `og:image` and `twitter:image`.

Do not draw default and domaine with `ImageResponse` "for consistency". One template is shared in spirit
only: if the article route ever drifts from the PNGs, the PNGs are the reference.

## Deviation from `brand.md` §6.5 (for `lead`)

`brand.md` §6.5 describes an OG image with the portrait in the right 45 %. These templates have **no
portrait**, as Task 3 asks ("no photo"), for three reasons:

1. The portrait would sit outside the 630 × 630 safe area, so square crops would cut it in half.
2. Placed inside the safe area, it would leave no room for a 48 px title.
3. Its navy background clashes with the teal bands.

If Eva wants her face in shares after a photo session, add a separate `default-portrait` variant, kept
outside the square-crop constraint. No other template changes.

Dropping the portrait and fitting everything in the square safe area also changes these §6.5 values:

| §6.5 | These templates | Why |
|---|---|---|
| Logo ≥ 160 px wide | **128 px** (above the 96 px minimum of §2.2, clear space kept) | Keeps the logo secondary to the title in the narrower sheet. **Lead to confirm**: 160 px also fits (logo plus 27 px clear space ends near y 209, above a 4-line text block starting at y 231) |
| Display 56/62, max 3 lines | **48/54, max 4 lines** (the §4 display size) | The column is 566 px, not 55 % of 1200: at 56 px the 78-character `HERO.heading` and long article titles need more than 3 lines |
| « biezunski-avocat.fr » in 600 24/32 `primary` | **« Eva Biezunski, avocate au Barreau de Lyon »** (`SITE.title`), same style | Spec « Social share images » asks for the name and Barreau line; the share card already shows the domain |
| Article: left column full width on Sand 100 | **Centred Sand 100 sheet between the bands** | Same square-crop rule as the other templates |
