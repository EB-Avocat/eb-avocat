# Content to collect from Eva (#68, task T-502 draft)

The questionnaire of `spec.md` §6 (E1 to E12), refined with what `copy.md` actually needs: one row per
item. The user relays it to Eva; `lead` relays her answers back for T-503 (`copy.md`, `proof.md`
finalised, no `[À CONFIRMER]` left). English doc, French quoted as is.

## How to read it

- **Owner**: Eva unless noted. « Eva asks clients » = she collects the consent herself.
- **Deadline**: answers **2026-12-02**; testimonial consents **2026-12-14** (clients must sign).
- **Status**: `sent 2026-11-23` = the question is in the questionnaire `lead` sent for Eva that day (spec
  §6, same E-number). `new` = a sub-question the drafts need, not worded in that version: `lead` adds it to the
  relay or asks it with the next message. Values after Eva answers: `answered`, `partly`, `declined`.
- **If no answer**: the fallback of `copy.md` / `proof.md` that ships, so no design waits (spec §4.5).
- **Answer**: empty. Fill it when Eva replies; T-503 turns it into copy.
- Keys are the `copy.md` keys; « G » = `editorial-guide.md`.
- **Where a row sits in the draft**: each `[À CONFIRMER : … (E#)]` marker in `copy.md` has its row here,
  under the same E-number (so a marker never has a row of its own without a number). Rows with no marker
  (E7 beyond the section, E12, X) come from the spec or the guide.

## Priority for Eva (if she has little time)

1. **E2** professions served and **E3** (the four domaines: confirm, correct the examples). They decide
   hero, « Pour qui » and whether each page ships (launch gate).
2. **E4, E5** first exchange, delay, fees (« Comment ça se passe », form success, FAQ).
3. **E1, E6, E9, E10** facts for the proof (credentials, trainings, rating, figures).
4. **E11** privacy wording and secret professionnel wording; **X** ethics rules.
5. **E8** testimonials (the long one: needs clients), **E7**, **E12**.

---

## E1. Credentials

