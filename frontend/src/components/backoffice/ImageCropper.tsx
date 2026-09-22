"use client";

import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useId, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import type { Crop } from "@/lib/api/schema";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/** react-easy-crop works in percentages (0–100); the API in fractions (0–1). */
export function toApiCrop(area: Area): Crop {
	const clamp = (value: number) => Math.min(1, Math.max(0, value / 100));
	return {
		x: clamp(area.x),
		y: clamp(area.y),
		width: clamp(area.width),
		height: clamp(area.height),
	};
}

export function toCropperArea(crop: Crop): Area {
	return { x: crop.x * 100, y: crop.y * 100, width: crop.width * 100, height: crop.height * 100 };
}

/**
 * Notion-style reframing: drag to move the image inside a fixed-ratio frame and zoom
 * with the slider, the wheel or a pinch. Works on the kept original, so the saved
 * crop can be changed at any time; the server renders the final image.
 *
 * Mount it only once its container is visible: react-easy-crop measures the frame
 * when the image loads and ignores the first resize, so a cropper mounted inside a
 * closed <dialog> stays at 0×0 and shows an empty background.
 */
export function CropArea({
	image,
	aspect,
	round = false,
	initialCrop,
	onChange,
}: {
	image: string;
	aspect: number;
	round?: boolean;
	initialCrop: Crop | null;
	onChange: (crop: Crop) => void;
}) {
	const zoomId = useId();
	const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(MIN_ZOOM);
	const [loaded, setLoaded] = useState(false);

	return (
		<>
			<p className="mb-3 text-sm text-gray-600">
				Faites glisser l'image pour la positionner, zoomez avec le curseur, la molette ou deux
				doigts.
			</p>
			<div className="relative h-72 w-full overflow-hidden rounded bg-near-black sm:h-96">
				<Cropper
					image={image}
					aspect={aspect}
					cropShape={round ? "round" : "rect"}
					crop={position}
					zoom={zoom}
					minZoom={MIN_ZOOM}
					maxZoom={MAX_ZOOM}
					initialCroppedAreaPercentages={initialCrop ? toCropperArea(initialCrop) : undefined}
					onCropChange={setPosition}
					onZoomChange={setZoom}
					onCropComplete={(area) => onChange(toApiCrop(area))}
					onMediaLoaded={() => setLoaded(true)}
					showGrid
				/>
				{!loaded && (
					<div
						role="status"
						className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/80"
					>
						<Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
						Chargement de l'image…
					</div>
				)}
			</div>
			<div className="mt-4 flex items-center gap-3">
				<ZoomOut className="h-4 w-4 text-gray-500" aria-hidden="true" />
				<label htmlFor={zoomId} className="sr-only">
					Zoom
				</label>
				<input
					id={zoomId}
					type="range"
					min={MIN_ZOOM}
					max={MAX_ZOOM}
					step={0.01}
					value={zoom}
					onChange={(e) => setZoom(Number(e.target.value))}
					className="flex-1 accent-primary"
				/>
				<ZoomIn className="h-4 w-4 text-gray-500" aria-hidden="true" />
			</div>
		</>
	);
}
