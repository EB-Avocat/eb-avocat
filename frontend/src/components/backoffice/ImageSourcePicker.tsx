"use client";

import { Link2, Upload } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { BoButton, TextInput } from "@/components/backoffice/ui";

export type ImageSource = { file: File } | { url: string };

/** Choose an image from the computer or from a web address (downloaded by the server). */
export function ImageSourcePicker({
	busy,
	onPick,
	label = "Image",
}: {
	busy: boolean;
	onPick: (source: ImageSource) => void;
	label?: string;
}) {
	const [tab, setTab] = useState<"file" | "url">("file");
	const [url, setUrl] = useState("");
	const fileId = useId();
	const urlId = useId();

	function submitUrl(event: FormEvent) {
		event.preventDefault();
		if (url.trim()) onPick({ url: url.trim() });
	}

	const tabClass = (active: boolean) =>
		`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-500 ${active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`;

	return (
		<div className="flex flex-col gap-2">
			<div role="tablist" aria-label={`Source de l'${label.toLowerCase()}`} className="flex gap-1">
				<button
					type="button"
					role="tab"
					aria-selected={tab === "file"}
					className={tabClass(tab === "file")}
					onClick={() => setTab("file")}
				>
					<Upload className="h-3 w-3" aria-hidden="true" />
					Mon ordinateur
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={tab === "url"}
					className={tabClass(tab === "url")}
					onClick={() => setTab("url")}
				>
					<Link2 className="h-3 w-3" aria-hidden="true" />
					Lien web
				</button>
			</div>

			{tab === "file" ? (
				<div role="tabpanel">
					<label htmlFor={fileId} className="sr-only">
						{label} depuis l'ordinateur
					</label>
					<input
						id={fileId}
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						disabled={busy}
						onChange={(e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (file) onPick({ file });
						}}
						className="block w-full text-xs text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-primary-light/10 file:px-3 file:py-1.5 file:text-xs file:font-500 file:text-primary hover:file:bg-primary-light/20"
					/>
				</div>
			) : (
				<form role="tabpanel" onSubmit={submitUrl} className="flex gap-2">
					<label htmlFor={urlId} className="sr-only">
						Adresse de l'image
					</label>
					<TextInput
						id={urlId}
						type="url"
						placeholder="https://…"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						required
					/>
					<BoButton type="submit" variant="secondary" busy={busy}>
						Utiliser
					</BoButton>
				</form>
			)}
			<p className="text-xs text-gray-500">JPEG, PNG, WebP ou GIF, 8 Mo maximum.</p>
		</div>
	);
}
