# Proof register (#68, final version T-503: Eva's answers, parts 1 and 2, applied 2026-11-24)

Every proof item the redesigned site may show: where it comes from, where `copy.md` uses it, its
**consent status**, who owns it, the deadline, and what ships if it does not arrive. Proof is facts and
credentials, never superlatives, comparisons or promised results (G §6, A-04). Eva has the last word.
English doc, French quoted as is.

## 1. Rules of the register

**Consent status (the only six values):**

| Status | Meaning |
|---|---|
| `none` | Not asked yet. Nothing ships. |
| `asked` | Asked, no answer. Nothing ships. |
| `written consent received` | Signed or written reply on file, with date and scope. May ship. |
| `refused` | The person or Eva said no. Never ships; keep the row so nobody asks again. |
| `not needed` | Eva's own public fact or her own content, or a public review shown unselected. Eva still confirms it is true (column « Confirmed by Eva »). |
| `not used` | The item was planned and is not used on the site. Nothing ships. |

**Rules that apply to every row:**
1. **Nothing ships with status `none`, `asked`, `refused` or `not used`**, and nothing ships that Eva has
   not confirmed (spec §4.4, G §6). `copy.md` has no confirmation marker left.
2. **No client identity without written consent** (G §6.3): no name, logo, company, town, or detail that
   lets someone recognise a client. Examples on the domaine pages are fictional composites (row P17). Google reviews (P14) are public and left voluntarily by clients; the site shows only what Google returns and never confirms that a named person is a client.
