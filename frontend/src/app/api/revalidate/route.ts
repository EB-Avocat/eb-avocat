import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLICATIONS_TAG } from "@/lib/publications";

/**
 * On-demand revalidation, called by the Django backend after an article or a
 * category changes (`Authorization: Bearer $REVALIDATE_SECRET`). Refreshes the
 * cached API data and the pages that surface it, without a rebuild.
 */
export async function POST(request: Request): Promise<Response> {
	const secret = process.env.REVALIDATE_SECRET;
	if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
		return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
	}

	// "max" is the drop-in for the legacy single-arg revalidateTag in route
	// handlers (updateTag is Server-Action-only).
	revalidateTag(PUBLICATIONS_TAG, "max");
	revalidatePath("/publications", "layout");
	revalidatePath("/"); // homepage LatestPublications teaser

	return Response.json({ ok: true, revalidated: true });
}
