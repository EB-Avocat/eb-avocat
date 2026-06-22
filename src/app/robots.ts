import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// /carte is a personal QR contact card (noindex) and /api are server routes.
			disallow: ["/carte", "/api/"],
		},
		sitemap: `${SITE.url}/sitemap.xml`,
		host: SITE.url,
	};
}
