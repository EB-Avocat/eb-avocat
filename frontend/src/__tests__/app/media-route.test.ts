import { afterEach, describe, expect, it, vi } from "vitest";

const get = vi.hoisted(() => vi.fn());
vi.mock("@vercel/blob", () => ({ get }));

import { GET } from "@/app/media/[...path]/route";

function request(path: string[]) {
	return GET(new Request(`http://localhost/media/${path.join("/")}`), {
		params: Promise.resolve({ path }),
	});
}

describe("GET /media/[...path]", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("streams the private blob with long-lived cache headers", async () => {
		get.mockResolvedValue({
			statusCode: 200,
			stream: new Response("img").body,
			blob: { contentType: "image/webp", size: 3 },
		});

		const res = await request(["covers", "a", "cover-X1.webp"]);

		expect(get).toHaveBeenCalledWith("covers/a/cover-X1.webp", { access: "private" });
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toBe("image/webp");
		expect(res.headers.get("cache-control")).toContain("immutable");
		expect(res.headers.get("x-content-type-options")).toBe("nosniff");
		await expect(res.text()).resolves.toBe("img");
	});

	it("returns a briefly cached 404 for a missing blob", async () => {
		get.mockResolvedValue(null);

		const res = await request(["missing.webp"]);

		expect(res.status).toBe(404);
		expect(res.headers.get("cache-control")).toBe("public, s-maxage=300");
	});
});
