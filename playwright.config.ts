import { defineConfig, devices } from "@playwright/test";

// Accessibility audit harness. Runs a real Chromium against a production build so
// that color-contrast and computed-style checks (which jsdom/Vitest cannot do) are
// accurate. See docs/accessibility-audit.md for the report this produces.
const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		// Audit the production build, not the dev server, so the report reflects what
		// users actually get (final CSS, fonts, no dev overlays). Swap to "bun run dev"
		// for faster local iteration while editing fixes.
		command: "bun run build && bun run start",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
