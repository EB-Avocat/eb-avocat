import "server-only";
import { createHash } from "node:crypto";
import { BlobNotFoundError, head, put } from "@vercel/blob";

// Notion serves uploaded files (page covers, inline images, avatars) from S3
// with signed URLs that expire ~1h. Cached/ISR pages outlive that window, so we
// mirror each file to a permanent, public Vercel Blob URL keyed deterministically
// (upload-once, then reuse). Ported from the reference site's blob-images module.

const BLOB_PREFIX = "notion/";
const AVATAR_PREFIX = "notion/avatars/";
const COVER_PREFIX = "notion/covers/";

/** Stable Blob key for a Notion-hosted (S3) file, from its `/{parentId}/{objId}/{name}` path. */
function parseNotionFileKey(url: string): string | null {
	try {
		const { hostname, pathname } = new URL(url);
		if (!hostname.endsWith(".amazonaws.com")) return null;
		const [parentId, objId, fileName] = pathname.split("/").filter(Boolean);
		if (!parentId || !objId || !fileName) return null;
		const ext = fileName.split(".").pop() ?? "bin";
		return `${BLOB_PREFIX}${parentId}/${objId}.${ext}`;
	} catch {
		return null;
	}
}

/** Stable Blob key for an arbitrary remote image, hashed from its origin+path (skips already-Blob URLs). */
function parseHashedKey(url: string, prefix: string): string | null {
	try {
		const parsed = new URL(url);
		if (parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
			return null;
		}
		const stable = `${parsed.origin}${parsed.pathname}`;
		const hash = createHash("sha256").update(stable).digest("hex").slice(0, 24);
		return `${prefix}${hash}`;
	} catch {
		return null;
	}
}

async function uploadIfMissing(url: string, key: string): Promise<string> {
	const token = process.env.BLOB_READ_WRITE_TOKEN;
	// Without a Blob token (local dev / CI) we cannot mirror; fall back to the
	// original URL. Fine for dev, but such URLs expire ~1h in production.
	if (!token) return url;

	try {
		const existing = await head(key, { token });
		return existing.url;
	} catch (error) {
		if (!(error instanceof BlobNotFoundError)) throw error;
	}

	const res = await fetch(url);
	if (!res.ok) return url;
	const body = await res.arrayBuffer();
	const { url: publicUrl } = await put(key, body, {
		access: "public",
		token,
		addRandomSuffix: false,
		contentType: res.headers.get("content-type") ?? undefined,
	});
	return publicUrl;
}

/** Mirror a Notion-hosted file (inline body image) to Blob; passes non-Notion URLs through. */
export async function uploadNotionFileIfMissing(url: string): Promise<string> {
	const key = parseNotionFileKey(url);
	if (!key) return url;
	return uploadIfMissing(url, key);
}

/**
 * Mirror a cover image to Blob: Notion-hosted covers get a stable key, external
 * covers a hashed one, so production only ever serves permanent Blob URLs (a
 * single `next/image` host) regardless of where the cover came from.
 */
export async function uploadCoverIfMissing(url: string): Promise<string> {
	const key = parseNotionFileKey(url) ?? parseHashedKey(url, COVER_PREFIX);
	if (!key) return url;
	return uploadIfMissing(url, key);
}

/** Mirror a remote avatar to Blob; passes already-Blob URLs through. */
export async function uploadAvatarIfMissing(url: string): Promise<string> {
	const key = parseHashedKey(url, AVATAR_PREFIX);
	if (!key) return url;
	return uploadIfMissing(url, key);
}
