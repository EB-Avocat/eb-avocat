# Editorial guide (#68, task T-501)

Rules for every word of the redesigned site: voice, vocabulary, CTA and links, glossary,
typography, ethics, length limits, and a checklist for Eva's articles. English doc, French
quoted as is. In the French examples, spaces inside « » and before `? ! : ;` are U+00A0 (see §5).

Inputs: `spec.md` §3–§4, `ux-brief.md`; #66 `objectives.md` (§1, §3, §4); #67 `ia.md` (§4.1, §5,
§8); #69 `brand.md` (§1.3); `audit.md` A-01, A-05, A-07, A-17, A-30; `frontend/src/lib/constants.ts`.

Status: written by ux, **Eva confirmed the ethics frame (§6) and the glosses (§4) on 2026-11-24, for now**; she has
the last word. Open points for `lead` are in §10.

How to read the rules: **Must** = `check-copy.ts` can test it (spec §3) or review rejects it.
**Aim** = a target, an exception needs a reason in `copy.md`.

---

## 1. Voice

### 1.1 One voice: « je »

The site is Eva speaking to one reader. Every sentence about what she does, thinks or offers is
in the first person singular. The reader is « vous » (vouvoiement, always; never « tu »).

**Must**
- « Je » / « mon » / « mes » for Eva, « vous » / « votre » for the reader, in every block:
  hero, domaines, À propos, contact page, form labels and messages, success, error, 404, error
  page, article end lines, `/carte`.
- Never « Eva vous répondra », « Eva propose », « Mme Biezunski… » in running copy.
- No « nous » (the site has no team). « Nous » is only allowed when it means *you and I*
  (« Nous fixons ensemble… », « nous verrons ensemble »).

**Third person is allowed only for identification**: the byline (« Par Eva Biezunski »), the
author card, legal pages (mentions légales, politique de confidentialité), copyright line, alt
text of her photo, meta titles and descriptions where the name helps the snippet, structured
data. Nowhere else.

### 1.2 Where today's copy breaks the voice (to fix in `copy.md`)

| Where (`constants.ts`) | Today | Problem | Fix direction |
|---|---|---|---|
| `CONTACT.formMessages.success` | « Merci, votre message a bien été envoyé. Eva vous répondra rapidement. » | Third person; « rapidement » promises nothing measurable (A-17) | « Merci, j'ai bien reçu votre message. Je vous réponds … » (delay only if Eva confirms, E4) |
| `CONTACT.formMessages.error` | « …ou nous contacter par téléphone. » | « Nous » | « …ou appelez-moi au 07 56 85 62 75. » |
| `CONTACT.formErrors.verificationFailed` | « …ou contacter le cabinet par téléphone ou par email. » | Entity instead of « je »; infinitive with no subject | « …ou écrivez-moi par email ou appelez-moi. » |
| `NOT_FOUND.title` | « Nous n'avons pas trouvé cette page » | « Nous » | « Je n'ai pas trouvé cette page » or « Cette page n'existe pas » (no blame, no « nous ») |
| `NOT_FOUND.contactCta` | « Nous contacter » | « Nous » and a second CTA label for `/contact` (§3) | The primary CTA label |
| `ERROR_PAGE.message` | « Un incident technique nous empêche… n'hésitez pas à nous contacter. » | « Nous » ×2, filler « n'hésitez pas à » | « Un incident technique empêche l'affichage de cette page. Réessayez, ou appelez-moi. » |
| `HERO.cta` | « Prendre rendez-vous » | Promises an appointment nobody can book (A-05); banned in §2 | « Contacter le cabinet » (§3.1) |
| `HERO.subheading` | « Cabinet d'avocat dédié aux professionnels libéraux » | The entity speaks, not Eva; « cabinet d'avocat » vs « Avocate » (A-30) | « Avocate au Barreau de Lyon, j'accompagne… » (positioning A) |
| `SITE.title`, `SITE.description` | « Cabinet dédié aux professionnels libéraux… » | Same | Meta in §7 |
| `REVIEW_CTA.subtitle` | « Vous avez fait appel au Cabinet ? » | Capital « C »; entity | « Vous avez fait appel à moi ? » |
| `CONTACT.sectionTitle` + « Coordonnées » | two headings in one section | One concept, two words (§2) | « Contact » names the page; « Coordonnées » names only the phone/email/address block |
| `NAV_LINKS` « Accueil », « Domaines d'intervention » (23 chars), « Votre avis » | long or redundant labels | IA §4.1 fixes the new set | « Domaines », « À propos », « Publications » |

### 1.3 « le cabinet », « Avocate au Barreau de Lyon », « je »

