import { checkBotId } from "botid/server";
import {
	isHoneypotFilled,
	isSameOrigin,
	isTooFast,
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

/**
 * A real person can hit these (a slow form fill, a blocked BotID script): tell them to retry
 * rather than dropping their message. Logs the reason, never the visitor's data.
 */
function verificationFailed(reason: "too-fast" | "botid") {
	console.warn("Contact verification failed:", reason);
	return Response.json({ ok: false, code: "verification_failed" }, { status: 400 });
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

	// Only the honeypot is a silent drop: no person can fill a field they cannot see.
	if (isHoneypotFilled(body)) {
		console.warn("Contact spam dropped:", "honeypot");
		return Response.json({ ok: true });
	}
	if (isTooFast(body)) return verificationFailed("too-fast");
	if (await isBotIdBot()) return verificationFailed("botid");

	const result = await sendContactEmail(validation.data);
	if (!result.ok) {
		// Log server-side; never leak the API key or Brevo internals to the client.
		console.error("Contact email failed:", result.error);
		return Response.json({ ok: false }, { status: 500 });
	}

	return Response.json({ ok: true });
}
