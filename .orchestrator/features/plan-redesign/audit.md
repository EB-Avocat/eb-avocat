# Audit of the current design (D1)

Source of truth: the code on `orch/plan-redesign/integration` (frontend/src). No live site was
used, so anything that depends on real content (publications, images) is marked as such.
Paths are relative to `frontend/src`. Ratios are WCAG 2.x contrast, computed (sRGB relative
luminance, alpha blended over the actual background).

Contents: 1 Screen inventory · 2 Journeys · 3 Design tokens · 4 Findings · 5 Keep vs question.

---

## 1. Screen inventory

The spec's table is right. Additions and corrections (also sent to `ui`):

| Missing screen / state | Source | Note |
|---|---|---|
| `/carte` **iOS** state: extra block with address / phone / email links under the buttons | `app/carte/page.tsx:95-110` | shown only on iPhone/iPad |
| `/carte` **Firefox iOS** state: disabled "Enregistrer le contact" + hint box | `app/carte/page.tsx:63-70, 89-93` | |
| `/carte` on desktop **does not exist**: UA sniffing redirects to `/` | `app/carte/page.tsx:36-40` | so "desktop optional" in the spec = none; no frame needed |
| `global-error` (root-level crash, outside the layout) | `app/global-error.tsx` | not in the spec table; teal gradient full-page, white text, primary + outline buttons (`global-error.tsx:25-45`), unlike `error.tsx` which uses the white solid-navbar layout |
| Navbar **solid** variant is used by legal, publications, 404, error | `components/Navbar.tsx:16-20` | already in spec components; list it per screen |
| Hero scroll arrow bounce, section fade-in on scroll (About, ServiceCard) | `Hero.tsx:35`, `About.tsx:19-22`, `ui/ServiceCard.tsx:19-23` | animations: note on frames |
| Publication card **without cover** (gradient + "Eva Biezunski") | `ui/PublicationCard.tsx:28-33` | in spec components |
| Publications **empty** state; home teaser with 0 or 1 article (no "Voir toutes") | `publications/PublicationGrid.tsx:7-9`, `LatestPublications.tsx:22` | home teaser hides the button when `total <= 1` |
| Contact form states: idle, submitting (button disabled, "Envoi en cours…"), success (`role=status`), error (`role=alert`), "Autre" reveals a field | `Contact.tsx:18-19, 135-161` | no per-field error UI: native browser validation, server messages not displayed (see A-17) |
| Back-office: article editor has an **Aperçu** tab, a **Markdown** mode, a delete confirm dialog, an unsaved-changes label and status badges | `backoffice/ArticleEditor.tsx:40, 296, 391, 516` | dialogs are in `backoffice/ui.tsx:415-454` |
| Back-office loading screens (full-page spinner, skeleton lists) | `backoffice/ui.tsx:239-310`, `app/backoffice/loading.tsx` | |
| Back-office mobile shell (header + burger + stacked nav) | `backoffice/Shell.tsx:106-130` | spec already asks for shell on mobile |

Site map today: `/` (home, 6 sections), `/publications`, `/publications/[slug]`,
`/mentions-legales`, `/politique-de-confidentialite`, `/carte` (noindex, mobile only),
`/backoffice/*`. Sitemap: `app/sitemap.ts`. There is **no page per domaine d'intervention**,
no about page, no contact page (contact is a home section; the 404 links to `/#contact`).

Home section order (`app/page.tsx:14-23`): Hero → À propos → Domaines → Votre avis → Contact →
Publications → Footer. Backgrounds alternate: teal gradient / white / tint / solid primary /
white / tint / darker teal.

## 2. User journeys

### J1 — Prospect lands on home → understands → contacts
1. Hero: logo, h1 "Avocate en droit des sociétés", subtitle "Cabinet d'avocat dédié aux professionnels libéraux", CTA "Prendre rendez-vous" (`Hero.tsx:20-31`, `constants.ts:34-38`).
2. Scrolls to À propos: portrait + 4 paragraphs, first-person ("Je détermine…") (`About.tsx`).
3. Domaines: 6 cards, each a title + short paragraph, no link, no CTA, no example (`Services.tsx`).
4. "Votre avis" band: invitation to leave a review, no review shown.
5. Contact: coordinates + 7-field form (`Contact.tsx`), or tel/mail links.

