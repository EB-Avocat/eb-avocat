/**
 * Generates the PWA / home-screen icons from the white monogram on the hero gradient.
 *
 * Foreground: public/images/favicon-white.svg (EB monogram recolored white)
 * Background: vertical gradient #162729 -> #264445 (the hero "from-darker-teal to-dark-teal")
 *
 * Run once after changing the source art:
 *   bun run scripts/generate-icons.ts
 *
 * Outputs (committed):
 *   public/icon-192.png            192x192  (Android, purpose "any")
 *   public/icon-512.png            512x512  (Android, purpose "any")
 *   public/icon-maskable-512.png   512x512  (Android adaptive, logo in safe zone)
 *   public/icon-monochrome-512.png 512x512  (Android themed/tintable icon: white glyph,
 *                                            transparent bg — the OS recolors the alpha)
 *   src/app/apple-icon.png         180x180  (iOS home screen, via Next file convention)
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp, { type Sharp } from "sharp";
import { BRAND_COLORS } from "../src/lib/constants.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO = readFileSync(join(ROOT, "public/images/favicon-white.svg"));

/** The hero-gradient square canvas the logo sits on by default. */
function gradient(size: number): Sharp {
	return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BRAND_COLORS.darkerTeal}"/>
      <stop offset="1" stop-color="${BRAND_COLORS.darkTeal}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
</svg>`));
}

/** A fully transparent square canvas (Android tints the composited glyph's alpha). */
function transparent(size: number): Sharp {
	return sharp({ create: { width: size, height: size, channels: 4, background: "#00000000" } });
}

/**
 * Composite the white logo (scaled to `logoRatio` of the canvas, centered) onto `base`.
 * @param size      output square size in px
 * @param logoRatio logo width as a fraction of the canvas width
 * @param base      background canvas (hero gradient by default, or transparent())
 */
async function makeIcon(
	size: number,
	logoRatio: number,
	out: string,
	base: Sharp = gradient(size),
) {
	const logo = await sharp(LOGO, { density: 400 })
		.resize({ width: Math.round(size * logoRatio) })
		.png()
		.toBuffer();

	await base.composite([{ input: logo, gravity: "center" }]).png().toFile(out);
	console.log(`✓ ${out} (${size}x${size}, logo ${Math.round(logoRatio * 100)}%)`);
}

await Promise.all([
	makeIcon(192, 0.7, join(ROOT, "public/icon-192.png")),
	makeIcon(512, 0.7, join(ROOT, "public/icon-512.png")),
	// Maskable: logo pulled in so it survives the circular/squircle safe-zone crop.
	makeIcon(512, 0.55, join(ROOT, "public/icon-maskable-512.png")),
	// Monochrome: tintable themed icon for Android — white glyph on a transparent canvas,
	// same safe-zone padding as maskable (Android treats it as an adaptive foreground).
	makeIcon(512, 0.55, join(ROOT, "public/icon-monochrome-512.png"), transparent(512)),
	// Apple touch icon (iOS does not honor "maskable", so use standard padding).
	makeIcon(180, 0.7, join(ROOT, "src/app/apple-icon.png")),
]);

console.log("Done.");
