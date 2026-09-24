import { describe, expect, it } from "vitest";
import { toApiCrop, toCropperArea } from "@/components/backoffice/ImageCropper";

describe("crop conversions", () => {
	it("turns the cropper's percentages into API fractions", () => {
		expect(toApiCrop({ x: 12.5, y: 25, width: 50, height: 37.5 })).toEqual({
			x: 0.125,
			y: 0.25,
			width: 0.5,
			height: 0.375,
		});
	});

	it("clamps rounding overshoots into 0–1", () => {
		expect(toApiCrop({ x: -0.0001, y: 0, width: 100.0002, height: 100 })).toEqual({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
		});
	});

	it("round-trips a saved crop back into the cropper", () => {
		const crop = { x: 0.1, y: 0.2, width: 0.6, height: 0.3375 };
		expect(toApiCrop(toCropperArea(crop))).toEqual(crop);
	});
});