| Form | Use it for | Never for |
|---|---|---|
| « je » | Anything Eva does, thinks, promises, asks | — |
| « le cabinet » (lowercase) | The entity as a *target*: the CTA « Contacter le cabinet », « Appeler le cabinet » (accessible name of the call button), footer group « Le cabinet », the place where she receives, legal pages (« le cabinet » as data controller) | The subject of a sentence about what Eva does (« Le cabinet vous répond sous 48 h » → « Je vous réponds sous 48 h ») |
| « Avocate au Barreau de Lyon » | Her credential line, **as is**, with capital A when it stands alone (hero kicker, card, footer, `/carte`). In a sentence: « Avocate au Barreau de Lyon, j'aide… » at the start, « avocate au Barreau de Lyon » inside | A synonym for « le cabinet »; shortened to « avocate lyonnaise »; replaced by « Cabinet d'avocat » |
| « Eva Biezunski » | Identification only (§1.1) | Running text |

Never « Cabinet » with a capital C. « Maître » is not used in the site copy (see §10, D4).

### 1.4 Register, warmth, rhythm

- **Vouvoiement**, calm and direct. Warm means *specific and attentive*, not effusive: say what
  will happen, what to bring, when she answers. No exclamation marks, no emoji, no « n'hésitez
  pas à », no « Veuillez » (say the verb: « Réessayez »), no « notre expertise ».
- **Sentences: aim ≤ 20 words; hard stop 25.** One idea per sentence, one topic per paragraph,
  paragraph ≤ 3 sentences (≈ 60 words). Active voice. Avoid « afin de », « permettre de »,
  « dans le cadre de », « il convient de ».
- **Questions that name the reader's situation are welcome** as openers (« Vous vous associez
  avec un confrère ? »), at most one per block.
- **Concrete over abstract**: a profession, an object, a step. « Je rédige vos statuts » beats
  « J'assure la sécurisation juridique de votre projet ».
- **Plain words first**; any legal term or acronym is glossed on first use on each page (§4).

### 1.5 Benefit before service (A-01)

