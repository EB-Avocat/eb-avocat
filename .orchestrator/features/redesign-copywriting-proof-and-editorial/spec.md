# Spec — Copywriting, proof and editorial guide (#68)

Part of #65. Blocks #71 (home), #72 (domaine template), #73 (publications), #74 (contact).
Docs in English; French copy quoted as is. Owner of this file: `lead`.

## 1. Inputs (decided, not re-opened here)

This branch was cut from `main` before #66, #67 and #69 merged. Until the integration branch is
rebased (at integration time), read them with `git show origin/main:<path>`:

| Source | Path on `origin/main` | What it fixes for #68 |
|---|---|---|
| #66 objectives | `.orchestrator/features/redesign-objectives-audience-and-kpis/objectives.md` | Audiences (§1), positioning **variant A approved by Eva** (§3), hero candidates (§3), CTA family « Contacter le cabinet » without « rendez-vous » (§4), proof list to ask Eva (§3), privacy-policy edits for Eva's approval (§6) |
| #67 IA | `.orchestrator/features/redesign-information-architecture-and-na/ia.md`, `url-table.md` | Site map and slugs (§1), 4 domaine pages behind a **launch gate** (§2: for whom, what, how it goes, ≥ 3 situations, ≥ 3 FAQ), home order (§6), `/a-propos`, `/contact` (§3), nav labels ≤ 12 chars and CTA ≤ 22 chars (§4.1), footer (§7), page ends (§8), review ask wording (§5), open questions Q1–Q8 for Eva (§15) |
| #69 brand | `.orchestrator/features/redesign-brand-direction-and-moodboard/brand.md` | Direction A « Documentaire », first person, U+00A0 before » : ; ? ! and after « (§1.3), hero samples marked « exemple » (§6) |
| Audit | `.orchestrator/features/plan-redesign/audit.md` | A-01, A-04, A-05, A-07, A-08, A-17, A-30 |
| Current copy | `frontend/src/lib/constants.ts` | Base wording, export names, form messages |

## 2. Goal

