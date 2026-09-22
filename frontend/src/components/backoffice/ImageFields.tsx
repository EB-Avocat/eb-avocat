"use client";

import { Camera, Crop as CropIcon, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/backoffice/Avatar";
import {
	type CropTarget,
	ImageDialog,
	type ImageSource,
} from "@/components/backoffice/ImageDialog";
import { LoadingImage } from "@/components/backoffice/ui";
import type { Crop } from "@/lib/api/schema";
import { messageOf } from "@/lib/backoffice/api";

/** What the image fields need to know about the stored image. */
export interface StoredImage {
	/** Rendition shown on the site (null: no image). */
	url: string | null;
	/** Kept original, used to reframe. */
	original: string | null;
	crop: Crop | null;
}

type DialogMode = null | "pick" | "crop";

function useImageDialog(image: StoredImage) {
	const [mode, setMode] = useState<DialogMode>(null);
	const current: CropTarget | null = image.original
		? { image: image.original, crop: image.crop }
		: null;
	return { mode, setMode, current, canCrop: !!image.original };
}

/**
 * Round profile photo: click it to import a new one (file or web link), then reframe
 * it in the same dialog. "Recadrer" / "Retirer" act on the current one.
 */
export function AvatarField({
	image,
	name,
	onUpload,
	onCrop,
	onRemove,
	onError,
}: {
	image: StoredImage;
	name: string;
	onUpload: (source: ImageSource) => Promise<StoredImage>;
	onCrop: (crop: Crop) => Promise<void>;
	onRemove: () => Promise<void>;
	onError: (message: string) => void;
}) {
	const { mode, setMode, current, canCrop } = useImageDialog(image);
	const [removing, setRemoving] = useState(false);

	async function remove() {
		setRemoving(true);
		try {
			await onRemove();
		} catch (err) {
			onError(messageOf(err, "Suppression impossible."));
		} finally {
			setRemoving(false);
		}
	}

	return (
		<div className="flex flex-col items-center gap-2">
			<button
				type="button"
				onClick={() => setMode("pick")}
				className="group relative rounded-full focus-visible:outline-offset-4"
				aria-label={image.url ? "Changer la photo de profil" : "Ajouter une photo de profil"}
			>
				<Avatar src={image.url} name={name} size={96} />
				<span className="absolute inset-0 flex items-center justify-center rounded-full bg-near-black/0 text-white opacity-0 transition group-hover:bg-near-black/40 group-hover:opacity-100 group-focus-visible:bg-near-black/40 group-focus-visible:opacity-100">
					<Camera className="h-6 w-6" aria-hidden="true" />
				</span>
				<span className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow">
					<Camera className="h-4 w-4" aria-hidden="true" />
				</span>
			</button>
			{image.url && (
				<div className="flex gap-3 text-xs">
					{canCrop && (
						<button
							type="button"
							onClick={() => setMode("crop")}
							className="text-primary hover:underline"
						>
							Recadrer
						</button>
					)}
					<button
						type="button"
						onClick={remove}
						disabled={removing}
						className="text-red-700 hover:underline disabled:opacity-50"
					>
						{removing ? "Suppression…" : "Retirer"}
					</button>
				</div>
			)}

			<ImageDialog
				open={mode !== null}
				start={mode ?? "pick"}
				title={mode === "crop" ? "Cadrer la photo de profil" : "Photo de profil"}
				current={current}
				crop={{ aspect: 1, round: true, onSave: onCrop }}
				onPick={async (source) => {
					const stored = await onUpload(source);
					return stored.original ? { image: stored.original, crop: stored.crop } : null;
				}}
				onClose={() => setMode(null)}
			/>
		</div>
	);
}

/**
 * 16:9 cover, laid out as on the article page. Empty, it is one big "add an image"
 * button; filled, it offers Changer / Recadrer / Retirer over the image.
 */
export function CoverField({
	image,
	onUpload,
	onCrop,
	onRemove,
	onError,
	onDialogClosed,
}: {
	image: StoredImage;
	onUpload: (source: ImageSource) => Promise<StoredImage>;
	onCrop: (crop: Crop) => Promise<void>;
	onRemove: () => Promise<void>;
	onError: (message: string) => void;
	/** Called once the dialog is closed (e.g. to move a new article to its own URL). */
	onDialogClosed?: () => void;
}) {
	const { mode, setMode, current, canCrop } = useImageDialog(image);
	const [removing, setRemoving] = useState(false);

	async function remove() {
		setRemoving(true);
		try {
			await onRemove();
		} catch (err) {
			onError(messageOf(err, "Suppression impossible."));
		} finally {
			setRemoving(false);
		}
	}

	const action =
		"flex items-center gap-1.5 rounded bg-white/90 px-2.5 py-1.5 text-xs font-500 text-near-black shadow hover:bg-white";

	return (
		<>
			{image.url ? (
				<div className="group relative">
					<LoadingImage src={image.url} className="aspect-[16/9] w-full rounded-lg" />
					<div className="absolute top-3 right-3 flex gap-2">
						<button type="button" onClick={() => setMode("pick")} className={action}>
							<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
							Changer
						</button>
						{canCrop && (
							<button type="button" onClick={() => setMode("crop")} className={action}>
								<CropIcon className="h-3.5 w-3.5" aria-hidden="true" />
								Recadrer
							</button>
						)}
						<button
							type="button"
							onClick={remove}
							disabled={removing}
							className={`${action} text-red-700 disabled:opacity-60`}
							aria-label="Retirer l'image de couverture"
						>
							<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setMode("pick")}
					className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-500 transition-colors hover:border-primary hover:bg-primary-light/5 hover:text-primary"
				>
					<ImagePlus className="h-8 w-8" aria-hidden="true" />
					<span className="font-500">Ajouter une image de couverture</span>
					<span className="text-xs">Depuis votre ordinateur ou un lien web · format 16:9</span>
				</button>
			)}

			<ImageDialog
				open={mode !== null}
				start={mode ?? "pick"}
				title={mode === "crop" ? "Cadrer l'image de couverture" : "Image de couverture"}
				current={current}
				crop={{ aspect: 16 / 9, onSave: onCrop }}
				onPick={async (source) => {
					const stored = await onUpload(source);
					return stored.original ? { image: stored.original, crop: stored.crop } : null;
				}}
				onClose={() => {
					setMode(null);
					onDialogClosed?.();
				}}
			/>
		</>
	);
}
