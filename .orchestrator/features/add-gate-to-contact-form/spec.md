# Add Gate To Contact Form — spec

## Context

The contact form (`frontend/src/components/Contact.tsx`) POSTs JSON to the Next.js route
`frontend/src/app/api/contact/route.ts`, which validates (`frontend/src/lib/contact.ts`) and sends
an e-mail to Eva through Brevo. There is no protection: any script can `POST /api/contact` and land
a message in the lawyer's inbox. The Django backend is not involved. The site is on Vercel; there is
no cookie banner, no CSP, no analytics. Accessibility (WCAG 2.1 AA / RGAA) is checked by Playwright
+ axe; RGPD matters (French law firm, professional secrecy).

Goal: stop automated submissions (scripts, spam bots, headless browsers, unattended AI agents)
without adding friction for real visitors, without breaking accessibility, and without sending
client message content to third parties.

Non-goal: blocking a human who uses an AI assistant to fill the form for them — that is a real
prospect. No gate can reliably tell them apart, and we should not try.

## Options considered

| # | Option | Stops | Friction | Privacy / RGPD | Cost | Verdict |
|---|--------|-------|----------|----------------|------|---------|
| A | **Honeypot field + minimum fill time** (hidden field bots fill; reject submissions faster than ~3 s) | Dumb form-spam bots, direct POSTs | None | No third party | Free | **Do it (baseline)** |
| B | **Server hardening**: length caps, max links in message, `Origin` check, silent drop for detected bots | Scripted POSTs, link spam | None | None | Free | **Do it (baseline)** |
| C | **Cloudflare Turnstile** (invisible / "interaction-only" mode, token verified server-side) | Most bots incl. headless browsers & automated agents | Usually none; rare one-click check | Cloudflare (US, DPF) processes browser signals, no ad tracking, no consent banner needed; privacy policy must mention it | Free | **Recommended gate** |
| D | Vercel BotID (invisible, Vercel-native, `checkBotId()` in the route) | Similar to C; "Deep Analysis" needs a paid plan ($1 / 1000 checks) | None | Vercel (already our host) | Basic free, deep paid | Good alternative if you prefer zero new vendor; ties us to Vercel |
| E | ALTCHA (self-hosted proof-of-work widget) | Mass spam (makes it costly); weaker vs. real headless browsers | Small widget, a few-second compute | Fully self-hosted, best RGPD story | Free | Alternative if no third party at all is a hard requirement |
| F | Google reCAPTCHA / hCaptcha / image CAPTCHA | Bots | Visible puzzles, a11y issues | reCAPTCHA is problematic under CNIL guidance | Free–paid | **Rejected** |
| G | AI / Akismet content classification | Spam content | None | Sends client messages to a third party — conflicts with professional secrecy | Paid | **Rejected** |
| H | E-mail confirmation (double opt-in) | Fake senders | High (visitor must click a link) | OK | Free | **Rejected** (too much friction for a prospect) |
| I | Rate limiting per IP (Vercel Firewall rule on `/api/contact`, e.g. 5 req / 10 min) | Floods from one IP | None | None | Plan-dependent | **Recommended ops step** (dashboard config, no code) |

## Decision (proposed — approve or pick another option)

Layered: **A + B + C**, plus **I** as an optional dashboard setting done by you.

## Behaviour

### Client (`Contact.tsx`)
- Hidden honeypot input (e.g. `name="website"`), off-screen, `tabIndex={-1}`, `autoComplete="off"`,
  `aria-hidden` wrapper — invisible to sighted users and screen readers.
- Records the time the form was first rendered; sends `elapsedMs` with the submission.
- Renders the Turnstile widget (`appearance: "interaction-only"`, `language: "fr"`) inside the form,
  just above the submit button. It stays invisible unless Cloudflare needs an interaction.
- Sends the Turnstile token as `turnstileToken`; resets the widget after each submit (tokens are
  single-use) and after an error.
- Submit button stays usable; if the token is not ready yet when the visitor clicks, wait for it
  (short spinner state, existing "Envoi en cours…" copy) rather than failing.
- New French copy in `src/lib/constants.ts` (see ux-brief.md) for the "verification failed" case,
  pointing to the phone / e-mail fallback.

### Server (`/api/contact` + `lib/contact.ts`)
Order of checks, cheapest first:
1. `Origin` header must match the site origin (or be absent in tests/dev). Mismatch → 403.
2. Body validation as today, plus caps: names ≤ 100, email ≤ 254, phone ≤ 30, subject ≤ 150,
   message ≤ 5000 chars; message with more than 3 URLs is treated as spam.
3. Honeypot filled, `elapsedMs` < 3000, or more than 3 URLs in the message → **silent drop**: respond `200 { ok: true }` (bot learns
   nothing), send no e-mail, log `console.warn("Contact spam dropped:", reason)`.
4. Turnstile: verify `turnstileToken` with `https://challenges.cloudflare.com/turnstile/v0/siteverify`
   (secret + token + client IP from `x-forwarded-for`), check `success`, `hostname`, and `action`
   (`"contact"`). Invalid / missing token → `400 { ok: false, code: "verification_failed" }`.
   - `TURNSTILE_SECRET_KEY` unset → skip this step with a `console.warn` (dev, tests, preview
     without keys). Layers A + B still apply.
   - siteverify unreachable / 5xx → **fail open** (send the e-mail) and `console.error`: losing a
     real client's message is worse than one spam.
5. Send through Brevo as today.

### Config
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (frontend env). Document them where the
  Brevo vars are documented. Tests / local use Cloudflare's official test keys
  (always-pass `1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`).
- **You** create the Turnstile widget in a Cloudflare account (free) for `biezunski-avocat.fr` and
  set both keys on the Vercel `frontend` service. Until then the site keeps working with A + B.

### Privacy policy
`/politique-de-confidentialite`: add a short paragraph naming Cloudflare Turnstile as the anti-spam
service on the contact form (purpose: security / legitimate interest; data: technical browser
signals and IP; no advertising use). Draft wording is in ux-brief.md — **Eva should validate it**.

## Acceptance criteria
- A direct `curl -X POST /api/contact` with a valid body and no token sends no e-mail (prod config).
- Honeypot filled or too-fast submission → 200, no Brevo call.
- Valid human submission in a browser → e-mail sent, no visible challenge in the common case.
- Turnstile failure → French error message with phone/e-mail fallback, form content kept.
- Over-long fields / link-stuffed messages rejected.
- Vitest covers every branch of the route and of the new helpers; `bun run lint|typecheck|test`
  green; Playwright a11y suite still passes with the widget (test keys).
- Privacy policy paragraph added.

## Out of scope
- Moving the contact endpoint to Django.
- Storing submissions in a database / back-office inbox.
- Code-level rate limiting (needs a shared store; the Vercel Firewall rule covers it).
