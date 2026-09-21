import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Allow physical devices on the local network (e.g. a phone) to load the
	// dev server's /_next/* resources (HMR client + image optimizer). Without
	// this, Next.js 16 blocks those cross-origin requests, so the page renders
	// but never hydrates (dead menu/scroll) and images fail to load.
	// Adjust the subnet if your LAN uses a different range.
	allowedDevOrigins: ["192.168.1.*", "*.local"],
};

export default nextConfig;