3. **Google rating and reviews** (P14) are fetched by the server from the Google Places API once a day (spec §4.7; #80), shown unselected, in Google's order, with the date of the update and the attribution « Avis publiés sur Google ». No cookie and no script for the visitor. The block shows only once E8c is confirmed.
4. **`proof.md` is the source of truth for « where used »**: if an item is removed here, the matching
   `copy.md` block is removed.
5. T-503 applied Eva's answers (parts 1 and 2, 2026-11-24): `Confirmed by Eva` is filled where she answered; where she gave nothing the fallback is applied (« skipped → fallback »).

## 2. Register

Columns: **Source** (where the fact comes from today) · **Where used** (`copy.md` keys) · **Consent** (§1) ·
**Owner** · **Deadline** · **Fallback** (what ships without it). Eva's question row is in `eva-content.md`.

### 2.1 Credentials

| ID | Item | Source | Where used | Consent | Confirmed by Eva | Owner | Deadline | Fallback |
|---|---|---|---|---|---|---|---|---|
| P1 | « Avocate au Barreau de Lyon » (Eva's registration to the Barreau) | Today's site: `QR_CARD.subtitle`, `FOOTER.copyright`; positioning A (#66 §3) | `HERO.kicker`, `HERO.panel.lines`, `FOOTER.credential`, `FOOTER.copyright`, `ARTICLE.authorCard.credential`, `QR_CARD.subtitle`, `SITE.title` | not needed | **yes** (G3: « Avocate au Barreau de Lyon », as is) | Eva | done | Shipped as is |
| P2 | Year of oath: 2020 (oath taken 12 novembre 2020) | Eva (E1a), answered 2026-11-24 | `ABOUT.lead`, `PROOF.credentials.items`, `HERO.panel.since` | not needed | **yes** | Eva | done | Year only on the site: « Avocate au Barreau de Lyon depuis 2020 » |
| P3 | Diplomas (title, university, year) | Eva (E1b): none given | none | not used | — | Eva | done | No diploma line (applied) |
| P4 | Memberships, mandates, commissions, associations | Eva (E1c): none given | none | not used | — | Eva | done | No membership line (applied) |
| P5 | Mention de spécialisation (official): none (E1d). Self-description « experte des professions libérales », Eva's own words | Eva (E1d, part 2, 2026-11-24); X1 | `PROOF.credentials.items` (once per page; guide §6.7) | not needed | **yes** | Eva | done | Never « spécialiste » or « spécialisée »; « droit des sociétés » stays a field of work |
| P6 | Trainings given (Formations): organisers, audiences, topics, years | Eva (E6a, E6b), answered 2026-11-24: dropped | none (section removed, copy.md R7) | refused | no | Eva | done | No Formations section, pointer or subject option (applied) |
| P7 | Professions and client types served: every liberal health profession, the other liberal professions, entrepreneurs | Eva (E2a), answered 2026-11-24 | `HERO.subheading`, `PROOF.professions`, `DOMAINES.template.forWhom`, `DOMAINES.hub.forWhom.text` | not needed | **yes** | Eva | done | — |
| P8 | Domaines of practice (création de sociétés, clientèle ou patientèle, contrats, Ordre et déontologie). Mécénat and Formations are dropped (E6, E7) | Today's `SERVICES`; positioning A; Eva 2026-11-24 | `DOMAINES.*`, `HERO.panel.lines` (« Droit des sociétés, exercice libéral ») | not needed | yes | Eva | final read (E3) | Pages Eva does not validate become hub sections (copy.md § 14: all four pass the gate) |
| P9 | Address, Lyon location | `CONTACT.address` | `HERO.panel.lines`, `FOOTER`, `CONTACT.metaDescription`, `CONTACT_BAND` (home) | not needed | yes | Eva | — | Shipped as is |

### 2.2 Client voices and ratings

| ID | Item | Source | Where used | Consent | Confirmed by Eva | Owner | Deadline | Fallback |
|---|---|---|---|---|---|---|---|---|
| P10 | Site testimonial 1 | Eva (E8b): her testimonials are the Google reviews, left voluntarily; no separate collection | none (`PROOF.testimonials` removed) | not used (reviews on Google instead) | — | Eva | done | Block removed (applied) |
| P11 | Site testimonial 2 | Eva (E8b): her testimonials are the Google reviews, left voluntarily; no separate collection | none (`PROOF.testimonials` removed) | not used (reviews on Google instead) | — | Eva | done | Block removed (applied) |
| P12 | Site testimonial 3 | Eva (E8b): her testimonials are the Google reviews, left voluntarily; no separate collection | none (`PROOF.testimonials` removed) | not used (reviews on Google instead) | — | Eva | done | Block removed (applied) |
| P13 | Site testimonial 4 | Eva (E8b): her testimonials are the Google reviews, left voluntarily; no separate collection | none (`PROOF.testimonials` removed) | not used (reviews on Google instead) | — | Eva | done | Block removed (applied) |
| P14 | Google rating, review count and up to 5 reviews (variant (b) shows the quotes with first name and date, variant (a) does not), « Avis publiés sur Google », link to all reviews | Google Places API, fetched by the server once a day (spec §4.7) | `PROOF.reviews.*`, `PROOF.rating.*`; home, `/a-propos` | not needed (public Google reviews, shown unselected); **gated on E8c** (review text: variant (a) rating + count + link is the default until `lead` confirms (b)) | **yes** (E8, E9a; Barreau rule E8c answered: allowed with the client's consent) | #80 builds it; `lead` asks the user about (b) | pending: place ID, Google Cloud key | When the fetch fails or returns no reviews: the link alone |
| P15 | Direct Google « write a review » link and the `/avis` short link | Eva (E9b, E9c): no answer; today `REVIEW_URL` is the map link | `REVIEW.footerLink`, `REVIEW.shortUrl`, `QR_CARD.review` | not needed | skipped → fallback | Eva | done | Today's `REVIEW_URL`; no `/avis` short link printed or shown (applied) |

Rows P10 to P13 are kept so nobody plans a separate testimonial collection again (E8b).

### 2.3 Figures and publications

| ID | Item | Source | Where used | Consent | Confirmed by Eva | Owner | Deadline | Fallback |
|---|---|---|---|---|---|---|---|---|
| P16 | Figures | Eva (E10): none | none (`PROOF.figures` removed) | not used | — | Eva | done | No figure on the site (applied) |
| P17 | Typical situations and FAQ of the four domaine pages (anonymised composites) | ux drafts from today's copy and general knowledge; **fictional**, not real clients | `DOMAINES.items[*].situations`, `.faq` | not needed (fictional); each carries the label « Exemple » and the note `DOMAINES.template.situations.note` | partly: the first situations of the création and cession pages come from Eva (E3); Eva reads the composites (X5) | Eva | final read | A situation or FAQ she does not confirm is cut; below the gate (3 situations, 3 FAQ) the page becomes a hub section |
| P18 | Publications as proof of expertise (latest 3 on home, list, article count) | The back-office (API); Eva's own articles | `HOME.publications.*`, `ARTICLE.*`, `ABOUT.publications.*` | not needed (her own content) | automatic | Eva | — | Block hidden at 0 article or API failure (IA §6) |
| P19 | Portrait photograph | Photograph used today in `About` (brand #69 §7) | `PROOF.portrait.alt`; `/a-propos`, home proof teaser | not needed | pending: photographer's licence for web use | Eva | 2026-12-02 | No portrait; typographic panel only (brand direction A) |

### 2.4 What never ships

| ID | Item | Why |
|---|---|---|
| N1 | Client names, logos, companies, towns, or any detail that identifies a client | Secret professionnel and G §6.3. A client's Google review is public and left voluntarily (P14); no case description, ever |
| N2 | « Le meilleur », « n° 1 », « leader », « spécialiste » or « spécialisée » (Eva has no official mention; the only allowed phrase is her own « experte des professions libérales », once per page), success rate, « gagné n dossiers » | G §6.1, §6.2, §6.7 |
| N3 | Press mentions, awards, rankings, « recommandé par… » | Not on today's site, none planned. If Eva has one, it becomes a row (comparison rule, G §6.1) |
| N4 | A client-side Google widget, a third-party review widget or script, a cookie for the visitor | The reviews come from the server (Places API, daily); the visitor gets no cookie and no script (spec §4.7) |

## 3. Summary for `lead`

| Item group | Rows | Final status | Ships at launch |
|---|---|---|---|
| Credentials | P1 to P9 | P1, P2, P5, P7, P8, P9 confirmed; P3, P4 none given (not used); P6 dropped | « Avocate au Barreau de Lyon depuis 2020 », « Experte des professions libérales », domaines, professions, address |
| Client voices and ratings | P10 to P15 | P14 confirmed, gated on E8c, pending place ID and API key; P10 to P13 not used; P15 skipped → fallback | Google reviews block, variant (a) by default (or the link alone if the fetch fails); today's review link |
| Figures, examples, publications, portrait | P16 to P19 | P16 not used; P17 composites for the final read; P18 automatic; P19 pending licence | No figure; composites for Eva's final read; portrait if the licence is confirmed |

Deadlines: place ID and Google Cloud key (for #80) **2026-12-02**. No testimonial collection: nothing waits for client consents.