Friction:
- The CTA "Prendre rendez-vous" does not book anything: it scrolls past 4 sections to a message form (A-05).
- Phone and email, the fastest paths, appear only at the very bottom (Contact section and footer); the navbar has no phone/CTA (A-06).
- No proof before the contact form: no testimonial, no experience figures, no bar/ordre details beyond "Barreau de Lyon" in the footer (A-04).
- The offer says *what* (statuts, contrats) but not for *whom* concretely, how it works, fees, delay or first-meeting format (A-03, A-07).
- The form asks for last name, first name, email, phone, subject, message with no reassurance on confidentiality or response time before sending; the success text promises "répondra rapidement" without a figure (A-17).
- 6 equal cards, no hierarchy: "Mécénat" and "Formations" weigh as much as "Création de sociétés", the core job (A-08).

### J2 — Prospect arrives on a publication from search → trusts → contacts
1. Lands on `/publications/[slug]`: back link, categories, h1, summary, author, date, cover, body (`ArticleView.tsx`).
2. Navbar is solid; links go to `/#section` (`Navbar.tsx:33`).
3. Article ends. **Nothing follows the body**: no author box, no "Contactez Eva" CTA, no related articles, no next article (A-09).

Friction:
- Dead end after the article (A-09). Only exits are the navbar (5 anchors + Publications) and the footer.
- No sticky or inline contact route; the navbar has no CTA (A-06).
- No author credentials on the page (28px avatar + name only) (A-04).
- Article pages carry no structured data (no `Article`/`BreadcrumbList` JSON-LD), see A-20.
- "← Retour aux publications" is the only wayfinding, and the filter state is lost (A-10).

### J3 — Client → leaves a review
1. Home → navbar "Votre avis" (anchor) → band with outline button "Laisser un avis" (`Testimonials.tsx`), opens Google Maps in a new tab.
2. Alternative: no direct link in the footer, no link on `/carte`.

Friction:
- The button's accessible name does not say it opens a new tab (A-15).
- A review is a *client* task but it holds a primary slot in the main navigation for prospects (A-02): prospects see a request meant for someone else and no actual reviews. The component is named `Testimonials` but shows none.
- The Google link is a `maps.app.goo.gl` short link (`constants.ts:16`): not a "write a review" deep link; one extra step on mobile.

### J4 — QR card → saves contact / visits site
1. Phone scans QR → `/carte` (mobile UA only; desktop → `/`).
2. Dark teal screen: logo, name, "Avocate au Barreau de Lyon", two buttons: "Enregistrer le contact" (vCard download), "Visiter le site web" (`carte/page.tsx`).
3. iOS: contact links under a divider; Firefox iOS: disabled button + hint.

Friction:
- Good: short, one purpose. But the card shows no phone/email on Android (only on iOS, `carte/page.tsx:95`) even though people often just want to call (A-11).
- Detection by User-Agent: iPad desktop mode or an unknown UA gets redirected to the home page with no explanation (A-11).
- No QR-origin context: the page cannot say what Eva does (no tagline of her speciality).
- `robots.txt` disallows `/carte` while the page sets `noindex`: Google cannot read the noindex then (harmless here, see A-21).

### J5 — Eva → logs in → writes, illustrates, publishes
1. `/backoffice/connexion`: card with email + password (`AuthCard.tsx`, `connexion/page.tsx`).
2. Articles list: search, status filter, category filter, "Nouvel article" (`articles/page.tsx`).
3. Editor: title, summary, cover (image dialog + cropper), body in rich editor with `/` slash menu or Markdown tab, categories picker, status, publication date, slug, delete (`ArticleEditor.tsx`).
4. "Enregistrer" (also Ctrl/⌘+S) or "Publier" / "Repasser en brouillon"; "Aperçu" tab renders the public view.

Friction:
- Strengths: `beforeunload` guard (`ArticleEditor.tsx:151-155`), dirty indicator (`:296`), Ctrl/⌘+S, preview that shares the public component (`ArticleView`), status badges, skeletons, French labels.
- "Enregistrer" and "Publier" are two separate buttons: it is not obvious that publishing also saves, or that saving a published article goes live immediately (`:192` toasts "enregistré et publié") (A-23).
- Slash menu offers 12 items including "Code", "Tableau", "Liste de tâches" (`editor/slash-items.ts`): developer vocabulary for a lawyer; the discoverability of "/" itself depends on a placeholder (A-24; to verify with Eva).
- Slug, status and date sit in the side panel with no explanation of what is public (A-23).
- The back-office is "Eva Biezunski · Gestion" with no logo and `gray-*` neutrals, so it looks like another product (A-19).
- No autosave (only the `beforeunload` guard): a crash loses the work (A-24).
- Mobile: a shell exists (burger) but the editor with its side panel is desktop-first (not verified by screenshots).

