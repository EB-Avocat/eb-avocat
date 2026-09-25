import { get } from "@vercel/blob";

/**
 * Public face of the private Vercel Blob store (covers, avatars, figures). Django
 * stores blob pathnames and links them as `${MEDIA_URL}<pathname>`, i.e.
 * https://cdn.biezunski-avocat.fr/media/... in production. Blob names carry a
 * random suffix and never change, so the CDN may cache them forever.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
	const { path } = await params;
	const result = await get(path.join("/"), { access: "private" });

	if (result?.statusCode !== 200) {
		// Cache misses briefly too, so bots and stale links don't reach Blob every time.
		return new Response("Not found", {
			status: 404,
			headers: { "Cache-Control": "public, s-maxage=300" },
		});
	}

	return new Response(result.stream, {
		headers: {
			"Content-Type": result.blob.contentType,
			"Content-Length": String(result.blob.size),
			"Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
			// Uploads are images, but never let a stored file run as a page on our domain.
			"Content-Security-Policy": "default-src 'none'; sandbox",
			"X-Content-Type-Options": "nosniff",
		},
	});
}
