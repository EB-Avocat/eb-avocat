# Redesign: objectives, audience and KPIs — spec

Issue: #66 (part of epic #65). Audit: `.orchestrator/features/plan-redesign/audit.md` (A-01, A-05, §2 Journeys).

## Goal

Write down what success means for the redesign, before any design work starts, so that the
downstream issues (#67 IA, #68 copy, #71 home, #74 contact, #80 event tracking, #86 QA/KPI
report) all work toward the same conversion and the launch can be judged against a baseline.

This feature ships **documents only**. No production code, no visual design, no page copy, no
tracking code (tracking is implemented in #80, the KPI report is #86).

## Deliverable

One file, `.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md`
(English, French where it is site copy), with these sections. Each one maps to an acceptance
criterion of #66.

1. **Audiences and priorities** — the four audiences of the brief, ranked, each with: who they
   are, what they come for, entry points, what "success" is for them.
   Proposed order: (1) prospects — liberal professionals (santé, droit, chiffre…) and
   entrepreneurs around Lyon; (2) existing clients; (3) networking contacts (QR card);
   (4) Eva as author. Prospects drive every design trade-off; the others must not cost them
   anything.
2. **Journeys J1–J5 ranked** — ranking with the reason and the KPI each journey moves.
   Proposed: J1 home → contact and J2 publication → contact are both priority 1 (J2 is the main
   search entry, A-09); J4 QR card is 2; J3 review is 3 (moves out of the main nav, A-02);
   J5 back-office is 4 (not a conversion journey, handled in #76).
3. **Positioning paragraph** (French, one paragraph, ≤ 80 words) — promise, audience, proof,
   difference (knowledge of the Ordres, déontologie, anticipating associate conflicts, Lyon),
   built only from facts already in `constants.ts` / À propos, plus a one-line hero promise
   candidate for #68. Marked **draft until Eva approves**. Up to 2 variants if a choice of angle
   is useful. No invented proof (figures, client names) — what Eva must supply is listed instead.
4. **Primary conversion and CTA (A-05)** — decision and rationale.
   Recommendation: the primary conversion is a **contact request** through any of three channels
   (form, phone, email), all counted. The CTA stops promising an appointment: label in the
   family of "Contacter le cabinet" / "Prendre contact" (exact wording is #68's job), leading to
   the form, with the phone number visible beside it (tap-to-call on mobile). Online booking is
   out of epic scope (#65 excludes new business features) and is recorded as a follow-up with
   the conditions that would justify it (e.g. share of requests that are "first meeting").
   Secondary conversions: vCard save (`/carte`), review left (not measurable: proxy = click on
   the review link), publication read.
5. **KPIs** — table: name, definition (exact counting rule), source, baseline (a value, a way to
   get it now, or "unknown, measure from launch"), target direction, owner issue. At least:
   - contact requests / month (form submissions accepted by `/api/contact`; plus calls and emails
     Eva reports),
   - phone and email clicks (`tel:` / `mailto:` clicks, by page),
   - publication reads (article page views; "engaged read" if the tool allows it),
   - reads that lead to a contact (contact submissions whose originating page is an article,
     and article → contact-CTA clicks),
   - `/carte` vCard saves (hits on `/carte/vcard`) and `/carte` visits,
   - Core Web Vitals (LCP, INP, CLS at p75, field data) — budgets themselves are #77,
   - search: impressions, clicks, average position on brand and domaine queries (Search
     Console), since protecting SEO is an epic goal.
   Baselines that exist today and must be collected before launch: contact emails in Eva's inbox
   (form emails come from Brevo with a fixed subject), Google Business Profile insights (calls,
   site clicks), Search Console history if the property exists, a Lighthouse/CrUX snapshot.
   Everything else is "unknown, measure from launch". (A 4-week measurement window on the current
   site before launch was proposed, then dropped on 2026-11-20: tracking ships with the redesign in
   #80, see `objectives.md` §5 and §8.)
6. **Measurement approach** — tools, event plan, privacy.
   Recommendation (reuse existing vendors, no cookie banner):
   - **Vercel Web Analytics** (the site already runs on Vercel) for page views and custom events:
     no cookies, no cross-site identifier, so exempt from consent under the CNIL audience
     measurement guidance if configured as first-party measurement only; **Vercel Speed
     Insights** for Core Web Vitals field data.
   - **Server-side count** of accepted contact submissions (the API route already knows), so the
     primary KPI does not depend on client-side analytics or ad blockers; Brevo tag on the
     contact email as a cross-check.
   - **Search Console** and **Google Business Profile** insights: no code on the site.
   - Event plan: names and properties (no personal data, no form content): e.g. `contact_cta_click
     {location}`, `contact_submit {origin_path}`, `tel_click {location}`, `mailto_click {location}`,
     `vcard_save`, `review_click {location}`. Origin of a contact = the page the visitor came from
     (e.g. passed by the article CTA), never a user identifier.
   - Privacy policy changes needed (implemented with #80): add the "mesure d'audience" purpose,
     its legal basis (intérêt légitime), Vercel as recipient and the transfer basis (Vercel is a
     US company; the policy today states data stays in the EEE — to fix), retention. No banner
     needed as long as nothing above sets a cookie or identifier.
   - Plan check: Vercel Web Analytics custom events require a paid Vercel plan. If the project is
     on Hobby, the fallback is server-side counting through our own API (contact, vCard) and page
     views only; noted as an open question below.
7. **Hand-offs** — the decisions each downstream issue must take as input (#67, #68, #71, #73,
   #74, #80, #83, #86), and what Eva must provide (approval, proof material, phone-call counts).

## Team and tasks

| # | Node | Task | Depends on |
|---|---|---|---|
| 1 | ux | Write `objectives.md` (sections 1–7), from the audit, the code (`constants.ts`, `Contact.tsx`, `api/contact`, `carte/`, privacy policy) and this spec | — |
| — | lead | Review; get Eva's approval of the positioning and the CTA decision from the user; merge; comment the decisions on #66 and tick its checklist; PR | 1 |

`ui` has no task: the issue excludes visual design. Downstream design issues read
`objectives.md`.

## Open questions (asked to the user during review, one batch)

1. Eva's approval of the positioning paragraph (or her edits).
2. CTA: confirm "contact request, no booking" (recommended) vs a real booking path (would need a
   new vendor/feature, out of epic scope).
3. Vercel plan (Hobby or Pro) — decides whether custom events are available.
4. Does a Search Console property exist for biezunski-avocat.fr, and can Eva count past contact
   requests (form / phone / email) for the last 6–12 months as the baseline?

## Acceptance (maps to #66)

- [ ] Positioning paragraph in `objectives.md`, approved by Eva (via the user).
- [ ] Audiences ranked and J1–J5 ranked with reasons.
- [ ] Primary CTA and its real action decided (A-05).
- [ ] KPI table complete: definition, source, baseline or "unknown, measure from launch".
- [ ] Measurement approach decided, with the privacy-policy changes it requires and no consent
      banner needed (or the reason one is).
- [ ] Decisions summarised in a comment on #66.