| ID | Question | Why | Blocks (page / key, issue) | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E1a | In which year did you take the oath (prestation de serment)? Or how many years have you practised? | Proof of experience (#66 §3); only a fact, never « expérimentée » | `/a-propos` `ABOUT.lead`; `PROOF.credentials.items`; `HERO.panel.since`; home proof teaser (#71, #73) | Eva | 2026-12-02 | sent 2026-11-23 (E1) | « Avocate au Barreau de Lyon » alone; no year; `HERO.panel.since` dropped | |
| E1b | Diplomas you want shown: title, university, year | Proof (`proof.md` P3); « Diplômes » on À propos | `ABOUT.parcours.items`, `PROOF.credentials.items` | Eva | 2026-12-02 | sent 2026-11-23 (E1) | No diploma line | |
| E1c | Memberships, mandates, commissions, associations you want shown (name, since when) | Proof (P4); any title must be true and current | `ABOUT.parcours.items`, home proof teaser | Eva | 2026-12-02 | sent 2026-11-23 (E1) | No membership line | |
| E1d | Do you hold an official **mention de spécialisation**? If so, which, since when? | The copy never says « spécialiste » or « experte » without it (G §6.7); « droit des sociétés » is a field, not a claim | `ABOUT`, `HERO.panel`, meta; ethics rule 7 | Eva | 2026-12-02 | new | No claim of specialisation (today's wording) | |

## E2. Professions served

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E2a | Which professions do you actually serve, in order of importance? Health (which ones: médecins, kinés, infirmiers…)? Law? Chiffre? Others? Also entrepreneurs? | #66 §1 confirms only health; the hero audience line, « Pour qui » on each page and the choice « patientèle » or « clientèle » depend on it (`copy.md` uses « clientèle ou patientèle ») | `HERO.subheadingWithProfessions`; `PROOF.professions`; `DOMAINES.hub.forWhom.professions`; `DOMAINES.template.forWhom.professions`; #71, #72 | Eva | 2026-12-02 | sent 2026-11-23 (E2) | Audience stays « professionnels libéraux et entrepreneurs »; no profession named; « clientèle ou patientèle » everywhere | |
| E2b | For the professions you serve: what does the Ordre require when someone creates a société, transfers a clientèle or signs a contract (information, approval, filing)? In short, per profession | Three FAQ answers say « dans de nombreuses professions… » (general, true); Eva can make them specific, or confirm they stay general | `DOMAINES.items[creation-de-societe].faq[1]`, `[cession-clientele-patientele].faq[1]`, `[contrats-professionnels].faq[0]` | Eva | 2026-12-02 | new | General wording stays (« la règle dépend de votre profession ») | |

## E3. The four domaines (launch gate, #67 §2)

Eva validates or cuts each page. A page she does not validate falls back to its hub section (`copy.md`
§3.4): no URL, link to `/domaines#<slug>`. The situations and FAQ in the drafts are **general composites**:
Eva reads each one and confirms it is not a real client (ethics rule 4).

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E3a | **Création de sociétés**: scope right? Four situations (two confrères; shared premises (SCM); entrepreneur individuel becoming dirigeant; buying the premises (SCI)): keep, replace, cut? Three FAQ + the cost FAQ: right? Do you draft **pactes d'associés**? Do you do the **enregistrement** of the société yourself, or only the démarches devant l'Ordre? | Launch gate; accuracy (ethics rule 12); « pacte » and « enregistrement » are not in today's copy | `DOMAINES.items[creation-de-societe].*` (§4); #72 | Eva | 2026-12-02 | sent 2026-11-23 (E3) | Drop the pacte item and the enregistrement step; the page keeps cards, forms, steps, 3 FAQ; if she cannot validate: hub section | |
| E3b | **Clientèle ou patientèle**: scope right (cession, apport, prêt)? What does « **prêt** de clientèle » mean for your professions? Do you use « **clause de non-réinstallation** »? Do you check what the Ordre asks? Three situations, FAQ: right? | « Prêt » comes from today's copy; the legal meaning varies; the gloss must stay true (G §4.3) | `DOMAINES.items[cession-clientele-patientele].*` (§5), card, hub section | Eva | 2026-12-02 | sent 2026-11-23 (E3) | Drop « prêt » (card, lead, whatIDo, FAQ 1) and the non-réinstallation question | |
| E3c | **Contrats professionnels**: scope right? Definitions of contrat de **collaboration**, de **remplacement**, **d'exercice** (« exercice libéral » on today's site) and **prestation de services**: correct for your professions? Three situations, FAQ | G §4.3 glosses wait for it | `DOMAINES.items[contrats-professionnels].*` (§6) | Eva | 2026-12-02 | sent 2026-11-23 (E3) | Keep glosses as drafted if she validates the page; else hub section | |
| E3d | **Ordre et déontologie**: scope right (questions, relations with the Ordre, litigation)? Situations that really occur? Do you also appear before the **chambre disciplinaire** (or only the Conseil de l'Ordre)? Names and roles of the bodies for the Ordres you serve | « Contentieux » today says « Conseils de l'Ordre »; the chambre disciplinaire is a different body and may differ per Ordre | `DOMAINES.items[ordre-et-deontologie].*` (§7), card, `contentieux.text` | Eva | 2026-12-02 | sent 2026-11-23 (E3) | Keep « Conseil de l'Ordre » only (today's wording); drop the chambre disciplinaire sentence | |
| E3e | Which domaine matters most (leads the home list)? Does any of the four pages look too thin to publish? | Home order (#71); launch gate | `HOME.domaines.cards`; all four pages | Eva | 2026-12-02 | sent 2026-11-23 (E3) | IA order: création, clientèle ou patientèle, contrats, Ordre | |

## E4. First contact

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E4a | Format of the first exchange: phone call, visioconférence, meeting at the cabinet? Which do you offer? | « Comment ça se passe » step 3 | `FIRST_CONTACT.steps[2]`; #71 | Eva | 2026-12-02 | sent 2026-11-23 (E4) | `FIRST_CONTACT.fallback` (no format named) | |
| E4b | Is the first exchange charged? How long does it last? | Honest fees (ethics rule 6): no « gratuit » unless she confirms it complies | `FIRST_CONTACT.steps[2]` | Eva | 2026-12-02 | sent 2026-11-23 (E4) | Say nothing about price or duration | |
| E4c | Usual response delay to a first message (e.g. « 48 heures ouvrées »)? | Success message, `/contact`, home step; A-17 (no vague « rapidement ») | `CONTACT.formMessages.success`; `CONTACT.delay.text`; `FIRST_CONTACT.steps[1]` | Eva | 2026-12-02 | sent 2026-11-23 (E4) | « Je vous réponds dès que possible » (no figure) | |
| E4d | What should a prospect bring or send first (documents, dates)? Anything they must **not** send before you reply? | « Vous préparez l'essentiel »; `/contact` « Ce que vous pouvez m'indiquer » | `FIRST_CONTACT.steps[3]`; `CONTACT.prepare.items` | Eva | 2026-12-02 | new | Keep the generic list of the draft | |
| E4e | Address access (métro, parking, floor, intercom), opening hours, by appointment only? | `/contact` « Adresse et accès » (#67 §3) | `CONTACT.address.access` | Eva | 2026-12-02 | new | Address and map link only | |
| E4f | Is « Je lis chaque demande » true as a standing practice? | Home band line (§1.6) and `/contact` intro (« je lis votre demande ») | `CONTACT_BAND.lines.home`, `CONTACT.intro` | Eva | 2026-12-02 | new | Drop the sentence from the band; `/contact` intro keeps « je vous réponds » | |

## E5. Fees

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E5a | May the site state the **principle** of your fees: written convention d'honoraires before you start (forfait or temps passé)? Not a figure | Home step 5; three FAQ (« Combien cela coûte-t-il ? », création, cession, contrats) | `FIRST_CONTACT.steps[4]`; FAQ cost item of each domaine | Eva | 2026-12-02 | sent 2026-11-23 (E5) | Drop step 5 and the three cost FAQ (three FAQ remain on each page; if E3b also drops the non-réinstallation question, the cession page keeps two and needs a third question or becomes a hub section) | |
| E5b | Do you use the term **« convention d'honoraires »** (rather than devis or contrat d'honoraires)? | Word list G §2; gloss G §4.3 | `FIRST_CONTACT.steps[4]` | Eva | 2026-12-02 | sent 2026-11-23 (E5) | Use « honoraires » with its gloss only | |

## E6. Trainings (Formations)

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E6a | Trainings you have given: organiser, audience, topic, year | Proof (`proof.md` P6) and the list on `/a-propos#formations` | `FORMATIONS.items`; #67 Q4 | Eva | 2026-12-02 | sent 2026-11-23 (E6) | `FORMATIONS.intro` and `FORMATIONS.gloss` only (today's copy) | |
| E6b | Do you want organisers to **request** a training (an offer) or only show what you did (proof)? | Decides the offer line `FORMATIONS.offer` | `FORMATIONS.offer`; `DOMAINES.formations` | Eva | 2026-12-02 | sent 2026-11-23 (E6) | No offer line (proof only) | |

## E7. Mécénat

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E7 | Mécénat: do you still take this work? For whom (associations, fonds de dotation, porteurs de projets)? Is there enough to say in one section? | One sentence on today's site; a section needs substance (#67 Q3) | `DOMAINES.mecenat.*`; `HOME.domaines.also`; `CONTACT.subjectOptions` | Eva | 2026-12-02 | sent 2026-11-23 (E7) | Remove the section, the « Également : mécénat » link and the subject option | |

## E8. Testimonials (consent needed)

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E8a | Which 2 to 4 clients would give a short quote, **in writing**? With name or initials + profession, or anonymous? | Proof layer; no quote ships without written consent (`proof.md` P10 to P13) | `PROOF.testimonials`; home, `/a-propos`; #71, #73 | Eva asks clients | **2026-12-14** | sent 2026-11-23 (E8) | Block not rendered | |
| E8b | Do you accept the consent wording of `proof.md` (what, where, how long, revocable)? | One wording for every client | `proof.md` consent record | Eva | 2026-12-02 | new | Use the wording as drafted | |
| E8c | Does your Barreau allow testimonials on a lawyer's site? Any conditions (no selection, date, anonymity)? | Ethics rule 8; the rules differ and Eva has the last word | `PROOF.testimonials`; X4 | Eva | 2026-12-02 | new | No testimonials | |

## E9. Google rating and review link

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E9a | May the site show « Note Google : x / 5 (n avis), au [date] » as **static text** you update by hand? Which numbers today? | Proof (P14); ethics rule 8; no widget, no API | `PROOF.rating`, `PROOF.ratingLink` | Eva | 2026-12-02 | sent 2026-11-23 (E9) | Block not rendered | |
| E9b | The direct « write a review » link from your Google profile (the current `maps.app.goo.gl` link opens the map, #67 Q8) | The review link of the footer, article end, `/carte` | `REVIEW.footerLink`; #80 | Eva | 2026-12-02 | sent 2026-11-23 (E9) | Keep today's link | |
| E9c | OK to print and give out `biezunski-avocat.fr/avis`? | Short link for invoices, emails, card (#67 §5) | `REVIEW.shortUrl`; #80 | Eva | 2026-12-02 | sent 2026-11-23 (E9) | The short link is not shown or printed | |

## E10. Figures

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E10 | Which figures are you comfortable stating (years of practice, sociétés créées, professions)? Each one with what it counts and the date | Proof (P16); none is shown without her OK; no success rate (ethics rule 2) | `PROOF.figures.items` | Eva | 2026-12-02 | sent 2026-11-23 (E10) | No figure on the site | |

## E11. Privacy, secret professionnel, form line

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E11a | Approve the French wording of the privacy-policy edits 1 to 5 (`copy.md` §12) | #66 §6; #80 implements it; #80 also checks processors, retention and the transfer mechanism | `PRIVACY.edit1` to `edit5` | Eva | 2026-12-02 | sent 2026-11-23 (E11) | The policy stays as today; #80 does not ship tracking without an approved policy | |
| E11b | Approve the **secret professionnel** wording used in four places: « Je suis tenue au secret professionnel » (home fallback, FAQ ordre), `/contact` « Confidentialité », and the form help (« N'envoyez pas de document confidentiel »). Which channel do you give for sending documents? | Ethics rule 5; she decides what the form may collect and how a prospect sends documents | `FIRST_CONTACT.fallback.steps[2]`; `DOMAINES.items[ordre-et-deontologie].faq[1]`; `CONTACT.confidentiality.text`; `CONTACT.formHelp.message` | Eva | 2026-12-02 | sent 2026-11-23 (E11) | Drop the claims about secret professionnel from the home and the FAQ; keep « n'envoyez pas de document confidentiel par ce formulaire » | |
| E11c | Form data line: « J'utilise vos données uniquement pour répondre à votre demande, et je les conserve 5 ans » matches your practice? | A-17; the 5 years is today's policy figure | `CONTACT.gdpr.text` | Eva | 2026-12-02 | new | Keep as drafted if E11a is approved | |

## E12. Old links

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| E12 | Links you have shared to `biezunski-avocat.fr/#contact` or other `#…` anchors (email signature, LinkedIn, GBP, print)? Which URL does your Google Business Profile use? Did another site exist at this domain? | Redirects (#78); the home contact band keeps id `contact` | No copy; relayed to #78 (`url-table.md`) | Eva | 2026-12-02 | sent 2026-11-23 (E12) | The home band keeps its ids; no other redirect | |

## G. Glossary and company forms

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| G1 | Read the glossary tables of `editorial-guide.md` §4 and correct any gloss that is wrong for your professions (SEL, SCM, SCI, SPFPL, SARL, SAS, statuts, pacte d'associés, apport, cession, Ordre, Conseil de l'Ordre, chambre disciplinaire, conflit d'intérêts, contentieux ordinal, secret professionnel, mécénat, fonds de dotation, convention d'honoraires) | G §4 rule 5: a gloss must stay true for any liberal profession | Every page; `GLOSSARY` in `copy.ts` | Eva | 2026-12-02 | new | Glosses as written (each is general and checked against standard definitions) | |
| G2 | Which company forms do you actually create? Today's site names SEL, SCM, SCI, SPFPL, SARL, SAS. Do you also create **SELARL, SELAS, SELU, SCP, EURL, SASU**? (They are in the glossary but not in the copy.) | Only forms Eva offers are written; the guide has the glosses ready | `DOMAINES.items[creation-de-societe].forms.items`; SEO queries (K9) | Eva | 2026-12-02 | new | Only the six forms of today's site | |
| G3 | How do you write the credential: « Avocate au Barreau de Lyon » (as on the site and the card), or with « de l'ordre des avocats »? | G §4.4 row « Barreau » | `HERO.kicker`, `FOOTER.credential`, `QR_CARD.subtitle` | Eva | 2026-12-02 | new | « Avocate au Barreau de Lyon » (today's wording) | |

## X. Ethics rules for her communication (`editorial-guide.md` §6)

The guide §6 is an editorial line, not legal advice; Eva confirms what applies to her Barreau. Items 5, 7
and 8 go to her with the questionnaire (`lead`'s decision on D6).

| ID | Question | Why | Blocks | Owner | Deadline | Status | If no answer | Answer |
|---|---|---|---|---|---|---|---|---|
| X1 | Confirm the frame of §6: loi du 31 décembre 1971 art. 3 bis and Règlement intérieur national art. 10 (advertising and solicitation), plus any rule specific to the Barreau de Lyon. Anything to add or cut among the twelve rules? | The guide cites them as a starting point; she has the last word | Guide §6; every page | Eva | 2026-12-02 | new | The twelve rules stay as editorial line; nothing publishes without her reading | |
| X2 | Rule 5, secret professionnel: how do you want a first message handled (what to send, what not, how documents arrive)? | See E11b | `CONTACT.confidentiality`, form help | Eva | 2026-12-02 | = E11b | See E11b | |
| X3 | Rule 7, titles: may the copy say « spécialiste » or use « Maître » anywhere? (Default: no.) | See E1d | All copy; legal pages (D4, #75) | Eva | 2026-12-02 | = E1d | Neither term is used | |
| X4 | Rule 8, testimonials and ratings: rules of the Barreau, wording of the date and of the source | See E8c and E9a | `PROOF.testimonials`, `PROOF.rating` | Eva | 2026-12-02 | = E8c, E9a | Neither is shown | |
| X5 | Rule 4: read each situation and FAQ example of the four pages and confirm it describes no real client | Anonymised composites only | `DOMAINES.items[*].situations` | Eva | 2026-12-02 | = E3a to E3d | An example she does not confirm is cut | |

---

## What the drafts need, by marker (check list for T-503)

| Marker in `copy.md` | Row |
|---|---|
| année du serment (`ABOUT.lead`, `HERO.panel.since`, `PROOF.credentials.items`) | E1a |
| diplôme, adhésion ou mandat | E1b, E1c |
| professions (`HERO.subheadingWithProfessions`, `PROOF.professions`, hub, template) | E2a |
| règle par profession (three FAQ) | E2b |
| situations réelles, pacte d'associés, démarches / enregistrement, prêt, non-réinstallation, contrat definitions, chambre disciplinaire, examples | E3a to E3d, X5 |
| format, délai, honoraires on home and forms | E4a to E4c, E5a, E5b |
| liste d'Eva (what to bring) | E4d |
| accès | E4e |
| mécénat | E7 |
| formations list and offer | E6a, E6b |
| testimonials | E8a to E8c |
| rating | E9a |
| figures | E10 |
| secret professionnel, GDPR line, privacy edits | E11a to E11c |