## 3. Design tokens actually used

Counts come from a grep over `src/**/*.tsx` (class occurrences, tests excluded).

### Colours
| Token | Value | Where defined | Role |
|---|---|---|---|
| `primary` | `#3f5b57` | `app/globals.css:29` | button hover, "Votre avis" band, headings links, active chip |
| `primary-light` | `#4a7a6f` | `:30` | button bg, icons, focus ring, tints (`/5`, `/10`, `/20`) |
| `dark-teal` | `#264445` | `:31` | hero gradient end, PWA colour |
| `darker-teal` | `#162729` | `:32` | hero gradient start, footer, `theme-color` |
| `near-black` | `#191919` | `:33` | body text, headings |
| white | `#fff` | tailwind | backgrounds; alpha 10/60/70/80/90 for text and borders on teal |
| gray 100/200/300 | tailwind | not tokens | borders (`Navbar.tsx:115,125,136`, `Contact.tsx:13`, back-office) |
| gray 400/500/600/700 | tailwind | not tokens | public body text: 600 in cards (`ServiceCard.tsx:27`, `PublicationCard.tsx:49`), 700 in About/Contact, 500 for dates; back-office hints and placeholders |
| red 600 / 700 / 800, red 50/200 | tailwind | not tokens | public form error is `red-600` (`Contact.tsx:158`); back-office uses `red-700/800` (`backoffice/ui.tsx:26,87,115`): two reds |
| green 100/200/800 | tailwind | not tokens | back-office success only (`ui.tsx:116,138`) |

Hard-coded hex values outside the theme: only `BRAND_COLORS` duplicates the two dark teals in
`lib/constants.ts:11-14` (kept in sync by hand). No other raw hex in components. No dark mode, no
semantic tokens (success / error / surface / border / muted text), no tokens for the gray scale.

### Type
- Family: Museo only, `--font-museo` with `ui-serif, Georgia, serif` fallback (`globals.css:35`); body uses it (`layout.tsx:111`). Weights declared: **300, 500, 700**. `Museo100` and `Museo900` are in `public/fonts` but never loaded: 2 dead files. Utilities used: `font-300` (32), `font-500` (61), `font-700` (31); no `font-400`, so text with no weight utility renders at the CSS-matched face (likely 500, since there is no 400 face).
- Body reads at **weight 300 (light) in gray-600/700** almost everywhere (`About.tsx:42`, `ServiceCard.tsx:27`, `Contact.tsx:61`): thin strokes on white, contrast is OK numerically (see §4) but legibility is lower than the numbers suggest, especially `text-sm` (72 uses) and `text-xs` (33 uses).
- Scale: `text-xs` 33, `sm` 72, `base` 5, `lg` 7, `xl` 5, `2xl` 14, `3xl` 7, `4xl` 6, `5xl` 1, `6xl` 1. Headings: hero h1 `4xl/5xl/6xl` (`Hero.tsx:20`), section h2 `3xl/4xl` (`ui/SectionHeading.tsx:13`), cards h3 `xl`, legal h2 `2xl`. No `leading-*` on headings; `leading-relaxed` on paragraphs. Body size is `text-sm` (14px) in cards and contact: small for a 40-70 year-old professional audience.
- Prose in articles: `@tailwindcss/typography` `prose prose-neutral` with overrides (`publications/ArticleBody.tsx:9`), i.e. a separate type system from the rest of the site.

### Spacing & layout
- Container `max-w-6xl` + `px-6` everywhere (home sections, publications, legal at `max-w-3xl` inside). Articles `max-w-3xl`.
- Section rhythm `py-20` (80px) everywhere; no density change between sections. Section heading `mb-12` (`SectionHeading.tsx:13`); `Testimonials.tsx:10` fights it with `-mt-6` to attach the subtitle (a hack, A-26).
- Gaps: grids `gap-6` (cards) and `gap-12` (two columns); forms `space-y-4`. Card padding `p-6`. Buttons `px-8 py-3`.
- Navbar: `py-2` mobile / `py-4` desktop (`Navbar.tsx:46`). `scroll-padding-top` 48px / 80px (`globals.css:38-47`) does not match the navbar height on mobile (logo 120px wide + py-2 ≈ 50px, ok) but is hard-coded.

