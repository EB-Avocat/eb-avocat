# Redesign: information architecture and navigation — spec

Issue: [#67](https://github.com/EB-Avocat/eb-avocat/issues/67), part of epic #65.
**Blocked by #66** (objectives, audience, KPIs, feature `redesign-objectives-audience-and-kpis`).
No task of this feature starts before #66's `objectives.md` is approved and merged: see
"Blocked by #66" below.

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
`hooks/useScrollSpy.ts`. No redirects exist in `next.config.ts` or `vercel.json`.

## Lead's starting proposal (ux validates, changes with a reason, or rejects)

This is a hypothesis, written before #66 exists. The lead revises it against #66's
`objectives.md` before creating tasks; `ux` then stress-tests it against the audiences, the ranked
journeys and the audit and records the final decision with its reason. #66's spec already points
the same way (prospects first, J1 and J2 priority 1, a contact request rather than a booking,
phone beside the CTA, review ask out of the main nav).

### Site map

| Page | Proposed URL | Why |
|---|---|---|
| Accueil | `/` | unchanged |
| Domaines d'intervention (hub) | `/domaines` | lists every domaine, links to each page; breadcrumb parent |
| Création de sociétés (SEL, SCM, SCI, SPFPL, SARL/SAS) | `/domaines/creation-de-societe` | core offer, strong search intent ("créer une SEL Lyon") |
| Clientèle / patientèle (cession, prêt, apport) | `/domaines/cession-clientele-patientele` | high-intent searches ("cession de patientèle") |
| Contrats professionnels | `/domaines/contrats-professionnels` | collaboration / remplacement / exercice contracts are searched |
| Contentieux ordinal | `/domaines/contentieux-ordinal` | distinct need and searches ("avocat conseil de l'ordre") |
| Mécénat (associations, fonds de dotation) | section of `/domaines` | secondary offer; own page only if Eva can supply enough content (avoid a thin page) |
| Formations | section of `/a-propos` (or `/domaines`) | different buyer (organisations); low volume |
| À propos | `/a-propos` | credentials and proof (A-04), author page that articles link to |
| Contact | `/contact` | one target for every CTA from any page, one trackable conversion URL |
| Publications | `/publications`, `/publications/[slug]` | unchanged: these URLs rank today |
| Legal | `/mentions-legales`, `/politique-de-confidentialite` | unchanged |
| QR card | `/carte`, `/carte/vcard` | unchanged: the QR code is printed |

Per-profession pages (médecins, dentistes, pharmaciens, kinés, vétérinaires, avocats…): **not at
launch**. Professions appear as "pour qui" blocks on domaine pages; revisit with the KPIs once
the domaine pages have traffic. ux confirms or overturns this.

### Navigation

- **Desktop header**: logo (→ `/`, replaces "Accueil") · Domaines (→ `/domaines`, with the 4-5
  domaine pages as a disclosure menu) · À propos · Publications · phone number as a link · one
  primary CTA button (→ `/contact`, action from #66 §4, wording from #68).
- **Mobile header**: logo · call button (`tel:`, visible without opening the menu) · menu button.
  Menu: the same items + the CTA + email; Domaines expands in place.
- **"Votre avis" leaves the main nav**: footer link, end of articles (after the author block),
  `/carte`. Optional `/avis` short URL (302 to the Google review link) that can be printed.
- **One nav model on every page**: same header everywhere (no overlay / scroll-spy variant),
  route-aware active state (`aria-current="page"`; `/domaines/*` marks Domaines, `/publications/*`
  marks Publications). Sticky or not: ux decides with the mobile cost in mind.
- **Breadcrumbs** on domaine pages and articles (also feeds `BreadcrumbList` in #78).

### Home section order

Hero (promise, audience, CTA + phone) → Domaines (core first, each linking to its page) → Proof /
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
are unknown here: the table flags that #78 must pull them from Search Console.

## Deliverables

All under `.orchestrator/features/redesign-information-architecture-and-na/`:

1. **`ia.md`** (owner `ux`):
   - site map with a Mermaid diagram (renders on GitHub);
   - **decision per domaine** (own page or section) and per profession, each with its reason;
   - À propos and Contact: page or section, with the reason;
   - navigation items, CTA (target, placeholder label), phone/email placement, mobile behaviour
     (header, menu content and order, what is visible without opening the menu), active-state
     rules, sticky or not, breadcrumbs;
   - placement of the review ask;
   - home section order with the job of each section, and the role of publications;
   - footer structure;
   - internal linking rules (home → domaines, domaine ↔ publications via categories, article →
     domaine / contact / author, 404 → hub and contact);
   - how the IA maps to the journeys J1-J5 (each journey in the new structure, step by step);
   - "Depends on #66": each decision that rests on `objectives.md`, with the section it cites;
   - open questions for Eva, and follow-ups for later issues.
2. **`url-table.md`** (owner `ux`): one row per URL, columns *new URL · old URL · redirect
   (none / 301 / 302 / client-side) · indexable · in sitemap · canonical · notes*. Covers pages,
   query parameters (`?category=`, `?page=`), hash anchors, `/carte`, `/avis` if adopted, and
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
| 0 | lead | Sync with `main` once #66 is merged; revise the proposal against `objectives.md`; create tasks 1-2 | #66 merged |
| 1 | ux | `ia.md` and `url-table.md`: validate or revise the lead's proposal against `objectives.md`, record every decision with its reason | 0 |
| 2 | ui | Low-fi wireframes from `ia.md` in Figcraft + PNG exports to `design/` | 1 |
| — | lead | Review, merge, tick the #67 acceptance criteria, comment on #78 with the URL table link, PR | 2 |

ux may hand a draft site map to ui early (handoff) so the wireframes start before the URL table is
final; ui only draws what `ia.md` decides.

## Blocked by #66

#66 decides the inputs this IA is built on. Its deliverable is
`.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`; today only its spec
exists. This feature consumes, from that file:

| #66 section | What the IA takes from it | Where it lands here |
|---|---|---|
| 1. Audiences and priorities | which audience the header, home order and footer serve first; what clients, QR contacts and Eva need without costing prospects | nav items, home order, footer columns |
| 2. Journeys J1-J5 ranked | the journeys the IA must make shortest (J1 home → contact, J2 publication → contact) | journey walkthrough in `ia.md`, article exits, review-ask placement (J3) |
| 3. Positioning | the promise and the differentiators the home order must put first; which domaines are core | home order, core vs secondary domaines, own page vs section |
| 4. Primary conversion and CTA (A-05) | the CTA's real action and its target, the channels (form, phone, email) and their weight | CTA target and position, `/contact` page or section, phone/email in the header |
| 5. KPIs | events that need a distinct, trackable page or location (`contact_submit {origin_path}`, `tel_click {location}`, `review_click {location}`, `vcard_save`) | URL choices (one contact URL), `location` values = named header/footer/article slots |
| 7. Hand-offs | anything #66 explicitly asks #67 to decide | checked one by one in `ia.md` |

**Sequencing**

1. This spec is approved now as the plan; the lead's proposal below is a hypothesis, not a
   decision.
2. When #66 is merged (or its `objectives.md` is approved on its integration branch), the lead
   syncs this integration branch with `main` so `objectives.md` is in the worktree, revises the
   lead's proposal where #66 contradicts it (commit + short note to the user if anything material
   changes, e.g. a booking path instead of a contact request), and only then creates the tasks.
3. `ux` cites the #66 section behind each IA decision that depends on it. Anything #66 leaves
   open (e.g. Eva's approval still pending) is listed in `ia.md` under "Depends on #66" with the
   default the IA uses.

If #66 ends with a real booking path rather than a contact request, the `/contact` row, the CTA
target and the home contact block change; everything else stands.

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
