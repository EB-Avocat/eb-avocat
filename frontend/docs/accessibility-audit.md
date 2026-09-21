# Accessibility Audit — biezunski-avocat.fr

**Date:** 2026-06-19
**Standard targeted:** WCAG 2.1 Level AA (the basis of the French RGAA)
**Method:** Automated scan with [axe-core](https://github.com/dequelabs/axe-core) driven by a real Chromium via Playwright (`bun run test:a11y`), against a **production build**, plus manual review. Color-contrast and focus-visibility checks require a real browser — jsdom/Vitest cannot compute them.

Pages audited: `/`, `/carte` (mobile UA — desktop is server-redirected to `/`), `/mentions-legales`, `/politique-de-confidentialite`.

---

## Summary

The site is in **good** shape. The automated axe-core scan reports **zero WCAG 2.1 A/AA violations** on every page — semantic landmarks, image `alt` text, form labels, language, and (notably) **color contrast all pass**. The remaining findings are things automated tools cannot fully verify (keyboard operation, screen-reader state, motion) plus two best-practice heading issues on the legal pages.

| Page | axe WCAG A/AA | Contrast | Notable manual/best-practice findings |
|---|---|---|---|
| `/` (home) | ✅ 0 violations | ✅ pass | No skip link; hamburger lacks `aria-expanded`; no `aria-current`; decorative SVG not hidden; no reduced-motion |
| `/carte` | ✅ 0 violations | ✅ pass | (disabled vCard button is intentionally dim — exempt) |
| `/mentions-legales` | ✅ 0 violations | ✅ pass | No `<h1>` (`page-has-heading-one`); heading order skips |
| `/politique-de-confidentialite` | ✅ 0 violations | ✅ pass | No `<h1>` (`page-has-heading-one`); heading order skips |

---

## Contrast (verified, not just estimated)

axe computes contrast on the **rendered** pixels, flattening alpha against the actual background. The translucent text that looked risky on inspection measures fine:

- Footer `text-white/60` over `#162729` (`--color-darker-teal`) → effective ≈ `rgb(162,169,169)` on `#162729` ≈ **6.0:1** — passes AA for normal text (incl. the `text-xs` legal links).
- Hero `text-white/80` subheading over the teal gradient — passes.
- Nav `text-near-black/70` over `bg-white/90`, `text-gray-600` service descriptions, `text-gray-700` contact links — all pass AA.

No contrast remediation is required. The only sub-threshold text is the **disabled** Firefox-iOS vCard button (`text-white/40`, `aria-disabled="true"`), which WCAG exempts as an inactive control.

## Keyboard accessibility

- **No "skip to content" link.** Keyboard/switch users must tab through the whole nav on every page before reaching content. → fixed: added a visually-hidden-until-focused skip link to `#contenu`.
- **Focus visibility relied on the browser default outline**, and form inputs set `focus:outline-none` with only a faint `ring-…/20`. → fixed: added a global high-contrast `:focus-visible` outline and a stronger form-field focus ring.
- Tab order and focus reachability of nav + all contact-form fields verified OK by the harness.

## Screen reader

- **Hamburger button had no `aria-expanded`/`aria-controls`** and a static `aria-label="Menu"` that never reflected the open state. A screen-reader user could not tell the menu was expanded. → fixed: `aria-expanded`, `aria-controls`, and a state-aware label ("Ouvrir/Fermer le menu").
- `<nav>` had no accessible name, and the active section had no `aria-current`. → fixed: `aria-label` on `<nav>`, `aria-current` on the active link.
- **Contact form "Objet" `<select>` not announced under VoiceOver.** The DOM was already correct (the `<label for>` associates and Chromium/axe compute the accessible name as "Objet"), but VoiceOver — especially on Safari/iOS — is unreliable at announcing a native select's label via implicit `for`/`id` association, and the empty placeholder option muddied how the choices were presented. → fixed: explicit `aria-labelledby` on the select pointing at the visible label, and the placeholder is now a `disabled` prompt so the real options are presented as the choices. This is a VoiceOver quirk no automated tool flags — re-verify it with the manual checklist.
- **Decorative Hero scroll-arrow SVG** was announced as a graphic. → fixed: `aria-hidden="true"`.
- Legal pages start at `<h2>` with **no `<h1>`** and a skipped level (axe `page-has-heading-one` + `heading-order`). → fixed: real `<h1>` page title; section headings follow in order.

## Motion

- No `prefers-reduced-motion` handling: the Hero `animate-bounce` indicator and the scroll-in fades run regardless of OS setting (WCAG 2.3.3, AAA — but cheap and good practice). → fixed: motion is suppressed under `prefers-reduced-motion: reduce`.

---

## How to re-run this audit

```sh
bun run test:a11y          # full axe + keyboard + menu suite against a production build
bunx playwright show-report # open the HTML report after a run
```

The suite gates on **zero** WCAG 2.1 A/AA violations across all pages and asserts the skip link, focus visibility, form reachability, and `aria-expanded` behavior. Wire `bun run test:a11y` into CI to keep these regressions out.

For the parts no tool can check, follow **`docs/accessibility-manual-checklist.md`** (VoiceOver + keyboard-only walkthrough).
