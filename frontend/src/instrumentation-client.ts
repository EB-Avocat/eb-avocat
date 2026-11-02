import { initBotId } from "botid/client/core";

// Vercel BotID: attaches the invisible bot-check headers to the contact form's fetch, which
// /api/contact verifies with checkBotId().
initBotId({ protect: [{ path: "/api/contact", method: "POST" }] });
