"use client";

import { ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useId, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { BoButton, Modal } from "@/components/backoffice/ui";
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
 */
export function ImageCropper({
	open,
	title,
	image,
	aspect,
	round = false,
	initialCrop,
	busy,
	onSave,
	onClose,
}: {
	open: boolean;
	title: string;
	image: string;
	aspect: number;
	round?: boolean;
	initialCrop: Crop | null;
	busy: boolean;
	onSave: (crop: Crop) => void;
	onClose: () => void;
}) {
	const zoomId = useId();
	const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(MIN_ZOOM);
	const [area, setArea] = useState<Area | null>(null);

	// Reset the view each time the dialog opens on an image.
	useEffect(() => {
		if (!open) return;
		setPosition({ x: 0, y: 0 });
		setZoom(MIN_ZOOM);
		setArea(null);
	}, [open]);

	return (
		<Modal open={open} title={title} onClose={onClose} wide>
			<p className="mb-3 text-sm text-gray-600">
				Faites glisser l'image pour la positionner, zoomez avec le curseur, la molette ou deux
				doigts.
			</p>
			<div className="relative h-80 w-full overflow-hidden rounded bg-near-black sm:h-96">
				{open && (
					<Cropper
						key={image}
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
						onCropComplete={(croppedArea) => setArea(croppedArea)}
						showGrid
					/>
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
			<div className="mt-5 flex justify-end gap-2">
				<BoButton variant="secondary" onClick={onClose}>
					Annuler
				</BoButton>
				<BoButton busy={busy} disabled={!area} onClick={() => area && onSave(toApiCrop(area))}>
					Enregistrer le cadrage
				</BoButton>
			</div>
		</Modal>
	);
}
