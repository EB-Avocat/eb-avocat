import { checkBotId } from "botid/server";
import {
	detectSpam,
	isSameOrigin,
	type SpamReason,
	sendContactEmail,
	validateContactForm,
} from "@/lib/contact";

/** Vercel BotID verdict. Fails open: losing a real client's message is worse than one spam. */
async function isBotIdBot(): Promise<boolean> {
	try {
		const { isBot } = await checkBotId();
		return isBot;
	} catch (error) {
		console.error("Contact BotID check failed:", error);
		return false;
	}
}

/** Answers like a successful send so the bot learns nothing; logs the reason, never the data. */
function silentDrop(reason: SpamReason) {
	console.warn("Contact spam dropped:", reason);
	return Response.json({ ok: true });
}

export async function POST(request: Request) {
	// Cheapest checks first; BotID (a network call) only for submissions that pass the rest.
	if (!isSameOrigin(request)) {
		return Response.json({ ok: false }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, errors: ["Invalid request body."] }, { status: 400 });
	}

	const validation = validateContactForm(body);
	if (!validation.ok) {
		return Response.json({ ok: false, errors: validation.errors }, { status: 400 });
	}

	const spam = detectSpam(body, validation.data);
	if (spam) return silentDrop(spam);
	if (await isBotIdBot()) return silentDrop("botid");

	const result = await sendContactEmail(validation.data);
	if (!result.ok) {
		// Log server-side; never leak the API key or Brevo internals to the client.
		console.error("Contact email failed:", result.error);
		return Response.json({ ok: false }, { status: 500 });
	}

	return Response.json({ ok: true });
}
