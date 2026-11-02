# Add Gate To Contact Form — spec

## Context

The contact form (`frontend/src/components/Contact.tsx`) POSTs JSON to the Next.js route
`frontend/src/app/api/contact/route.ts`, which validates (`frontend/src/lib/contact.ts`) and sends
an e-mail to Eva through Brevo. There is no protection: any script can `POST /api/contact` and land
a message in the lawyer's inbox. The Django backend is not involved. The site is on Vercel (Services:
`frontend` + `backend`, root `vercel.json`); there is no cookie banner, no CSP, no analytics.
Accessibility (WCAG 2.1 AA / RGAA) is checked by Playwright + axe; RGPD matters (French law firm,
professional secrecy).

Goal: stop automated submissions (scripts, spam bots, headless browsers, unattended AI agents)
without friction for real visitors, without breaking accessibility, without sending client message
content to third parties, and **without adding a new vendor** (no Cloudflare — revision 2).

Non-goal: blocking a human who uses an AI assistant to fill the form for them — that is a real
prospect. No gate can reliably tell them apart, and we should not try.

## Options considered

| # | Option | Stops | Friction | Privacy / RGPD | Cost | Verdict |
|---|--------|-------|----------|----------------|------|---------|
| A | **Honeypot field + minimum fill time** (hidden field bots fill; reject submissions faster than ~3 s) | Dumb form-spam bots, direct POSTs | None | No third party | Free | **Do it (baseline)** |
| B | **Server hardening**: length caps, max links in message, `Origin` check, silent drop for detected bots | Scripted POSTs, link spam | None | None | Free | **Do it (baseline)** |
| D | **Vercel BotID** (invisible client challenge injected by `botid`, `checkBotId()` in the route) | Scripts, `curl`, most headless/automated browsers; "Deep Analysis" (Kasada) adds stronger detection | None, no widget | Vercel — already our host and processor | Basic free on every plan; Deep Analysis needs Pro, ~$1 / 1000 checks (a few cents a month here) | **Recommended gate** |
| E | ALTCHA (self-hosted proof-of-work widget, challenge signed by our own route) | Mass spam (makes it costly); weaker vs. real headless browsers; replay possible within challenge lifetime unless we store used challenges | Small "je ne suis pas un robot" widget, ~1 s compute | Fully self-hosted, no third party | Free | Alternative if you want zero external service at all |
| C | Cloudflare Turnstile | Most bots | Usually none | Cloudflare | Free | **Dropped** — not set up for this app |
| F | Google reCAPTCHA / hCaptcha / image CAPTCHA | Bots | Visible puzzles, a11y issues | reCAPTCHA is problematic under CNIL guidance | Free–paid | **Rejected** |
| G | AI / Akismet content classification | Spam content | None | Sends client messages to a third party — conflicts with professional secrecy | Paid | **Rejected** |
| H | E-mail confirmation (double opt-in) | Fake senders | High | OK | Free | **Rejected** |
| I | Rate limiting per IP (Vercel Firewall rule on `/api/contact`, e.g. 5 req / 10 min) | Floods from one IP | None | None | Plan-dependent | **Recommended ops step** (dashboard, no code) |

## Decision (proposed — approve, or pick E instead of D)

Layered: **A + B + D (Vercel BotID)**, plus **I** as an optional Vercel dashboard setting.
No new account, no new vendor, nothing visible to visitors.

## Behaviour

### BotID wiring (frontend)
- Add the `botid` dependency (exact pinned version, like the rest of `package.json`).
- `next.config.ts`: wrap the config with `withBotId(...)` (adds the rewrites that proxy BotID's
  challenge script). Keep the existing local `BACKEND_URL` rewrites working.
- New `src/instrumentation-client.ts`: `initBotId({ protect: [{ path: "/api/contact", method: "POST" }] })`.
  The client `fetch("/api/contact")` then carries the BotID headers automatically.
