import type { MetadataRoute } from "next";
import { BRAND_COLORS, SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: SITE.title,
		short_name: SITE.name,
		description: SITE.description,
		start_url: "/",
		display: "standalone",
		background_color: BRAND_COLORS.darkerTeal,
		theme_color: BRAND_COLORS.darkerTeal,
		lang: "fr",
		icons: [
			{ src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
			{ src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
			{
				src: "/icon-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-monochrome-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "monochrome",
			},
		],
	};
}
