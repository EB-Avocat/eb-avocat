import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// WCAG 2.1 Level A + AA — the conformance target for the French RGAA / European
// accessibility requirements that apply to a professional services site.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// A mobile UA is required for /carte: the route server-redirects desktop browsers
// to "/" (see src/app/carte/page.tsx), so it only renders for a mobile user agent.
const MOBILE_UA =
	"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function formatViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
	return violations
		.map((v) => {
			const nodes = v.nodes
				.map((n) => `      - ${n.target.join(" ")}\n        ${n.failureSummary?.replace(/\n/g, " ") ?? ""}`)
				.join("\n");
			return `  [${v.impact}] ${v.id}: ${v.help} (${v.helpUrl})\n${nodes}`;
		})
		.join("\n\n");
}

test.describe("axe-core WCAG 2.1 AA scan", () => {
	for (const { name, path } of [
		{ name: "home", path: "/" },
		{ name: "mentions-legales", path: "/mentions-legales" },
		{ name: "politique-de-confidentialite", path: "/politique-de-confidentialite" },
	]) {
		test(`${name} has no detectable a11y violations`, async ({ page }) => {
			await page.goto(path);
			const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
			expect(violations, `\n${formatViolations(violations)}`).toEqual([]);
		});
	}

	test.describe("carte (mobile)", () => {
		test.use({ userAgent: MOBILE_UA });
		test("carte has no detectable a11y violations", async ({ page }) => {
			await page.goto("/carte");
			const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
			expect(violations, `\n${formatViolations(violations)}`).toEqual([]);
		});
	});
});

test.describe("keyboard accessibility", () => {
	test("skip link is the first focusable element and targets main", async ({ page }) => {
		await page.goto("/");
		await page.keyboard.press("Tab");
		const skip = page.locator(":focus");
		await expect(skip).toHaveText(/contenu/i);
		const href = await skip.getAttribute("href");
		expect(href).toBe("#contenu");
	});

	test("focused form fields show a visible focus indicator (outline not suppressed)", async ({
		page,
	}) => {
		await page.goto("/#contact");
		// Text inputs always match :focus-visible; assert the ring is actually
		// rendered (outline or box-shadow) and not suppressed by focus:outline-none.
		const email = page.locator("#email");
		await email.focus();
		const style = await email.evaluate((el) => {
			const s = getComputedStyle(el);
			return { outline: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
		});
		const hasOutline = style.outline !== "none" && style.outlineWidth !== "0px";
		const hasShadow = style.boxShadow !== "none";
		expect(hasOutline || hasShadow).toBe(true);
	});

	test("contact form fields are reachable and labelled", async ({ page }) => {
		await page.goto("/#contact");
		for (const id of ["lastName", "firstName", "email", "phone", "subject", "message"]) {
			const field = page.locator(`#${id}`);
			await field.focus();
			await expect(field).toBeFocused();
		}
	});

	test("subject select is explicitly labelled and announces its options", async ({ page }) => {
		await page.goto("/#contact");
		// Accessible name resolves to the visible label, and it is wired explicitly
		// (aria-labelledby) so VoiceOver announces it for the native <select>.
		const select = page.getByRole("combobox", { name: "Objet" });
		await expect(select).toHaveAttribute("aria-labelledby", "subject-label");
		// The placeholder is a non-selectable prompt; the real options are choosable.
		await expect(page.locator("#subject option[value='']")).toBeDisabled();
		await select.selectOption({ label: "Contentieux" });
		await expect(select).toHaveValue("Contentieux");
	});
});

test.describe("mobile menu (screen reader state)", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("hamburger exposes aria-expanded that toggles", async ({ page }) => {
		await page.goto("/");
		const button = page.getByRole("button", { name: /menu/i });
		await expect(button).toHaveAttribute("aria-expanded", "false");
		await button.click();
		await expect(button).toHaveAttribute("aria-expanded", "true");
		// The controlled menu is now exposed and its links are reachable.
		const menu = page.locator("#mobile-menu");
		await expect(menu).toBeVisible();
		await expect(menu.getByRole("link", { name: "Contact" })).toBeVisible();
	});
});