- Route: `const { isBot } = await checkBotId();` → bot → **silent drop** (see below).
  Outside Vercel (local, Docker, tests) `checkBotId()` reports human by default; tests mock
  `botid/server`.
- Risk to verify on the first preview deployment: BotID's rewrites behind our Vercel **Services**
  routing (`/(.*)` → `frontend`). Acceptance includes a preview check (see below).
- Deep Analysis: optional toggle in Vercel → Firewall, only if the team plan is Pro. Code is the same.

### Client (`Contact.tsx`)
- Hidden honeypot input (`name="website"`), off-screen, `tabIndex={-1}`, `autoComplete="off"`,
  inside an `aria-hidden` wrapper — invisible to sighted users and screen readers.
- Records the time the form was first rendered; sends `elapsedMs` with the submission.
- No visible UI change. Errors keep the existing generic error message (with phone / e-mail
  fallback); validation messages from the server (length caps) are shown as today's errors.

### Server (`/api/contact` + `lib/contact.ts`)
Order of checks, cheapest first:
1. `Origin` header, when present, must match the request host. Mismatch → `403 { ok: false }`.
2. Body validation as today, plus caps: names ≤ 100, email ≤ 254, phone ≤ 30, subject and
   customSubject ≤ 150, message ≤ 5000 chars → `400` with French errors.
3. Honeypot filled, `elapsedMs` < 3000 (or missing / not a number), or more than 3 URLs in the
   message → **silent drop**.
4. `checkBotId()` → `isBot` → **silent drop**. If `checkBotId()` throws → **fail open** (send) and
   `console.error`: losing a real client's message is worse than one spam.
5. Send through Brevo as today.

**Silent drop** = respond `200 { ok: true }` (the bot learns nothing), send no e-mail, log
`console.warn("Contact spam dropped:", reason)` — reason only, never the visitor's data.

### Privacy policy
`/politique-de-confidentialite`: add a short paragraph on the anti-spam protection of the contact
form (Vercel BotID: technical browser signals, purpose security, legitimate interest, no advertising
use). Draft wording in ux-brief.md — **Eva should validate it**.

## Acceptance criteria
- On a Vercel preview: a direct `curl -X POST /api/contact` with a valid body sends no e-mail and
  gets `200 { ok: true }`; a real browser submission sends the e-mail.
- Honeypot filled / too-fast / link-stuffed submission → 200, no Brevo call.
- Over-long fields rejected with French errors; foreign `Origin` → 403.
- Form looks and behaves exactly as today for a human.
- Vitest covers every branch of the route and of the new helpers; `bun run lint|typecheck|test`
  green; `bun run build` passes; Playwright a11y suite still passes.
- Privacy policy paragraph added.

## Tasks
1. **front** — everything above (BotID wiring, honeypot + timing, server checks, constants copy,
   privacy paragraph, tests).
No backend work (the endpoint is the Next.js route). No design task: nothing visible changes; copy
and privacy wording are in ux-brief.md.

## Out of scope
- Moving the contact endpoint to Django; storing submissions.
- Code-level rate limiting (needs a shared store; the Vercel Firewall rule covers it).

## Revision 3 (after T-70 review, lead decision)
Rule: never silently drop something a real person could trigger.
- Only the honeypot is a silent drop. It is renamed `hp_ref` (autofill / password managers could fill `website`).
- Too fast (< 3 s) and a BotID bot verdict → `400 { ok: false, code: "verification_failed" }`; the client shows
  « La vérification anti-spam n'a pas abouti. Veuillez réessayer dans quelques secondes, ou contacter le cabinet par téléphone ou par email. »
  The form keeps its content.
- More than 3 URLs → visible validation error « Votre message contient trop de liens (3 maximum). »
- The client shows the server's French `errors` when present.
- Origin check uses `x-forwarded-host` then `host` (Vercel Services may forward an internal Host).
