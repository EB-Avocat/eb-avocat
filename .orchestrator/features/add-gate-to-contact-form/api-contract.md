# Add Gate To Contact Form — API contract

`POST /api/contact` (Next.js route, `frontend/src/app/api/contact/route.ts`). Not part of the Django
OpenAPI schema; no `tox -e api-types` change.

## Request (JSON)
```jsonc
{
  "lastName": "string",        // required, ≤ 100
  "firstName": "string",       // required, ≤ 100
  "email": "string",           // required, valid, ≤ 254
  "phone": "string",           // optional, ≤ 30
  "subject": "string",         // optional, ≤ 150
  "customSubject": "string",   // required when subject = "Autre", ≤ 150
  "message": "string",         // required, ≤ 5000
  "website": "string",         // honeypot — must be empty
  "elapsedMs": 4210            // ms since the form was rendered (number or numeric string)
}
```
Headers: BotID headers are added automatically by `initBotId` on the client; the route reads them
through `checkBotId()`.

## Responses
| Case | Status | Body |
|------|--------|------|
| Sent | 200 | `{ "ok": true }` |
| Honeypot / too fast / > 3 URLs / BotID bot (silent drop) | 200 | `{ "ok": true }` |
| Bad JSON | 400 | `{ "ok": false, "errors": ["Invalid request body."] }` |
| Validation (incl. length caps) | 400 | `{ "ok": false, "errors": [french messages] }` |
| Foreign `Origin` | 403 | `{ "ok": false }` |
| Brevo failure | 500 | `{ "ok": false }` |

## Env
No new environment variable.
