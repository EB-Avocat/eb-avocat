# Redesign objectives, audience and KPIs (#66)

Input for #67, #68, #71, #73, #74, #80, #83, #86. Sources: `audit.md` (§2, A-01…A-17), `spec.md`,
the code (`frontend/src/lib/constants.ts`, `app/api/contact/route.ts`, `lib/contact.ts`, `app/carte/`,
`app/politique-de-confidentialite/page.tsx`, `app/mentions-legales/page.tsx`). Status: **draft
until Eva approves §3 and §4** (through the user).

## 1. Audiences and priorities

| Rank | Audience | Who | Comes for | Entry points | Success for them |
|---|---|---|---|---|---|
| 1 | **Prospects** | Liberal professionals (patientèle wording in the copy = health; other professions to confirm with Eva) and entrepreneurs, around Lyon, creating or reorganising a practice, a société, a contract, or facing their Ordre | Know in seconds that Eva handles *their* case, trust her, reach her | Google (publications, brand, "SEL Lyon"…), Google Business Profile, word of mouth → home | A contact request sent (form, call or email) in ≤ 2 actions from any page |
| 2 | Existing clients | People Eva already advises | Phone/email/address; leave a review | Direct, GBP, review link Eva sends | Coordinates found in one tap; review link one tap away (footer, `/carte`) |
| 3 | Networking contacts | People who scan Eva's QR card | Save the contact, maybe browse | `/carte` (mobile) | vCard saved, or call/email from the card |
| 4 | Eva as author | Eva, in the back-office | Publish articles that bring prospects | `/backoffice` | Publishing is easy (#76); her articles lead to contacts (J2) |

Rule: prospects drive every design trade-off. Clients, contacts and Eva get their paths without
taking room from the prospect path (e.g. the review ask leaves the main nav, A-02).

## 2. Journeys ranked

| Rank | Journey | Reason | KPI it moves |
|---|---|---|---|
| 1 | **J1 home → understand → contact** | Brand and GBP visitors land here; today the CTA promises a booking that does not exist and phone/email are at the bottom (A-01, A-05, A-06) | K1 contact requests, K2 tel/mailto clicks, K3 CTA clicks |
| 1 | **J2 publication (from search) → trust → contact** | Articles are the only pages that rank beyond the brand (A-03, A-09) and today end in a dead end | K4 reads, K5 reads → contact, K9 search |
| 2 | J4 QR card → save contact / visit | Short, working journey with known defects (A-11: no phone/email on Android, desktop UA silently redirected) | K6 `/carte` visits, K7 vCard saves |
| 3 | J3 client → leave a review | Client task; it moves out of the main nav (A-02) to footer, end of article, `/carte` | K8 review-link clicks (proxy, the review itself is on Google) |
| 4 | J5 Eva → write → publish | Not a conversion journey; handled in #76 | none here (#76 has its own checks) |

## 3. Positioning (DRAFT — to approve by Eva)

Built only from `HERO`, `ABOUT`, `SERVICES`, `QR_CARD`, `FOOTER` in `constants.ts`. No figures, no
client names, no comparative claim, no promised result (avocat ethics). ≤ 80 words (`wc -w`).

**Variant A — "structurer et anticiper"** (recommended: it puts the audience first and keeps the
current first-person voice of À propos), 71 words:

> Avocate au Barreau de Lyon, j'aide les professionnels libéraux et les entrepreneurs à structurer
> leur activité : choix de la société, statuts, contrats, opérations sur leur clientèle ou
> patientèle. J'anticipe dès la création les ambitions de chacun et je traite en amont les points
> de friction entre associés. Mon accompagnement se poursuit dans leurs relations avec leur Ordre
> professionnel, sur leurs questions déontologiques et, si besoin, devant les Conseils de l'Ordre.

**Variant B — "profession réglementée"** (leads with the Ordre difference), 74 words:

> Votre profession est réglementée : la société et les contrats qui l'encadrent doivent en tenir
> compte. Avocate au Barreau de Lyon, j'accompagne les professionnels libéraux de la création de
> leur structure (SEL, SCM, SCI, SPFPL) jusqu'aux démarches devant leur Ordre, et je réponds à
> leurs questions déontologiques. Je construis avec vous un cadre qui tient compte de vos projets
> futurs et des relations entre associés, en traitant en amont les points de friction éventuels.

| Element | Where it is in A / B | Source |
|---|---|---|
| Promise | structure the activity, anticipate associate friction | `ABOUT` §1–3 |
| Audience | professionnels libéraux (+ entrepreneurs) | `HERO.subheading`, `ABOUT` §2 |
| Proof | Barreau de Lyon; Ordre work and Conseils de l'Ordre litigation | `QR_CARD.subtitle`, `SERVICES` |
| Difference | Ordres, déontologie, associate conflicts, Lyon | `ABOUT` §3–4, address |

**Hero promise candidate for #68** (one line): « Structurer votre exercice libéral, en accord avec
votre Ordre et vos associés. » — B-style alternative: « Avocate des professionnels libéraux, de la
création de votre société aux démarches devant votre Ordre. » #68 writes the final wording;
acronyms in B must be glossed on first use (#68 rule).

**Proof to ask Eva** (none of this is invented here; #68 owns the collection list, consent and
deadlines): year of oath / years of practice; professions actually served (santé? droit? chiffre?
which first); trainings given (organisers, audiences); memberships, mandates, diplomas; plus the
#68 proof layer (testimonials with consent, Google rating, figures, first-meeting/delay/fee info).

## 4. Primary conversion and CTA (A-05)

**Decision (recommended):** the primary conversion is a **contact request**, by any of three
channels, all counted: form (accepted by `/api/contact`), phone, email.

- CTA label stops promising an appointment: family "Contacter le cabinet" / "Prendre contact"
  (exact words: #68). It leads to the form (on the page or `/contact`, per #67).
- Phone number visible beside the CTA, `tel:` on mobile; same contact action in the header on
  every page (A-06).
- Every article ends with a contextual contact CTA (A-09), which passes its origin (§6).
- Secondary conversions: vCard save (`/carte/vcard`), review-link click, publication read.

**Why:** a booking tool would be a new vendor and a new business feature, both out of the epic
(#65); Eva needs to qualify a request before meeting (conflict check, déontologie); the form,
phone and email already exist and work; the label then matches the action.

**Follow-up (not in this epic): online booking.** Reconsider if, after ≥ 3 months of data, one of:
≥ 50 % of contact requests are "first meeting" requests with no qualifying exchange needed (Eva
tags them for a month); visitors repeatedly ask for a slot by email; Eva has fixed slots for first
meetings. It would then need a vendor choice (prefer one already used, see `no-new-vendors`) and
a privacy-policy update.

## 5. KPIs

Window: calendar month (Europe/Paris) unless stated. "Article" = `/publications/<slug>`. Target ↑
unless noted. "Pre-launch window" = the dependency below. `location` = the enum of §6.

| # | KPI | Definition (counting rule) | Source | Baseline | Target | Owner |
|---|---|---|---|---|---|---|
| K1 | Contact requests / month | Form: POST `/api/contact` that returns `ok: true` **and** sent the email (honeypot drops excluded). Plus calls and emails from new people that Eva logs (count only) | Server counter (§6); Eva's monthly count | Form: count the Brevo emails carrying the subject prefix of `buildBrevoPayload` (`lib/contact.ts`, today « Contact site — ») in Eva's inbox, last 6–12 months. Calls/emails: ask Eva, else unknown, measure from launch | ↑ | #80 (counter), #83, #86 |
| K2 | tel / mailto clicks | `link_click` with `kind` = tel \| mailto, i.e. links to `CONTACT.phone` / `CONTACT.email` only (other addresses carry no `data-track`), by `location`; 1 per click | `link_click` (§6) | Pre-launch window. Partial proxy: GBP calls (K11) | ↑ | #80 |
| K3 | Contact-CTA clicks | `link_click` with `kind=contact_cta`, by `location` | `link_click` | Pre-launch window (hero « Prendre rendez-vous » today) | ↑ | #80 |
| K4 | Publication reads | Page views of article pages; "engaged read" = `article_read_end` (end-of-body sentinel visible), once per page view | Vercel Web Analytics (+ custom event) | Page views: pre-launch window. Engaged: unknown, measure from launch (sentinel comes with #73) | ↑ | #80, #73 |
| K5 | Reads → contact | (a) K1 form requests whose `origin` is an article path; (b) `link_click` `kind=contact_cta`, `location=article` / article page views | Server counter; `link_click` | 0 by construction today (no article CTA, A-09); measure from launch | ↑ (a) count, (b) rate | #73, #80 |
| K6 | `/carte` visits | Page views of `/carte` (mobile only today: desktop UA is redirected, A-11) | Vercel Web Analytics | Pre-launch window | → / ↑ (depends on cards handed out) | #80 |
| K7 | vCard saves | Successful GET `/carte/vcard` (200), 1 per request (the route must run per request, not be prerendered or CDN-cached: #80 checks the build output and forces it dynamic if needed) | Server counter | Pre-launch window (needs the counter) | ↑ as share of K6 | #80 |
| K8 | Review-link clicks | `link_click` with `kind=review`, by `location`. Proxy: GBP review count | `link_click`; GBP | GBP: current review count (Eva) | ↑ | #80 |
| K9 | Search | Impressions, clicks, average position, monthly, split: brand queries (contain "biezunski") vs domaine queries (SEL, SCM, patientèle, Ordre, contentieux ordinal, "avocat … Lyon") | Search Console | 16 months of history if the property exists; else create it now (unknown until then) | Brand ≥ baseline (SEO protected); domaine ↑ | #78, #86 |
| K10 | Core Web Vitals | LCP, INP, CLS at p75, mobile and desktop, 28-day field data | Vercel Speed Insights | Lighthouse + CrUX snapshot of `/`, one article, `/carte` now (CrUX may lack data for a small site); Speed Insights over the pre-launch window | Within #77 budgets, no regression | #77, #86 |
| K11 | GBP actions | Calls, website clicks, direction requests, monthly | Google Business Profile insights | Last 6 months (Eva) | ↑ | #86 |

**Pre-launch window (dependency, stated only here):** the redesign must not launch before **≥ 4
full weeks** of K1–K4 (K4 page views only), K6, K7 and K10 on the current site. These work on any
Vercel plan (§6). So the tracking part of #80 (analytics, counter, `data-track` on the current
components, policy edits) must ship first, ahead of the redesign. Recommended as its own small issue
blocking #86 (lead to decide). The +1 and +3 month reports (#86) compare with this window.

**Reporting cadence:** one monthly row (Vercel figures + server counter + Eva's count) in a single
place on the epic. Search Console and GBP keep 16+ months of history, so they are pulled only for the
baseline and the +1 / +3 month reports.

## 6. Measurement approach

**Tools** (existing vendors only, no cookie):

| Tool | Notes |
|---|---|
| Vercel Web Analytics | Page views; custom events on **Pro** only. First-party script path, no cookie; visitor hash salted daily, not stored |
| Vercel Speed Insights | Field data, no cookie |
| Server counter | Counted in our own code, immune to ad blockers and independent of the plan. Proposed: daily aggregate rows (date, event, `kind`, `location` or `origin` path) in the Django backend (UUID pk), no personal data. Written with `after()` (`next/server`) so the write never delays or fails the response of `/api/contact` or `/carte/vcard` |
| Brevo | Cross-check of K1: add a tag (e.g. `contact-site`) to the transactional email and compare Brevo's monthly count with the counter |
| Search Console, GBP | No code on the site |

**One tracking mechanism.** Every tracked link carries `data-track="<kind>"` and `data-location`;
one delegated click listener sends `link_click {kind, location}`. `kind`: contact_cta \| tel \|
mailto \| review \| vcard. Only links rendered from `CONTACT`, `REVIEW_URL` and the CTA component
carry the attribute, so new pages are tracked by reuse, not by remembering an event. Sink: Vercel
custom event on Pro; on Hobby the same listener posts to the server counter with `sendBeacon`. No
KPI is lost on either plan.

**Event plan** (#80 implements). Values are fixed enums or site paths, never form content, email,
phone, name, query string or identifier.

| Event | Properties | Fired when |
|---|---|---|
| `link_click` | `kind` (above), `location` | A `data-track` link is clicked |
| `contact_error` | `kind`: validation \| verification \| server | Form shows an error (diagnoses lost requests) |
| `article_read_end` | `slug` | End-of-body sentinel enters the viewport, once per view |
| (server) `contact` | `origin`: path of the page the CTA was clicked on (every contact CTA passes it), else `direct` | `/api/contact` sent the email |
| (server) `vcard` | none | `/carte/vcard` answered 200 |

`location` (one enum for all): header \| hero \| article \| contact_section (home `#contact`) \|
contact_page \| home_review (current « Votre avis ») \| footer \| carte \| legal \| not_found. #67
may add values; they are added here, once. No client `contact_submit` / `vcard_save` events: the
server counts are the single source.

**Consent (no banner):**
- Vercel Web Analytics and Speed Insights neither store nor read anything on the device: art. 82 loi
  Informatique et Libertés consent is not triggered.
- Even if it were, the CNIL audience-measurement exemption fits: the site's own statistics only,
  aggregates, no cross-site tracking or cross-referencing, Vercel as processor (DPA), ≤ 25 months.
- Still required: inform visitors in the policy and offer a right to object. A banner is needed only
  if a cookie, identifier, fingerprint or third-party tag is added (not planned). The server counter
  holds no personal data.

**Privacy-policy edits** (`politique-de-confidentialite/page.tsx`, with #80; Eva approves wording):
1. §3 table: add row « Mesure d'audience du Site » | « Données techniques de navigation (pages
   vues, type d'appareil, pays, page de provenance), pseudonymisées puis agrégées ; aucun cookie » |
   « Intérêt légitime du Cabinet à connaître la fréquentation de son Site ». Also fix the existing
   « Gestion des demandes de contact » row: the form also collects prénom, téléphone and objet, not
   only « Nom, email, contenu du message ».
2. §4: name the processors: Vercel Inc. (hébergement, détection des robots, mesure d'audience) and
   Brevo (acheminement des emails du formulaire). Remove the off-topic bullet about « services de
   paiement de loyer ».
3. §5 table: add « Mesure d'audience » | « 25 mois maximum » (or the shorter retention of the plan).
4. §7: the sentence « … stockées … au sein de l'Espace Économique Européen (« EEE ») » is false
   (Vercel is a US company, and already hosts the site and BotID). Replace with: data are stored in
   the EEE where possible; data processed by Vercel Inc. may be transferred to the United States
   under the EU-US Data Privacy Framework or the standard contractual clauses of Vercel's DPA
   (#80 verifies which applies on dataprivacyframework.gov and in the DPA).
5. New short paragraph: right to object to audience measurement (contact email), and that no cookie
   is used. Update « Date de dernière mise à jour ».

**Hobby vs Pro.** Only the sink of `link_click` and `article_read_end` changes (above). Check the
plan's analytics retention either way; the monthly row (§5) keeps the history.

## 7. Hand-offs

| Issue | Takes as input |
|---|---|
| #67 IA & navigation | Audience ranking (§1), J1/J2 priority 1 (§2); one contact action in the header on every page, phone on mobile; review ask out of the main nav; whether `/contact` exists (adds `location` values to the §6 enum) |
| #68 Copy & proof | Positioning A/B + hero candidate (§3) once Eva picks; CTA family without "rendez-vous" (§4); proof list (§3); privacy-policy wording (§6) for Eva's approval |
| #71 Home design | Hero = promise + audience + primary CTA + phone, above the fold on mobile; secondary paths (review, `/carte`) never compete with the CTA |
| #73 Publications design | Article end: author card, contextual contact CTA, related/next article; room for the `article_read_end` sentinel (K4, K5) |
| #74 Contact design | Three channels shown as equals, tel/mail first on mobile; states incl. error kinds (`contact_error`); no booking UI |
| #80 Home implementation | Ship tracking **first** (§5 pre-launch window): Analytics, Speed Insights, server counter, `data-track` mechanism and events (§6), privacy-policy edits, Brevo tag |
| #83 Contact implementation | Fire `contact_error`; forward the CTA's `origin` to `/api/contact`; contact links reuse the tracked components (no wiring of their own) |
| #86 QA & launch | Gate launch on the §5 pre-launch window; KPI reports at +1 and +3 months vs baseline (K1–K11); Search Console brand-query watch |

**Eva must provide:**

| Item | Needed for |
|---|---|
| Choice of variant A/B (or edits), CTA approval | §3, §4 |
| Proof items | §3 → #68 |
| Past contact requests per month, 6–12 months; monthly count of new calls/emails from launch | K1 |
| GBP insights export and access; Search Console access (or confirm none exists) | K8, K9, K11 |
| Approval of the privacy-policy wording | §6 |

## Open questions (for the user / Eva)

| Question | Recommendation |
|---|---|
| Positioning: A, B or edits? | A (audience first, current voice); B's opening line can feed the hero |
| CTA: contact request, no booking? | Yes; booking as a follow-up with the §4 conditions |
| Vercel plan: Hobby or Pro? | Either works (§6 sink switch); Pro if already paid, no plan change just for analytics |
| Search Console property and past contact counts? | Create/verify the property now; Eva counts the form emails (K1 baseline) |
| Split the tracking part of #80 into an early issue? | Yes, so the pre-launch window runs while design work happens |
