# Copy (#68, task T-502 draft)

French copy for every page of the #67 IA, in IA order, one stable key per slot. English notes, French
quoted as is. **T-503 version**: Eva's part 1 answers (relayed 2026-11-24) are applied. The `[À CONFIRMER : …]`
markers still in the file wait for her part 2 or for answers not given yet (row id in `eva-content.md`;
the list is in § 13); each has its fallback written here, so design never waits (spec §4.5). The
last version of `copy.md` has no marker left; Eva approves it as a whole.

Inputs: `editorial-guide.md` (the rules; cited as **G §n**), `spec.md`, `ux-brief.md`, #66
`objectives.md` (positioning A, §6 privacy), #67 `ia.md` (cited as **IA §n**), `constants.ts`.

## 0. How to read this file

**Format.** Each slot is a key in code font, then its French text in a quote block (`>`). A quote block
is the exact string `copy.ts` will hold. A plain line under it is a note (reason, limit, link to Eva's
answer). Only quote-block text is French copy; everything else is for the team.

**Typography.** Quote blocks use the real characters of G §5 (U+00A0 before `» : ; ? !` and after `«`,
`'`, `…`). Plain-text notes do not.

**Placeholders (not retyped in prose, G §5):**

| Placeholder | Resolved by `copy.ts` from | Example |
|---|---|---|
| `{{phoneDisplay}}` | `CONTACT.phone`, displayed `07 56 85 62 75` with U+00A0 | link text |
| `{{email}}` | `CONTACT.email` | `eva@biezunski-avocat.fr` |
| `{{address}}` | `CONTACT.address` | `29 rue du Président Édouard Herriot, 69002 Lyon` |
| `{{year}}` | build year (copyright) | `2026` |
| `{{limit.name}}`, `{{limit.email}}`, `{{limit.phone}}`, `{{limit.subject}}`, `{{limit.message}}`, `{{limit.urls}}` | `CONTACT_LIMITS` | `100`; `5 000` |

Note for `ui`: `maxChars` in `constants.ts` uses `toLocaleString("fr-FR")`, which writes a narrow
no-break space (U+202F), not U+00A0 (G §5). Format the thousands separator with U+00A0 in `copy.ts`.

**Key names.** A key holds either a string or an object, never both: where today's key is a string
(`CONTACT.address`, `PUBLICATIONS.readMore`, `HERO.subheading`), the new sub-keys get a flat sibling name
(`CONTACT.addressBlock.*`, `PUBLICATIONS.readMoreName`). Surviving blocks keep today's export name (`HERO`, `ABOUT`, `CONTACT`, `FOOTER`,
`NOT_FOUND`, `ERROR_PAGE`, `QR_CARD`, `PUBLICATIONS`). New blocks: `SITE` (extended), `HEADER`,
`BREADCRUMB`, `REVIEW`, `CONTACT_BAND`, `PROOF`, `DOMAINES`, `FIRST_CONTACT`,
`ARTICLE`, `GLOBAL_ERROR`, `PRIVACY`. `FORMATIONS` is not created (R8). `SERVICES` becomes `DOMAINES` (the word « services » is
avoided, G §2). `REVIEW_CTA` becomes `REVIEW` (the home review band is gone, IA §5). `NAV_LINKS` and
`PUBLICATIONS_LINK` become `HEADER.nav` (no more hash anchors, IA §4). Arrays use the slug as index:
`DOMAINES.items[creation-de-societe].faq[0].q`.

**Status marks.** `[À CONFIRMER : … (E4d)]` = Eva must confirm; the id is the row in
`eva-content.md`. « Fallback » = the text to use if the answer does not come, or the instruction to
drop the block.

**Decisions recorded here** (from `lead`, T-501 review):
- **R1. Domaine label « Création de sociétés » (plural).** The IA page, today's `constants.ts` and the
  contact subject option all use the plural; the slug stays `creation-de-societe`. The guide examples
  now use the plural too. One label everywhere: nav panel, footer, cards, breadcrumb, « Autres
  domaines », subject option, article end.
- **R2. Article-end domaine link reads « Voir le domaine : [domaine] »**, not the IA working label
  « En savoir plus : [domaine] » (IA §8 rule 2). Reason: « en savoir plus » is a banned link label
  (G §2, §3.2); the new wording says where the link goes.
- **R3. « Contacter le cabinet »** stays the one primary CTA label (decided with Eva in #66; no question
  to Eva).
- **R4. Legal pages** (`/mentions-legales`, `/politique-de-confidentialite`) keep their defined terms
  (« le Cabinet », « Données »). They are third-person legal text (G §1.1). The « Cabinet » capital
  rule and `check-copy.ts` skip them. « Maître » is not used in copy; the legal pages are #75's call
  with Eva (G §10 D4). The mentions légales are out of scope here.
