# Add Gate To Contact Form — UX brief

The gate should be invisible to real visitors. Design work is small: placement of the Turnstile
widget for the rare case it shows, the new error state, and the privacy-policy wording.

## Form states to design (desktop + mobile, existing contact section)
1. **Default** — unchanged form. Turnstile is in "interaction-only" mode: nothing visible.
2. **Challenge shown** — Cloudflare widget (≈ 300 × 65 px, fixed size, not stylable beyond
   light/dark theme) appears just above the submit button, left-aligned with the fields. Must not
   overflow on a 320 px wide screen (widget has a `compact` size 150 × 140 if needed — decide).
3. **Sending** — existing "Envoi en cours…" button state (also covers waiting for the token).
4. **Success** — unchanged.
5. **Verification failed** (new) — `role="alert"` message under the button, same style as the
   existing error. Form content is kept so the visitor can retry.
6. **Generic error** — unchanged.

The honeypot field is never visible and must not be reachable by keyboard or screen reader.

## Copy (French, goes in `src/lib/constants.ts`)
- Verification failed: « La vérification anti-spam n'a pas abouti. Veuillez réessayer, ou contacter
  le cabinet par téléphone ou par email. » (UX may refine.)
- Field length errors (server): « Le message est trop long (5 000 caractères maximum). » and a
  generic « Un des champs dépasse la longueur autorisée. »
- Optional discreet note under the button: « Ce formulaire est protégé contre le spam par
  Cloudflare Turnstile. » with a link to the privacy policy — UX decides whether it is needed.

## Privacy policy paragraph (draft, Eva validates)
« Afin de protéger le formulaire de contact contre les envois automatisés (spam), le Site utilise
le service Cloudflare Turnstile, fourni par Cloudflare, Inc. Ce service analyse des informations
techniques relatives à votre navigateur et votre adresse IP, uniquement pour vérifier que la
demande émane d'une personne. Ces données ne sont pas utilisées à des fins publicitaires. Ce
traitement repose sur l'intérêt légitime du Cabinet à sécuriser son Site. »

## Accessibility
- Widget focusable and announced (Cloudflare targets WCAG 2.1 AA); no time limit imposed by us.
- New messages use `role="alert"` like the existing error.
- No CAPTCHA puzzle, no audio challenge.
