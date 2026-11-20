# Redesign: information architecture and navigation — spec

Issue: [#67](https://github.com/EB-Avocat/eb-avocat/issues/67), part of epic #65.
Built on **#66** (objectives, audience, KPIs), now closed: its decisions are in
`.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`, merged to `main`
through PR #89 (decided 2026-11-20). See "Inputs from #66" below.

**State of `main`.** This integration branch was cut at `aa79811` (PR #64, plan-redesign), before
PR #89 merged. The sandbox cannot fetch `origin`, and the orchestrator brings `main` in only at
integration time, so this spec was checked against #66's final pushed head
`origin/orch/redesign-objectives-audience-and-kpis/integration` = `89eb4f3`, the head of PR #89.
Until the branch is synced, nodes read the file with
`git show 89eb4f3:.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`.
No other redesign feature had been pushed: #69 (brand direction) has no commit yet.
The orchestrator merges `main` into this branch at integration time (rebase before the PR).

## Goal

Decide the structure of the new site before any visual work: which pages exist and at which URL,
how a visitor moves between them, what the header, mobile menu and footer contain, and in which
order the home page tells the story. The output feeds the page designs (#71 home, #72 domaine
template, #73 publications, #74 contact), the SEO issue (#78, redirect map) and the
implementation (#80).

This feature produces **docs and low-fidelity wireframes only**. No production code, no visual
design (colours, type, imagery), no final copy. Labels quoted in French are working labels; the
copy issue (#68) owns the final wording.

## Problems it resolves (audit)

- **A-02** navigation built around the page, not the visitor; "Votre avis" (a client task) holds a
  prospect slot; "Accueil" is redundant; no primary action in the bar.
- **A-03** no page per domaine: only `/` and `/publications/*` can rank.
- **A-06** phone and email buried; mobile burger has nothing actionable.
- **A-18** two navbar variants (overlay + scroll-spy / solid), anchors reached by full reload from
  other pages, no active state on `/publications`.
- **A-32** the publications teaser comes after Contact, so articles never lead to the form.
- Also touched: A-09 (articles are dead ends: the IA defines the exits), A-31 (footer headings),
  A-21 (default canonical claims `/`: every new route needs its own, noted for #78).

## Current site (from the code)

`/` (Hero → À propos → Domaines → Votre avis → Contact → Publications → Footer, anchors
`#accueil`, `#a-propos`, `#domaines-intervention`, `#avis`, `#contact`), `/publications`
(`?category=`, `?page=`), `/publications/[slug]`, `/mentions-legales`,
`/politique-de-confidentialite`, `/carte` (noindex, printed QR code, mobile UA only),
`/carte/vcard`, `/backoffice/*`, plus `sitemap.xml`, `robots.txt`, `manifest.webmanifest`,
`/media/*`, `/api/v1/*`, `/mcp`. Nav model: `NAV_LINKS` + `PUBLICATIONS_LINK` in
`frontend/src/lib/constants.ts`, `components/Navbar.tsx`, `components/Footer.tsx`,
`hooks/useScrollSpy.ts`. Existing redirects: `vercel.json` sends `cdn.biezunski-avocat.fr/<anything
but media/>` to the main host (301), and `/carte` answers non-mobile User-Agents with a 307 to `/`
(`redirect()` in `app/carte/page.tsx`); `next.config.ts` has none.

## Inputs from #66 (decided, not reopened here)

| #66 decision (`objectives.md`) | Consequence for the IA |
|---|---|
| §1 Audiences: prospects → clients → QR contacts → Eva. Prospects drive every trade-off; the others get their paths without taking room from prospects | Nav items and home order serve prospects only; client and QR tasks live in the footer, the article end and `/carte` |
| §1 Success for a prospect: a contact request sent in **≤ 2 actions from any page** | Hard rule for the nav: CTA and phone in the header of every page; ux checks it on every page type |
| §1 Professions: "patientèle" wording = health; other professions to confirm with Eva | No per-profession pages at launch (not enough known to fill them) |
| §2 J1 home → contact and J2 publication → contact are priority 1; J4 `/carte` 2; J3 review 3; J5 back-office 4 | J1 and J2 get the shortest paths; the article end is a first-class exit (A-09) |
| §3 Positioning A (approved by Eva): structure (société, statuts), contrats, opérations sur la clientèle ou patientèle, anticipating associate friction, relations with the Ordre, déontologie, Conseils de l'Ordre | Core domaines = the four the positioning names; Mécénat and Formations are absent from it, so they are secondary |
| §4 Primary conversion = contact request by form, phone or email; **no booking**; CTA in the "Contacter le cabinet" family (words: #68) leading to the form "on the page or `/contact`, per #67"; phone beside it, `tel:` on mobile; every article ends with a contact CTA | The IA decides where the form lives and the CTA target; no booking page |
| §6 One tracking mechanism: `data-track` + `data-location`; `location` enum = header, hero, article, contact_section, contact_page, home_review, footer, carte, legal, not_found; **#67 may add values**; every contact CTA passes its `origin` path to `/api/contact` | `ia.md` names every slot that holds a tracked link and gives the final `location` list (e.g. adds `domaine`, `menu`, drops `home_review` if the band leaves home). How `origin` reaches the form is an IA/URL question (see below) |
| §7 Hand-off to #67: audience ranking, J1/J2, one contact action in the header on every page, phone on mobile, review ask out of the main nav, whether `/contact` exists | All answered in `ia.md`, one line each |

## Lead's proposal (ux validates, changes with a reason, or rejects)

Revised against #66. `ux` stress-tests it against the audiences, the ranked journeys and the audit,
and records each final decision with its reason and the #66 section it rests on.

### Site map

| Page | Proposed URL | Why |
|---|---|---|
| Accueil | `/` | unchanged |
| Domaines d'intervention (hub) | `/domaines` | lists every domaine, links to each page; breadcrumb parent |
| Création de sociétés (SEL, SCM, SCI, SPFPL, SARL/SAS) | `/domaines/creation-de-societe` | core offer, strong search intent ("créer une SEL Lyon") |
| Clientèle / patientèle (cession, prêt, apport) | `/domaines/cession-clientele-patientele` | high-intent searches ("cession de patientèle") |
| Contrats professionnels | `/domaines/contrats-professionnels` | collaboration / remplacement / exercice contracts are searched |
| Ordre professionnel: relations, déontologie, contentieux ordinal | `/domaines/ordre-et-deontologie` (ux may prefer `contentieux-ordinal`) | positioning A frames it as one accompaniment (relations with the Ordre, déontologie, Conseils de l'Ordre), wider than litigation; searches "contentieux ordinal", "avocat conseil de l'ordre" |
| Mécénat (associations, fonds de dotation) | section of `/domaines` | secondary (absent from the approved positioning); own page only if Eva can supply enough content (avoid a thin page) |
| Formations | section of `/a-propos` (or `/domaines`) | different buyer (organisations), absent from the positioning; also proof of expertise (trainings given are on #66's proof list) |
| À propos | `/a-propos` | credentials and proof (A-04), author page that articles link to |
| Contact | `/contact` | one target for every CTA from any page (#66 §4 leaves form placement to #67); `contact_page` already exists in the `location` enum; the CTA's `origin` travels with the click (mechanism: ux, see Old URLs) |
| Publications | `/publications`, `/publications/[slug]` | unchanged: these URLs rank today |
| Legal | `/mentions-legales`, `/politique-de-confidentialite` | unchanged |
| QR card | `/carte`, `/carte/vcard` | unchanged: the QR code is printed |

Per-profession pages (médecins, dentistes, pharmaciens, kinés, vétérinaires, avocats…): **not at
launch**. #66 records that only health is confirmed by the copy and the other professions are to
be confirmed by Eva. Professions appear as "pour qui" blocks on domaine pages; revisit with K9
(domaine queries in Search Console) once the domaine pages have traffic.

### Navigation

- **Desktop header**: logo (→ `/`, replaces "Accueil") · Domaines (→ `/domaines`, with the 4-5
  domaine pages as a disclosure menu) · À propos · Publications · phone number as a link · one
  primary CTA button (→ `/contact`, contact request per #66 §4, "Contacter le cabinet" family,
  final words from #68).
- **Mobile header**: logo · call button (`tel:`, visible without opening the menu) · menu button.
  Menu: the same items + the CTA + email; Domaines expands in place. With the header CTA or
  call button, every page meets #66's "≤ 2 actions to a contact request".
- **"Votre avis" leaves the main nav**: footer link, end of articles (after the author block),
  `/carte` (#66 §2, J3 rank 3). The home "Votre avis" band goes, so the `home_review` location
goes with it. Optional `/avis` short URL (302 to the Google review link) that can be printed.
- **One nav model on every page**: same header everywhere (no overlay / scroll-spy variant),
  route-aware active state (`aria-current="page"`; `/domaines/*` marks Domaines, `/publications/*`
  marks Publications). Sticky or not: ux decides with the mobile cost in mind.
- **Breadcrumbs** on domaine pages and articles (also feeds `BreadcrumbList` in #78).

### Home section order

Hero (positioning A promise and audience, CTA + phone, above the fold on mobile per #66 §7)
→ Domaines (core first, each linking to its page) → Proof /
À propos teaser (credentials, testimonials when available) → How it works / first meeting →
Publications teaser (role: **credibility**, placed before the contact block) → Contact block
(CTA, phone, email; whether the full form stays on home or only on `/contact` is a ux decision)
→ Footer.

### Footer

Identity (name, "Avocate au Barreau de Lyon", address, phone, email) · Domaines (one link per
page) · Le cabinet (À propos, Publications, Contact) · Clients ("Laisser un avis", LinkedIn) ·
legal row. Column titles are not `h2` landmarks competing with page headings (A-31).

### Old URLs

Every current URL above stays valid; nothing needs a 301 unless ux changes a slug. Hash anchors
(`/#contact`, `/#a-propos`, `/#domaines-intervention`, `/#avis`, `/#accueil`) never reach the
server, so they cannot be redirected by HTTP: the table records, per anchor, whether the id is
kept on the new home or handled client-side. URLs that existed before this codebase (older site)
are unknown here, and there is no Search Console property yet (#66 K9, to be created): the table
flags that #78 must pull them once it exists.

The CTA's `origin` (#66 §6) must not create new indexable URLs: if it travels as a query
parameter (`/contact?origin=/publications/x`), the table marks `/contact?origin=*` noindex with a
canonical to `/contact`; a `sessionStorage` or referrer approach avoids the parameter. ux picks one
with the reason; #80/#83 implement it.

## Deliverables

All under `.orchestrator/features/redesign-information-architecture-and-na/`:

1. **`ia.md`** (owner `ux`):
   - site map with a Mermaid diagram (renders on GitHub);
   - **decision per domaine** (own page or section) and per profession, each with its reason;
   - À propos and Contact: page or section, with the reason;
   - navigation items, CTA (target and position; label family from #66 §4), phone/email placement, mobile behaviour
     (header, menu content and order, what is visible without opening the menu), active-state
     rules, sticky or not, breadcrumbs;
   - placement of the review ask;
   - home section order with the job of each section, and the role of publications;
   - footer structure;
   - internal linking rules (home → domaines, domaine ↔ publications via categories, article →
     domaine / contact / author, 404 → hub and contact);
   - how the IA maps to the journeys J1-J5 (each journey in the new structure, step by step);
   - "From #66": each decision that rests on `objectives.md`, with the section it cites, and the
     final `location` enum (§6) with the values this IA adds or removes;
   - open questions for Eva, and follow-ups for later issues.
2. **`url-table.md`** (owner `ux`): one row per URL, columns *new URL · old URL · redirect
   (none / 301 / 302 / client-side) · indexable · in sitemap · canonical · notes*. Covers pages,
   query parameters (`?category=`, `?page=`, the CTA `origin` if it is one), hash anchors, `/carte`, `/avis` if adopted, and
   technical routes (excluded from the sitemap). This is the input of #78.
3. **Low-fidelity wireframes** (owner `ui`), greyscale boxes and working labels only, in a new page
   `IA — Wireframes` of the Figcraft file `EB-Avocat.figcraft`, exported as PNG to
   `design/` (`<name>-<viewport>.png`):
   - `sitemap.png`: the site map diagram;
   - `header-desktop.png`, `header-mobile.png`, `menu-open-mobile.png` (with Domaines expanded),
     active state shown on one item;
   - `footer-desktop.png`, `footer-mobile.png`;
   - `home-structure-desktop.png`, `home-structure-mobile.png`: the section stack with each
     section's job, no visual design;
   - `journeys.png` (optional): J1 and J2 drawn as paths through the new pages.

## Tasks

| # | Node | Task | Depends on |
|---|---|---|---|
| 1 | ux | `ia.md` and `url-table.md`: validate or revise the lead's proposal against `objectives.md`, record every decision with its reason | — |
| 2 | ui | Low-fi wireframes from `ia.md` in Figcraft + PNG exports to `design/` | 1 |
| — | lead | Review, merge, tick the #67 acceptance criteria, comment on #78 with the URL table link, PR | 2 |

ux may hand a draft site map to ui early (handoff) so the wireframes start before the URL table is
final; ui only draws what `ia.md` decides.

## Acceptance (maps to #67)

- [ ] Site map and URL table committed under the feature docs (`ia.md`, `url-table.md`, `design/sitemap.png`).
- [ ] Decision recorded for each domaine: own page or section, with the reason.
- [ ] Navigation items and CTA decided, with mobile behaviour (`ia.md` + header/menu wireframes).
- [ ] Home section order decided (`ia.md` + home structure wireframes).
- [ ] Old URLs mapped in `url-table.md` (feeds #78).

## Constraints and risks

- **SEO**: no URL that ranks today may change without a 301 (epic #65). Publications, legal pages
  and `/carte` keep their URLs. Slugs are French, lowercase, hyphenated, no accents, no trailing
  slash (current convention).
- **Thin pages**: a domaine page with three sentences hurts more than it helps; a domaine gets its
  own page only if the content issue (#68) can fill it (for whom, what, how, situations, FAQ).
- **Printed QR code**: `/carte` must keep working exactly as today.
- **Figcraft**: the file lives in Google Drive outside the repo; only `ui` writes it. If the
  sandbox blocks it, ui asks for access; if Figcraft is unavailable, ui falls back to SVG/PNG
  diagrams committed under `design/` and says so.
- Everything is written in English (site labels quoted in French), like the rest of the docs.
