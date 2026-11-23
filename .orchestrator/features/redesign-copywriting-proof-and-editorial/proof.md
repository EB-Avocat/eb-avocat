# Proof register (#68, task T-502 draft)

Every proof item the redesigned site may show: where it comes from, where `copy.md` uses it, its
**consent status**, who owns it, the deadline, and what ships if it does not arrive. Proof is facts and
credentials, never superlatives, comparisons or promised results (G §6, A-04). Eva has the last word.
English doc, French quoted as is.

## 1. Rules of the register

**Consent status (the only five values):**

| Status | Meaning |
|---|---|
| `none` | Not asked yet. Nothing ships. |
| `asked` | Asked, no answer. Nothing ships. |
| `written consent received` | Signed or written reply on file, with date and scope. May ship. |
| `refused` | The person or Eva said no. Never ships; keep the row so nobody asks again. |
| `not needed` | Eva's own public fact or her own content. Eva still confirms it is true (column « Confirmed by Eva »). |

**Rules that apply to every row:**
1. **Nothing ships with status `none`, `asked` or `refused`**, and nothing ships from a row that has
   `[À CONFIRMER]` in `copy.md` (spec §4.4, G §6).
2. **No client identity without written consent** (G §6.3): no name, logo, company, town, or detail that
   lets someone recognise a client. Examples on the domaine pages are fictional composites (row P17).
3. **Static text, updated by hand**: rating and figures carry the date of the reading; no widget, no API,
   no new vendor.
4. **`proof.md` is the source of truth for « where used »**: if an item is removed here, the matching
   `copy.md` block is removed.
5. T-503 turns this draft into the final register: each `Confirmed by Eva` is filled, each fallback applied.

**Consent record (one per testimonial, kept with the signed text, not on the site):**

| Field | Content |
|---|---|
| Person | First name or initials, profession; or « anonymous » |
| Text | The exact quote, as signed |
| Where | The pages named (home, `/a-propos`), nowhere else without a new consent |
| How long | Until withdrawn, or an end date |
| Revocable | Yes, by email to Eva; removal within [À CONFIRMER : délai] of the request |
| Date and proof | Date of the written consent; the email or document kept by Eva |
| Eva's check | She confirms the person is a client she may name and that the quote is accurate |

Suggested consent wording to send (French, for Eva to adapt):

> J’accepte qu’Eva Biezunski publie, sur son site biezunski-avocat.fr (page d’accueil et page À propos), la citation ci-dessous, avec mon prénom ou mes initiales et ma profession. Je peux retirer mon accord à tout moment, par email, et la citation sera retirée du site.

## 2. Register

Columns: **Source** (where the fact comes from today) · **Where used** (`copy.md` keys) · **Consent** (§1) ·
**Owner** · **Deadline** · **Fallback** (what ships without it). Eva's question row is in `eva-content.md`.

### 2.1 Credentials

