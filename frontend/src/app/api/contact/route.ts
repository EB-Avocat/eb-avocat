import { sendContactEmail, validateContactForm } from "@/lib/contact";

export async function POST(request: Request) {
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

	const result = await sendContactEmail(validation.data);
	if (!result.ok) {
		// Log server-side; never leak the API key or Brevo internals to the client.
		console.error("Contact email failed:", result.error);
		return Response.json({ ok: false }, { status: 500 });
	}

	return Response.json({ ok: true });
}
