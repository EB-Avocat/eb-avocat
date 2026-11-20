# UX brief — objectives, audience and KPIs

Read `spec.md` first; it lists the seven sections of `objectives.md` and the recommendations to
start from. You may disagree with a recommendation: say so in the doc with the reason.

## Inputs
- Audit: `.orchestrator/features/plan-redesign/audit.md` — §2 Journeys (J1–J5), A-01, A-02,
  A-04, A-05, A-06, A-09, A-11, A-17.
- Issue drafts downstream: `.orchestrator/features/plan-redesign/issues/` (02, 03, 06, 08, 09,
  15, 18, 21) — your hand-off section must fit what they expect.
- Code (facts only, no changes): `frontend/src/lib/constants.ts` (hero, À propos, domaines,
  contact), `components/Contact.tsx`, `app/api/contact/route.ts` + `lib/contact.ts` (Brevo email),
  `app/carte/` (vCard route `/carte/vcard`), `app/politique-de-confidentialite/page.tsx`,
  `app/mentions-legales/page.tsx` (Vercel host).
- Baseline PNGs: `.orchestrator/features/plan-redesign/design/current/home-desktop.png`, `home-mobile.png`.

## Rules
- Positioning: French, one paragraph, ≤ 80 words, first person like the current site. Only facts
  present in the code/copy. Where proof is missing (years of practice, number of clients,
  professions served, reviews), list it as "to ask Eva" — never invent it. Avocat ethics rules
  apply (no comparative or misleading claims, no "meilleur", no guaranteed result).
- KPIs: every definition must be countable without guessing (what event, which pages, what
  window). Baseline column: a value, how to get it now, or "unknown, measure from launch".
- Measurement: reuse Vercel (and Brevo, Google tools that need no code on the site). No cookie,
  no fingerprinting, no personal data or form content in events. Name the privacy-policy edits.
- Keep it short: tables over prose. Target < 250 lines.

## Output
`objectives.md` in this folder, committed on your branch. Report to lead with the open questions
for Eva/the user (positioning approval, CTA, Vercel plan, baseline data), each with your
recommendation.
