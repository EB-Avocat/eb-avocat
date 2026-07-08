import type { NextConfig } from "next";

// Mock publications (served when NOTION_TOKEN is absent) use Unsplash cover URLs.
// With a real token, covers are mirrored to Vercel Blob, so prod only needs the
// Blob host — keep Unsplash out of the production allow-list.
const useMocks = !process.env.NOTION_TOKEN;

const nextConfig: NextConfig = {
	// Allow physical devices on the local network (e.g. a phone) to load the
	// dev server's /_next/* resources (HMR client + image optimizer). Without
	// this, Next.js 16 blocks those cross-origin requests, so the page renders
	// but never hydrates (dead menu/scroll) and images fail to load.
	// Adjust the subnet if your LAN uses a different range.
	allowedDevOrigins: ["192.168.1.*", "*.local"],
	images: {
		// Publication covers/avatars are mirrored to permanent Vercel Blob URLs.
		remotePatterns: [
			{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
			...(useMocks ? [{ protocol: "https" as const, hostname: "images.unsplash.com" }] : []),
		],
	},
};

export default nextConfig;
