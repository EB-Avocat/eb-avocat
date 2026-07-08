import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLICATIONS_TAG } from "@/lib/publications";

/**
 * On-demand revalidation webhook. Point a Notion automation / Vercel webhook at
 * `POST /api/revalidate?secret=…` to refresh publications instantly (no rebuild)
 * after editing an article. Busts the cached Notion data + rendered bodies and
 * the pages that surface them.
 */
export async function POST(request: Request): Promise<Response> {
	const secret = new URL(request.url).searchParams.get("secret");
	if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
		return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
	}

	// "max" is the drop-in for the legacy single-arg revalidateTag in route
	// handlers (updateTag is Server-Action-only).
	revalidateTag(PUBLICATIONS_TAG, "max");
	revalidatePath("/publications");
	revalidatePath("/"); // homepage LatestPublications teaser

	return Response.json({ ok: true, revalidated: true });
}
