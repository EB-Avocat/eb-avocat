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

**Proof to ask Eva** (none of this is invented here): year of oath / years of practice; professions
actually served (santé? droit? chiffre? which ones first); number or share of clients, if she wants
to publish it; trainings given (organisers, audiences); memberships, mandates, diplomas; testimonials
with written consent; whether the Google rating may be shown; first-meeting format, response time
and fee information she accepts to state.

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

Window: calendar month (Europe/Paris) unless stated. "Article" = `/publications/<slug>`.

| # | KPI | Definition (counting rule) | Source | Baseline | Target | Owner |
|---|---|---|---|---|---|---|
| K1 | Contact requests / month | Form: POST `/api/contact` that returns `ok: true` **and** sent the email (honeypot drops excluded). Plus calls and emails from new people that Eva logs (count only) | Server-side counter (§6); Eva's monthly count | Form: count Brevo emails with subject starting "Contact site —" in Eva's inbox, last 6–12 months. Calls/emails: ask Eva, else unknown, measure from launch | ↑ | #80 (counter), #83, #86 |
| K2 | tel / mailto clicks | Clicks on a `tel:` link to `CONTACT.phone` or a `mailto:` link to `CONTACT.email` (not privacy@vercel.com, the médiateur, etc.), by `location` (event plan enum); 1 per click | Vercel custom events | Unknown, measure ≥ 4 weeks before launch. GBP "calls" as partial proxy | ↑ | #80, #83 |
| K3 | Contact-CTA clicks | Clicks on the primary contact CTA, by `location` | Vercel custom events | Hero "Prendre rendez-vous" today: unknown, measure before launch | ↑ | #80 |
| K4 | Publication reads | Page views of article pages; "engaged read" = `article_read_end` (end-of-body sentinel visible), once per page view | Vercel Web Analytics (+ custom event) | Page views: from Analytics once enabled (≥ 4 weeks pre-launch). Engaged: unknown, measure from launch | ↑ | #80, #73 |
| K5 | Reads → contact | (a) K1 form requests with `origin` = an article path; (b) `contact_cta_click` with `location=article` / article page views | Server counter + custom events | 0 by construction today (no article CTA, A-09); measure from launch | ↑ (a) count, (b) rate | #73, #80, #83 |
| K6 | `/carte` visits | Page views of `/carte` (mobile only today: desktop UA is redirected, A-11) | Vercel Web Analytics | Measure ≥ 4 weeks before launch | → / ↑ (depends on cards handed out) | #80 |
| K7 | vCard saves | Successful GET `/carte/vcard` (200), 1 per request (the route must run per request, not be prerendered or CDN-cached: #80 checks the build output and forces it dynamic if needed) | Server-side counter | Unknown, measure before launch (needs the counter) | ↑ as share of K6 | #80 |
| K8 | Review-link clicks | Clicks on `REVIEW_URL` links, by `location`. Proxy: GBP review count per month | Custom events; GBP | GBP: current review count (Eva) | ↑ | #80 |
| K9 | Search | Impressions, clicks, average position, monthly, split: brand queries (contain "biezunski") vs domaine queries (SEL, SCM, patientèle, Ordre, contentieux ordinal, "avocat … Lyon") | Search Console | Export 16 months of history if the property exists; else create it now (unknown until then) | Brand ≥ baseline (SEO protected); domaine ↑ | #78, #86 |
| K10 | Core Web Vitals | LCP, INP, CLS at p75, mobile and desktop, 28-day field data | Vercel Speed Insights | Lighthouse + CrUX snapshot of `/`, one article, `/carte` now (CrUX may lack data for a small site); Speed Insights ≥ 4 weeks pre-launch | Within #77 budgets, no regression | #77, #86 |
| K11 | GBP actions | Calls, website clicks, direction requests, monthly | Google Business Profile insights | Export last 6 months now (Eva) | ↑ | #86 |

**Pre-launch measurement (dependency):** the redesign must not launch before **≥ 4 full weeks** of
K1, K4 (page views), K6, K7, K10, plus K2 and K3 on Pro (custom events; on Hobby they do not exist,
see the fallback below), on the current site. The tracking part of #80 (analytics, counters, events on the
current components) must therefore ship first, ahead of the redesign; recommended as its own small
issue blocking #86 (lead to decide). Reports at launch +1 and +3 months compare with that window (#86).

## 6. Measurement approach

**Tools** (existing vendors only, no cookie):

| Tool | Measures | Notes |
|---|---|---|
| Vercel Web Analytics | Page views (K4, K6), custom events (K2, K3, K5b, K8) | First-party script path, no cookie; visitor hash salted daily, not stored. Custom events need **Pro** |
| Vercel Speed Insights | K10 | Field data, no cookie |
| Server-side counter | K1, K5a, K7 | Counted in our own code, immune to ad blockers. Proposed: daily aggregate rows (date, event, origin path) in the Django backend (UUID pk), written by `/api/contact` after a successful send and by `/carte/vcard`. No personal data |
| Brevo | K1 cross-check | Add a tag (e.g. `contact-site`) to the transactional email; compare Brevo's monthly count with the counter |
| Search Console, GBP | K9, K11 | No code on the site; Eva or Guillaume exports monthly |