### Radii
`rounded` (4px, 55 uses: buttons, inputs, chips on back-office), `rounded-lg` (8px, 30: cards, images), `rounded-full` (16: chips, avatars). Consistent. The focus ring forces `border-radius: 2px` on every `:focus-visible` (`globals.css:53-57`), which visibly reshapes pill chips and rounded buttons on focus (A-14).

### Shadows
`shadow-md` on cards and navbar (`ServiceCard.tsx:18`, `Navbar.tsx:43`), hover `shadow-lg` + lift `-translate-y-1`; back-office `shadow-sm` (11), `shadow-xl` for dialogs. No custom shadow tokens; the navbar uses `shadow-md` + `backdrop-blur-md` + `bg-white/90`.

### Motion
- `transition-all duration-300` on 18 elements (buttons, cards): `transition-all` also animates layout properties.
- Scroll reveal: opacity + `translateY(20px|30px)`, 0.6-0.8s, staggered 100ms, via inline `style` (`About.tsx:18-22`, `ServiceCard.tsx:19-23`).
- Hero arrow `animate-bounce` (infinite, `Hero.tsx:35`).
- Navbar logo fade/slide 500ms (`Navbar.tsx:49`).
- Reduced motion: handled globally (`globals.css:79-95`), good. The inline `transition` on ServiceCard overrides the class `transition-all`, so the hover lift runs at the 0.6s reveal duration (A-26).

### Assets
Logos: 5 SVG/PNG/WebP variants in `public/images` (dark-green, light-green, white-for-black, white-for-white, black). Photo: one portrait (835×1112) reused for About, OG and Twitter image, and JSON-LD. Icons: `lucide-react` (strokeWidth 1.5 on cards, default 2 elsewhere) plus an inline LinkedIn glyph. Favicon SVG; PWA icons 192/512/maskable/monochrome.

## 4. Findings

Severity: high = blocks a main goal (contact, trust, accessibility failure on common paths);
medium = clear loss; low = polish. Lenses: UX, content, visual, a11y, SEO, mobile, back-office.
Recommendation = a direction for the redesign plan, not a design.

### Contrast (computed)

White text with alpha over the real backgrounds:

| bg | white/40 | /60 | /70 | /80 | /100 |
|---|---|---|---|---|---|
| `#162729` (hero top, footer) | 3.66 | 6.48 | 8.24 | 10.36 | 15.48 |
| `#264445` (hero bottom) | 3.11 | 4.94 | 6.11 | 7.44 | 10.53 |
| `#3f5b57` (primary band) | 2.60 | **3.83** | 4.60 | 5.43 | 7.38 |
| `#4a7a6f` (primary-light) | 2.07 | **2.85** | **3.29** | **3.77** | 4.88 |

Gray and brand text:

| Text | on white | on section tint `#f6f8f8` |
|---|---|---|
| gray-700 `#374151` | 10.31 | 9.67 |
| gray-600 `#4b5563` | 7.56 | 7.09 |
| gray-500 `#6b7280` | 4.83 | 4.54 |
| gray-400 `#9ca3af` (back-office placeholders) | **2.54** | **2.38** |
| primary `#3f5b57` | 7.38 | 6.92 |
| primary-light `#4a7a6f` | 4.88 | 4.58 |
| red-600 `#dc2626` (public form error) | 4.83 | 4.53 |
| red-700 `#b91c1c` (back-office errors) | 6.47 | 6.07 |
| near-black/70 (nav links on white/90) | 6.48 | |
| white on primary-light button | 4.88 | |
| primary on chip (`primary-light/10` = `#edf2f1`) | 6.53 | |

Reading: the contrast the brief worried about is **mostly fine in practice**. The 60-80% whites
that are used (hero subtitle 80% and footer 60% on `#162729`; "Votre avis" subtitle 80% on
`#3f5b57`; QR card 70-80% on the gradient) all pass 4.5:1. What fails or is fragile:
- white/60 on `#3f5b57` (3.83) and any white/60-80 on `#4a7a6f`: not used today, but the "Votre avis" band is exactly that background, so any future muted text there fails (A-13).
- The hero scroll arrow at white/60 on `#264445` (4.94) is decorative and passes anyway.
- The QR card's disabled button text at white/40 is intentionally disabled (exempt).
- gray-500 on the tint is 4.54, passing by a hair; at `text-xs font-300` (dates, `PublicationCard.tsx:53`) the light weight makes it hard to read (A-12).
- `gray-400` placeholders and disabled text in the back-office (`backoffice/ui.tsx:25,27,54`) fail 3:1 and 4.5:1.

