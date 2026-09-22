"use client";

import { ImageUp, Link2, Loader2, Upload } from "lucide-react";
import {
	type ClipboardEvent,
	type DragEvent,
	type FormEvent,
	useEffect,
	useId,
	useState,
} from "react";
import { CropArea } from "@/components/backoffice/ImageCropper";
import { Alert, BoButton, Modal, TextInput } from "@/components/backoffice/ui";
import type { Crop } from "@/lib/api/schema";
import { messageOf } from "@/lib/backoffice/api";

export type ImageSource = { file: File } | { url: string };

/** An image the user can reframe: the kept original and its current crop. */
export interface CropTarget {
	image: string;
	crop: Crop | null;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 8 * 1024 * 1024;

/** Client-side check so obvious mistakes fail instantly instead of after the upload. */
export function checkImageFile(file: File): string | null {
	if (!ACCEPT.split(",").includes(file.type))
		return "Format non pris en charge (JPEG, PNG, WebP ou GIF).";
	if (file.size > MAX_BYTES) return "L'image dépasse la taille maximale (8 Mo).";
	return null;
}

type Step = "pick" | "processing" | "crop";

/**
 * One dialog for every image of the back-office (covers, avatars, article images):
 *
 * 1. pick — drop a file (or click to browse, or paste), or give a web address;
 * 2. processing — spinner while the server downloads, normalises and compresses it;
 * 3. crop — optional Notion-style reframing when `crop` is given.
 *
 * `start="crop"` opens directly on step 3 to reframe the `current` image.
 */
export function ImageDialog({
	open,
	title,
	start = "pick",
	current = null,
	crop,
	onPick,
	onClose,
}: {
	open: boolean;
	title: string;
	start?: "pick" | "crop";
	current?: CropTarget | null;
	crop?: { aspect: number; round?: boolean; onSave: (crop: Crop) => Promise<void> };
	/** Stores the image; resolves with what to reframe next, or null when done. */
	onPick: (source: ImageSource) => Promise<CropTarget | null>;
	onClose: () => void;
}) {
	const [step, setStep] = useState<Step>(start);
	const [target, setTarget] = useState<CropTarget | null>(current);
	const [area, setArea] = useState<Crop | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// The cropper must mount after the <dialog> is shown (see CropArea); this effect
	// runs after the Modal's own effect has called showModal().
	const [shown, setShown] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset only when (re)opened
	useEffect(() => {
		setShown(open);
		if (!open) return;
		setStep(start === "crop" && current ? "crop" : "pick");
		setTarget(current);
		setArea(null);
		setError(null);
	}, [open]);

	async function pick(source: ImageSource) {
		if ("file" in source) {
			const problem = checkImageFile(source.file);
			if (problem) {
				setError(problem);
				return;
			}
		}
		setError(null);
		setStep("processing");
		try {
			const next = await onPick(source);
			if (next && crop) {
				setTarget(next);
				setArea(null);
				setStep("crop");
			} else {
				onClose();
			}
		} catch (err) {
			setError(messageOf(err, "Import de l'image impossible."));
			setStep("pick");
		}
	}

	async function saveCrop() {
		if (!crop || !area) return;
		setSaving(true);
		setError(null);
		try {
			await crop.onSave(area);
			onClose();
		} catch (err) {
			setError(messageOf(err, "Recadrage impossible."));
		} finally {
			setSaving(false);
		}
	}

	return (
		<Modal open={open} title={title} onClose={onClose} wide={step === "crop"}>
			{error && (
				<div className="mb-4">
					<Alert>{error}</Alert>
				</div>
			)}

			{step === "pick" && <SourcePicker onPick={pick} />}

			{step === "processing" && (
				<div role="status" className="flex flex-col items-center gap-3 py-12 text-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
					<p className="font-500 text-near-black">Traitement de l'image…</p>
					<p className="text-sm text-gray-500">Redimensionnement et compression en cours.</p>
				</div>
			)}

			{step === "crop" && crop && target && shown && (
				<>
					<CropArea
						key={target.image}
						image={target.image}
						aspect={crop.aspect}
						round={crop.round}
						initialCrop={target.crop}
						onChange={setArea}
					/>
					<div className="mt-5 flex flex-wrap justify-end gap-2">
						<BoButton variant="secondary" onClick={onClose}>
							{start === "crop" ? "Annuler" : "Garder le cadrage centré"}
						</BoButton>
						<BoButton busy={saving} disabled={!area} onClick={saveCrop}>
							Enregistrer le cadrage
						</BoButton>
					</div>
				</>
			)}
		</Modal>
	);
}

function SourcePicker({ onPick }: { onPick: (source: ImageSource) => void }) {
	const [tab, setTab] = useState<"file" | "url">("file");
	const [url, setUrl] = useState("");
	const [dragging, setDragging] = useState(false);
	const fileId = useId();
	const urlId = useId();
	const hintId = useId();

	function onDrop(event: DragEvent) {
		event.preventDefault();
		setDragging(false);
		const file = event.dataTransfer.files[0];
		if (file) onPick({ file });
	}

	function onPaste(event: ClipboardEvent) {
		const file = Array.from(event.clipboardData.files).find((f) => f.type.startsWith("image/"));
		if (file) {
			event.preventDefault();
			onPick({ file });
		}
	}

	function submitUrl(event: FormEvent) {
		event.preventDefault();
		if (url.trim()) onPick({ url: url.trim() });
	}

	const tabClass = (active: boolean) =>
		`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-500 ${active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`;

	return (
		<div onPaste={onPaste}>
			<div role="tablist" aria-label="Source de l'image" className="mb-4 flex gap-1">
				<button
					type="button"
					role="tab"
					aria-selected={tab === "file"}
					className={tabClass(tab === "file")}
					onClick={() => setTab("file")}
				>
					<Upload className="h-4 w-4" aria-hidden="true" />
					Importer
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={tab === "url"}
					className={tabClass(tab === "url")}
					onClick={() => setTab("url")}
				>
					<Link2 className="h-4 w-4" aria-hidden="true" />
					Lien web
				</button>
			</div>

			{tab === "file" ? (
				<div role="tabpanel">
					<label
						htmlFor={fileId}
						onDragOver={(e) => {
							e.preventDefault();
							setDragging(true);
						}}
						onDragLeave={() => setDragging(false)}
						onDrop={onDrop}
						className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
							dragging
								? "border-primary bg-primary-light/10"
								: "border-gray-300 hover:border-primary hover:bg-gray-50"
						}`}
					>
						<ImageUp className="h-8 w-8 text-primary" aria-hidden="true" />
						<span className="font-500 text-near-black">
							Glissez une image ici ou <span className="text-primary underline">parcourez</span>
						</span>
						<span id={hintId} className="text-xs text-gray-500">
							JPEG, PNG, WebP ou GIF, 8 Mo maximum. Vous pouvez aussi coller une image.
						</span>
						<input
							id={fileId}
							type="file"
							accept={ACCEPT}
							aria-describedby={hintId}
							className="sr-only"
							onChange={(e) => {
								const file = e.target.files?.[0];
								e.target.value = "";
								if (file) onPick({ file });
							}}
						/>
					</label>
				</div>
			) : (
				<form role="tabpanel" onSubmit={submitUrl} className="flex flex-col gap-3">
					<label htmlFor={urlId} className="text-sm font-500 text-near-black">
						Adresse de l'image
					</label>
					<div className="flex gap-2">
						<TextInput
							id={urlId}
							type="url"
							placeholder="https://…"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							required
							autoFocus
						/>
						<BoButton type="submit">Importer</BoButton>
					</div>
					<p className="text-xs text-gray-500">
						L'image est copiée sur le site : elle restera affichée même si elle disparaît de
						l'adresse d'origine.
					</p>
				</form>
			)}
		</div>
	);
}