**Event plan** (#80 implements). Property values are fixed enums or site paths, never form content,
email, phone, name, query string or identifier.

| Event | Properties | Fired when |
|---|---|---|
| `contact_cta_click` | `location`: header \| hero \| article \| contact_section (home `#contact`, current site) \| contact_page \| footer \| not_found | Primary contact CTA clicked |
| `contact_submit` | `origin`: path of the page the visitor came from (article CTA passes it), else `direct` | `/api/contact` answered `ok: true` (client event; close to the server count but not equal: a honeypot drop also answers `ok: true`, so the server counter is the reference) |
| `contact_error` | `kind`: validation \| verification \| server | Form shows an error (diagnoses lost requests) |
| `tel_click` / `mailto_click` | `location` (as above + carte + legal for mentions légales / politique) | `tel:` / `mailto:` link clicked |
| `vcard_save` | none | "Enregistrer le contact" tapped (server count is the reference) |
| `review_click` | `location`: home_review (current « Votre avis » section) \| footer \| article \| carte | Review link clicked |
| `article_read_end` | `slug` | End-of-body sentinel enters the viewport, once per view |

**Consent (no banner).** Vercel Web Analytics and Speed Insights store nothing on the device and do
not read device storage, so art. 82 loi Informatique et Libertés consent is not triggered; even if
it were, the use fits the CNIL audience-measurement exemption: strictly the site's own statistics,
anonymous aggregates, no cross-site tracking or cross-referencing, no use by Vercel for its own
purposes (processor under Vercel's DPA), retention ≤ 25 months. Conditions kept: inform visitors in
the privacy policy and give a way to object. A banner becomes necessary only if a cookie,
identifier, fingerprint or ad/third-party tag is added (not planned). The server counter holds no
personal data.

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

**Hobby vs Pro fallback.** Pro: everything above. Hobby: page views (K4, K6) and Speed Insights
(K10) only, no custom events. Then K1, K5a, K7 still come from the server counter; K2/K3/K8 are
lost, so the server counter also records CTA-originated contacts (`origin`) and K2 falls back to
GBP calls + Eva's call count. Check the plan's analytics retention either way; #86 keeps a monthly
snapshot in the epic so history survives it.

## 7. Hand-offs

| Issue | Takes as input |
|---|---|
| #67 IA & navigation | Audience ranking (§1), J1/J2 priority 1 (§2); one contact action in the header on every page, phone on mobile; review ask out of the main nav; whether `/contact` exists (sets `contact_cta_click` targets and `location` values) |
| #68 Copy & proof | Positioning A/B + hero candidate (§3) once Eva picks; CTA family without "rendez-vous" (§4); proof list to collect from Eva (§3); privacy-policy wording (§6) for Eva's approval |
| #71 Home design | Hero = promise + audience + primary CTA + phone, above the fold on mobile; secondary paths (review, `/carte`) never compete with the CTA |
| #73 Publications design | Article end: author card, contextual contact CTA carrying `origin`, related/next article; room for the `article_read_end` sentinel (K4, K5) |
| #74 Contact design | Three channels shown as equals, tel/mail first on mobile; states incl. error kinds (`contact_error`); no booking UI |
| #80 Home implementation | Ship tracking **first** on the current site (§5 dependency): Analytics, Speed Insights, server counter, event plan (§6), privacy-policy edits, Brevo tag |
| #83 Contact implementation | Fire `contact_submit`/`contact_error`; pass `origin` to the counter; tel/mailto events on contact links |
| #86 QA & launch | Gate launch on ≥ 4 weeks of baseline; KPI report at +1 and +3 months vs baseline (K1–K11); Search Console brand-query watch |

**Eva must provide:** approval of variant A or B (or her edits) and of the CTA decision; the proof
items in §3; past contact requests (form emails, calls, emails from new people) per month for 6–12
months; a monthly count of new calls/emails from launch (K1); GBP insights export and access;
Search Console access (or confirm none exists); approval of the privacy-policy wording.

## Open questions (for the user / Eva)

| Question | Recommendation |
|---|---|
| Positioning: A, B or edits? | A (audience first, current voice); B's opening line can feed the hero |
| CTA: contact request, no booking? | Yes; booking as a follow-up with the §4 conditions |
| Vercel plan: Hobby or Pro? | Pro if already paid (custom events); else Hobby + server counter fallback, no new vendor |
| Search Console property and past contact counts? | Create/verify the property now; Eva counts "Contact site —" emails for 6–12 months |
| Split the tracking part of #80 into an early issue? | Yes, so the 4-week baseline runs while design work happens |
