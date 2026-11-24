# Local SEO checklist (#78, task 2)

Owner: `ux`. Inputs: the code at `aa79811` and `frontend/src/lib/*` (**today**), #68 `copy.md` / `eva-content.md`
(**copy §n**, **E-nn**, approved by Eva 2026-11-24), #67 `ia.md` (**ia §n**), #66 `objectives.md` (**K11**), the
audit (**A-22**), and this feature's `metadata.md` (§4 JSON-LD) and `url-inventory.md` (§5 legacy URLs).
Monitoring of the results is in `monitoring.md`.

**Status values.** *done in copy* = the approved copy already says it; *to build* = an implementation issue
builds it (owner in the column); *Eva action* = only Eva (or the user) can do it, listed word for word in §3
so `lead` can forward it. A fourth value, *decided*, records a decision with no work left.

**What I could not check.** Nobody on the team has access to Eva's Google Business Profile (GBP), Search
Console, the Barreau de Lyon directory or LinkedIn. Every « today » for those says what the *site* shows and
what the public Maps URL reveals, not what is typed inside the profile. §3 turns each gap into a question for
Eva.

## 1. The one NAP (name, address, phone), written once

`CONTACT` in `frontend/src/lib/constants.ts` is the source (the copy placeholders `{{address}}`,
`{{phoneDisplay}}`, `{{email}}` resolve from it). Every listing, signature and profile uses these strings
**character for character**; the only allowed variants are the machine ones.

| Part | Canonical string | Allowed variant | Why this form |
|---|---|---|---|
| Name | Eva Biezunski | none. No keyword or job in the GBP name (« Eva Biezunski Avocat Lyon » can get the profile suspended) | The Barreau name; the same string as `SITE.name`, `Person.name`, `LegalService.name` |
| Address | 29 rue du Président Édouard Herriot, 69002 Lyon | « Edouard » without the accent where a directory strips accents; machine form in JSON-LD (`streetAddress` « 29 rue du Président Édouard Herriot », `postalCode` 69002, `addressLocality` Lyon, `addressCountry` FR) | `CONTACT.address` |
| Phone | 07 56 85 62 75 (display, non-breaking spaces) | `+33 7 56 85 62 75` (JSON-LD), `+33756856275` (`tel:` and vCard); never `+33 (0)7…` | `CONTACT.phone` |
| Email | eva@biezunski-avocat.fr | none | `CONTACT.email` |
| Website | `https://biezunski-avocat.fr/` | with `?utm_source=gbp` in the GBP website field only (§2 L13) | `SITE.url` |

The old WordPress site (2022, found in the web archive, `url-inventory.md` §5) showed **+33 (0)4 72 44 44 44**.
That number is not Eva's current line. If a directory still lists it, it is a NAP conflict (§3 A2).

## 2. Checklist