| ID | Item | Source | Where used | Consent | Confirmed by Eva | Owner | Deadline | Fallback |
|---|---|---|---|---|---|---|---|---|
| P1 | « Avocate au Barreau de Lyon » (Eva's registration to the Barreau) | Today's site: `QR_CARD.subtitle`, `FOOTER.copyright`; positioning A (#66 §3) | `HERO.kicker`, `HERO.panel.lines`, `FOOTER.credential`, `FOOTER.copyright`, `ARTICLE.authorCard.credential`, `QR_CARD.subtitle`, `SITE.title` | not needed | yes (on today's site, approved in #66) | Eva | 2026-12-02 (G3 wording) | Shipped as is |
| P2 | Year of oath, or years in practice | Eva (E1a); nothing on today's site | `ABOUT.lead`, `PROOF.credentials.items`, `HERO.panel.since` | none | no | Eva | 2026-12-02 | « Avocate au Barreau de Lyon » with no year |
| P3 | Diplomas (title, university, year) | Eva (E1b) | `ABOUT.parcours.items`, `PROOF.credentials.items` | none | no | Eva | 2026-12-02 | No diploma line |
| P4 | Memberships, mandates, commissions, associations | Eva (E1c) | `ABOUT.parcours.items`, `PROOF.credentials.items` | none | no | Eva | 2026-12-02 | No membership line |
| P5 | Mention de spécialisation (official), if any | Eva (E1d); ethics rule 7 | `ABOUT`, `HERO.panel`, meta, only if confirmed | none | no | Eva | 2026-12-02 | No claim of specialisation; « droit des sociétés » stays a field of work |
| P6 | Trainings given: organiser, audience, topic, year | Eva (E6a). Today's site names the themes (structures d'exercice, passage d'entrepreneur individuel à dirigeant) but no organiser or year | `FORMATIONS.items`, `FORMATIONS.intro` | none for the list; the themes already ship | partly (themes only) | Eva | 2026-12-02 | `FORMATIONS.intro` and `FORMATIONS.gloss`, as on today's site |
| P7 | Professions and client types served | Eva (E2a). Today's site: « professionnels libéraux », « entrepreneurs »; #66 §1: health confirmed | `HERO.subheading.withProfessions`, `PROOF.professions`, `DOMAINES.*.forWhom.professions` | none | partly | Eva | 2026-12-02 | « professionnels libéraux et entrepreneurs » only |
| P8 | Domaines of practice (création de sociétés, clientèle ou patientèle, contrats, Ordre et déontologie; mécénat; formations) | Today's `SERVICES`; positioning A | `DOMAINES.*`, `HERO.panel.lines` (« Droit des sociétés, exercice libéral ») | not needed | yes (today's site) | Eva | 2026-12-02 (E3, E7 for scope) | Pages Eva does not validate become hub sections |
| P9 | Address, Lyon location | `CONTACT.address` | `HERO.panel.lines`, `FOOTER`, `CONTACT.metaDescription`, `CONTACT_BAND` (home) | not needed | yes | Eva | — | Shipped as is |

### 2.2 Client voices and ratings

| ID | Item | Source | Where used | Consent | Confirmed by Eva | Owner | Deadline | Fallback |
|---|---|---|---|---|---|---|---|---|
| P10 | Testimonial 1 (name or initials, profession, month and year) | Eva asks the client (E8a) | `PROOF.testimonials.items[0]`; home proof teaser, `/a-propos` | none | no | Eva asks the client | **2026-12-14** | Block not rendered |
| P11 | Testimonial 2 | same | `PROOF.testimonials.items[1]` | none | no | Eva asks the client | **2026-12-14** | not rendered |
| P12 | Testimonial 3 | same | `PROOF.testimonials.items[2]` | none | no | Eva asks the client | **2026-12-14** | not rendered |
| P13 | Testimonial 4 | same | `PROOF.testimonials.items[3]` | none | no | Eva asks the client | **2026-12-14** | not rendered |
| P14 | Google rating: x / 5, n reviews, date of the reading | Google Business Profile, read by Eva (E9a); nothing on today's site | `PROOF.rating`, `PROOF.ratingLink`; home, `/a-propos` | not needed for the count (public data), **Eva's OK needed** | no | Eva | 2026-12-02 | Not rendered |
| P15 | Direct Google « write a review » link and the `/avis` short link | Eva (E9b, E9c); today `REVIEW_URL` is the map link | `REVIEW.footerLink`, `REVIEW.shortUrl`, `QR_CARD.review` | not needed | partly (today's link only) | Eva | 2026-12-02 | Today's `REVIEW_URL`; no `/avis` printed |

Rows P10 to P13 are slots; the register has one row per testimonial actually collected. A refused testimonial
stays in the register as `refused`.

### 2.3 Figures and publications

| ID | Item | Source | Where used | Consent | Confirmed by Eva | Owner | Deadline | Fallback |
|---|---|---|---|---|---|---|---|---|
| P16 | Figures she is comfortable stating (years, sociétés créées, professions), each with what it counts and its date | Eva (E10) | `PROOF.figures.items` | none | no | Eva | 2026-12-02 | No figure |
| P17 | Typical situations and FAQ of the four domaine pages (anonymised composites) | ux drafts from today's copy and general knowledge; **fictional**, not real clients | `DOMAINES.items[*].situations`, `.faq` | not needed (fictional); each carries the label « Exemple » and the note `DOMAINES.template.situations.note` | no (Eva reads each one: X5) | Eva | 2026-12-02 | A situation or FAQ she does not confirm is cut; below the gate (3 situations, 3 FAQ) the page becomes a hub section |
| P18 | Publications as proof of expertise (latest 3 on home, list, article count) | The back-office (API); Eva's own articles | `HOME.publications.*`, `ARTICLE.*`, `ABOUT.publications.*` | not needed (her own content) | automatic | Eva | — | Block hidden at 0 article or API failure (IA §6) |
| P19 | Portrait photograph | Photograph used today in `About` (brand #69 §7) | `PROOF.portrait.alt`; `/a-propos`, home proof teaser | not needed (her own image); photographer's licence for web use to confirm | partly | Eva | 2026-12-02 | No portrait; typographic panel only (brand direction A) |

### 2.4 What never ships

| ID | Item | Why |
|---|---|---|
| N1 | Client names, logos, companies, towns, or any detail that identifies a client | Secret professionnel and G §6.3. A client can consent in writing to a testimonial (P10 to P13), never to a case description |
| N2 | « Le meilleur », « n° 1 », « leader », « expert », « spécialiste » (without the official mention), success rate, « gagné n dossiers » | G §6.1, §6.2, §6.7 |
| N3 | Press mentions, awards, rankings, « recommandé par… » | Not on today's site, none planned. If Eva has one, it becomes a row (comparison rule, G §6.1) |
| N4 | A live Google widget, rating API, or a third-party review widget | No new vendor (memory « no-new-vendors »); static text only (spec §4.7) |

## 3. Consent tracker (testimonials)

Filled by Eva as clients answer. One line per person.

| ID | Person (initials, profession) | Asked on | Consent received on | Scope (pages, until) | Quote re-read by Eva | Status | Withdrawn on |
|---|---|---|---|---|---|---|---|
| P10 | | | | | | none | |
| P11 | | | | | | none | |
| P12 | | | | | | none | |
| P13 | | | | | | none | |

## 4. Summary for `lead`

| Item group | Rows | Status today | Ships at launch if nothing arrives |
|---|---|---|---|
| Credentials | P1 to P9 | P1, P8, P9 shipped; others `none` | « Avocate au Barreau de Lyon », domaines, address, today's trainings themes |
| Client voices and ratings | P10 to P15 | all `none` | No testimonial, no rating; today's review link |
| Figures, examples, publications, portrait | P16 to P19 | P18 automatic; the rest `none` | Examples cut or hub sections; no figure; typographic hero |

Deadlines: answers **2026-12-02**, testimonial consents **2026-12-14**. If the consents are late, the
site ships without testimonials (a later content update, no design change: the block is conditional).
