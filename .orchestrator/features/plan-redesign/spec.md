# Plan redesign — spec

## Goal

Prepare a redesign of biezunski-avocat.fr. This feature does **not** design the new site.
It delivers three things:

1. **An audit** of the current design: what exists, how it is built, what works, what does not.
2. **A faithful copy of the current design in Figcraft**, in
   `~/Library/CloudStorage/GoogleDrive-…/My Drive/EB-Avocat.figcraft` (the file is empty today,
   with one page). This is the baseline the redesign will start from.
3. **A plan for the redesign as GitHub issues**: one epic plus child issues, ordered, each with
   a scope and acceptance criteria.

No production code changes. The only repo changes are docs and exported images under
`.orchestrator/features/plan-redesign/`.

## Current design (what the code tells us)

- Stack: Next.js 16 App Router, Tailwind 4, `lucide-react` icons, copy in `frontend/src/lib/constants.ts`.
- Typography: **Museo** (OTF in `frontend/public/fonts`, weights 300/500/700 used; 100/900 shipped but unused).
- Colours (`frontend/src/app/globals.css` `@theme`): primary `#3f5b57`, primary-light `#4a7a6f`,
  dark-teal `#264445`, darker-teal `#162729`, near-black `#191919`, plus Tailwind grays
  (gray-500/600/700, gray-100/200) and `red-600` for errors. Section tint = primary-light at 5%.
- Layout: centred `max-w-6xl` container, `px-6`, sections `py-20`, radius `rounded` (4px) on
  buttons and `rounded-lg` (8px) on cards, cards use `shadow-md` → `shadow-lg` on hover.
- Assets: logos in `frontend/public/images` (dark-green, light-green, white, black variants, SVG),
  `portrait.jpeg`, contact icons in `images/icons`, favicon.

### Screen inventory (scope of the Figcraft copy)

Public site — each at **desktop 1440** and **mobile 390**:

| Screen | Source | Notes |
|---|---|---|
| Home | `app/page.tsx` | Navbar (overlay: transparent over hero, then solid white/90 blur), Hero (gradient darker→dark teal, logo, h1, subtitle, CTA, scroll arrow), À propos (portrait + 4 paragraphs), Domaines d'intervention (6 service cards, 3/2/1 cols), Votre avis (primary band, outline button), Contact (coordinates + form, incl. "Autre" custom subject, success/error states), Publications teaser (3 cards + "Voir toutes"), Footer (3 cols + legal row) |
| Mobile menu open | `components/Navbar.tsx` | mobile only |
| Publications list | `app/publications/page.tsx` | intro, category filter (+ "Plus de catégories"), grid, pagination, empty state |
| Article | `app/publications/[slug]/page.tsx`, `components/publications/ArticleView.tsx` | cover, categories, author, prose body with figures |
| Legal pages | `app/mentions-legales`, `app/politique-de-confidentialite` | one template frame each, solid navbar |
| Carte (QR card) | `app/carte/page.tsx` | mobile first; desktop optional |
| 404 / error | `app/not-found.tsx`, `app/error.tsx` | |

Back-office — **desktop 1440 only**, mobile 390 for the shell only:
connexion, mot de passe (request + nouveau), articles list, article editor (rich editor, slash menu,
image dialog/cropper, category picker), catégories, utilisateurs, profil.
Source: `app/backoffice/**`, `components/backoffice/**`.

## Deliverables

### D1 — Audit (`audit.md`, owner `ux`)
- Screen inventory and user journeys (prospect → contact, prospect → publication → contact,
  returning client → review, QR card, Eva in the back-office).
- Design tokens actually used (colours, type scale, spacing, radii, shadows, motion), with
  inconsistencies (e.g. hard-coded Tailwind grays vs brand tokens, unused font weights).
- UX / content / accessibility / SEO findings, each with severity (high/medium/low), evidence
  (file:line or screen) and a recommendation direction — not a new design.
- What to keep (brand equity: logo, teal palette, Museo, tone) vs what to question.

### D2 — Figcraft baseline (owner `ui`)
Figcraft file organised in pages:
1. `Cover` — title, date, legend.
2. `Foundations` — colour styles, text styles (Museo), spacing/radius/shadow references, logos, icons.
3. `Components` — components with variants: Button (primary / outline / disabled), Navbar
   (overlay-top / solid / mobile closed / mobile open), SectionHeading (dark / light), ServiceCard,
   PublicationCard (with and without cover), CategoryChip / filter, Pagination, form fields
   (default / focus / error), Footer, back-office sidebar item, back-office controls.
4. `Site — Desktop`, `Site — Mobile` — one frame per screen above, built from the components,
   with the real French copy from `constants.ts`. Publications use clearly sample articles.
5. `Back-office`.

Fidelity bar: same layout, sizes, colours, copy and states as the running code. Where Figcraft
cannot reproduce something (blur, animations), note it on the frame.
PNG exports of every screen frame go to `.orchestrator/features/plan-redesign/design/current/`
(`<page>-<viewport>.png`), committed on the task branch.

### D3 — Redesign plan as GitHub issues (owner `ux`, published by `lead`)
- Drafts in `.orchestrator/features/plan-redesign/issues/NN-slug.md` (title, labels, body:
  context, scope, acceptance criteria, dependencies, links to audit findings and design PNGs).
- Expected shape (ux may refine from the audit): epic "Site redesign"; then
  1. objectives & audience (positioning, KPIs: contact requests, publication reads),
  2. content & information architecture (nav, home order, standalone pages per domaine?),
  3. brand direction & moodboard (keep/evolve logo, palette, Museo licence for web),
  4. design system v2 (tokens, components) in Figcraft,
  5. page designs: home, publications + article, contact, legal/404/carte,
  6. back-office polish,
  7. accessibility (RGAA/WCAG 2.2 AA) and performance budgets,
  8. SEO preservation (URLs, metadata, JSON-LD, redirects),
  9. implementation in code (tokens → components → pages), with QA and rollout.
- Issues are written in English, like the code and commit history (site copy quoted in French).

## Tasks

| # | Node | Task | Depends on |
|---|---|---|---|
| 1 | ux | Audit (D1) | — |
| 2 | ui | Figcraft baseline (D2) | — (runs in parallel; reads the code) |
| 3 | ux | Redesign plan issue drafts (D3) | 1, 2 |
| — | lead | Review, merge, publish the issues, PR with the docs | 3 |

## Constraints and risks

- **Creating GitHub issues**: the orchestrator tools can read and update existing issues but not
  create new ones, and GitHub is not reachable from the sandbox. Plan: the drafts ship with a
  `create-issues.sh` (`gh issue create …`, epic first, then children linked to it) for the user to
  run with `! bash .orchestrator/features/plan-redesign/issues/create-issues.sh`. If the user prefers,
  I can instead ask for a tool or sandbox access.
- The Figcraft file lives in Google Drive outside the repo. Only `ui` writes it. Save often.
- Museo must be available to Figcraft for the text styles; if not, use the OTFs from
  `frontend/public/fonts`, or note the fallback on the Foundations page.
- No running site needed: the code is the source of truth. If a node needs the live site or a
  local dev server, it asks lead.