| # | Item | Today (evidence) | Target | Owner issue | Status |
|---|---|---|---|---|---|
| **Home page signals** | | | | | |
| L1 | Home `<title>` | « Eva Biezunski Avocate, Cabinet dédié aux professionnels libéraux » (64 characters, no Lyon; `SITE.title`, A-22) | « Eva Biezunski, avocate au Barreau de Lyon » (41, Lyon, no suffix; `SITE.title`, copy §1.1) | #79 (`copy.ts`, root layout) | done in copy; to build in #79 |
| L2 | Home meta description | « Cabinet d'avocat dédié aux professionnels libéraux : création de sociétés, clientèle/patientèle, contrats professionnels, contentieux, mécénat et formations. » (no Lyon, mécénat and formations are dropped) | « Avocate au Barreau de Lyon, j'accompagne les professionnels libéraux et les entrepreneurs : choix de la société, statuts, contrats, patientèle, Ordre. » (`SITE.description`, within 155, `metadata.md` §3) | #79 | done in copy; to build in #79 |
| L3 | Home h1 | « Avocate en droit des sociétés » (`HERO.heading` today; neither Lyon nor audience) | **Decision (lead, recorded here): keep the approved h1** « Structurer votre exercice libéral, en accord avec votre Ordre et vos associés. » It names the audience, not Lyon. Lyon is carried by the title (L1), the description (L2), the eyebrow `HERO.kicker` « Avocate au Barreau de Lyon » directly above the h1, the address in the hero panel (`HERO.panel.lines`), the footer NAP and `LegalService` (L9). Reason: Google weighs the title and the local signals far more than the h1 for « avocat … Lyon » queries, and reopening approved copy costs a round with Eva. **Revisit rule:** if `monitoring.md` C5 shows the home with impressions for « avocat … Lyon » queries but position > 10 at month 2, test a h1 or kicker variant with Eva then, not before | #80 (hero) | decided |
| L4 | Domaine titles carry Lyon | n/a (pages are new) | Two of four titles lack « Lyon » (`contrats-professionnels`, `ordre-et-deontologie`): problem P1 of `metadata.md` §3, kept at launch, revisited at month 1 (`monitoring.md` C5) | #81 | decided (P1) |
| **NAP everywhere** | | | | | |
| L5 | NAP in the site footer and on `/contact` | Address is plain text with a map pin icon and **no link** (`contactItems.ts` has no `href` for the address); phone and email are links. The only Google-profile link on the site is the review link in `Testimonials.tsx` (`REVIEW_URL`) | Footer and `/contact` show the §1 strings exactly, from `CONTACT`, and the address is a link to the GBP place (`GBP_URL`, `metadata.md` §4.2), new tab, accessible name `FOOTER.address.name` / `CONTACT.addressBlock.link` (« … s'ouvre dans un nouvel onglet ») | #80 (footer), #83 (`/contact`) | done in copy (names and visible text); to build |
| L6 | NAP in JSON-LD | `Attorney` with `telephone`, `PostalAddress`, no `geo`, no `hasMap`, `priceRange: "$$"` (A-20) | `LegalService` `#cabinet` on every page: `name`, `telephone` `+33 7 56 85 62 75`, `email`, `address`, `geo` 45.76494 / 4.8344, `hasMap` `GBP_URL`, `sameAs` [LinkedIn, `GBP_URL`] (`metadata.md` §4.3). Same strings as §1, from `CONTACT`, never retyped | #79 | to build |
| L7 | NAP in the vCard (`/carte/vcard`) | `FN` Eva Biezunski, `TEL;TYPE=CELL` `+33756856275`, `EMAIL`, `ADR` (street, Lyon, 69002, France), `URL` `SITE.url`. **`TITLE` « Avocate en droit des sociétés »** is the old wording | Same values from `CONTACT`; `TITLE` = `FOOTER.credential` « Avocate au Barreau de Lyon »; `URL` without a trailing path | #84 (`/carte`, vCard) | to build (one line) |
| L8 | NAP on the QR card page `/carte` | `Contact.tsx`-style items from `contactItems` | Same component data as the footer (one source); the card also gets the review link (`REVIEW.footerLink`) | #84 | to build |
| L9 | Cabinet type in structured data | `Attorney` | `LegalService` (`metadata.md` §4.2) | #79 | to build |
| L10 | NAP in the Google Business Profile | Not readable by the team. The public place URL behind `REVIEW_URL` carries coordinates **30.6959, −49.8171** (open ocean, mid-Atlantic): the pin is wrong, or the address is hidden (service-area setting) | Name, address, phone, website exactly as §1; the pin on 29 rue du Président Édouard Herriot (BAN: 45.76494, 4.8344); address visible, since Eva receives clients at the cabinet by appointment (E4e) | Eva (verified by #86) | **Eva action A1** |
| L11 | NAP on LinkedIn, the Barreau de Lyon directory, other listings, and the email signature | Unknown. The signature hot-links `/images/icons/*` and logos (`url-table §4`); its text is not in the repo. The 2022 site showed another phone number (§1) | The §1 strings in the LinkedIn contact info and company/profile (website field `https://biezunski-avocat.fr/`), the Barreau de Lyon directory profile, the signature, and any other directory Eva already has. **No new directory campaign** (link building is out of scope) | Eva | **Eva actions A2, A7** |
| **Google Business Profile ↔ site** | | | | | |
| L12 | Site → GBP | Review link only (`REVIEW_URL`, `maps.app.goo.gl/…`, opens the map, not the review form: #67 Q8, E9b skipped) | Address link in the footer, `/contact` and the static map (L21) → `GBP_URL` = `https://www.google.com/maps?cid=15633752146969655329` (the place's CID, decoded from `REVIEW_URL`, `metadata.md` §4.2); `hasMap` and `sameAs` in JSON-LD. **#86 checks that `GBP_URL` opens Eva's profile** before launch | #79 (constant), #80, #83 | to build |
| L13 | GBP → site | Unknown (E12: « which URL does your GBP use? » was answered « no contact URL shared anywhere », which says no deep link, not what the website field holds) | Website field = `https://biezunski-avocat.fr/` (home, never `/#contact`, never `/contact`). Optional `?utm_source=gbp`: lets Vercel Web Analytics show GBP visits next to K11 (the canonical ignores the parameter, `url-inventory.md` §3). **Update on launch day** | Eva | **Eva action A3** |
| L14 | GBP appointment / booking link | None | Leave empty. The site has no booking tool (#66 §4); `/contact` is the contact page, not a booking page | — | decided |
| L15 | GBP categories | Unknown | Primary: the category closest to « avocat en droit des sociétés / droit des affaires » **that Eva's category list offers**; secondary: « Avocat » and « Cabinet d'avocats » if offered (the category list varies and changes; check it in the dashboard). Nothing outside law | Eva | **Eva action A4** |
| L16 | GBP services, description, attributes | Unknown | Services = the four domaines, named as on the site (copy §4: « Création de sociétés », « Clientèle ou patientèle », « Contrats professionnels », « Ordre et déontologie »); description drafted from approved copy (§3 A4, ≤ 750 characters, no promise, no figure: ethics rules, E10); « Sur rendez-vous » attribute | Eva (text drafted here) | **Eva action A4** |
| L17 | GBP hours | Unknown. Eva receives **by appointment only** (E4e) | No invented hours. Use the « sur rendez-vous » option if the dashboard offers it, else leave the hours unset | Eva | **Eva action A4** |
| L18 | Review link | `REVIEW_URL` opens the place on the map, not the « write a review » box (#67 Q8). E9b (the direct link) was **skipped**; `/avis` is not printed or shown (E9c skipped) | Keep `REVIEW_URL` at launch (copy fallback). When Eva sends the direct link (GBP dashboard → « Demander des avis » → copy the link), change the one constant `REVIEW_URL`; `/avis` (302) follows with it (`url-inventory.md` R5) | #80 (constant), Eva | **Eva action A5** (optional) |
| L19 | Photos | Unknown | At least the portrait (`/images/portrait.jpeg`, same photo as the site: recognition) as profile photo, a logo, and 2–3 photos of the cabinet's entrance or office if Eva wants them. No stock photos, no photo of clients | Eva | **Eva action A6** |
| L20 | Google reviews and rating on the site | Review link only; Eva wants the reviews shown (E9a, answered); how they are pulled is a user decision still open; E9d (place ID) and E9e (API key) pending | No `aggregateRating` or `Review` JSON-LD (`metadata.md` §4.2: Google ignores self-served ratings on a `LocalBusiness`); the on-page block follows #80 | #80 | to build (E9d, E9e pending) |
| **`/contact` page** | | | | | |
| L21 | Static map, no iframe | None (no map anywhere; A-22) | An image on `/contact` in « Adresse et accès » (copy §9, ia §3), **no Google Maps iframe** (it sets cookies, #66 rule: nothing stored on the device without consent), the image links to `GBP_URL`, new tab. Source: a one-off export of OpenStreetMap tiles (openstreetmap.org « Exporter » or the IGN Géoportail tiles) centred on the BAN coordinates, committed as a static file (`public/images/plan-cabinet.webp`, 2 × 1200 × 600, < 100 KB), with the licence mention « © OpenStreetMap » **inside the image or under it, visible**. The Google Static Maps API is not used (key, billing, and its terms forbid storing the image). **Needs a copy key:** `CONTACT.addressBlock.mapAlt` for the alt text (proposal for #68: « Plan : 29 rue du Président Édouard Herriot, Lyon 2e »), and `CONTACT.addressBlock.mapCredit` for the OSM line. The design of #74 must show the slot | #83 (build), #74 (design), #68 (two keys) | to build; **copy keys missing** (relayed to lead) |
| L22 | Métro / access line | None. E4e (answered 2026-11-24): « Je vous reçois sur rendez-vous uniquement. » **No access details** | Not shipped. `CONTACT.addressBlock.access` carries the one sentence; no métro, tram, parking or floor. A line « Métro … » adds a small local signal and a visitor benefit, but Eva declined access details, so it stays out | #83 | decided (E4e). Reopen only if Eva volunteers it (§3 A4 mentions it as optional) |
| L23 | `ContactPage` JSON-LD with the address | None | `ContactPage` with `mainEntity` → `#cabinet` (`metadata.md` §4.3) | #83 | to build |
| **Profiles and consistency** | | | | | |
| L24 | `sameAs` and profile links | `sameAs: [LinkedIn]` | `[LinkedIn, GBP_URL]` on the cabinet; `[LinkedIn]` on Eva; add the Barreau de Lyon directory profile URL **only when Eva gives it** (A7) | #79 (constants), Eva | to build; Eva action A7 |
| L25 | `keywords` meta | A long `keywords` list in `layout.tsx` (ignored by Google, A-22) | Removed (`metadata.md` §1) | #79 | to build |
| L26 | Search Console property | None yet (#66 K9: « create it now ») | A Domain property `biezunski-avocat.fr` (DNS TXT), with Eva and the user as owners. It has to exist **before launch** to hold the old site's data, or the baseline is empty (`monitoring.md` §1) | User (DNS), Eva | **Eva / user action A8** |
| L27 | GBP insights baseline (K11) | None exported | Export the last 6 months (calls, website clicks, direction requests, searches) before launch (`monitoring.md` §1) | Eva | **Eva action A9** |

Not in scope and not done: link building, paid acquisition, citation campaigns, review solicitation tactics
(issue #78). The Barreau and other directories are checked for **consistency of what exists**, not extended.

## 3. Eva actions, worded to forward

Each block is French, ready to paste into a message. « Pourquoi » is one line so she can decide to skip it.
Suggested order: A1 and A2 first (they can hide the cabinet from local results), then A3 on launch day, then
the rest before launch. **Deadline:** all before the launch day `L` of `monitoring.md`, except A3 (on `L`).

**A1. Épingle ou adresse de la fiche Google (à vérifier en premier)**
> Eva, peux-tu ouvrir ta fiche Google Business Profile et vérifier deux choses ? 1) Que l'adresse affichée est
> bien « 29 rue du Président Édouard Herriot, 69002 Lyon » et que le repère sur la carte est bien à cette
> adresse. 2) Que l'option « Masquer mon adresse / zone de service » n'est pas activée (tu reçois sur rendez-vous
> au cabinet, l'adresse doit être visible). Le lien Google que le site utilise pour ta fiche pointe aujourd'hui
> sur des coordonnées au milieu de l'Atlantique (30,6959 ; −49,8171), ce qui laisse penser que l'adresse est
> masquée ou que le repère est mal placé. Pourquoi : une épingle au mauvais endroit ou une adresse masquée
> empêche la fiche d'apparaître dans les recherches « avocat Lyon » et sur la carte.

**A2. Ancien site et ancien numéro**
> Eva, un ancien site WordPress a existé à cette adresse en 2022 (pages « /avocate/ » et « /coaching/ »). Il
> affichait le numéro 04 72 44 44 44, qui n'est pas ton numéro actuel : c'était peut-être le numéro d'exemple du
> thème. Peux-tu regarder si cet ancien numéro, ou le lien « biezunski-avocat.fr/avocate », apparaît encore
> quelque part : annuaire du Barreau de Lyon, ton profil sur le site du Barreau, LinkedIn, une ancienne signature
> d'email, une carte de visite, un annuaire en ligne ? Si oui, dis-moi où : je fais corriger le numéro
> (07 56 85 62 75) ou le lien. Pourquoi : deux numéros pour le même cabinet brouillent la fiche Google ; et le
> lien « /avocate » est redirigé vers l'accueil au lancement du nouveau site.

**A3. Site web de la fiche Google (le jour du lancement)**
> Eva, le jour du lancement du nouveau site, dans ta fiche Google, champ « Site Web », mets exactement :
> `https://biezunski-avocat.fr/?utm_source=gbp`. (Pas de « /contact », pas de « #contact ».) Pourquoi : ça envoie
> les visiteurs de la fiche vers l'accueil et nous permet de compter les visites venant de ta fiche.

**A4. Catégories, services, description, horaires de la fiche**
> Eva, dans ta fiche Google : 1) Catégorie principale : la plus proche de « avocat en droit des sociétés / droit
> des affaires » dans la liste que Google te propose ; catégories secondaires : « Avocat » et « Cabinet
> d'avocats » si elles sont proposées. Rien d'autre qu'une activité juridique. 2) Services : ajoute les quatre
> domaines du site, avec ces intitulés : « Création de sociétés », « Clientèle ou patientèle », « Contrats
> professionnels », « Ordre et déontologie ». 3) Description (750 caractères maximum) : « Avocate au Barreau de
> Lyon, j'accompagne les professionnels de santé, les autres professions libérales et les entrepreneurs :
> choix de la société, rédaction des statuts, cession ou apport de patientèle, contrats de collaboration et de
> remplacement, relations avec l'Ordre et contentieux ordinal. Cabinet situé au 29 rue du Président Édouard
> Herriot, 69002 Lyon, sur rendez-vous. » À corriger comme tu veux : c'est ton texte. 4) Horaires : n'invente
> aucun horaire. Si Google propose « Sur rendez-vous », choisis-le ; sinon laisse les horaires vides. 5) Ne
> mets pas de lien de prise de rendez-vous. (Facultatif : si tu veux donner une indication d'accès, métro ou
> parking, dis-le-moi ; tu avais préféré n'en donner aucune, ce choix tient.) Pourquoi : Google compare la fiche
> au site ; des services et des catégories qui disent la même chose que le site renforcent les deux.

**A5. Lien direct pour laisser un avis (facultatif)**
> Eva, le lien d'avis actuel (« maps.app.goo.gl/… ») ouvre la fiche, pas directement la fenêtre « Écrire un
> avis ». Dans ta fiche Google : « Demander des avis » → copie le lien et envoie-le-moi. Je le mets à la place du
> lien actuel sur le site (pied de page, fin d'article, page « carte »). Pourquoi : un clic de moins pour tes
> clients, donc plus d'avis. (Si tu préfères garder le lien actuel, rien à faire.)

**A6. Photos de la fiche**
> Eva, dans ta fiche Google, ajoute : ta photo de profil (la même que sur le site), le logo, et si tu le
> souhaites 2 ou 3 photos du cabinet (entrée, bureau). Pas de photo de clients. Pourquoi : une fiche avec des
> photos reçoit plus de clics, et la même photo partout aide à te reconnaître.

**A7. Mêmes coordonnées partout**
> Eva, peux-tu vérifier que ton nom, ton adresse, ton téléphone et ton site sont écrits de la même façon sur :
> ta fiche Google, ton profil LinkedIn (champ « Site web » : `https://biezunski-avocat.fr/`), l'annuaire du
> Barreau de Lyon, ta signature d'email, et tout autre annuaire où tu es déjà inscrite ? Modèle : « Eva
> Biezunski, avocate au Barreau de Lyon, 29 rue du Président Édouard Herriot, 69002 Lyon, 07 56 85 62 75,
> eva@biezunski-avocat.fr, biezunski-avocat.fr ». Envoie-moi l'adresse web de ton profil dans l'annuaire du
> Barreau de Lyon : je l'ajoute au site (lien « sameAs » invisible, pour que Google relie les profils). Pas
> besoin de t'inscrire ailleurs. Pourquoi : des informations identiques partout confirment à Google qu'il s'agit
> du même cabinet.

**A8. Search Console (avant le lancement)**
> Eva (ou toi, [l'utilisateur]), crée une propriété « Domaine » `biezunski-avocat.fr` dans Google Search Console
> (vérification par un enregistrement DNS TXT chez le gestionnaire du domaine), et ajoute l'autre personne comme
> propriétaire. À faire le plus tôt possible : Search Console ne montre l'historique qu'à partir du jour de sa
> création, et cet historique sert à vérifier après le lancement que le site ne perd pas ses visites. Pourquoi :
> sans cela, on ne peut pas savoir si le nouveau site fait mieux ou moins bien que l'ancien.

**A9. Statistiques de la fiche Google (avant le lancement)**
> Eva, dans ta fiche Google → « Performances » : exporte ou fais une capture des 6 derniers mois (appels, clics
> sur le site, demandes d'itinéraire, recherches) et envoie-les-moi. Note aussi le nombre d'avis et la note
> actuelle. Pourquoi : c'est le point de départ pour savoir, après le lancement, si la fiche attire plus ou
> moins qu'avant.

## 4. Summary by owner

| Owner | Items |
|---|---|
| #79 | L1, L2, L6, L9, L12 (constant `GBP_URL`), L24, L25 |
| #80 | L3, L5 (footer), L12, L18, L20 |
| #83 | L5 (`/contact`), L12, L21, L22, L23 |
| #84 | L7, L8 |
| #81 | L4 |
| #74 (design) | L21 (map slot) |
| #68 (via lead) | L21: copy keys `CONTACT.addressBlock.mapAlt`, `CONTACT.addressBlock.mapCredit` |
| #86 | Verifies L12 (`GBP_URL` opens the profile), L10 after Eva's fix (the Maps pin), L13 on launch day |
| Eva | A1 to A7, A9 (L10, L11, L13, L15 to L19, L24, L27) |
| Eva and the user | A8 (L26) |
