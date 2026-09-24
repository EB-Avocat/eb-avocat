# Manual Accessibility Checklist — biezunski-avocat.fr

Automated tools (axe-core via `bun run test:a11y`) catch contrast, missing labels,
ARIA misuse, and structure. They **cannot** confirm that the screen-reader
experience and keyboard operation actually make sense. Run this checklist by hand
before each release, or after any change to the navbar, contact form, or layout.

The site is in French — test with a **French screen-reader voice**.

---

## 1. Keyboard-only pass (no mouse)

Unplug/ignore the mouse. On each page (`/`, `/mentions-legales`,
`/politique-de-confidentialite`, and `/carte` on a phone):

- [x] **First `Tab` reveals the "Aller au contenu" skip link** in the top-left; press `Enter` and focus jumps to the main content.
- [x] Every link, button, form field, and the hamburger is reachable with `Tab`, in a logical order (left→right, top→bottom).
- [x] **The focus indicator is always clearly visible** (teal outline) — including over the dark teal hero and footer. Nothing receives focus invisibly.
- [x] `Shift+Tab` walks back up in the reverse order.
- [x] No keyboard trap: you can always tab out of any component.
- [x] On the home page, activate each nav link with `Enter` — the page scrolls to the right section.
- [x] Mobile width (< 768px): the hamburger opens/closes with `Enter`/`Space`; menu links are reachable; `Esc` or re-activating closes it. Focus is not lost when it closes.
- [x] Contact form: every field is reachable, the `<select>` opens with the keyboard, and `Tab` order matches the visual order.

## 2. Screen-reader pass (VoiceOver, French voice)

macOS: `⌘+F5` to toggle VoiceOver. Set the voice to a French voice in
VoiceOver Utility. Navigate with `Ctrl+Option+→` and the rotor (`Ctrl+Option+U`).
iOS: Settings → Accessibility → VoiceOver; swipe to move, double-tap to activate.

### Landmarks & structure
- [x] Rotor → **Landmarks**: you hear a banner/navigation, a `main`, and a `contentinfo` (footer). The nav is announced as **"Navigation principale"**.
- [x] Rotor → **Headings**: each page has exactly **one `h1`** (home = "Avocate en droit des sociétés"; legal pages = their title). Levels descend logically with no skipped level.

### Navigation
- [x] The active section link is announced as **current** (`aria-current`) while browsing the home page.
- [x] The **hamburger** announces its name and state: closed = "Ouvrir le menu, button, collapsed"; after activating = "Fermer le menu, button, expanded". The menu's links are then reachable.

### Images & icons
- [x] Each logo is announced as **"Eva Biezunski - Avocate"** (not "image" or a filename).
- [x] The decorative scroll-down arrow on the hero is **silent** (not announced).
- [x] Decorative icons beside contact details don't add noise — you hear the address/phone/email text, not "image".

### Contact form
- [x] Each field announces its **label** (Nom, Prénom, Email, Téléphone, Objet, Message) and its type/role.
- [x] **Objet `<select>` regression check:** focusing the select announces **"Objet"** (its label), and opening it announces each option (Création de société, Clientèle / Patientèle, …). The "-- Sélectionnez --" prompt is announced as **dimmed/unavailable** (it is a `disabled` placeholder). *Native `<select>` + VoiceOver is historically flaky — if the label or options are still not announced on a given OS/Safari version, the next step is to replace the native select with a fully-built ARIA combobox; do **not** add more ARIA to the native element, which tends to make it worse.*
- [x] Choosing "Autre" in the Objet `<select>` reveals the "Précisez l'objet" field, and VoiceOver can reach the newly shown field.
- [x] The submit button is announced as a button with its label.

### /carte (mobile, scan a QR or load on a phone)
- [x] "Enregistrer le contact" and "Visiter le site" are announced as links.
- [x] On Firefox iOS the disabled save button is announced as **dimmed/unavailable** (it is `aria-disabled`), and the hint text is read.
- [x] The address / phone / email links are announced with their text.

## 3. Reduced motion

- [x] Enable **System Settings → Accessibility → Display → Reduce motion** (macOS) or the equivalent OS toggle, reload the home page: the hero scroll-arrow bounce stops, scroll-in fades are instant, and anchor scrolling is not animated.

## 4. Zoom / reflow (WCAG 1.4.10)

- [x] Browser zoom to **200%** and **400%** (or 320px-wide viewport): content reflows to a single column with no horizontal scrolling and no clipped text. Check the privacy-policy tables remain readable (they scroll horizontally within their own container only).

---

### On-device testing tip
`next.config.ts` already sets `allowedDevOrigins` for `192.168.1.*` / `*.local`,
so you can run `bun run dev` and open the site from a phone on the same network
(`http://<your-mac-ip>:3000`) to test mobile VoiceOver / TalkBack and the `/carte`
page with a real mobile user agent.