- **R5. Acronyms**: each page glosses its own first use (« société d'exercice libéral (SEL) »). Plain
  words come first in cards, headings and nav; searched acronyms appear in domaine meta and lead only
  with the gloss in the lead (G §4.1).
- **R6. « Ordre »** is glossed on the pages where it is the topic (`/domaines`, `ordre-et-deontologie`,
  `/a-propos`), not in the home hero, where the reader knows the word (ux-brief, « Who reads »). On `/domaines` the lead
  repeats the approved promise (« votre Ordre ») before the gloss in `forWhom.text`: a documented exception,
  the gloss is the next block.
- **R7. Changes against IA §2 and §3 (Eva, part 1, 2026-11-24).**
  - **E6, Formations dropped.** No `/a-propos#formations` section, no pointer on `/domaines`, no
    « Formations » subject option, no « formations » in `HOME.domaines`. IA §3 loses the Formations block
    of `/a-propos`. Removed from this file: `FORMATIONS.*`, `DOMAINES.formations.*`; « mes formations » in
    `HOME.proof.link` and `ABOUT.metaDescription`.
  - **E7, Mécénat dropped (no longer active).** No `/domaines#mecenat` section, no « Également » line on
    the home (nothing is left in it, IA §6), no « Mécénat » subject option, no mécénat glossary rows
    (guide §4.5 removed). Removed from this file: `DOMAINES.mecenat.*`, `HOME.domaines.also`.
  - The four domaines stay the only domaines (IA §2: 4 core domaines).
- **R8. No `FORMATIONS` block.** The key family is not created; `ui` does not build a Formations block,
  anchor or subject option.
- **R9. Consent and rating (E8, E9).** Google reviews are shown, not typed in by hand: `copy.md` covers the
  slots (heading, rating line, update line, attribution, link, author and date labels), never the review
  text. How the reviews are pulled in is a user decision still open; the copy is the same either way.

---

## 1. Global (every page)

### 1.1 Site

`SITE.name`
> Eva Biezunski

`SITE.title` (home meta title)
> Eva Biezunski, avocate au Barreau de Lyon

41 characters. The home title carries the name once and no `| Eva Biezunski` suffix (G §7, D3).

`SITE.titleSuffix` is the string ` | Eva Biezunski` (one leading space, 16 characters). The `metaTitle` values in this
file are shown with the suffix already appended: `copy.ts` either builds them from the page part plus
`SITE.titleSuffix` or keeps the full strings, never both.

`SITE.titleSuffix` (appended to every other meta title)
> | Eva Biezunski

`SITE.description` (home meta description)
> Avocate au Barreau de Lyon, j’accompagne les professionnels libéraux et les entrepreneurs : choix de la société, statuts, contrats, patientèle, Ordre.

`SITE.url` stays `https://biezunski-avocat.fr`.

### 1.2 Header (IA §4)

`HEADER.logoLabel` (accessible name of the logo link)
> Eva Biezunski, avocate, retour à l’accueil

`HEADER.skipLink`
> Aller au contenu

Only if the app has a skip link (A-18); the label is ready.

`HEADER.nav.domaines` (disclosure button)
> Domaines

`HEADER.nav.aPropos`
> À propos

`HEADER.nav.publications`
> Publications

All three ≤ 12 characters (G §7). Nav `aria-label`:

`HEADER.navLabel`
> Menu principal

`HEADER.domainesPanel.all` (last link of the panel, also in the mobile menu and the footer)
> Tous les domaines

The four panel links use `DOMAINES.items[slug].label` (§1.8). No description line.

`HEADER.cta` (primary CTA, desktop header and mobile menu)
> Contacter le cabinet

`HEADER.phone.name` (accessible name of the phone link; visible text is `{{phoneDisplay}}`)
> Appeler le cabinet au {{phoneDisplay}}

`HEADER.call.label` (mobile header button, visible text)
> Appeler

`HEADER.call.name` (accessible name of the mobile call button; contains the visible label, WCAG 2.5.3)
> Appeler le cabinet au {{phoneDisplay}}

`HEADER.menu.open`
> Menu

`HEADER.menu.close`
> Fermer

`HEADER.menu.email.name` (mobile menu email link; visible text is `{{email}}`)
> Envoyer un email au cabinet : {{email}}

### 1.3 Breadcrumb (IA §9; domaine pages and articles only)

`BREADCRUMB.label` (`aria-label` of the `<nav>`)
> Fil d’Ariane

`BREADCRUMB.home`
> Accueil

`BREADCRUMB.domaines`
> Domaines

`BREADCRUMB.publications`
> Publications

The last crumb is the page title (domaine label or article title).

### 1.4 Footer (IA §7)

`FOOTER.navLabel`
> Pied de page

`FOOTER.credential` (identity block)
> Avocate au Barreau de Lyon

`FOOTER.address.name` (accessible name of the address link, the visible text is `{{address}}`)
> {{address}}, voir sur la carte (s’ouvre dans un nouvel onglet)

`FOOTER.phone.name`
> Appeler le cabinet au {{phoneDisplay}}

`FOOTER.email.name`
> Envoyer un email au cabinet : {{email}}

`FOOTER.linkedin.label`
> LinkedIn

`FOOTER.linkedin.name`
> Mon profil LinkedIn (s’ouvre dans un nouvel onglet)

`FOOTER.groups.domaines.title` (label, not a heading, IA §7)
> Domaines

Its links: the four `DOMAINES.items[slug].label`, then `HEADER.domainesPanel.all`.

`FOOTER.groups.cabinet.title`
> Le cabinet

`FOOTER.groups.cabinet.links`
> À propos
> Publications
> Contact
> Laisser un avis

The first three are internal links to `/a-propos`, `/publications`, `/contact`. The last is
`REVIEW.footerLink` (§1.5). « Contact » is a plain text link here; no CTA button in the footer (IA §7).

`FOOTER.copyright`
> © {{year}} Eva Biezunski, avocate au Barreau de Lyon. Tous droits réservés.

Third person is allowed here (G §1.1). The hyphen of today's line becomes a comma (G §5).

`FOOTER.legalNotice`
> Mentions légales

`FOOTER.privacyPolicy`
> Politique de confidentialité

`FOOTER.credit.prefix`
> Site créé par

`FOOTER.credit.name`
> Guillaume Ojardias

`FOOTER.credit.suffix` (hidden, part of the accessible name)
> (s’ouvre dans un nouvel onglet)

### 1.5 Review ask (IA §5; G §3.3)

`REVIEW.footerLink` (footer, « Le cabinet » group; also `/carte`)
> Laisser un avis

`REVIEW.externalSuffix` (hidden suffix of every review link)
> (Google, s’ouvre dans un nouvel onglet)

`REVIEW.articleLine` (end of article, one line below the contact block)
> Vous avez fait appel à moi ?

Followed by the link `REVIEW.footerLink`. It replaces the IA working label « Client du cabinet ? Laisser
un avis »: « je », and no gendered « cliente/client ». The home band `REVIEW_CTA` (« Votre avis compte »)
is removed with the section (IA §5).

`REVIEW.shortUrl` (printed or spoken form of the `/avis` short link, for the card and signatures)
> biezunski-avocat.fr/avis

Used only if Eva agrees to print it (E9c, not answered yet: the short link is not printed or shown until she does).

### 1.6 Contact band (every page end except `/contact`; IA §8)

One component, one heading, one CTA, one line that changes with the page.

`CONTACT_BAND.heading`
> Parlons de votre situation

`CONTACT_BAND.cta`
> Contacter le cabinet

`CONTACT_BAND.phoneLead` (before the phone link)
> Ou appelez-moi :

`CONTACT_BAND.lines.home`
> Décrivez-moi votre projet en quelques lignes, ou appelez-moi. Je lis chaque demande. [À CONFIRMER : pratique d’Eva (E4f)]

`CONTACT_BAND.lines.domaines`
> Vous ne savez pas quel domaine correspond à votre situation ? Écrivez-moi, nous la regarderons ensemble.

`CONTACT_BAND.lines.creation-de-societe`
> Vous créez ou réorganisez une société ? Décrivez-moi votre projet, ou appelez-moi.

`CONTACT_BAND.lines.cession-clientele-patientele`
> Vous préparez une cession ? Écrivez-moi avant la signature : je regarde le projet avec vous.

`CONTACT_BAND.lines.contrats-professionnels`
> Un contrat à signer ou à écrire ? Décrivez-moi la situation, ou appelez-moi.

`CONTACT_BAND.lines.ordre-et-deontologie`
> Votre Ordre vous a écrit, ou vous avez une question de déontologie ? Écrivez-moi ou appelez-moi.

`CONTACT_BAND.lines.publications`
> Vous ne trouvez pas la réponse à votre question ? Écrivez-moi.

`CONTACT_BAND.lines.aPropos`
> Vous voulez savoir si je peux vous aider ? Écrivez-moi quelques lignes, ou appelez-moi.

The home band also shows email and address (IA §6); the other bands show CTA and phone. « Je lis chaque
demande » is a fact only Eva can confirm (E4f): fallback is to drop that sentence.

### 1.7 Proof blocks (home teaser, `/a-propos`; register in `proof.md`)

Every block is conditional. A block whose proof item has no confirmed answer is **not rendered** (no empty
heading).

`PROOF.credentials.items` (list of facts; E1: 2020, no diploma or membership given)
> Avocate au Barreau de Lyon depuis 2020

One fact. The oath was taken on 12 novembre 2020; the site says the year only. No diploma line, no
membership line unless part 2 brings them (E1b and E1c are closed as « none given »). The official
specialisation question (E1d) stays open: no claim of specialisation until Eva answers.

`PROOF.professions` (E2: every liberal health profession, the other liberal professions)
> Je travaille avec toutes les professions de santé libérales, avec les autres professions libérales et avec les entrepreneurs.

`PROOF.rating` and `PROOF.reviews` (E8, E9; Google reviews shown on the site, how they are pulled in is a
user decision; one block, rendered only if Google returns at least one rating)

`PROOF.reviews.heading` (h2 on `/a-propos`, h3 in the home teaser)
> Avis de mes clients sur Google

`PROOF.rating.line` (`{{rating}}` and `{{count}}` come from Google)
> Note Google : {{rating}} / 5 ({{count}} avis)

`PROOF.rating.updated`
> Mis à jour le {{date}}

Format for `ui` (G §5): `{{rating}}` with a decimal comma (`4,8`, not Google's `4.8`); `{{date}}` as « 2 décembre 2026 »
(never a relative date such as « il y a 2 mois »).

`PROOF.reviews.attribution`
> Avis publiés sur Google

`PROOF.reviews.item.author` (up to 5 items; first name as returned by Google; the review text is shown as
Google returns it, never edited or typed here)
> {{firstName}}

`PROOF.reviews.item.date`
> {{date}}

`PROOF.reviews.item.name` (accessible name of each review, so the author and date are read first)
> Avis de {{firstName}}, {{date}}

`PROOF.reviews.link` (visible text; opens a new tab)
> Voir tous les avis sur Google

`PROOF.reviews.link.name` (accessible name, says the new tab)
> Voir tous les avis sur Google (s’ouvre dans un nouvel onglet)

Rule: no selection of the review text by the copy, no reply text, no star icon without the number next to
it. If Google returns no review, or the call fails, the whole block is not rendered (no empty heading).

`PROOF.testimonials` (written consent, E8)
Status: **none yet**, so the block is not rendered at launch. The format stays for later; no quote
ships without the consent record of `proof.md` §1. Consent wording and the Barreau's rule are with Eva:
[À CONFIRMER : consentement et règle du Barreau sur les témoignages (E8b, E8c)]

`PROOF.testimonials.heading`
> Ce que disent mes clients

`PROOF.testimonials.items[i]` (2 to 4 items, only with written consent)
> « {{quote}} »
> {{author}}, {{profession}}, {{monthYear}}

`PROOF.portrait.alt`
> Portrait d’Eva Biezunski, avocate au Barreau de Lyon

Figures (`PROOF.figures`) are dropped: Eva gave none (E10). No figure on the site.

### 1.8 Domaine list (one source for every domaine link, IA §2)

The same four entries feed header panel, footer, home cards, hub, « Autres domaines », article end,
subject options. `hasPage` is set by Eva's validation of each page (launch gate, §3 and §4–§7); a domaine
without a page links to `/domaines#<slug>` and renders its **hub section** (§3.4).

`DOMAINES.items[creation-de-societe].label`
> Création de sociétés

`DOMAINES.items[cession-clientele-patientele].label`
> Clientèle ou patientèle

`DOMAINES.items[contrats-professionnels].label`
> Contrats professionnels

`DOMAINES.items[ordre-et-deontologie].label`
> Ordre et déontologie

The cession label replaces the working label « Clientèle / patientèle » (no slash, G §2). The ordre label
replaces « Contentieux » (IA §2).

Card texts (home cards §2.2 and hub cards §3.3; ≤ 40 words; benefit, then what I do; no unglossed acronym):

`DOMAINES.items[creation-de-societe].card`
> Vous vous installez ou vous vous associez ? Je choisis avec vous la société adaptée, j’en rédige les statuts (ses règles de fonctionnement) et je fais les démarches devant votre Ordre.

`DOMAINES.items[cession-clientele-patientele].card`
> Vous reprenez ou vous cédez une clientèle ou une patientèle ? Je vous conseille sur la forme la plus adaptée, vente, apport à une société ou prêt, et je rédige l’acte avec vous. [À CONFIRMER : « prêt » (E3b)]

`DOMAINES.items[contrats-professionnels].card`
> Vous rejoignez un confrère, vous le remplacez ou vous exercez à ses côtés ? Je rédige et je négocie le contrat qui fixe les règles, y compris celles du départ.

`DOMAINES.items[ordre-et-deontologie].card`
> Une question sur les règles de votre profession (la déontologie), un échange avec votre Ordre, une procédure disciplinaire ? Je vous conseille et, si besoin, je vous défends devant le Conseil de l’Ordre.

The card follows today's « Je représente les professionnels libéraux devant les Conseils de l'Ordre ».
Order of the four on the home and the hub (E3): Création de sociétés, Clientèle ou patientèle, Contrats
professionnels (the three of today's home lead), then Ordre et déontologie.

---

## 2. Home `/` (IA §6 order)

### 2.1 Meta and hero

`HOME.metaTitle` = `SITE.title` (§1.1). `HOME.metaDescription` = `SITE.description`.

`HERO.kicker` (≤ 30)
> Avocate au Barreau de Lyon

`HERO.heading` (h1, 78 characters, 12 words; a candidate: Eva approved the positioning paragraph of #66 §3, not this line)
> Structurer votre exercice libéral, en accord avec votre Ordre et vos associés.

`HERO.subheading` (audience line, positioning A; E2: health, the other liberal professions, entrepreneurs)
> J’accompagne les professionnels de santé, les autres professions libérales et les entrepreneurs, de la création de leur société aux démarches devant leur Ordre.

« Accompagner » is the umbrella verb, used once on the page (G §2). The variant `HERO.subheadingWithProfessions`
is dropped: this line names the professions, so only one subheading exists.

`HERO.cta`
> Contacter le cabinet

`HERO.phoneLead`
> Ou appelez-moi :

Then the phone link, visible text `{{phoneDisplay}}`, accessible name `HEADER.phone.name`.

`HERO.panel.lines` (Sand panel, set in type, brand §6.3; three lines, no heading)
> Barreau de Lyon
> Droit des sociétés, exercice libéral
> {{address}}

`HERO.panel.since` (fourth line, E1)
> Inscrite au Barreau depuis 2020

### 2.2 Domaines teaser (id `domaines-intervention`)

`HOME.domaines.heading` (h2)
> Comment je peux vous aider

`HOME.domaines.cards` = the four `DOMAINES.items[slug]` (`label` as card title and link text, `card` as text). The card link goes to `/domaines/<slug>`, or to `/domaines#<slug>` if the page missed the gate.

`HOME.domaines.all`
> Tous les domaines

Order (E3): Création de sociétés, Clientèle ou patientèle, Contrats professionnels, Ordre et déontologie.
The first three are the domaines of today's home lead; the Ordre comes fourth. The « Également » line of
IA §6 is removed (R7): nothing is left in it.

### 2.3 Proof teaser (id `a-propos`)

`HOME.proof.heading` (h2)
> Qui je suis

`HOME.proof.text` (2 sentences, from the approved positioning and today's `ABOUT`)
> Aider les professionnels libéraux à se structurer et à garder de bonnes relations avec leurs associés est le cœur de mon activité. Dès la création, je pense à la suite : vos projets, l’arrivée d’un associé, un départ.

`HOME.proof.link`
> Mon parcours

→ `/a-propos`. Under the text: `PROOF.credentials.items`, then `PROOF.reviews` and `PROOF.testimonials` when they render
(§1.7). Portrait alt: `PROOF.portrait.alt`.

### 2.4 Publications teaser (id `publications`)

`HOME.publications.heading` (h2)
> Mes publications récentes

`HOME.publications.intro`
> J’y explique en mots simples les questions que se posent les professionnels libéraux.

`HOME.publications.viewAll` = `PUBLICATIONS.viewAll` (§10). Card link: `PUBLICATIONS.readMore` with the title in the
accessible name (`PUBLICATIONS.readMoreName`, §10). Block hidden if 0 articles or the API fails (IA §6).

### 2.5 « Comment ça se passe » (id `premier-contact`, conditional)

Eva answered the delay and the fee principle (E4, E5), not the format or the cost of the first exchange.
The step « Nous fixons un premier échange » is therefore **removed** (E4a and E4b, fallback applied: no
format, no price, no duration named). Steps follow what the reader lives: write, get my answer, prepare,
fees.

`FIRST_CONTACT.heading` (h2)
> Comment ça se passe

`FIRST_CONTACT.steps[0]` (title, text)
> Vous m’écrivez ou vous m’appelez
> Par le formulaire, par email ou par téléphone, comme vous préférez. Dites-moi votre situation en quelques lignes.

`FIRST_CONTACT.steps[1]`
> Je vous réponds
> Je vous réponds en général sous 48 heures.

A habit, not a guarantee (E4). No « jours ouvrés » unless Eva says so. Same sentence in `CONTACT.formMessages.success`
and `CONTACT.delay.text`.

`FIRST_CONTACT.steps[2]`
> Vous préparez l’essentiel
> Apportez ce que vous avez : statuts ou projet de contrat, courriers de votre Ordre, dates importantes. [À CONFIRMER : liste d’Eva (E4d)]

Fallback for the marker: keep this generic list (every item is general).

`FIRST_CONTACT.steps[3]`
> Je vous indique mes honoraires
> Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.

E5: Eva always signs one. The principle only: no « forfait », no « temps passé », no figure.

**Fallback** (if Eva rejects the block in her final read): the block is dropped (IA §6, « conditional »).

### 2.6 Contact band (id `contact`)

`CONTACT_BAND.heading`, `CONTACT_BAND.lines.home`, `CONTACT_BAND.cta`, phone, email, `{{address}}` (§1.6). No form.

---

## 3. Domaines `/domaines`

### 3.1 Meta, heading, lead

`DOMAINES.hub.metaTitle` (page part 23)
> Domaines d’intervention | Eva Biezunski

`DOMAINES.hub.metaDescription`
> Création de sociétés, clientèle ou patientèle, contrats, Ordre et déontologie : les domaines où j’accompagne les professionnels libéraux, à Lyon.

`DOMAINES.hub.h1` (the long form « domaines d'intervention » is allowed here, G §2)
> Mes domaines d’intervention

`DOMAINES.hub.lead` (2 sentences)
> Quatre domaines, un même fil : structurer votre exercice libéral, en accord avec votre Ordre et vos associés. Choisissez celui qui ressemble à votre situation.

### 3.2 « Pour qui »

`DOMAINES.hub.forWhom.heading` (h2)
> Pour qui

`DOMAINES.hub.forWhom.text`
> Je travaille avec les professionnels de santé libéraux, les autres professions libérales et les entrepreneurs. Vous créez, vous reprenez ou vous réorganisez votre activité, ou votre Ordre, l’organisme qui réunit les membres de votre profession, vous interroge.

The line `DOMAINES.hub.forWhom.professions` is dropped: the professions are named in the text above (E2).

### 3.3 The four cards

Cards use `DOMAINES.items[slug].label` (title and link) and `.card` (text), §1.8. Each card has the id
`<slug>`, kept even after its page exists (IA §2).

### 3.4 Hub section of a domaine whose page missed the launch gate

If Eva does not validate a page, no URL is created and the domaine keeps this section. It replaces the
card on `/domaines`; `.situations` are the first three titles of the page's situations (§4 to §7). Every
link to the domaine points to `/domaines#<slug>`.

`DOMAINES.items[creation-de-societe].hubSection.text`
> Je choisis avec vous la société adaptée à votre profession. Par exemple une société d’exercice libéral (SEL) pour exercer, ou une société civile de moyens (SCM) pour partager matériel et locaux. Je rédige les statuts, le document qui fixe les règles de la société, et je fais les démarches devant votre Ordre.

`DOMAINES.items[cession-clientele-patientele].hubSection.text`
> Une cession est la vente ou le transfert d’une clientèle ou d’une patientèle. Je vous conseille sur la forme la plus adaptée : cession, apport à une société, ou prêt. Je rédige l’acte avec vous et je vérifie ce que demande votre Ordre. [À CONFIRMER : « prêt » (E3b)]

`DOMAINES.items[contrats-professionnels].hubSection.text`
> Je rédige et je négocie les contrats de votre exercice : collaboration, remplacement, exercice en commun, prestation de services. Chacun fixe vos droits, votre rémunération et les conditions d’un départ.

`DOMAINES.items[ordre-et-deontologie].hubSection.text`
> Votre Ordre fixe la déontologie, les règles de conduite de votre profession. Je vous conseille sur vos questions et vos échanges avec lui. Si un litige s’ouvre devant l’Ordre (contentieux ordinal), je vous défends devant le Conseil de l’Ordre.

### 3.5 Removed sections (R7)

No `/domaines#mecenat` section and no Formations pointer: Eva dropped Mécénat (no longer active, E7) and
Formations (E6). The hub shows the four domaines only.

### 3.6 Contact band

`CONTACT_BAND.lines.domaines` (§1.6), `CONTACT_BAND.cta`, phone.

### 3.7 Shared domaine-page blocks (labels used on the four pages)

`DOMAINES.template.forWhom.heading`
> Pour qui

`DOMAINES.template.forWhom.intro`
> Cette page s’adresse aux professionnels de santé, aux autres professions libérales et aux entrepreneurs. Elle vous concerne si :

`DOMAINES.template.forWhom.professions` = `PROOF.professions` (§1.7)
> Je travaille avec toutes les professions de santé libérales, avec les autres professions libérales et avec les entrepreneurs.

`DOMAINES.template.whatIDo.heading`
> Ce que je fais

`DOMAINES.template.how.heading`
> Comment je travaille

`DOMAINES.template.situations.heading`
> Exemples de situations

`DOMAINES.template.situations.note`
> Ces exemples sont généraux. Ce ne sont pas des dossiers réels.

`DOMAINES.template.exampleLabel` (tag on each situation, G §6.4)
> Exemple

`DOMAINES.template.faq.heading`
> Questions fréquentes

`DOMAINES.template.related.heading`
> Publications sur ce thème

`DOMAINES.template.related.all`
> Voir les publications sur ce thème

→ `/publications?category=<slug>`; the block is hidden when the domaine has no article (IA §8).

`DOMAINES.template.others.heading`
> Autres domaines

The three other domaines, `label` as link text (§1.8).

---

## 4. `/domaines/creation-de-societe`

`DOMAINES.items[creation-de-societe].metaTitle` (page part 31)
> Créer une SEL ou une SCM à Lyon | Eva Biezunski

`DOMAINES.items[creation-de-societe].metaDescription`
> Vous vous installez ou vous vous associez ? Avocate à Lyon, je choisis avec vous la société adaptée, je rédige les statuts et je fais les démarches.

`DOMAINES.items[creation-de-societe].h1`
> Créer la société qui correspond à votre exercice

`DOMAINES.items[creation-de-societe].lead` (glosses the two acronyms of the meta title, G §4.1 rule 2)
> Une société d’exercice libéral (SEL) pour exercer, une société civile de moyens (SCM) pour partager matériel et locaux : je choisis la forme avec vous.

`DOMAINES.items[creation-de-societe].forWhom.items`
> vous vous installez, seul ou à plusieurs
> vous vous associez avec un ou plusieurs confrères
> vous voulez mettre en commun du matériel ou des locaux
> vous exercez en votre nom propre (entrepreneur individuel) et vous voulez créer une société

`DOMAINES.items[creation-de-societe].whatIDo.items`
> Je compare avec vous les formes de société possibles pour votre profession et je vous conseille la plus adaptée.
> Je rédige les statuts, le document qui fixe les règles de fonctionnement de la société.
> Je rédige, si besoin, un pacte d’associés : un accord privé entre associés qui complète les statuts, par exemple en cas de départ. [À CONFIRMER : fait partie de ma pratique (E3a)]
> Je fais les démarches devant votre Ordre.

Fallback for the marker: drop the pacte item (the FAQ answer stays general).

`DOMAINES.items[creation-de-societe].forms.heading` (h2)
> Les formes de société les plus courantes

`DOMAINES.items[creation-de-societe].forms.items` (inline form, then the gloss of G §4.2; each ≤ 40 words)
> Société d’exercice libéral (SEL) : société dans laquelle un professionnel libéral exerce sa profession. Elle peut être créée seul ou à plusieurs.
> Société civile de moyens (SCM) : société qui met en commun le matériel et les locaux, sans partager les honoraires.
> Société civile immobilière (SCI) : société qui détient un bien immobilier, par exemple les locaux de votre cabinet.
> Société de participations financières de professions libérales (SPFPL) : société qui détient les parts de votre société d’exercice.
> Société à responsabilité limitée (SARL) et société par actions simplifiée (SAS) : sociétés commerciales, pour une activité commerciale à côté de votre exercice.

`DOMAINES.items[creation-de-societe].how.steps`
> Nous faisons le point sur votre profession, votre projet et vos associés éventuels.
> Je compare avec vous les formes possibles et je vous recommande l’une d’elles.
> Je rédige les statuts et, si besoin, un pacte d’associés. Vous relisez, nous ajustons.
> Je fais les démarches devant votre Ordre. [À CONFIRMER : formalités faites par moi, y compris l’enregistrement de la société (E3a)]
> Dès la création, je prévois la suite : l’arrivée d’un associé, un départ, un changement de projet.

Fallback for the marker: keep « Je fais les démarches devant votre Ordre. » (today's copy), drop the rest.

`DOMAINES.items[creation-de-societe].situations` (E3: the first three are the situations Eva names, centred on the création and on an associate arriving or leaving; 4 to 6 are composites kept from the draft)
> Vous créez votre société
> Vous exercez seul ou avec des confrères et vous voulez une société. Je compare les formes possibles, je rédige les statuts et je fais les démarches devant votre Ordre.
>
> Un associé arrive
> Un confrère rejoint votre société. Je regarde ce que prévoient les statuts, je les adapte et je règle avec vous ce que cela change pour chacun.
>
> Un associé part
> L’un des associés quitte la société. Je règle avec vous les conditions de son départ : ses parts, ce que prévoient les statuts, la suite de l’activité.
>
> Un professionnel veut partager des locaux et du matériel
> Chacun garde ses propres honoraires, mais les locaux et le matériel sont communs. Je vous conseille une SCM et j’en rédige les statuts.
>
> Un entrepreneur individuel devient dirigeant
> Vous exercez en votre nom depuis des années et vous voulez créer une société. Je vous explique ce qui change pour vous, puis je rédige les statuts avec vous.
>
> Un professionnel veut acheter ses locaux
> Vous voulez détenir les locaux de votre cabinet sans les mettre dans votre société d’exercice. Je vous conseille sur une SCI distincte et j’en rédige les statuts.

Situations 4 to 6 are fictional composites, labelled « Exemple » like the others; Eva reads them in her final
read (X5). If the page feels long, `ui` cuts from the end (6, then 5, then 4); the three first stay.

`DOMAINES.items[creation-de-societe].faq`
> Quelle société choisir pour exercer à plusieurs ?
> Cela dépend de votre profession, du nombre d’associés et de ce que vous mettez en commun. Certaines professions n’ont accès qu’à certaines formes de société. Je compare les options avec vous avant de vous recommander une forme.
>
> Dois-je prévenir mon Ordre quand je crée une société ?
> Dans de nombreuses professions réglementées, oui : l’Ordre doit être informé, parfois autorisé, avant ou après la création. La règle dépend de votre profession. Je vérifie avec vous ce que prévoit la vôtre. [À CONFIRMER : règle par profession servie (E2b)]
>
> Qu’est-ce qu’un pacte d’associés, et en ai-je besoin ?
> C’est un accord privé entre associés qui complète les statuts, par exemple en cas de départ ou de désaccord. Il n’est pas obligatoire. Il règle à l’avance ce qui pourrait vous opposer plus tard.
>
> Combien cela coûte-t-il ?
> Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.

The cost question states the principle only (E5). The delay is not stated (the duration of a creation depends on the profession and the Ordre, and Eva gave no figure).

`DOMAINES.items[creation-de-societe].band` = `CONTACT_BAND.lines.creation-de-societe` (§1.6).

Page order (IA §8): breadcrumb, h1, lead, forWhom, whatIDo, forms, how, situations, faq, related
publications, « Autres domaines », contact band.

---

## 5. `/domaines/cession-clientele-patientele`

`DOMAINES.items[cession-clientele-patientele].metaTitle` (page part 44)
> Cession de patientèle ou de clientèle à Lyon | Eva Biezunski

`DOMAINES.items[cession-clientele-patientele].metaDescription`
> Vous cédez ou reprenez une patientèle ? Avocate à Lyon, je vous conseille sur la cession, l’apport ou le prêt, et je rédige l’acte avec vous. [À CONFIRMER : « prêt » (E3b)]

`DOMAINES.items[cession-clientele-patientele].h1`
> Céder ou reprendre une clientèle ou une patientèle

`DOMAINES.items[cession-clientele-patientele].lead` (defines « cession », used in the meta title)
> Une cession est la vente ou le transfert d’une clientèle ou d’une patientèle. Je vous conseille sur la forme la plus adaptée et je rédige l’acte.

`DOMAINES.items[cession-clientele-patientele].forWhom.items`
> vous reprenez la clientèle ou la patientèle d’un confrère
> vous cédez la vôtre, par exemple avant de partir à la retraite
> vous rejoignez une société et vous y apportez la vôtre

`DOMAINES.items[cession-clientele-patientele].whatIDo.items`
> Je vous conseille sur la forme de l’opération :
> une cession, vente ou transfert à quelqu’un d’autre ;
> un apport, ce que vous mettez dans une société : argent, matériel ou clientèle ;
> un prêt de clientèle : mise à disposition temporaire, sans vente. [À CONFIRMER : sens du « prêt » pour les professions servies (E3b)]
> Je rédige l’acte avec vous, et j’y prévois ce qui est cédé, à quelles conditions et quand.
> Je vérifie ce que demande votre Ordre pour cette opération.

Fallback for the « prêt » markers (this list, both cards, the meta description, the hub section, FAQ 1):
drop the « prêt » line and the word everywhere it appears (the page stays valid with cession and apport).

`DOMAINES.items[cession-clientele-patientele].how.steps`
> Vous m’exposez votre projet : qui cède, qui reprend, ce qui est concerné.
> Je vous conseille sur la forme la plus adaptée et sur les points à régler avant de signer.
> Je rédige l’acte avec vous et je négocie avec l’autre partie si vous le souhaitez.
> Je vérifie ce que demande votre Ordre, puis vous signez en connaissance de cause. [À CONFIRMER : démarches auprès de l’Ordre faites par moi (E3b)]

`DOMAINES.items[cession-clientele-patientele].situations` (E3: the first two are the transfer of a patientèle from one professional to another, the situation Eva names; 3 is a composite kept from the draft)
> Vous reprenez la patientèle d’un confrère
> Vous voulez savoir ce que vous achetez et comment votre Ordre voit l’opération. Je vérifie le projet, je vous conseille et je rédige l’acte.
>
> Vous cédez votre patientèle à un confrère
> Vous voulez un acte clair sur ce qui est cédé, à quel moment et comment vos patients sont informés. Je rédige l’acte et je négocie les conditions avec vous.
>
> Vous entrez dans une société et vous y apportez votre clientèle
> Votre apport doit être décrit et évalué dans l’acte. Je rédige avec vous les statuts et l’acte d’apport.

Situation 3 is a fictional composite, labelled « Exemple »; Eva reads it in her final read (X5).

`DOMAINES.items[cession-clientele-patientele].faq`
> Quelle différence entre cession, apport et prêt de clientèle ?
> Une cession transfère la clientèle contre un prix. Un apport la place dans une société, en échange de parts ; un prêt la met à disposition sans la transférer. Le bon choix dépend de votre projet. [À CONFIRMER : exactitude du « prêt » (E3b)]
>
> Mon Ordre doit-il être informé d’une cession ?
> Souvent oui : beaucoup d’Ordres demandent à être informés, voire à approuver l’opération. La règle dépend de votre profession. Je vérifie ce qui s’applique à vous avant la signature. [À CONFIRMER : règle par profession servie (E2b)]
>
> Qu’est-ce qu’une clause de non-réinstallation ?
> C’est l’engagement de ne pas rouvrir un cabinet près de l’ancien après une cession. Elle protège celui qui reprend. Sa durée et son étendue doivent rester raisonnables. [À CONFIRMER : le terme sera utilisé, règles par profession (E3b)]
>
> Combien cela coûte-t-il ?
> Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.

The cost question states the principle only (E5). Fallback for the third question: drop it if Eva does not
use the term (the glossary row stays unused). **Launch gate (IA §2, ≥ 3 FAQ):** the page keeps three
questions after that, so it still passes.

`DOMAINES.items[cession-clientele-patientele].band` = `CONTACT_BAND.lines.cession-clientele-patientele`.

---

## 6. `/domaines/contrats-professionnels`

`DOMAINES.items[contrats-professionnels].metaTitle` (page part 44)
> Contrats de collaboration et de remplacement | Eva Biezunski

`DOMAINES.items[contrats-professionnels].metaDescription`
> Collaboration, remplacement, exercice en commun : avocate à Lyon, je rédige et je négocie les contrats des professionnels libéraux.

`DOMAINES.items[contrats-professionnels].h1`
> Poser par écrit les règles de votre exercice

`DOMAINES.items[contrats-professionnels].lead`
> Vous rejoignez un confrère, vous le remplacez, vous exercez à ses côtés : je rédige et je négocie le contrat qui fixe les règles.

`DOMAINES.items[contrats-professionnels].forWhom.items`
> vous rejoignez un confrère comme collaborateur
> vous remplacez un confrère, ou vous cherchez un remplaçant
> vous partagez des locaux ou des charges avec d’autres professionnels
> vous faites appel à un prestataire, ou vous l’êtes

`DOMAINES.items[contrats-professionnels].whatIDo.items` (each contract name glossed, G §4.3)
> Un contrat de collaboration : contrat où un professionnel travaille à son compte, pour un confrère, avec sa propre clientèle. [À CONFIRMER : définition valable pour les professions servies (E3c)]
> Un contrat de remplacement : contrat par lequel un confrère exerce à votre place pendant votre absence.
> Un contrat d’exercice : contrat qui organise l’exercice commun de plusieurs professionnels, locaux, charges, départ. [À CONFIRMER : portée exacte chez Eva (E3c)]
> Un contrat de prestation de services : contrat où un professionnel réalise un travail précis pour un autre, contre rémunération.

« Services » appears only inside the legal name of a contract; it is not a word for Eva's own offer (G §2).

`DOMAINES.items[contrats-professionnels].how.steps`
> Vous me décrivez la situation, et le projet de contrat si vous en avez un.
> Je vous dis ce qu’il prévoit, ce qui manque et ce que je vous conseille de négocier.
> Je rédige ou j’ajuste le contrat, et je négocie avec l’autre partie si vous le souhaitez.
> Je vous explique les clauses sur la rémunération, la clientèle et le départ, avant que vous signiez.

`DOMAINES.items[contrats-professionnels].situations`
> Un jeune professionnel est invité à collaborer avec un confrère
> On lui remet un contrat à signer. Je le lis avec lui, j’explique chaque clause (rémunération, clientèle, départ) et je négocie ce qui doit l’être.
>
> Un professionnel part en congé et cherche un remplaçant
> Il veut un contrat clair sur les dates, la rémunération et la clientèle ou la patientèle. Je rédige un contrat de remplacement adapté.
>
> Trois professionnels partagent des locaux et des charges
> Ils veulent écrire qui paie quoi, qui décide et comment l’un d’eux peut partir. Je rédige un contrat d’exercice en commun.

The three situations are fictional composites, labelled « Exemple »; Eva reads them in her final read (X5).

`DOMAINES.items[contrats-professionnels].faq`
> Un contrat de collaboration doit-il être écrit ?
> Dans de nombreuses professions, oui, et il doit parfois être transmis à l’Ordre. La règle dépend de votre profession. Je vérifie ce qui s’applique à vous. [À CONFIRMER : règle par profession servie (E2b)]
>
> Que doit prévoir un contrat de remplacement ?
> Les dates, la rémunération, les conditions d’exercice et ce que devient la clientèle ou la patientèle à la fin. Je l’adapte à votre profession.
>
> Puis-je faire relire un contrat qu’on m’a déjà remis ?
> Oui, avant de signer. Contactez-moi : je vous dis ce qu’il prévoit, ce qui manque et ce que je vous conseille de négocier. Je vous indiquerai comment me le transmettre.
>
> Combien coûte la rédaction d’un contrat ?
> Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.

The cost question states the principle only (E5).

`DOMAINES.items[contrats-professionnels].band` = `CONTACT_BAND.lines.contrats-professionnels`.

---

## 7. `/domaines/ordre-et-deontologie`

« Contentieux ordinal » is in the meta title, the h2 of §7.3 and the hub section (§3.4), as the IA asks
(§2).

`DOMAINES.items[ordre-et-deontologie].metaTitle` (page part 41)
> Ordre, déontologie et contentieux ordinal | Eva Biezunski

`DOMAINES.items[ordre-et-deontologie].metaDescription`
> Question de déontologie, échange avec votre Ordre, contentieux ordinal : avocate à Lyon, je conseille et je défends les professionnels libéraux.

`DOMAINES.items[ordre-et-deontologie].h1`
> Face à votre Ordre : un conseil, et une défense si besoin

`DOMAINES.items[ordre-et-deontologie].lead` (glosses Ordre and déontologie, used in the meta)
> Votre Ordre réunit les membres de votre profession et fixe sa déontologie, ses règles de conduite. Je vous conseille et, si besoin, je vous défends devant lui.

`DOMAINES.items[ordre-et-deontologie].forWhom.items`
> vous avez une question sur ce que votre profession permet
> votre Ordre vous écrit ou vous demande des explications
> une plainte ou une procédure disciplinaire vise votre exercice
> vous voulez vérifier un projet avant de le soumettre à votre Ordre

`DOMAINES.items[ordre-et-deontologie].whatIDo.items`
> Je vous conseille sur vos questions de déontologie : société, contrat, communication, secret professionnel.
> Je lis les courriers de votre Ordre avec vous et je prépare vos réponses.
> Je vérifie un projet (société, cession, contrat) au regard des règles de votre profession.
> Si une procédure s’ouvre, je vous défends devant le Conseil de l’Ordre.

`DOMAINES.items[ordre-et-deontologie].contentieux.heading` (h2, 50 characters)
> Contentieux ordinal : l’Ordre vous met en cause

`DOMAINES.items[ordre-et-deontologie].contentieux.text`
> Un litige devant l’Ordre (contentieux ordinal) peut venir, par exemple, d’une plainte ou d’une sanction. Je vous défends devant le Conseil de l’Ordre, l’instance élue qui représente votre profession. Selon votre profession, la procédure peut aussi passer par la chambre disciplinaire, la juridiction de l’Ordre qui juge les manquements aux règles. [À CONFIRMER : nom et rôle de ces instances selon les Ordres servis (E3d)]

Fallback: drop the last sentence and keep « devant le Conseil de l'Ordre » (today's copy).

`DOMAINES.items[ordre-et-deontologie].how.steps`
> Vous m’exposez la situation et vous me transmettez les courriers de votre Ordre.
> Je regarde ce que prévoient les règles de votre profession.
> Je vous conseille sur la marche à suivre et je prépare vos réponses.
> Si une procédure s’ouvre, je vous défends devant le Conseil de l’Ordre.

`DOMAINES.items[ordre-et-deontologie].situations`
> Vous hésitez sur ce que votre déontologie permet
> Un projet vous inquiète : une société, un contrat, une communication. Je vérifie les règles de votre profession et je vous dis ce que vous pouvez faire.
>
> Votre Ordre vous demande des explications
> Vous avez reçu un courrier et vous ne savez pas comment répondre. Je le lis avec vous et je prépare la réponse.
>
> Une plainte est déposée contre vous
> Vous voulez une défense devant le Conseil de l’Ordre. Je prépare votre dossier et je vous défends.

The three situations are fictional composites, labelled « Exemple »; Eva reads them in her final read (X5).

`DOMAINES.items[ordre-et-deontologie].faq`
> Qu’est-ce qu’un litige devant l’Ordre ?
> C’est un litige porté devant l’Ordre de votre profession, par exemple après une plainte. Il peut aboutir à une sanction. Je vous conseille dès que vous recevez le premier courrier.
>
> Mon échange avec vous reste-t-il confidentiel ?
> Oui. Je suis tenue au secret professionnel : je ne révèle rien de ce que vous me confiez.
>
> Puis-je vous consulter avant que mon Ordre m’écrive ?
> Oui, et c’est souvent utile pour vérifier un projet. Une question de déontologie peut se régler avant tout litige.
>
> Que se passe-t-il si vous conseillez déjà la partie adverse ?
> Je ne peux pas vous conseiller : c’est un conflit d’intérêts, une situation où les intérêts d’un autre client s’opposent aux vôtres. Je vérifie ce point dès votre premier message.

`DOMAINES.items[ordre-et-deontologie].band` = `CONTACT_BAND.lines.ordre-et-deontologie`.

---

## 8. `/a-propos` (IA §3 order: who, approach, reviews, publications, band; no Formations block, R7)

`ABOUT.metaTitle` (page part 29)
> Mon parcours d’avocate à Lyon | Eva Biezunski

`ABOUT.metaDescription` (third person allowed in meta, G §1.1)
> Eva Biezunski, avocate au Barreau de Lyon : son parcours et sa façon de travailler avec les professionnels libéraux et les entrepreneurs.

`ABOUT.h1`
> Qui je suis, et comment je travaille

`ABOUT.lead`
> Je suis avocate au Barreau de Lyon depuis 2020. J’aide les professionnels de santé, les autres professions libérales et les entrepreneurs à structurer leur activité.

E1: the oath was taken on 12 novembre 2020; the page states the year only.

`ABOUT.portrait.alt` = `PROOF.portrait.alt`.

### 8.1 Parcours (proof)

`ABOUT.parcours.heading` (h2)
> Mon parcours

`ABOUT.parcours.items` = `PROOF.credentials.items`, then `PROOF.professions` (§1.7). One credential fact
(E1: no diploma, no membership given); the list stays short.

### 8.2 Ma façon de travailler (positioning A)

`ABOUT.approche.heading` (h2)
> Ma façon de travailler

`ABOUT.paragraphs[0]`
> Mon travail consiste à aider les professionnels libéraux à se structurer, et à garder de bonnes relations avec leurs associés.

`ABOUT.paragraphs[1]`
> Je choisis avec vous la société et les contrats qui conviennent à votre projet, que votre activité soit réglementée ou entrepreneuriale.

`ABOUT.paragraphs[2]`
> Dès la création, je pense à la suite : vos projets, l’arrivée d’un associé, un départ. Je règle en amont ce qui pourrait vous opposer plus tard.

`ABOUT.paragraphs[3]`
> Je vous conseille aussi dans vos relations avec votre Ordre, l’organisme qui réunit les membres de votre profession. Je réponds à vos questions de déontologie, c’est-à-dire de règles de conduite.

`ABOUT.sectionTitle` (kept for the page `<title>` fallback and the home link; today « À propos »)
> À propos

### 8.3 Publications and contact band

`ABOUT.publications.text`
> J’écris des articles sur ces sujets.

`ABOUT.publications.link`
> Voir mes publications

→ `/publications`.

Google reviews and, when they exist, testimonials (`PROOF.reviews`, `PROOF.testimonials`, §1.7) go
between § 8.2 and § 8.3. Contact band: `CONTACT_BAND.lines.aPropos`, `CONTACT_BAND.cta`, phone.

---

## 9. `/contact` (IA §3: h1, channels, form, address; no band)

`CONTACT.metaTitle` (page part 36)
> Contacter le cabinet, avocate à Lyon | Eva Biezunski

`CONTACT.metaDescription`
> Trois façons de joindre Eva Biezunski, avocate au Barreau de Lyon : formulaire, téléphone, email. 29 rue du Président Édouard Herriot, 69002 Lyon.

`CONTACT.h1`
> Écrivez-moi ou appelez-moi

`CONTACT.intro` (lead)
> Décrivez votre situation en quelques lignes : je lis votre demande et je vous réponds. Si vous préférez, appelez-moi ou envoyez-moi un email. [À CONFIRMER : « je lis votre demande », pratique d’Eva (E4f)]

Fallback: « Décrivez votre situation en quelques lignes : je vous réponds. Si vous préférez, appelez-moi ou envoyez-moi un email. »

### 9.1 Three channels as equals (phone and email first on mobile, #66 §7)

`CONTACT.channels.heading` (h2)
> Trois façons de me joindre

`CONTACT.channels.phone.label`
> Téléphone

`CONTACT.channels.phone.name` (visible text `{{phoneDisplay}}`)
> Appeler le cabinet au {{phoneDisplay}}

`CONTACT.channels.email.label`
> Email

`CONTACT.channels.email.name` (visible text `{{email}}`)
> Envoyer un email au cabinet : {{email}}

`CONTACT.channels.form.label`
> Formulaire

`CONTACT.channels.form.text`
> Remplir le formulaire ci-dessous

The page shows no heading « Coordonnées »: phone and email are the channels above, the address block
below is « Adresse et accès » (one concept, one word, G §2).

### 9.2 Form

`CONTACT.formTitle` (h2, replaces today's `sectionTitle`)
> Le formulaire

`CONTACT.requiredLegend`
> Les champs marqués d’un astérisque (*) sont obligatoires.

`CONTACT.requiredMark` (visual `*`; screen-reader text)
> obligatoire

`CONTACT.formFields.lastName`
> Nom

`CONTACT.formFields.firstName`
> Prénom

`CONTACT.formFields.email`
> Email

`CONTACT.formFields.phone`
> Téléphone (facultatif)

`CONTACT.formFields.subject`
> Objet

`CONTACT.formFields.customSubject`
> Précisez l’objet

`CONTACT.formFields.message`
> Message

`CONTACT.formFields.honeypot` (hidden anti-spam field, never shown to people; unchanged)
> Laisser ce champ vide

`CONTACT.formFields.submit`
> Envoyer mon message

« Envoyer mon message » names what the button does; it is a submit, not a CTA to `/contact` (G §3.1).

`CONTACT.formHelp.email`
> Pour que je puisse vous répondre.

`CONTACT.formHelp.phone`
> Si vous préférez que je vous rappelle.

`CONTACT.formHelp.message`
> Décrivez votre situation en quelques lignes. N’envoyez pas de document confidentiel.

`CONTACT.subjectOptions` (follow the domaines, IA §16; the CONTACT constant keeps `OTHER_SUBJECT`)
> Création de sociétés
> Clientèle ou patientèle
> Contrats professionnels
> Ordre et déontologie
> Autre

« Création de société » becomes the plural (R1); « Clientèle / Patientèle » loses its slash; « Contentieux »
becomes « Ordre et déontologie » (IA §2); « Mécénat » and « Formation » are removed (R7). The last value is `OTHER_SUBJECT`, today `"Autre"`:
it must stay equal to the last option, whatever `copy.ts` chooses.

### 9.3 Messages (« je », G §1.1)

`CONTACT.formMessages.sending`
> Envoi en cours…

`CONTACT.formMessages.success` (≤ 30 words; no « rapidement »)
> Merci, j’ai bien reçu votre message. Je vous réponds en général sous 48 heures.

E4: a habit, not a guarantee. 14 words.

`CONTACT.formMessages.error`
> Votre message n’a pas pu être envoyé. Réessayez, ou appelez-moi au {{phoneDisplay}}, ou écrivez-moi à {{email}}.

### 9.4 Errors (same keys as today, reworded: say what to do, ≤ 20 words)

`CONTACT.formErrors.lastNameRequired`
> Indiquez votre nom.

`CONTACT.formErrors.firstNameRequired`
> Indiquez votre prénom.

`CONTACT.formErrors.emailRequired`
> Indiquez votre email pour que je puisse vous répondre.

`CONTACT.formErrors.emailInvalid`
> Cette adresse email semble incorrecte. Vérifiez-la.

`CONTACT.formErrors.messageRequired`
> Écrivez votre message, même en quelques lignes.

`CONTACT.formErrors.customSubjectRequired`
> Précisez l’objet de votre demande.

`CONTACT.formErrors.nameTooLong`
> Raccourcissez votre nom ou votre prénom ({{limit.name}} caractères maximum).

`CONTACT.formErrors.emailTooLong`
> Cet email est trop long ({{limit.email}} caractères maximum).

`CONTACT.formErrors.phoneTooLong`
> Ce numéro est trop long ({{limit.phone}} caractères maximum).

`CONTACT.formErrors.subjectTooLong`
> Raccourcissez l’objet ({{limit.subject}} caractères maximum).

`CONTACT.formErrors.messageTooLong`
> Raccourcissez votre message ({{limit.message}} caractères maximum).

`CONTACT.formErrors.tooManyLinks`
> Votre message contient trop de liens ({{limit.urls}} au maximum). Supprimez-en.

`CONTACT.formErrors.verificationFailed`
> La vérification anti-spam n’a pas abouti. Réessayez dans quelques secondes, ou écrivez-moi par email, ou appelez-moi.

### 9.5 GDPR line next to the submit button (A-17)

`CONTACT.gdpr.text`
> J’utilise vos données uniquement pour répondre à votre demande, et je les conserve 5 ans. [À CONFIRMER : durée et finalité alignées sur la politique de confidentialité (E11c)]

`CONTACT.gdpr.link`
> Lire la politique de confidentialité

→ `/politique-de-confidentialite`. The line avoids the acronym RGPD (it is in the policy). The 5 years are
today's policy figure (« conservées 5 ans à compter du traitement de cette demande »).

### 9.6 What to say, confidentiality, delay, address

`CONTACT.prepare.heading` (h2)
> Ce que vous pouvez m’indiquer

`CONTACT.prepare.items`
> votre profession et, si elle existe, votre société
> votre projet ou votre question, en quelques lignes
> les dates importantes (signature, réponse de votre Ordre)
> les autres personnes concernées (associé, confrère), pour que je vérifie tout conflit d’intérêts (un autre client dont les intérêts s’opposent aux vôtres)

« Conflit d'intérêts » is glossed inline on this page (G §4.1 rule 3: each page glosses its own first use);
`GLOSSARY` can supply the same text as a tooltip (G §4.1 rule 6).

`CONTACT.confidentiality.heading` (h2)
> Confidentialité

`CONTACT.confidentiality.text`
> Ce que vous m’écrivez est couvert par le secret professionnel. Pour un premier message, restez simple : n’envoyez pas de document confidentiel par ce formulaire. Je vous indiquerai comment me le transmettre.

Fallback: « Je suis tenue au secret professionnel. N'envoyez pas de document confidentiel par ce
formulaire : appelez-moi ou écrivez-moi, je vous dirai comment faire. »

`CONTACT.delay.heading` (h2)
> Délai de réponse

`CONTACT.delay.text`
> Je vous réponds en général sous 48 heures. Pour une urgence, appelez-moi.

E4: a habit, not a guarantee. « Je lis chaque demande » is not used here (E4f stays with Eva).

`CONTACT.addressBlock.heading` (h2)
> Adresse et accès

`CONTACT.addressBlock.link` (visible text `{{address}}`; accessible suffix, new tab)
> Voir sur la carte (s’ouvre dans un nouvel onglet)

`CONTACT.addressBlock.access`
> [À CONFIRMER : accès (métro, parking), horaires d’accueil, sur rendez-vous uniquement ou non (E4e)]

Fallback: the address and the map link only.

---

## 10. `/publications` and article end

### 10.1 List page

`PUBLICATIONS.metaTitle` (page part 41)
> Publications pour professionnels libéraux | Eva Biezunski

`PUBLICATIONS.metaDescription`
> Articles d’Eva Biezunski, avocate au Barreau de Lyon, pour les professionnels libéraux : sociétés, contrats, patientèle, Ordre et déontologie.

`PUBLICATIONS.h1` (today `pageTitle`)
> Publications : comprendre le droit de votre exercice

`PUBLICATIONS.sectionTitle` (home link and card section; unchanged)
> Publications

`PUBLICATIONS.intro`
> J’y explique en mots simples les questions juridiques que se posent les professionnels libéraux.

Keys that stay as today (no change of wording): `empty` « Aucune publication pour le moment. Revenez bientôt. »,
`viewAll` « Voir toutes les publications », `allCategories` « Toutes », `filterLabel` « Filtrer par
catégorie », `moreCategories` « Plus de catégories », `categoriesLabel` « Catégories de l’article »,
`readMore` « Lire l’article », `by` « Par », `previousPage` « Page précédente », `nextPage` « Page
suivante », `pageLabel` « Page ». `backToList` is removed (the breadcrumb replaces it, IA §9).

`PUBLICATIONS.readMoreName` (accessible name of a card link, so the generic label carries the title, G §3.2)
> Lire l’article : {{title}}

`PUBLICATIONS.coverAlt` (no « image de », ≤ 125)
> Illustration de l’article {{title}}

Contact band: `CONTACT_BAND.lines.publications`.

### 10.2 Article end (IA §8 order: author card, contact block, review, related)

`ARTICLE.byline`
> Par Eva Biezunski

`ARTICLE.published`
> Publié le {{date}}

`ARTICLE.updated`
> Mis à jour le {{date}}

`ARTICLE.generalInfo` (after the body; ethics, G §6.9)
> Cet article donne une information générale. Il ne remplace pas un conseil adapté à votre situation.

`ARTICLE.authorCard.name`
> Eva Biezunski

`ARTICLE.authorCard.credential`
> Avocate au Barreau de Lyon

`ARTICLE.authorCard.line`
> J’écris pour les professionnels libéraux : sociétés, contrats, patientèle, Ordre.

`ARTICLE.authorCard.link`
> Lire mon parcours

→ `/a-propos`.

`ARTICLE.contact.default` (contextual line, then CTA `HEADER.cta` and phone)
> Cet article touche à votre situation ? Écrivez-moi ou appelez-moi au {{phoneDisplay}}.

`ARTICLE.contact.creation-de-societe`
> Vous créez ou réorganisez une société et vous voulez en parler ? Écrivez-moi ou appelez-moi au {{phoneDisplay}}.

`ARTICLE.contact.cession-clientele-patientele`
> Vous reprenez ou vous cédez une clientèle ou une patientèle et vous voulez en parler ? Écrivez-moi ou appelez-moi au {{phoneDisplay}}.

`ARTICLE.contact.contrats-professionnels`
> Un contrat à signer ou à négocier ? Écrivez-moi ou appelez-moi au {{phoneDisplay}}.

`ARTICLE.contact.ordre-et-deontologie`
> Votre Ordre vous a écrit, ou vous avez une question de déontologie ? Écrivez-moi ou appelez-moi au {{phoneDisplay}}.

The line used is the one of the article's domaine (first category that maps to a domaine, IA §8); `default`
when none. CTA is always `HEADER.cta`; the review line sits below it (`REVIEW.articleLine`, §1.5).

`ARTICLE.domaineLink` (one line, before or inside the contact block, #73 decides; replaces « En savoir plus : [domaine] », R2)
> Voir le domaine : {{label}}

`ARTICLE.related.heading`
> À lire aussi

---

## 11. 404, error pages, `/carte`

### 11.1 404 (IA §8)

`NOT_FOUND.metaTitle` (no em dash, G §5)
> Page introuvable | Eva Biezunski

`NOT_FOUND.title`
> Je n’ai pas trouvé cette page

`NOT_FOUND.message`
> Elle n’existe pas ou a été déplacée. Vérifiez l’adresse, ou reprenez depuis l’une des pages ci-dessous.

`NOT_FOUND.homeCta`
> Retour à l’accueil

`NOT_FOUND.contactCta` (the primary label, no second variant, G §3.1)
> Contacter le cabinet

`NOT_FOUND.links.label` (small label of the link list)
> Pages principales

Links: `BREADCRUMB.home` (« Accueil »), `HEADER.nav.domaines`, `HEADER.nav.publications`; phone link `HEADER.phone.name`.
The home CTA stays a link, not a button (one button per section, G §3.1).

### 11.2 Error page (`error.tsx`, with header)

`ERROR_PAGE.title`
> Une erreur est survenue

`ERROR_PAGE.message`
> Un incident technique empêche l’affichage de cette page. Réessayez, ou appelez-moi au {{phoneDisplay}}.

`ERROR_PAGE.retryCta`
> Réessayer

`ERROR_PAGE.homeCta`
> Retour à l’accueil

### 11.3 Global error (`global-error.tsx`, no header; IA §11)

New block: the page shows phone and email as plain links, **without** `data-track`.

`GLOBAL_ERROR.title`
> Une erreur est survenue

`GLOBAL_ERROR.message`
> Un incident technique empêche l’affichage du site. Réessayez, ou appelez-moi au {{phoneDisplay}}, ou écrivez-moi à {{email}}.

`GLOBAL_ERROR.retryCta`
> Réessayer

`GLOBAL_ERROR.homeCta`
> Retour à l’accueil

### 11.4 `/carte` (noindex; no header)

`QR_CARD.metaTitle`
> Eva Biezunski, carte de visite

`QR_CARD.title`
> Eva Biezunski

`QR_CARD.subtitle`
> Avocate au Barreau de Lyon

`QR_CARD.saveContact`
> Enregistrer le contact

`QR_CARD.visitWebsite`
> Visiter le site

`QR_CARD.call.label` (visible text `{{phoneDisplay}}`; accessible name `HEADER.phone.name`)
> Téléphone

`QR_CARD.email.label` (visible text `{{email}}`)
> Email

`QR_CARD.address.link` (visible text `{{address}}`)
> Voir sur la carte (s’ouvre dans un nouvel onglet)

`QR_CARD.review` = `REVIEW.footerLink` (secondary link under the contact links, with `REVIEW.externalSuffix`)

`QR_CARD.firefoxHint` (unchanged)
> Sur Firefox, l’enregistrement du contact n’est pas pris en charge. Ouvrez cette page dans Safari, ou utilisez les liens ci-dessous.

---

## 12. Privacy policy wording (#66 §6 edits 1 to 5; Eva approves, E11)

Legal text in the style of the existing page (« le Cabinet », « Données », R4). #80 implements it in
`politique-de-confidentialite/page.tsx`. Eva set no constraint on the wording (E11) and approves this text with the rest of the file; the
processors, the retention and the transfer mechanism are also checked by #80.

`PRIVACY.edit1.row.measure` (§3 table: new row, three cells)
> Mesure d’audience du Site
> Données techniques de navigation (pages vues, type d’appareil, pays, page de provenance), pseudonymisées puis agrégées ; aucun cookie
> Intérêt légitime du Cabinet à connaître la fréquentation de son Site

`PRIVACY.edit1.row.contact` (§3 table: the existing row « Gestion des demandes de contact », cell 2 corrected)
> Nom, prénom, email, téléphone, objet, contenu du message

`PRIVACY.edit2.processors` (§4: replaces the bullet on « services de paiement de loyer »)
> À nos sous-traitants techniques : Vercel Inc. (hébergement, détection des robots, mesure d’audience) et Brevo (acheminement des emails du formulaire) ;

`PRIVACY.edit3.row.retention` (§5 table: new row, two cells)
> Mesure d’audience
> 25 mois maximum

#80 sets the measurement tool to this retention and fixes the figure here if it differs; not a question for Eva.

`PRIVACY.edit4.transfer` (§7: replaces the sentence on the « EEE »)
> Vos Données sont stockées dans l’Espace Économique Européen (« EEE ») lorsque c’est possible. Vercel Inc. est une société établie aux États-Unis. Les Données qu’elle traite peuvent y être transférées, selon le Data Privacy Framework UE-États-Unis ou les clauses contractuelles types de son accord.

#80 checks the mechanism that really applies and corrects the sentence if needed; not a question for Eva.

`PRIVACY.edit5.objection` (§6: new paragraph; the email comes from `CONTACT.email`)
> Mesure d’audience. Le Site mesure sa fréquentation avec des outils qui ne déposent aucun cookie et ne vous suivent pas d’un site à l’autre. Vous pouvez vous opposer à cette mesure à tout moment, en écrivant à {{email}}.

`PRIVACY.edit5.updated` (date line; `{{date}}` is the day #80 ships the wording, written by #80, not by Eva)
> Date de dernière mise à jour : {{date}}

---

## 13. Open points for `lead`

### 13.1 Markers still in this file (waiting for Eva)

Part 2 (still with Eva, markers kept as asked): E1d, E2b, E4d, E4e, E4f, E8b, E8c, E11c, G1, G2, G3, X1.

| Marker | Where | Row |
|---|---|---|
| Rule per profession in three FAQ | §4, §5, §6 FAQ | E2b |
| Prepare list | §2.5 step 3 | E4d |
| Access, opening hours | §9.6 | E4e |
| « Je lis chaque demande » | §1.6 band, §9 intro | E4f |
| Testimonial consent and Barreau rule | §1.7 | E8b, E8c |
| Form data line | §9.5 | E11c |

Not in the part 2 list and not answered in part 1 (so the marker stays; `lead` to say if they go with part 2
or take the fallback): E3a pacte d'associés and enregistrement (§4, 2 markers); E3b prêt, démarches
auprès de l'Ordre, non-réinstallation (§5, the home and hub cards, the meta description and the hub section: 7 markers); E3c contract definitions (§6, 2 markers); E3d
chambre disciplinaire (§7, 1 marker).

### 13.2 Answered in part 1 (applied)

E1 (2020, no diploma or membership), E2 (health, other liberal professions, entrepreneurs; one
subheading), E3 (situations; home order), E4 (48 hours as a habit; first-exchange step removed), E5
(convention d'honoraires, principle only), E6 and E7 (dropped, R7), E8a (no testimonial yet, Google reviews
slots), E9a (reviews shown), E10 (no figure), E11a and E11b (no constraint on the wording), E12 (no URL
shared).

### 13.3 Other points

| # | Point | Where | Proposal |
|---|---|---|---|
| O1 | « Je lis chaque demande » is a promise of conduct only Eva can give | §1.6, §9 | Marker kept (E4f); the sentence goes if Eva declines |
| O2 | Four domaine pages are drafted from today's copy and general knowledge. The launch gate (§3.4 fallback) applies page by page: see the status table in § 14 | §4 to §7 | Eva validates or cuts per page |
| O3 | « Prêt de clientèle » is the only term whose legal meaning could not be stated with confidence for every profession | §5 | Marker kept (E3b); dropped if Eva cannot confirm |
| O5 | `CONTACT.formFields.subject` « Objet » is kept; « Votre demande concerne » would fit the voice better | §9.2 | Keep: one label per concept; revisit with #74 |
| O6 | `maxChars` formats thousands with U+202F; the guide wants U+00A0 | §0 note | `ui` formats it in `copy.ts` |
| O7 | The mentions légales are not drafted here (D4 and #75) | R4 | #75 with Eva |
| O8 | How Google reviews are pulled in (API, widget, manual) is still a user decision | §1.7, R9 | Copy covers the slots; no change when the decision comes |
| O9 | Domaine pages and the launch gate | § 14 | See the table |

## 14. Launch gate per domaine page

Status after part 1. A page **passes** when it has for whom, what, how, ≥ 3 situations and ≥ 3 FAQ with no
open marker that would force a cut; otherwise it **falls back** to its `/domaines#<slug>` section (§3.4).
Eva has the last word on each page (E3, final read).

| Domaine | Situations | FAQ | Open markers | Status |
|---|---|---|---|---|
| Création de sociétés | 6 (3 from Eva, 3 composites) | 4 | pacte, enregistrement (E3a), rule per profession (E2b) | **Passes the gate**; each marker has its fallback (drop the item) and the page still has ≥ 3 FAQ |
| Clientèle ou patientèle | 3 (2 from Eva, 1 composite) | 4 | prêt, démarches, non-réinstallation (E3b), rule per profession (E2b) | **Passes the gate**; if the non-réinstallation question is dropped it keeps 3 FAQ |
| Contrats professionnels | 3 (composites) | 4 | definitions (E3c), rule per profession (E2b) | **Passes the gate**, pending Eva's read of the three composites (X5) |
| Ordre et déontologie | 3 (composites) | 4 | chambre disciplinaire (E3d) | **Passes the gate**, pending Eva's read of the three composites (X5) |

« Passes » is the drafting status: a page ships only when Eva validates it (spec §4.4). Any page she does not
validate links to `/domaines#<slug>` (§3.4), with no URL created.

Eva approves the whole file in her final read; the markers of § 13.1 are resolved when part 2 comes back.