Order inside every block: **the reader's situation or result → what I do → how**. Never open on the
legal object. Before/after from the current copy (illustrative drafts, the final wording is in
`copy.md`; facts are only those already on today's site):

| Slot | Before (`constants.ts`) | After |
|---|---|---|
| Hero (`HERO`) | « Avocate en droit des sociétés » / « Cabinet d'avocat dédié aux professionnels libéraux » | « Structurer votre exercice libéral, en accord avec votre Ordre et vos associés. » then « Avocate au Barreau de Lyon, j'accompagne les professionnels libéraux et les entrepreneurs. » (#66 §3) |
| Création de sociétés (`SERVICES.items[0]`, 44 words, 6 acronyms) | « Je vous guide dans la création de structures adaptées à vos besoins, pour votre activité (SEL), pour votre matériel (SCM), pour vos locaux (SCI)… » | « Vous vous installez ou vous vous associez ? Je choisis avec vous la société qui convient à votre profession, puis je rédige les statuts et je fais les démarches devant votre Ordre. » |
| Clientèle / patientèle (`items[1]`) | « Prêt, cession, apport : je vous conseille pour déterminer l'opération qui vous correspond pour sécuriser votre fonds libéral. » | « Vous reprenez ou vous cédez une patientèle ? Je vous conseille sur l'opération la plus adaptée (cession, apport ou prêt) et je le rédige avec vous. » |
| Contentieux (`items[3]`) | « Je représente les professionnels libéraux devant les Conseils de l'Ordre. » | « Votre Ordre vous met en cause ? Je vous défends devant son Conseil de l'Ordre. » |
| À propos (`ABOUT.paragraphs[2]`, 48 words) | « J'anticipe le développement de ces activités. Cela me permet de proposer un cadre adapté dès la création du projet, tout en prenant en compte les ambitions futures de chacun. J'apporte une attention particulière aux relations entre associés… » | « Dès la création, je pense à la suite : vos projets, l'arrivée d'un associé, un départ. Je règle en amont ce qui pourrait vous opposer plus tard. » |
| Form success (`formMessages.success`) | « …Eva vous répondra rapidement. » | « Merci, j'ai bien reçu votre message. Je vous réponds dès que possible. » (a figure only if Eva gives one, E4) |

---

## 2. Word list

One term per concept. « Use » is the only form allowed in new copy; « Avoid » forms are rejected in
review (and flagged by `check-copy.ts` where marked †).

| Concept | Use | Avoid | Note |
|---|---|---|---|
| The page and the action of reaching Eva | **Contact**, **Contacter le cabinet** | « Nous contacter » †, « Contactez-nous » †, « Prendre rendez-vous » †, « Écrire à Eva », « Me joindre » | #66 §4 |
| Phone, email, address as data | **Coordonnées** (heading of that block only) | « Contact » as the heading of the data block | « Contact » = page/action, « Coordonnées » = data; never both as headings of one block (A-30) |
| What she works on | **domaines** (nav, links, headings) | « services », « prestations », « expertises », « offre », « solutions » | Long form « mes domaines d'intervention » only in the `/domaines` h1 or meta where the short label is not enough |
| Clients' base of patients/clients | **patientèle** (health), **clientèle** (other professions), **« clientèle ou patientèle »** when both apply | « clientèle/patientèle » with a slash, « fonds de commerce » | Which word where: depends on E2 (professions served) |
| The professional body | **Ordre** (capital O) when it names the institution: « votre Ordre », « l'Ordre des médecins » | « ordre professionnel » lowercase, « l'ordre » | « Conseil de l'Ordre » keeps both capitals; « chambre disciplinaire » lowercase |
| The bar | **Barreau de Lyon** (capital B) | « barreau lyonnais », « Barreau lyonnais » | Credential: « Avocate au Barreau de Lyon » |
| The legal entity | **société** | « structure » (noun, vague), « entité », « véhicule juridique » | The verb « structurer » is fine (positioning A). « Société d'exercice » is the glossed form for SEL |
| Co-owners / fellow professionals | **associé** (co-owner of a société), **confrère** (same profession, fellow) | « partenaire », « collègue » for an associé | « Consœur » when the person is a woman |
| Eva's clients | **client(s)**; « les professionnels que j'accompagne » | « patient » (those are *their* patients), « justiciable », « usager » | |
| Audience | **professionnels libéraux**, **entrepreneurs** | « libéraux » alone as a noun, « chefs d'entreprise » (use « dirigeant » for the role inside a société) | |
| Her field of law | **droit des sociétés**, **contrats**, **déontologie** | « spécialiste », « spécialisée » (unless Eva holds the official mention, §6); « experte » only as her own phrase « experte des professions libérales », once per page | |
| Creating a société | **créer** une société | « constituer », « immatriculer », « monter » | |
| Selling a practice's clientele | **céder** / **cession** (glossed) | « vendre sa clientèle » in headings; « transmission » without gloss | |
| First exchange | **premier échange** (call, visioconférence or meeting, E4) | « consultation », « rdv », « premier rendez-vous » in a CTA | « Rendez-vous » is fine in body copy for a booked meeting, never in a CTA (#66 §4) |
| Video call | **visioconférence** | « visio », « call », « zoom » | |
| Price of her work | **honoraires** (glossed on first use: « mes honoraires, c'est-à-dire le prix de mon travail ») | « tarifs », « coûts », « prix » (« prix » stays allowed inside the §4 glosses) | A FAQ question may say « Combien ça coûte ? » (people search it); the answer says « honoraires » |
| Written fee agreement | **convention d'honoraires** (glossed) | « contrat d'honoraires », « devis » unless Eva uses it | E5 |
| Client's opinion on Google | **avis** (« Laisser un avis ») | « notation », « évaluation », « recommandation », « feedback » | |
| A client voice on the site | **avis sur Google** (the Google reviews); no separate **témoignage** collection | « retour d'expérience » | §6 rule 8 |
| The articles section | **Publications** (nav, section); **article** (one item) | « blog », « actualités » as the section name, « news » | « Actualités » stays a possible *category* |
| Her diplomas and career | **Diplômes** / **Parcours** | « formations » (the Formations section is dropped, `copy.md` R7) | |
| About page | **À propos** | « Qui suis-je ? », « Mon cabinet » | IA §4.1 |
| Electronic mail | **email** (label « Email ») | « e-mail », « mail », « courriel », « adresse électronique » | Current site already says « Email » |
| Phone | **téléphone**, verb **appeler** | « Tél. », « portable », « mobile » | |
| Privacy | **RGPD** glossed on first use, **données personnelles** | « vie privée » as the only term, « data » | |
| Verbs for what she does | Precise verb per act: **conseiller** (advise), **rédiger** (draft), **négocier**, **défendre / représenter** (only before an Ordre or a court), **accompagner** (umbrella, once per page) | « assister », « gérer », « s'occuper de tout », « sécuriser » without saying how | « Représenter » and « défendre » are regulated acts: use them only for contentieux |
| Link wording | **Descriptive** (§3) | « cliquez ici », « ici », « en savoir plus » alone † | |
| Reader's possible worry | « Si vous hésitez, écrivez-moi une ligne » style, concrete | « N'hésitez pas à » † | |

† = covered by `check-copy.ts` (list in §8).

---

## 3. CTA and link rules

### 3.1 The primary CTA

- **Label: « Contacter le cabinet »** (20 characters, ≤ 22). It names the real action (a message,
  a call; no booking happens, A-05) and matches #66 §4 and #67 §4.1.
- **Same label, everywhere a CTA points to `/contact`** (#67 §8 rule 8): header, mobile menu, hero,
  contact bands, article end, 404. No variants (« Nous contacter », « Prendre contact » (a family member in #66 §4, dropped here to keep one label), « Me
  contacter ») next to it. The 404 button that says « Nous contacter » today (`NOT_FOUND.contactCta`)
  becomes « Contacter le cabinet ».
- **One CTA label, one destination (`/contact`); at most one CTA button per content section** (the sticky header one excepted). Phone and email are text links beside it, never a second button.
- Verb first, infinitive. No « rendez-vous », no « gratuit » (§6), no « maintenant », no
  exclamation mark.
- The accessible name contains the visible label verbatim (WCAG 2.5.3); hidden words only add context.

**One proposed alternative (your decision, D1 in §10): « Me contacter »** (12 characters).
- *For*: it keeps « je » all the way to the button (A-30); it is shorter (fits the mobile header
  without wrapping); « cabinet » can suggest a larger firm, while Eva is one person and the
  positioning is « choose a person ».
- *Against*: « Contacter le cabinet » is already decided with Eva in #66 and sits in #67; the
  call button's accessible name (« Appeler le cabinet ») and the footer group « Le cabinet » would
  then be the only places left with the entity (still allowed, §1.3); « Me contacter » read alone
  is slightly ambiguous for a screen-reader user listing buttons (« me » = the reader or Eva?),
  so the surrounding heading must carry the sense.
- If you adopt it, it replaces the primary label everywhere at once; nothing else in this guide
  changes. **My recommendation: keep « Contacter le cabinet »** unless Eva prefers the
  first-person label; the gain is small and the decision is already approved.

### 3.2 Secondary links

- **Text links, never buttons**, below or beside the CTA: the phone number itself,
  the email address itself, « Laisser un avis », « Tous les domaines » (IA §4.4).
- **Understandable out of context**: the link text alone says where it goes (« Lire l'article
  Choisir sa société d'exercice »), not « En savoir plus » or « Lire la suite ». Card links that
  repeat a generic label (« Lire l'article ») must carry the title in the accessible name.
- Same destination → same label; different destination → different label.
- Phone: visible text is the number (§5); accessible name « Appeler le cabinet au 07 56 85 62 75 ».
- Email: the address is the visible text, `mailto:`.
- Domaine links: the domaine's name (« Création de sociétés »), never « Découvrir ».

### 3.3 Review link (IA §5)

- Footer: « Laisser un avis » (text link, last in the « Le cabinet » group).
- End of article, one line below the contact block: « Vous avez fait appel à moi ? Laisser un
  avis » (replaces the working label « Client du cabinet ? Laisser un avis »: « je », and no
  gendered « cliente/client »).
- `/carte`: « Laisser un avis », secondary, under the contact links.
- Never a button, never above or inside a contact block (#66 §7, #71).

### 3.4 External links

- Opens in a new tab → **the accessible name says so**: visible « Laisser un avis », hidden suffix
  « (Google, s'ouvre dans un nouvel onglet) ». Same for LinkedIn and the site credit.
  `rel="noopener noreferrer"`. A small icon is visual only (`aria-hidden`).
- Say *where* it goes when the label alone would not: « Mon profil LinkedIn (s'ouvre dans un
  nouvel onglet) ».
- Internal links never open a new tab. `tel:` and `mailto:` need no suffix.

### 3.5 Length of labels (IA §4.1)

Nav label ≤ 12 characters (one word where possible); CTA / button label ≤ 22 characters. Counted
as characters of the French string, with its accents.

---

## 4. Glossary

### 4.1 First-use rule

1. **Plain words first, acronym in parentheses, on the first use on each page** (every page is an
   entry point): « une société d'exercice libéral (SEL) ». After that, the acronym alone.
2. **Headings, nav and meta avoid acronyms**, except a searched term (« SEL », « SCM »…) in a
   domaine h1 or meta; then the gloss comes **in the first paragraph**.
3. A term that is not an acronym but is legal jargon (« apport », « cession », « statuts »…) gets a
   short plain gloss on its first use on the page too, unless the sentence already explains it.
4. Where the plain form is the same length as the acronym (« statuts »), no parentheses: the
   gloss is a clause (« les statuts, le document qui fixe les règles de la société »).
5. Glossary glosses are ≤ 15 words, general, and written to stay true for any liberal profession.
6. The `GLOSSARY` constant (#79–#84) can show each gloss as a tooltip or a « À savoir » line; the
   gloss text is the same everywhere.

Column « Inline form » is what to write on first use. Eva confirmed the glosses as written (G1). Rows marked « Not used on the site » stay here for later; `copy.md` does not use them.

### 4.2 Acronyms and company forms

| Term | Inline form (first use) | Gloss (≤ 15 words) | Status |
|---|---|---|---|
| SEL | société d'exercice libéral (SEL) | Société dans laquelle un professionnel libéral exerce sa profession. | |
| SELARL | société d'exercice libéral à responsabilité limitée (SELARL) | Société d'exercice libéral où les associés ne répondent des dettes qu'à hauteur de leurs apports. | Not used on the site (copy.md, G2 and E3). |
| SELAS | société d'exercice libéral par actions simplifiée (SELAS) | Société d'exercice libéral dont les statuts organisent librement la direction et les relations entre associés. | Not used on the site (copy.md, G2 and E3). |
| SELU | société d'exercice libéral unipersonnelle (SELU) | Société d'exercice libéral créée et détenue par une seule personne. | Not used on the site (copy.md, G2 and E3). |
| SCM | société civile de moyens (SCM) | Société qui met en commun le matériel et les locaux, sans partager les honoraires. | |
| SCP | société civile professionnelle (SCP) | Société où des professionnels exercent ensemble leur profession libérale. | Not used on the site (copy.md, G2 and E3). |
| SCI | société civile immobilière (SCI) | Société qui détient un bien immobilier, par exemple les locaux de votre cabinet. | |
| SPFPL | société de participations financières de professions libérales (SPFPL) | Société qui détient les parts de votre société d'exercice. | |
| SARL | société à responsabilité limitée (SARL) | Société commerciale où la responsabilité des associés est limitée à leurs apports. | |
| SAS | société par actions simplifiée (SAS) | Société commerciale aux statuts très libres, avec un ou plusieurs associés. | |
| EURL | entreprise unipersonnelle à responsabilité limitée (EURL) | Société à responsabilité limitée créée et détenue par une seule personne. | Not used on the site (copy.md, G2 and E3). |
| SASU | société par actions simplifiée unipersonnelle (SASU) | Société par actions simplifiée créée et détenue par une seule personne. | Not used on the site (copy.md, G2 and E3). |
| RGPD | règlement général sur la protection des données (RGPD) | Règlement européen qui protège vos données personnelles. | |
| CNIL | Commission nationale de l'informatique et des libertés (CNIL) | Autorité française qui contrôle l'usage des données personnelles. | |

### 4.3 Operations and documents

| Term | Inline form | Gloss (≤ 15 words) | Status |
|---|---|---|---|
| statuts | les statuts | Document qui fixe les règles de fonctionnement de la société. | |
| pacte d'associés | un pacte d'associés | Accord privé entre associés qui complète les statuts, par exemple en cas de départ. | |
| apport | un apport | Ce qu'un associé met dans la société : argent, matériel ou clientèle. | |
| cession | une cession | Vente ou transfert d'une clientèle, de parts ou d'un bien à quelqu'un d'autre. | |
| fonds libéral | le fonds libéral | Ce qu'on achète en reprenant une activité libérale : patientèle, matériel, bail. | |
| prêt de clientèle | un prêt de clientèle | Mise à disposition temporaire d'une clientèle, sans la vendre. | Not used on the site (copy.md, G2 and E3). |
| clause de non-réinstallation | une clause de non-réinstallation | Engagement de ne pas rouvrir un cabinet près de l'ancien après une cession. | Not used on the site (copy.md, G2 and E3). |
| convention d'honoraires | une convention d'honoraires | Accord écrit qui fixe le prix de mon travail avant que je commence. | Confirmed by Eva (E5): she always signs one. |
| honoraires | mes honoraires | Le prix de mon travail d'avocate. | |
| contrat de collaboration | un contrat de collaboration | Contrat où un professionnel travaille à son compte, pour un confrère, avec sa propre clientèle. | |
| contrat de remplacement | un contrat de remplacement | Contrat par lequel un confrère exerce à votre place pendant votre absence. | |
| contrat d'exercice | un contrat d'exercice | Contrat qui organise l'exercice commun de plusieurs professionnels : locaux, charges, départ. | |
| contrat de prestation de services | un contrat de prestation de services | Contrat où un professionnel réalise un travail précis pour un autre, contre rémunération. | |
| entrepreneur individuel | entrepreneur individuel | Vous exercez en votre nom propre, sans créer de société. | |
| dirigeant | dirigeant | Personne qui dirige une société et l'engage envers les tiers. | |
| conflit d'intérêts | un conflit d'intérêts | Les intérêts d'un autre client s'opposent aux vôtres : je ne peux pas vous conseiller. | |

### 4.4 Ordre, déontologie, contentieux

| Term | Inline form | Gloss (≤ 15 words) | Status |
|---|---|---|---|
| Ordre | votre Ordre | Organisme qui réunit les membres d'une profession réglementée et en fixe les règles. | |
| Conseil de l'Ordre | le Conseil de l'Ordre | Instance élue qui représente votre profession et veille au respect de ses règles. | |
| chambre disciplinaire | la chambre disciplinaire | Juridiction de l'Ordre qui juge les manquements aux règles de la profession. | Not used on the site (copy.md, G2 and E3). |
| contentieux ordinal | un litige devant l'Ordre (contentieux ordinal) | Litige devant l'Ordre de votre profession, par exemple une plainte ou une sanction. | |
| déontologie | la déontologie | Règles de conduite propres à une profession, par exemple le secret professionnel. | |
| secret professionnel | le secret professionnel | Obligation de ne rien révéler de ce que vous me confiez. | |
| profession réglementée | profession réglementée | Profession dont l'accès et l'exercice sont encadrés par la loi et un Ordre. | |
| profession libérale | profession libérale | Profession exercée de façon indépendante, sous sa propre responsabilité. | |
| Barreau | Barreau de Lyon | Ordre des avocats de Lyon, auquel je suis inscrite. | |

Terms to add when `copy.md` uses them (not in the table, so not glossed yet): « avantage
fiscal », « parts sociales », « compte courant d'associé », « clause de non-concurrence », « rupture
de contrat », « garantie ». Add a row here **before** using any new term; the `GLOSSARY` constant in `copy.ts` mirrors it, and `check-copy.ts` reads that constant.

---

## 5. Typography

French typography, enforced because the brand is calm and exact (#69 §1.3). In files, write the
real characters; do not rely on CSS.

| Rule | Write | Not |
|---|---|---|
| **U+00A0 (no-break space) before `» : ; ? !`** | « Bonjour ? » → `Bonjour ?` | ordinary space, no space |
| **U+00A0 after `«`** and **before `»`** | `« texte »` | `« texte »` with plain spaces; `"texte"` |
| Quotes | « français » with inner `“…”` if needed | `"..."`, `'...'` |
| Apostrophe | **’** (U+2019): `l’avocate`, `j’aide` | `'` straight in visible text |
| Ligatures | **œ**, **Œ**: `cœur`, `œuvre`, `Œuvre` | `oe`, `ae` for `æ` |
| Accents on capitals | **À**, **É**, **È**, **Ç**: `À propos`, `État`, `Éditorial` | `A propos`, `Etat` |
| Kickers | Written in normal case; uppercase via CSS only | Typed in capitals (screen readers spell them; accents get lost) |
| Dashes | Commas for asides; hyphen for compounds (`non-réinstallation`) | Em or en dash in running text |
| Ellipsis | **…** (U+2026), no space before: `Envoi en cours…` | `...` |
| Phone (display) | **07 56 85 62 75** with U+00A0 between pairs (so it never wraps; this very number is typed that way) | `+33 7 56 85 62 75`, `07.56.85.62.75`, `0756856275` |
| Phone (`tel:` link) | E.164 without spaces: `tel:+33756856275` (derive from `CONTACT.phone` by stripping spaces) | `tel:07…`, spaces in the href |
| Email | `eva@biezunski-avocat.fr`, never broken across lines (`white-space: nowrap`), never a hyphen inserted | Image of the address |
| Dates (text) | `2 décembre 2026`, first of month `1er décembre 2026`, no leading zero, no weekday unless needed | `02/12/2026` in prose; `1 décembre` |
| Dates (data/`<time>`) | Visible French text; `datetime="2026-12-02"` in the attribute | |
| Times | `9 h 30`, `de 9 h à 18 h` (U+00A0 before and after `h`) | `9H30`, `9:30` |
| Numbers | Space (U+00A0) as thousands separator: `1 500 €`; comma as decimal: `4,8 / 5`; `%` and `€` after a U+00A0: `20 %`, `150 €` | `1,500`, `20%`, `€150` |
| Ordinals | `1er`, `1re`, `2e`, `3e` | `1ère`, `2ème` |
| Lists | Capital after the colon only for full sentences; no final period on list items under 5 words | |
| Acronyms | Capitals without dots: `SEL`, `SCM`; no plural `s` for the acronym (`des SEL`) | `S.E.L.`, `SELs` |
| Meta title separator | A vertical bar with plain spaces: `Titre de la page \| Eva Biezunski` (see D3) | Em dash (`NOT_FOUND.metaTitle` uses one today) |
| Title case | French sentence case: only the first word and proper nouns get a capital | English Title Case |
| Address | `29 rue du Président Édouard Herriot, 69002 Lyon` | `Lyon 2e` |

Display number: `CONTACT.phone` is `+33 7 56 85 62 75`, so `copy.ts` adds a `phoneDisplay` constant (`07` + pairs, U+00A0 between) and prose never retypes the number.

Examples in this guide use `'` for readability; `copy.md` converts to `’`.

Writing note: in a Markdown or TypeScript source, the U+00A0 is invisible. Paste the character, or
use the escape `\u00A0` in a JS/TS string; `check-copy.ts` flags an ordinary space before
`» : ; ? !` and after `«`.

---

## 6. Ethics limits for an avocat's communication

**Status: confirmed by Eva for now (X1, 2026-11-24). She has the last word.** Source frame: the profession's rules on
advertising and personalised solicitation (loi n° 71-1130 du 31 décembre 1971 art. 3 bis;
Règlement intérieur national, art. 10). Nothing here is legal advice; it is the editorial line to apply
until Eva says otherwise. Rule of thumb: **information, not persuasion**.

1. **No comparison, no superlative.** Never « le meilleur », « n° 1 », « la plus qualifiée »,
   « leader », « unique », « plus rapide que », « contrairement aux autres cabinets ». Say what
   she does, not that she does it better.
2. **No promised result, no success rate.** Never « je gagne », « 95 % de dossiers réussis »,
   « résultat garanti », « vous obtiendrez ». Verbs of effort and method: « je vous conseille »,
   « je rédige », « je défends ».
3. **No client identity or case detail without written consent.** No name, logo, company, town,
   profession + year combination or fact that lets someone recognise a client. Consent is
   written, specific (what, where, how long), revocable, and recorded in `proof.md` before
   publication.
4. **Examples are anonymised composites**, built from several situations, with no recognisable
   detail (no amounts, no rare combinations), and labelled **« Exemple »** or « Situation type
   (cas fictif) ». Eva reads each one and confirms it is not a real client.
5. **Secret professionnel.** Never mention that someone *is* a client, nor anything learned in a
   consultation. The contact form asks for the minimum; a line on the form tells the visitor
   not to send confidential documents through it. Never confirm in a reply or a comment that a named person is a client.
6. **Honest fees and delays.** A fee or delay appears only if Eva confirms it (E4, E5) and is
   kept true: the principle (« convention d'honoraires écrite, avant de commencer »), not an
   invented figure. No « gratuit », no « devis gratuit », no « prix cassé » unless Eva confirms
   it complies. No urgency or pressure (« avant qu'il ne soit trop tard »), no fear.
7. **Titles and specialisations.** « Avocate au Barreau de Lyon » is a fact. Never « spécialiste » or
   « spécialisée »: those are reserved for an official mention of specialisation, which Eva does not hold
   (E1d). Never « Maître » as a quality claim. The one allowed self-description is « experte des professions
   libérales », Eva's own words, accepted as written, **at most once per page**. « Droit des sociétés » is a
   *field* she works in, not a claimed specialisation.
8. **Testimonials and ratings.** There is no separate testimonial collection (E8b): client voices are the
   Google reviews, left voluntarily by clients. They are shown with Google's attribution and a date, only once
   the Barreau rule is confirmed (E8c), fetched by the server (no widget, no cookie for the visitor) and never
   selected: Google's order, up to five. No site testimonial without written consent.
9. **No individual legal advice in a public article.** An article gives general information,
   dated, with its last update; it does not tell a named reader what to do in their case.
   Law changes: state the date.
10. **No third parties.** Do not name a confrère, an Ordre official, an adverse party or a
    court case file. Quote public decisions only as general rulings.
11. **Information, not solicitation.** Copy answers questions and invites contact; it does not
    chase the visitor (no countdowns, no « offre limitée », no popups).
12. **Accuracy first.** An approximate simplification is not published
    until Eva checks it. A plain gloss must still be true (§4).

---

## 7. Length limits

Counted in characters of the French string unless said; a string over its limit is rejected in
review, and `check-copy.ts` checks the ones marked †.

| Element | Limit | Note |
|---|---|---|
| Nav label † | ≤ 12 characters | IA §4.1; one word where possible |
| CTA / button label † | ≤ 22 characters | « Contacter le cabinet » = 20 |
| Text-link label | ≤ 40 characters | Longer only when the accessible name needs the article title |
| Kicker (overline) | ≤ 30 characters | Normal case in the source (§5) |
| h1 | ≤ 70 characters, ≤ 12 words | One per page; the promise, not the label of the section. Exception: the home h1 may reach 80 characters (the approved positioning A promise is 78), 12 words |
| h2 / card title | ≤ 50 characters | |
| Lead (first paragraph under the h1) | ≤ 30 words, ≤ 2 sentences | Carries the gloss of an acronym used in h1/meta (§4.1) |
| Sentence | aim ≤ 20 words; hard stop 25 | |
| Paragraph | ≤ 3 sentences (≈ 60 words) | Hub sections of `/domaines` (§3.4 of `copy.md`) use the same 60-word limit |
| Card text (domaine, publication teaser) | ≤ 40 words | |
| FAQ question | ≤ 15 words | In the reader's words |
| FAQ answer | ≤ 60 words | General and verifiable; anything profession-specific is a |
| Form label | ≤ 25 characters | « Nom », « Email », « Téléphone (facultatif) » |
| Form help / error message | ≤ 20 words, says what to do | « Indiquez votre email pour que je puisse vous répondre. » |
| Success / error page message | ≤ 30 words | |
| Alt text | ≤ 125 characters | Describes, no « image de » |
| Meta title † | ≤ 60 characters | Includes the site suffix (D3: `\| Eva Biezunski`, 16 characters, so the page part ≤ 44) |
| Meta description † | ≤ 155 characters; aim 120–155 | One sentence of benefit and audience; ends with a clear promise of content, never a CTA phrase |
| Article title | ≤ 70 characters | Meta title: the article title if its page part fits 44 characters, else a shorter version written by hand (no mid-word cut) |
| Article first paragraph | ≤ 50 words | Answers the title's question (§8) |

---

## 8. What `check-copy.ts` and review enforce

Text matches normalise `’` to `'` and ignore case, so the typographic apostrophe of §5 does not hide a banned phrase.

| Rule | Mechanical test | Section |
|---|---|---|
| Acronym used before its gloss on a page | acronym (from §4 table) appears in a page's body text before its first inline form; an h1 or meta may use a searched acronym when the gloss is in the first paragraph (§4.1 rule 2) | §4.1 |
| Nav > 12, CTA > 22 characters | length of `NAV_*`, `*cta*` | §3.5, §7 |
| Plain space before `» : ; ? !` or after `«` | regex | §5 |
| « rendez-vous » in a CTA | label match | §3.1 |
| « Eva vous », « nous contacter », « contactez-nous », « n'hésitez pas », « cliquez ici », third-person self-reference | regex outside the allowed places (§1.1) | §1, §2 |
| Meta title > 60, description > 155 | length | §7 |
| `[À CONFIRMER` left in final `copy.ts` | marker match | spec §4.4 |
| Straight apostrophe `'` in visible French text | regex | §5 |
| « e-mail », « courriel », « Cabinet » capital, « clientèle/patientèle » | word list | §2 |
| « en savoir plus », « lire la suite », « découvrir » as a whole link label | label match | §2, §3.2 |

Rows beyond the list in spec §3 (apostrophes, word list, link labels, « nous contacter » and similar) extend `check-copy.ts`: the lead confirms the scope at review (D8).

Not machine-checkable (review): ethics (§6), benefit-before-service (§1.5), sentence length,
gloss accuracy.

---

## 9. Checklist for Eva's future articles

Short enough to read before every publication. Everything marked ☐ must be true.

**Before writing**
- ☐ One reader, one question: a prospect (profession, situation) who searches this.
- ☐ Nothing identifies a client; any example is an anonymised composite labelled « Exemple »
  (§6).

**Title and meta**
- ☐ Title ≤ 70 characters, says the reader's question or situation, no acronym alone (« Choisir sa
  société d'exercice libéral », not « SEL : mode d'emploi »).
- ☐ A searched acronym may stay in the title *if* the first paragraph explains it.
- ☐ Meta description ≤ 155 characters: who it helps, what they learn.

**First paragraph (≤ 50 words)**
- ☐ Answers the title's question in plain words, in « je » where it is my view.
- ☐ Every acronym is glossed on first use in the *article* (plain words, then acronym in
  parentheses), even if it was glossed on another page.

**Body**
- ☐ Sentences aim ≤ 20 words; paragraphs ≤ 3 sentences; subheadings answer a question.
- ☐ Every legal term in the glossary (§4) is glossed on first use; a new term gets a row in §4.
- ☐ Words from §2 only (« patientèle ou clientèle », « société », « honoraires », « Ordre »…).
- ☐ No comparison, superlative, result or success rate (§6); no fee or delay unless confirmed.
- ☐ General information, with the date and last update; the law can change.
- ☐ Typography (§5): `« »` with U+00A0, `’`, `œ`, capitals with accents, no `...`.

**End of article**
- ☐ **Contextual contact line** (one sentence tied to the topic, then « Contacter le cabinet »,
  never a second CTA label): « Vous reprenez une patientèle et vous voulez en parler ? Écrivez-moi
  ou appelez-moi au 07 56 85 62 75. » (the numbers come from the constant, not retyped)
- ☐ Link to the related domaine page, once (« Voir le domaine : Création de sociétés »).
- ☐ Review line sits **below** the contact block, as a text link (§3.3), never above it.
- ☐ Author card: « Avocate au Barreau de Lyon », link to À propos.
- ☐ Eva has re-read it once for the secret professionnel (§6.5) before publication.

---

## 10. Decisions and points for `lead`

| # | Decision | My recommendation |
|---|---|---|
| D1 | Primary CTA: keep « Contacter le cabinet » or switch to the alternative « Me contacter » (§3.1) | Keep « Contacter le cabinet »; ask Eva only if she wants a first-person label |
| D2 | « email » (current site) vs « e-mail » / « courriel » | « email » (§2) |
| D3 | Meta title suffix: `\| Eva Biezunski` with a vertical bar (16 characters) instead of the em dash used today | Yes: it leaves 44 characters for the page part of a ≤ 60 title |
| D4 | « Maître » is not used in copy; legal pages may name her « Maître Eva Biezunski » if the mentions légales require it | Eva decides for the legal pages; copy says nothing |
| D5 | Inclusive writing: no point médian, no « (e) »; rephrase to a neutral formulation (« Vous avez fait appel à moi ») | Yes, applied in §3.3 |
| D6 | Ethics §6 is an editorial line, not legal advice; Eva confirms the Barreau rules before `copy.md` is final (E1, E8, E9, E11) | Send §6 items 7–8 to Eva with the E-questions |
| D7 | Glossary glosses marked `[À CONFIRMER]` (§4) go in `eva-content.md`; they block no design (a safe fallback gloss is the one written) | Add one row per marker in task T-502 |
| D8 | Scope of `check-copy.ts`: spec §3 lists 8 checks, §8 adds straight apostrophes, word-list terms and generic link labels | Accept the additions; they are cheap regexes |