### Findings table

| Id | Sev | Lens | Finding | Evidence | Direction |
|---|---|---|---|---|---|
| A-01 | high | UX / content | **The positioning is generic**: h1 "Avocate en droit des sociétés" + subtitle "…dédié aux professionnels libéraux" say what, not what it changes for the client; the real differentiators (Ordre, déontologie, anticipation of associate conflicts, Lyon) sit in the 4th paragraph of À propos. No value proposition above the fold. | `constants.ts:34-38`, `:43-46`; `Hero.tsx:20-31` | Rework the message hierarchy (promise, audience, proof) before any visual work; see D3 issue 1. |
| A-02 | high | UX / IA | **Navigation is organised around the page, not the visitor**: 5 anchors (Accueil, À propos, Domaines d'intervention, Votre avis, Contact) + Publications. "Votre avis" is for existing clients; "Accueil" is redundant with the logo; there is no primary action in the bar; the long label "Domaines d'intervention" is a wrap risk on tablets. | `constants.ts:22-32`, `Navbar.tsx:62-94` | Re-think the nav around prospect tasks; one visible contact CTA; move the review ask out of the main nav (to the footer / post-article / carte). |
| A-03 | high | SEO / content | **No dedicated page per domaine**: the 6 domaines are 1-3 sentence cards with no link, while prospects search "créer une SEL Lyon", "cession de patientèle avocat", "contentieux ordinal". Only `/publications/*` and home can rank. The sitemap lists 4 static URLs + articles. | `Services.tsx`, `constants.ts:50-89`, `app/sitemap.ts:8-33` | Evaluate one landing page per domaine (and per profession); define URLs and redirects in the IA/SEO issues. |
| A-04 | high | content | **Proof is almost absent**: reviews are a link only (the `Testimonials` component shows none, `Testimonials.tsx`), no client types, no cases, no figures, no bar registration or training, no Google rating. Credentials are "Barreau de Lyon" in the footer and OG alt. The only image of a person is one portrait. | `Testimonials.tsx`, `Footer.tsx:29`, `About.tsx` | Plan a proof layer (selected testimonials with consent, credentials, publications as expertise); content to be gathered from Eva. |
| A-05 | high | UX | **CTA and its promise do not match**: "Prendre rendez-vous" scrolls to a contact form; there is no scheduling, no phone number next to it, no stated response time. | `Hero.tsx:26-31`, `constants.ts:37` | Align label with the real action ("Écrire à Eva" / "Contacter le cabinet") or add a real booking path; show phone beside the CTA. |
| A-06 | medium | UX / mobile | **Contact channels are buried**: phone and email appear only in the Contact section and footer; the navbar carries no phone/CTA on desktop or mobile; on mobile the burger holds 6 text links and nothing actionable. | `Navbar.tsx`, `contactItems.ts` | A persistent contact action (tel on mobile) in the header; revisit the burger content. |
| A-07 | medium | content | **Offer descriptions are written from the lawyer's side**: dense legal acronyms (SEL, SCM, SCI, SPFPL) without a plain-language gloss; the first card's paragraph is 51 words; no example case, no "for whom", no process, no pricing or first-meeting info. | `constants.ts:55-58`, `:86` | Content rewrite with plain language and examples; add "how it works" and what to prepare for a first call. |
| A-08 | medium | visual / UX | **Flat hierarchy**: 6 identical cards (same icon size, same shadow, same copy length) with no priority; `py-20` sections and alternating white / tint / primary backgrounds repeat the same rhythm; the result reads as a standard template. | `Services.tsx:20-32`, `ui/ServiceCard.tsx`, `app/page.tsx` | Differentiate core vs secondary offers; vary density and section structure in the new design system. |
| A-09 | high | UX / conversion | **Articles are dead ends**: after the body there is no author card, no contact CTA, no related or next article; the single exit is the footer. Publications are the main SEO entry (J2) but do not convert. | `publications/ArticleView.tsx:19-76`, `[slug]/page.tsx:52-60` | Article template with author block, contextual CTA, related content. |
| A-10 | low | UX | List ↔ article wayfinding is minimal: back link to `/publications` loses the active category / page; filter chips and pagination exist but there is no search or sort; no reading time. | `[slug]/page.tsx:53-58`, `publications/CategoryFilter.tsx` | Preserve list state; consider reading time and categories as entry points. |
| A-11 | medium | mobile / UX | **`/carte` depends on User-Agent sniffing**: non-mobile UA (or iPad in desktop mode) is silently redirected to `/`; on Android only the two buttons show, phone/email appear only on iOS; Firefox iOS gets a disabled button + a hint. | `app/carte/page.tsx:14, 36-45, 63-110` | Show contact links for all platforms; make desktop either a real page or an explicit explanation; test vCard across devices. |
| A-12 | medium | a11y / visual | **Thin, small text**: body copy is Museo 300 at `text-sm` (14px) in gray-600/700 in cards, forms, dates (72 `text-sm`, 33 `text-xs`, 32 `font-300`). Numerically it passes AA, but the light weight reduces legibility (older readers, mobile in sunlight). `text-xs font-300 text-gray-500` for dates sits at 4.54:1 on the tint. | `ui/ServiceCard.tsx:27`, `PublicationCard.tsx:49,53`, `Contact.tsx:61` | Raise base size/weight in the type scale (≥16px for body, 14px minimum for meta). |
| A-13 | medium | a11y | **White-alpha text on the primary band is a trap**: `#3f5b57` gives 3.83 at /60 and `#4a7a6f` gives 2.85-3.77 at /60-80. Today the band uses /80 on `#3f5b57` (5.43: passes) and white at 100% in buttons, but the `/60-/80` pattern is used as a general style (`Footer.tsx:29,40,85`, `Hero.tsx:23`, `carte`), so any reuse on primary-light fails. | `Testimonials.tsx:10`, `Footer.tsx`, `Hero.tsx:23` | Define solid, pre-checked "muted on dark" tokens instead of alpha utilities. |
| A-14 | low | a11y / visual | The global `:focus-visible` forces `border-radius: 2px` on every focused element, so buttons (4px), pills (`rounded-full`) and cards lose their shape on focus; inputs rely on a border + ring + outline all at once. Outline colour `primary-light` is 4.88 on white (OK) but only ~3.2 against `#264445` and white backgrounds mixed. | `app/globals.css:53-57`, `Contact.tsx:13` | One focus style in the design system: ring colour per surface (light/dark), no radius override. |
| A-15 | low | a11y | "Laisser un avis" opens a new tab (`target=_blank`) with no indication in its name; the same for the LinkedIn link and the credit link. Brand icons are `aria-hidden`: ok. | `Testimonials.tsx:14-22`, `Contact.tsx:57-62`, `Footer.tsx:104-111` | Add "(nouvel onglet)" hidden text / icon with sr-only. |
| A-16 | medium | a11y | **Scroll-reveal content is invisible without JS**: `About` and `ServiceCard` render with `opacity: 0` until an IntersectionObserver fires (client component, initial state hidden), so the portrait, 4 paragraphs and 6 cards are hidden in the server HTML and for crawlers that do not run scripts or print; first-paint also shows empty blocks. | `About.tsx:9, 18-22`, `ui/ServiceCard.tsx:13, 19-23`, `hooks/useIntersectionObserver.ts` | Prefer CSS-only reveal or no reveal for primary content; never hide text by default. |
| A-17 | medium | UX / a11y | **Contact form**: only native browser validation (no inline messages, `noValidate` absent, no `aria-describedby`), while the server validates and has field messages (`lib/contact.ts:46-56`, `constants.ts:146-153`) that the client never shows: any 400 becomes the generic "Une erreur est survenue" (`Contact.tsx:33,37`); success message replaces nothing and the form resets; phone optional but undeclared; no required indicator (asterisk or "(requis)") on labels; no privacy notice or consent line next to the submit although the site has a privacy policy; the subject select starts on a disabled "-- Sélectionnez --". | `Contact.tsx:74-161`, `constants.ts:146-153` | Define field states (default/focus/error/success), a required marker, GDPR notice and response-time promise. |
| A-18 | medium | UX / SEO | **Navbar on standalone pages points to anchors by page reload** (`/#a-propos` etc.) and the "overlay" variant relies on a scroll-spy and a hero logo id; the "Publications" link has no active state on `/publications`; two nav variants + two footer variants to maintain. | `Navbar.tsx:31-34, 62-94`, `hooks/useScrollSpy.ts` | Single navigation model with route-aware active state; drop the hero-logo-driven hack in the redesign. |
| A-19 | medium | back-office / visual | The back-office has **no logo and a different visual language**: text "Eva Biezunski · Gestion", `gray-*` neutrals, `rounded`, `shadow-sm`, red-700 vs the site's red-600, a `green` success palette that the site never uses. Functionally coherent, but it feels like a separate product. | `backoffice/Shell.tsx:99`, `AuthCard.tsx:9`, `backoffice/ui.tsx:26,115-116,137` | Share tokens (colour, type, radius) with the public site in the design system; keep admin density. |
| A-20 | medium | SEO | **Structured data is a single `Attorney` block**: no `Article` / `BlogPosting`, `BreadcrumbList`, `LegalService` / `Service` per domaine, `FAQPage`, no opening hours or `geo`, no `aggregateRating`; `priceRange: "$$"` is a placeholder that suits restaurants more than a law firm. `Attorney` JSON-LD is in `<head>` of every page. | `app/layout.tsx:76-100, 106-109` | SEO issue: structured data per page type; review `priceRange`. |
| A-21 | low | SEO | `app/sitemap.ts` sets `lastModified: new Date()` on every build for all URLs (not the article's `updatedAt`); the comment mentions Notion (the source is now the Django API, `sitemap.ts:35`). `robots.ts` disallows `/carte` which already is `noindex` (the crawler cannot see the tag). Root metadata sets `canonical: "/"` as the default for every page (`layout.tsx:38-40`), so any new route without its own canonical claims the home page. | `app/sitemap.ts:6, 35`, `app/robots.ts:10`, `app/layout.tsx:38-40` | Fix in the SEO preservation issue: real `lastModified`, per-route canonicals, redirects map. |
| A-22 | medium | SEO / content | **Local SEO is thin**: address and phone appear (good) but there is no Google Business reference besides the review link, no neighbourhood / métro info, no map; the keywords in metadata (`layout.tsx:16-26`) are ignored by Google; h1 on home does not mention Lyon or "professions libérales"; `SITE.title` is long (73 chars) and gets truncated in results. | `layout.tsx:16-26`, `constants.ts:2-5`, `Contact.tsx:48-71` | Local SEO checklist (title, h1, NAP consistency, map, GBP link). |
| A-23 | medium | back-office | **Save vs publish is ambiguous**: "Enregistrer" and "Publier" / "Repasser en brouillon" are separate buttons; saving a published article publishes the change immediately; slug and publication date are exposed without explanation. | `ArticleEditor.tsx:192, 296-306, 445-479` | Clear status model ("Brouillon" / "En ligne") with a single primary action; explain what is public. |
| A-24 | low | back-office | Editor vocabulary and safety: slash menu includes "Code", "Tableau", "Liste de tâches", "Séparateur" (developer terms), 12 items; no autosave or version history (only the `beforeunload` guard); unclear how to discover "/" . To verify with Eva before deciding. | `editor/slash-items.ts`, `ArticleEditor.tsx:151-155` | Trim and rename blocks for a legal author; consider autosave and undo of publication. |
| A-25 | low | back-office / mobile | The back-office shell is responsive (burger) but the editor (side panel + rich toolbar) is a desktop-first layout; not verified by screenshots. | `backoffice/Shell.tsx:97-131`, `ArticleEditor.tsx` | Decide whether mobile editing is in scope; if so, test it. |
| A-26 | low | visual | Hacks that signal missing system pieces: `-mt-6` on the review subtitle to cancel `mb-12`; inline `transition` overriding hover transitions on `ServiceCard`; `transition-all` everywhere; `scroll-padding-top` hard-coded; hero `pt-20 md:pt-0` for the fixed navbar; two variants for Navbar/Footer. | `Testimonials.tsx:10`, `ui/ServiceCard.tsx:19-23`, `globals.css:38-47`, `Hero.tsx:8` | Absorb in design system v2 components (heading with subtitle, motion tokens). |
| A-27 | low | visual / brand | **Token model is thin**: 5 brand colours, 2 teals only used as gradient stops, gray scale from Tailwind (3 text grays), two reds, no semantic tokens, no spacing or type scale tokens, `BRAND_COLORS` duplicated in `constants.ts:11-14`. Museo 100/900 shipped but unused. | `app/globals.css:28-36`, `constants.ts:11-14`, `public/fonts` | Design system v2: semantic tokens, a type scale, drop unused weights (or use them deliberately). |
| A-28 | medium | brand / legal | **Museo web licence unknown**: the OTFs are served from `/fonts` (OpenType, not WOFF2, ~uncompressed, no `unicode-range`); with `font-display: swap` the first paint is in Georgia, then reflows. Whether Eva holds a web licence is not recorded in the repo. | `app/globals.css:4-26`, `public/fonts/*.otf` | Brand issue: confirm licence; convert to WOFF2 + preload; verify fallback metrics. |
| A-29 | low | mobile / performance | Portrait is 835×1112 and used as `priority` in About (below the fold) and for OG/Twitter; hero logo `priority` too. The hero is `min-h-screen` (100vh, jumps with mobile browser bars) with the arrow absolutely positioned. Not measured: needs Lighthouse. | `About.tsx:26-33`, `Hero.tsx:8`, `layout.tsx:60-62` | Measure first (performance budget issue); use `svh`. |
| A-30 | low | content | Tone is good (first person, warm, plain: "Je vous guide…") but inconsistent: the form success speaks of "Eva vous répondra" (third person) while the site is "Je"; the footer says "Avocate au Barreau de Lyon" whereas the hero says "Cabinet d'avocat"; "Contact"/"Coordonnées" are two headings in one section; nav says "Accueil" but the page has no h1 about the home beyond the hero. Legal pages use `text-2xl` h2 in a different rhythm. | `constants.ts:143`, `Contact.tsx:49`, `mentions-legales/page.tsx` | Editorial guide in the content issue. |
| A-31 | low | a11y | Heading order is mostly sound (one h1 per page; home h1 = hero). Gaps: footer uses `h2` for "Navigation" and "Contact" (second "Contact" h2 on the home page, `Footer.tsx:34, 59`); service and publication cards use `h3` under the section h2 (fine). The article cover uses a generic alt "Illustration de l'article" when none set (`PublicationCard.tsx:22`). | `Footer.tsx:34,59`, `ui/PublicationCard.tsx:22` | Check landmark labelling and alt policy in the a11y issue. |
| A-32 | low | UX | The home Publications teaser comes **after** Contact and is the last section, so articles never lead into the form; the teaser hides its CTA when there is a single article and shows a gradient placeholder card for covers; the section is empty when the API fails (error is swallowed to the empty state by `getJson`). | `app/page.tsx:19-21`, `LatestPublications.tsx:22`, `lib/publications.ts:49-55` | Decide the role of publications in the IA (credibility vs conversion), reorder accordingly. |

Not findings (checked and fine): skip link (`layout.tsx:112`), `lang="fr"`, single `<main id="contenu">`,
reduced-motion handling, `aria-current` on nav and pagination, labelled form fields, native
`<details>` category disclosure (works without JS), server-rendered filters and pagination
(crawlable), ISR and revalidation by tag, `noindex` on `/carte` and `/404`, canonical on legal pages.

## 5. Keep vs question

### Keep (brand equity)
- **Logo** and its five variants; the dark-teal-on-white / white-on-teal usage.
- **Teal palette** (`#3f5b57`, `#4a7a6f`, `#264445`, `#162729`): distinctive for a law firm, calm, passes contrast with solid colours.
- **Museo**: warm humanist face that suits the tone; keep the family, revisit weights and size (subject to the licence, A-28).
- **Tone of voice**: first person, plain verbs, "professionnels libéraux" as the explicit audience.
- **Portrait** and the idea of a person-led firm; the QR card concept; the publications as a content strategy; the existing accessibility basics (skip link, focus-visible, reduced motion, labelled forms); server-rendered, crawlable filters.

### Question (rethink in the redesign)
- Positioning and hero message (A-01) and the single long page (A-02, A-03).
- The 6-card offer and absence of landing pages (A-03, A-07, A-08).
- Proof and credibility (A-04), the review block as a "section" (A-02).
- Article template and conversion path (A-09).
- Typography scale and light-weight body (A-12), the token model (A-27) and the hand-built motion (A-16, A-26).
- Navigation and the overlay/solid navbar mechanism (A-18), contact CTA (A-05, A-06).
- Back-office vocabulary and publishing model (A-23, A-24), visual alignment with the site (A-19).
- Imagery: one portrait only; consider documentary photography, illustration or none, decided in the brand issue.

## Method and limits
- Read: all of `app/`, `components/`, `lib/constants.ts`, `lib/publications.ts`, `hooks/`, `globals.css`; the back-office was read at screen level (Shell, AuthCard, `ui.tsx`, article list and editor headers), not line by line. The privacy page was only scanned for headings.
- Not done (no running site): real rendering, responsive checks, Lighthouse, screen-reader pass, analytics. Statements about mobile behaviour come from the classes, not screenshots.
- Contrast values were computed with a small script (relative luminance, alpha blending over the actual background colours).
