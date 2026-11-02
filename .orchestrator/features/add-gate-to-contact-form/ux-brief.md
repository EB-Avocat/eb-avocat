# Add Gate To Contact Form — UX brief

The gate is invisible: Vercel BotID runs in the background, no widget, no puzzle. The form looks
and behaves exactly as today. No design frames are needed; this brief only fixes copy and rules.

## Rules
- Honeypot field never visible, not reachable by keyboard or screen reader (`aria-hidden` wrapper,
  `tabIndex={-1}`, `autoComplete="off"`, positioned off-screen — not `display:none`, which some
  bots skip).
- Detected bots get the normal success message (silent drop). A human is never told "you look
  like a bot".
- Errors keep today's styling and `role="alert"`; the generic error already points to phone/e-mail.

## Copy (French, goes in `src/lib/constants.ts` → `CONTACT.formErrors`)
- `nameTooLong`: « Le nom ou le prénom est trop long (100 caractères maximum). »
- `emailTooLong`: « L'email est trop long. »
- `phoneTooLong`: « Le numéro de téléphone est trop long. »
- `subjectTooLong`: « L'objet est trop long (150 caractères maximum). »
- `messageTooLong`: « Le message est trop long (5 000 caractères maximum). »

## Privacy policy paragraph (draft, Eva validates)
« Afin de protéger le formulaire de contact contre les envois automatisés (spam), le Site utilise
le service de détection des robots de son hébergeur, Vercel Inc. (Vercel BotID). Ce service analyse
des informations techniques relatives à votre navigateur, uniquement pour vérifier que la demande
émane d'une personne. Ces données ne sont pas utilisées à des fins publicitaires. Ce traitement
repose sur l'intérêt légitime du Cabinet à sécuriser son Site. »

## Accessibility
- No CAPTCHA, no time limit, no extra interaction: nothing changes for assistive technologies.
- `maxLength` attributes on inputs matching the server caps, so the limits are enforced before
  submission.
