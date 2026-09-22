"use client";

import { Camera, Crop as CropIcon, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/backoffice/Avatar";
import { type CropTarget, ImageDialog } from "@/components/backoffice/ImageDialog";
import { LoadingImage } from "@/components/backoffice/ui";
import type { Crop } from "@/lib/api/schema";
import { type ImageSource, messageOf } from "@/lib/backoffice/api";

/** What the image fields need to know about the stored image. */
export interface StoredImage {
	/** Rendition shown on the site (null: no image). */
	url: string | null;
	/** Kept original, used to reframe. */
	original: string | null;
	crop: Crop | null;
}

type ImageColumns<F extends string> = Record<F | `${F}_original`, string | null> &
	Record<`${F}_crop`, Crop | null>;

/** The API's `<field>`, `<field>_original`, `<field>_crop` trio (see backend/core/cropped.py). */
export function storedImage<F extends string>(record: ImageColumns<F>, field: F): StoredImage {
	const columns = record as Record<string, unknown>;
	return {
		url: columns[field] as string | null,
		original: columns[`${field}_original`] as string | null,
		crop: columns[`${field}_crop`] as Crop | null,
	};
}

const cropTarget = (image: StoredImage): CropTarget | null =>
	image.original ? { image: image.original, crop: image.crop } : null;

interface ImageFieldProps {
	image: StoredImage;
	onUpload: (source: ImageSource) => Promise<StoredImage>;
	onCrop: (crop: Crop) => Promise<void>;
	onRemove: () => Promise<void>;
	onError: (message: string) => void;
}

/** Dialog + remove state shared by the avatar and cover fields. */
function useImageField(
	{ image, onUpload, onCrop, onRemove, onError }: ImageFieldProps,
	dialog: { titles: { pick: string; crop: string }; aspect: number; round?: boolean },
) {
	const [mode, setMode] = useState<null | "pick" | "crop">(null);
	const [removing, setRemoving] = useState(false);
	const current = cropTarget(image);

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

	const element = (
		<ImageDialog
			open={mode !== null}
			start={mode ?? "pick"}
			title={dialog.titles[mode ?? "pick"]}
			current={current}
			crop={{ aspect: dialog.aspect, round: dialog.round, onSave: onCrop }}
			onPick={async (source) => cropTarget(await onUpload(source))}
			onClose={() => setMode(null)}
		/>
	);
	return { open: setMode, canCrop: current !== null, remove, removing, dialog: element };
}

/**
 * Round profile photo: click it to import a new one (file or web link), then reframe
 * it in the same dialog. "Recadrer" / "Retirer" act on the current one.
 */
export function AvatarField({ name, ...props }: ImageFieldProps & { name: string }) {
	const { image } = props;
	const field = useImageField(props, {
		titles: { pick: "Photo de profil", crop: "Cadrer la photo de profil" },
		aspect: 1,
		round: true,
	});

	return (
		<div className="flex flex-col items-center gap-2">
			<button
				type="button"
				onClick={() => field.open("pick")}
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
					{field.canCrop && (
						<button
							type="button"
							onClick={() => field.open("crop")}
							className="text-primary hover:underline"
						>
							Recadrer
						</button>
					)}
					<button
						type="button"
						onClick={field.remove}
						disabled={field.removing}
						className="text-red-700 hover:underline disabled:opacity-50"
					>
						{field.removing ? "Suppression…" : "Retirer"}
					</button>
				</div>
			)}
			{field.dialog}
		</div>
	);
}

/**
 * 16:9 cover, laid out as on the article page. Empty, it is one big "add an image"
 * button; filled, it offers Changer / Recadrer / Retirer over the image.
 */
export function CoverField(props: ImageFieldProps) {
	const { image } = props;
	const field = useImageField(props, {
		titles: { pick: "Image de couverture", crop: "Cadrer l'image de couverture" },
		aspect: 16 / 9,
	});
	const action =
		"flex items-center gap-1.5 rounded bg-white/90 px-2.5 py-1.5 text-xs font-500 text-near-black shadow hover:bg-white";

	return (
		<>
			{image.url ? (
				<div className="group relative">
					<LoadingImage src={image.url} className="aspect-[16/9] w-full rounded-lg" />
					<div className="absolute top-3 right-3 flex gap-2">
						<button type="button" onClick={() => field.open("pick")} className={action}>
							<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
							Changer
						</button>
						{field.canCrop && (
							<button type="button" onClick={() => field.open("crop")} className={action}>
								<CropIcon className="h-3.5 w-3.5" aria-hidden="true" />
								Recadrer
							</button>
						)}
						<button
							type="button"
							onClick={field.remove}
							disabled={field.removing}
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
					onClick={() => field.open("pick")}
					className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-500 transition-colors hover:border-primary hover:bg-primary-light/5 hover:text-primary"
				>
					<ImagePlus className="h-8 w-8" aria-hidden="true" />
					<span className="font-500">Ajouter une image de couverture</span>
					<span className="text-xs">Depuis votre ordinateur ou un lien web · format 16:9</span>
				</button>
			)}
			{field.dialog}
		</>
	);
}
