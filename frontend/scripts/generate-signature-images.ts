/**
 * Rasterizes the logos and contact icons for the e-mail signature.
 *
 * Many mail clients (Gmail, Outlook for Windows) do not render SVG images, so the
 * signature hot-links these raster copies instead. They are exported at 2x their display
 * size so they stay crisp on high-density screens; the signature HTML must set the display
 * width/height on the <img> (icons: 24x24, logos: 150x122).
 *
 * Run after changing a logo or icon SVG:
 *   bun run scripts/generate-signature-images.ts
 *
 * Outputs (committed), next to each source SVG, with a transparent background:
 *   public/images/logo-*.png|webp        300px wide (height follows the aspect ratio)
 *   public/images/icons/<name>.png|webp  48x48
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const IMAGES = join(dirname(fileURLToPath(import.meta.url)), "..", "public/images");

// `density` (dpi) renders each vector well above `width` before it is downscaled. The logos
// are authored in mm (230mm wide, ~870px at 96dpi) while the icons are 24px, hence the gap.
const SETS = [
	{ dir: IMAGES, match: /^logo-.*\.svg$/, width: 300, density: 96 },
	{ dir: join(IMAGES, "icons"), match: /\.svg$/, width: 48, density: 600 },
];

async function rasterize(dir: string, svg: string, width: number, density: number) {
	const name = svg.replace(/\.svg$/, "");
	const image = sharp(join(dir, svg), { density }).resize({ width });

	const [{ height }] = await Promise.all([
		image.clone().png({ compressionLevel: 9 }).toFile(join(dir, `${name}.png`)),
		image.clone().webp({ lossless: true }).toFile(join(dir, `${name}.webp`)),
	]);
	console.log(`✓ ${name}.png, ${name}.webp (${width}x${height})`);
}

await Promise.all(
	SETS.flatMap(({ dir, match, width, density }) =>
		readdirSync(dir)
			.filter((f) => match.test(f))
			.map((svg) => rasterize(dir, svg, width, density)),
	),
);

console.log("Done.");
