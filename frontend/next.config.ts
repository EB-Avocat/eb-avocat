import type { NextConfig } from "next";

// Local/docker only: proxy the Django API (+ local media) and the MCP endpoint so
// the browser, the back-office and the image optimizer stay same-origin. On
// Vercel, the Services rewrites in the root vercel.json route these paths.
const backendUrl = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
	// Allow physical devices on the local network (e.g. a phone) to load the
	// dev server's /_next/* resources (HMR client + image optimizer). Without
	// this, Next 16 blocks those cross-origin dev requests, so the page renders
	// but never hydrates (dead menu/scroll) and images fail to load.
	// Adjust the subnet if your LAN uses a different range.
	allowedDevOrigins: ["192.168.1.*", "*.local"],
	// Django routes end with "/": keep Next from stripping it before proxying /api/v1.
	skipTrailingSlashRedirect: true,
	images: {
		// Covers and avatars live on Vercel Blob in production.
		remotePatterns: [{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" }],
	},
	async rewrites() {
		if (!backendUrl) return [];
		return [
			// `:path*` drops a trailing slash, which Django needs: match it explicitly first.
			{ source: "/api/v1/:path*/", destination: `${backendUrl}/api/v1/:path*/` },
			{ source: "/api/v1/:path*", destination: `${backendUrl}/api/v1/:path*` },
			{ source: "/mcp", destination: `${backendUrl}/mcp` },
		];
	},
};

export default nextConfig;
