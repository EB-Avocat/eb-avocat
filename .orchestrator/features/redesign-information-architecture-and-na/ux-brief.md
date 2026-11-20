# UX brief — Information architecture and navigation

Read `spec.md` first, then **#66's decisions** in
`.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md` (audiences and
journeys ranked, positioning, primary conversion and CTA, KPI events, hand-offs to #67). It is on
`main` (PR #89) but not yet on this branch: read it with
`git show 89eb4f3:.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`.
Its decisions are settled; every IA decision that rests on one cites its section.
Then the audit:
`.orchestrator/features/plan-redesign/audit.md` (A-02, A-03, A-06, A-09, A-18, A-31, A-32, §1 site
map, §2 journeys) and the baseline PNGs in `.orchestrator/features/plan-redesign/design/current/`
(`home-desktop.png`, `home-mobile.png`, `menu-open-mobile.png`, `article-desktop.png`).

## Your job (ux)

Turn the lead's proposal in `spec.md` into decisions. For every item, write the decision and one
or two lines of reason grounded in the audience, the journeys or the audit. Changing the proposal
is fine; say why. Do not draw: `ui` draws the wireframes from your `ia.md`.

Sources of truth in the code: `frontend/src/lib/constants.ts` (`NAV_LINKS`, `SERVICES`,
`CONTACT.subjectOptions`), `components/Navbar.tsx`, `components/Footer.tsx`, `app/page.tsx`,
`app/sitemap.ts`, `app/robots.ts`, `app/carte/page.tsx`, `app/not-found.tsx`,
`app/publications/page.tsx` (query parameters).

## Questions to settle

1. **Domaines**: for each of the 6 (`SERVICES.items`), own page or section. Criteria: distinct
   search intent, distinct audience, enough content to avoid a thin page, priority for the firm.
   Note which domaines Eva must confirm.
2. **Professions**: pages per profession or not, now or later; how professions appear instead.
3. **À propos, Contact**: page or section; what stays on the home page.
4. **Navigation**: items (max 4 + CTA), labels short enough for tablet widths, the CTA target and
   position, phone on desktop and mobile, email placement, menu content order on mobile, what is
   reachable without opening the menu, active-state rules, sticky header or not, Domaines as a
   link, a disclosure menu or both (keyboard and touch behaviour in one line each).
5. **Review ask**: where it goes (footer, end of article, `/carte`), and whether a printable
   `/avis` short URL is worth it.
6. **Home**: section order, the job of each section in one line, the role of publications
   (credibility vs conversion) and where the teaser sits; whether the full form stays on home.
7. **Footer**: columns, links, what is not repeated from the header.
8. **Wayfinding**: breadcrumbs (where, what levels), internal links between domaines and
   publications (via categories?), the exits at the end of an article (A-09), the 404 links.
9. **URLs**: final slugs; per old URL (pages, query parameters, hash anchors, `/carte`,
   technical routes) what happens. Hash anchors cannot be redirected by HTTP: decide per anchor
   whether the id stays on the new home or a small client-side redirect is needed, and say which
   old anchors are likely in use (QR card, 404, emails, LinkedIn). Decide how the contact CTA's
   `origin` (#66 §6) reaches the form without creating indexable URLs.
10. **≤ 2 actions**: walk every page type (home, domaine, article, publications list, À propos,
   legal, 404, `/carte`) and show a contact request is reachable in two actions (#66 §1).

## Output

- `ia.md` and `url-table.md` in the feature folder, structure as listed in `spec.md`
  "Deliverables". Mermaid for the site map diagram.
- A section "From #66" that lists each decision resting on `objectives.md` (with the section it
  cites) and the final `location` enum (values added or removed); a section "Open
  questions for Eva" (content availability per domaine, Formations, Mécénat).
- Name the header, footer and article slots consistently: they become the `location` values of
  #66's single `link_click {kind, location}` event (§6).
- Hand off to `ui` (mcp__orch__handoff) once the site map, header/menu, footer and home order are
  decided, even if the URL table is still being finished. Tell ui which file and sections to draw.

## Out of scope

Visual design, final copy, implementation, the domaine page template (#72), the contact form
states (#74), metadata and JSON-LD details (#78: you only mark indexable / sitemap / canonical).

---

## UI brief (ui)

After ux's handoff, draw **low-fidelity wireframes** of what `ia.md` decides: greyscale boxes,
working labels from `ia.md`, system font is fine, no colours, no imagery, no visual design. They
illustrate structure for #71, #72 and #80, not looks.

- Figcraft file: `EB-Avocat.figcraft` in Google Drive (the baseline from the plan-redesign
  feature, path under `~/Library/CloudStorage/GoogleDrive-*/My Drive/`). Add one page
  `IA — Wireframes`; do not touch the other pages. If the sandbox blocks the path, ask for access
  with mcp__orch__request_sandbox_access and wait.
- Frames and exports (PNG, to `.orchestrator/features/redesign-information-architecture-and-na/design/`):
  `sitemap` (diagram), `header-desktop` (1440), `header-mobile` (390), `menu-open-mobile` (390,
  Domaines expanded), `footer-desktop`, `footer-mobile`, `home-structure-desktop`,
  `home-structure-mobile` (section stack, each box labelled with its job), optional `journeys`
  (J1 and J2 as paths). Show the active state on one nav item and the CTA + phone positions.
- If Figcraft is unavailable, draw the same frames as SVG, export PNG, and say so in your report.
- Check each export against `ia.md`; ask ux (send_message) when `ia.md` is ambiguous instead of
  inventing structure.