A prospect understands in seconds who Eva helps and how, trusts her, and knows what happens when
they write. Every word the redesign needs exists, approved by Eva, in a form #79–#84 paste into
`constants.ts`, and the design issues (#71–#74) design with real copy, not lorem.

## 3. Deliverables

All in `.orchestrator/features/redesign-copywriting-proof-and-editorial/`.

| File | Owner | Content |
|---|---|---|
| `editorial-guide.md` | ux | Voice (first person « je », plain language, warm, no jargon without gloss), word list (preferred / avoided terms, incl. « Contact » vs « Coordonnées », « le cabinet » vs « je » vs « Avocate au Barreau de Lyon »), CTA and link wording rules, glossary of legal terms and acronyms with plain-language glosses, French typography (U+00A0, « », ’, œ, phone display format), ethics limits (avocat communication rules: no comparison, no promised result, no client identity without consent, anonymised examples), length limits (nav, CTA, meta title/description), and a checklist for Eva's future articles |
| `copy.md` | ux | Final French copy, page by page: global (nav, header CTA, footer, review link, meta), home (hero promise + audience, domaines teaser, proof teaser, publications teaser, « Comment ça se passe », contact band), `/domaines` hub (incl. Mécénat, pointer to Formations, « Pour qui »), each of the 4 domaine pages to the launch gate, `/a-propos` (incl. Formations), `/contact` (intro, three channels, what to prepare, confidentiality, response time, form labels/help/errors/success, GDPR line), article end (author card line, contextual contact line, review line), 404 and error page, `/carte`, privacy-policy wording from #66 §6. Every acronym glossed on first use **per page** (each page is an entry point) |
| `proof.md` | ux | Proof register: each item (testimonials, credentials, oath year, trainings, memberships, client types, figures, publications as expertise, Google rating) with source, where it is used, **consent status** (none / asked / written consent received / refused / not needed), owner, deadline |
| `eva-content.md` | ux | Content to collect from Eva: one row per item (question, why, blocks which page/issue, owner, deadline, status, answer). Starts from §6 below and #67 Q1–Q8 |
| `copy.ts` | ui | `copy.md` in `constants.ts`-ready form: same export names as today where a block survives (`HERO`, `ABOUT`, `CONTACT`, `FOOTER`, `NOT_FOUND`…), new ones for new blocks (e.g. `DOMAINES`, `FIRST_CONTACT`, `PROOF`, `GLOSSARY`), `as const`, typechecks on its own. Not wired into the app (that is #79–#84) |
| `check-copy.ts` | ui | A script (`bun` run) over `copy.ts` that fails on: an acronym from the glossary used on a page before its gloss, a nav label > 12 chars or a CTA > 22 chars, an ordinary space before » : ; ? ! or after «, « rendez-vous » in a CTA, « Eva vous » / third-person self-reference outside allowed places, meta title > 60 / description > 155 chars, an unresolved `[À CONFIRMER` marker |

## 4. Decisions in this spec

1. **Voice.** First person « je » is the site's voice (A-30). « Le cabinet » names the entity
   (CTA, legal pages, footer) and is never the subject of a sentence about what Eva does.
   « Avocate au Barreau de Lyon » is her credential line, used as is. The guide fixes each case.
2. **CTA.** Family « Contacter le cabinet » (#66 §4), used identically everywhere a CTA points to
   `/contact` (#67 §8 rule 8). ux may propose one alternative in the guide with a reason
   (e.g. a first-person « Me contacter »); the lead decides at review, before `copy.md` is final.
3. **Acronyms.** Plain words first, acronym in parentheses, on first use on every page:
   « une société d'exercice libéral (SEL) ». After that the acronym alone is fine. Headings and
   nav avoid acronyms unless the searched term needs them (domaine h1/meta may keep « SEL »,
   « SCM »… for K9 when the gloss follows in the first paragraph).
4. **Facts are never invented.** Anything that needs Eva (years, professions, trainings,
   delays, fees, testimonials, rating, situations she handles) is written as a draft with an
   `[À CONFIRMER : …]` marker and a matching row in `eva-content.md`. The final `copy.md` has no
   marker: each one is either confirmed by Eva or removed with its fallback wording.
5. **Conditional blocks.** « Comment ça se passe » (home), response delay, fee principle,
   testimonials, figures, Google rating each have a fallback (block dropped or neutral wording)
   written in `copy.md`, so design never waits for an answer.
6. **Domaine pages and the launch gate.** ux drafts all 4 pages to the #67 gate from the current
   copy and general, verifiable descriptions of each operation (no figures, no profession-specific
   rule that differs by Ordre unless Eva confirms it). Eva validates or cuts; a page she does not
   validate falls back to its `/domaines#<slug>` section (#67 §2), and `copy.md` says which.
7. **Proof and consent.** No testimonial or client name ships without written consent recorded
   in `proof.md`. Case examples are anonymised composites, marked as such to Eva. Google reviews
   (decided by the user on 2026-11-24, replacing "static text by hand"): Eva wants them on the site.
   The server fetches them from the Google Places API once a day: rating, review count and up to
   5 reviews in Google's own order, shown with Google's attribution and a link to the profile. The
   visitor's browser never contacts Google, so there is no cookie, no third-party script and no
   consent banner (#66 §6). Built in #80. Prerequisites: a Google Cloud project with billing enabled
   and an API key (set up by the user; the expected volume stays inside the free quota), the place ID
   of Eva's profile, and Eva confirming that the Barreau de Lyon allows reviews on an avocat's site
   (E8c: answered, allowed with the client's consent). The review quotes are shown with the
   reviewer's first name and the date (user decision, 2026-11-24, variant (b) of `PROOF.reviews`).
   #68 writes only the copy for the slots around the reviews, never the review text.
8. **Privacy wording.** The French text of #66 §6 edits 1–5 is written here (it is copy) for
   Eva's approval; #80 implements it.
9. **No code change to the app.** `frontend/src/lib/constants.ts` is not modified by this
   feature: the new IA does not exist in code yet, and the copy ships with #79–#84.

## 5. Process and approval

1. ux writes `editorial-guide.md` (no Eva input needed).
2. ux writes drafts of `copy.md`, `proof.md` and `eva-content.md`. In parallel, as soon as the
   spec is approved, the lead sends the user the questionnaire of §6 for Eva.
3. The lead relays Eva's answers; ux finalises `copy.md` and `proof.md` (no marker left).
4. The lead asks the user for Eva's approval of the final `copy.md` (one question). Changes she
   asks for go back to ux.
5. ui turns the approved `copy.md` into `copy.ts` and `check-copy.ts`; the check passes.
6. The lead merges, checks the acceptance criteria, opens the PR.

## 6. Questionnaire for Eva (first version; ux keeps it in `eva-content.md`)

Deadline proposed: answers by **2026-12-02**; testimonial consents by **2026-12-14** (they need
clients to sign). Owner: Eva, relayed by the user, unless noted.

| # | Question | Blocks |
|---|---|---|
| E1 | Year of oath (prestation de serment) and years in practice; diplomas; memberships, mandates (commissions, associations) you want shown | À propos, proof teaser |
| E2 | Professions you actually serve, in order of importance (santé: which ones? droit, chiffre, autres?) — #67 Q5 | Hero audience line, « Pour qui » blocks |
| E3 | For each of the 4 domaines: confirm the scope, 3 typical situations, 3 questions clients often ask — #67 Q1, Q2. Which domaine leads the home list? | Domaine pages (launch gate) |
| E4 | First contact: format of the first exchange (call, visio, meeting), is it charged, usual response delay — #67 Q7 | « Comment ça se passe », `/contact` |
| E5 | Fees: can the site state the principle (convention d'honoraires, forfait or temps passé, devis before starting)? | « Comment ça se passe », FAQ |
| E6 | Trainings given: organisers, audiences, topics, years; offer (organisers can ask) or proof only — #67 Q4 | `/a-propos#formations` |
| E7 | Mécénat: still active? for whom? enough for a section — #67 Q3 | `/domaines#mecenat` |
| E8 | Testimonials: 2–4 clients willing to give a short quote with **written consent** (name or initials + profession, or anonymous)? Owner: Eva asks the clients | Proof layer |
| E9 | Google rating: may the site show « Note Google : x/5 (n avis) » with a date? Direct "write a review" link from your profile — #67 Q8; OK to print `biezunski-avocat.fr/avis`? | Proof, review link |
| E10 | Figures you are comfortable stating (e.g. sociétés créées, years, professions) — none is shown without your OK | Proof |
| E11 | Approval of the privacy-policy wording (#66 §6) | Legal page, #80 |
| E12 | Old links to `/#contact` or other anchors in emails, signature, GBP — #67 Q6 | #78 (relay only) |

## 7. Tasks (created after approval)

| # | Node | Task | Depends on |
|---|---|---|---|
| 1 | ux | `editorial-guide.md` (voice, terms, CTA rule, glossary, typography, ethics, limits) | — |
| 2 | ux | Drafts: `copy.md`, `proof.md`, `eva-content.md` with `[À CONFIRMER]` markers and fallbacks | 1 |
| 3 | ux | Finalise `copy.md` / `proof.md` / `eva-content.md` with Eva's answers; then Eva's approval | 2 + Eva's answers |
| 4 | ui | `copy.ts` + `check-copy.ts`, check passing | 3 |

Tasks 1–3 are the same owner in sequence (one file set, no branch conflict); task 4 only adds
`.ts` files.

## 8. Acceptance criteria (from #68)

- [x] `editorial-guide.md` committed.
- [x] Final French copy for home, domaines, contact (and the other pages of §3), approved by Eva (as is, 2026-11-24),
      in `constants.ts`-ready form (`copy.ts`, typechecks, `check-copy.ts` passes).
- [x] `proof.md` lists every proof item with its consent status.
- [x] Every legal acronym is glossed in plain language on first use on each page (enforced by
      `check-copy.ts`).

## 9. Out of scope

Layout and visuals (#70–#75), new publications, wiring copy into the app (#79–#84), SEO
structured data (#78: we only write meta titles/descriptions), tracking (#80).
