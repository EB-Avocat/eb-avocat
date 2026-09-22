"use client";

import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import {
	type ButtonHTMLAttributes,
	type InputHTMLAttributes,
	type ReactNode,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

// Small, accessible primitives for the back-office (site tokens, no extra deps).

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const buttonVariants: Record<ButtonVariant, string> = {
	primary: "bg-primary text-white hover:bg-primary-light disabled:bg-primary/50",
	secondary:
		"border border-gray-300 bg-white text-near-black hover:bg-gray-50 disabled:text-gray-400",
	danger: "bg-red-700 text-white hover:bg-red-800 disabled:bg-red-700/50",
	ghost: "text-primary hover:bg-primary-light/10 disabled:text-gray-400",
};

export function BoButton({
	variant = "primary",
	busy = false,
	className = "",
	children,
	disabled,
	type = "button",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; busy?: boolean }) {
	return (
		<button
			type={type}
			disabled={disabled || busy}
			aria-busy={busy || undefined}
			className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-500 transition-colors disabled:cursor-not-allowed ${buttonVariants[variant]} ${className}`}
			{...props}
		>
			{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
			{children}
		</button>
	);
}

const inputClass =
	"w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-near-black placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 aria-invalid:border-red-600";

export function Field({
	label,
	hint,
	error,
	children,
}: {
	label: string;
	hint?: string;
	error?: string | null;
	children: (props: {
		id: string;
		"aria-describedby"?: string;
		"aria-invalid"?: boolean;
	}) => ReactNode;
}) {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	const errorId = error ? `${id}-error` : undefined;
	const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={id} className="text-sm font-500 text-near-black">
				{label}
			</label>
			{children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
			{hint && (
				<p id={hintId} className="text-xs text-gray-500">
					{hint}
				</p>
			)}
			{error && (
				<p id={errorId} className="text-xs text-red-700">
					{error}
				</p>
			)}
		</div>
	);
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
	return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return <textarea {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
	return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Alert({
	tone = "error",
	children,
}: {
	tone?: "error" | "success" | "info";
	children: ReactNode;
}) {
	const tones = {
		error: "border-red-200 bg-red-50 text-red-800",
		success: "border-green-200 bg-green-50 text-green-800",
		info: "border-primary/20 bg-primary-light/5 text-primary",
	};
	return (
		<div
			role={tone === "error" ? "alert" : "status"}
			className={`whitespace-pre-line rounded border px-4 py-3 text-sm ${tones[tone]}`}
		>
			{children}
		</div>
	);
}

export function Badge({
	tone = "neutral",
	children,
}: {
	tone?: "neutral" | "success" | "primary";
	children: ReactNode;
}) {
	const tones = {
		neutral: "bg-gray-100 text-gray-700",
		success: "bg-green-100 text-green-800",
		primary: "bg-primary-light/10 text-primary",
	};
	return (
		<span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-500 ${tones[tone]}`}>
			{children}
		</span>
	);
}

export function Spinner({ label = "Chargement…" }: { label?: string }) {
	return (
		<div role="status" className="flex items-center gap-2 py-8 text-sm text-gray-500">
			<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
			{label}
		</div>
	);
}

/** Centered spinner filling the viewport (session check, route loading). */
export function FullPageSpinner({ label = "Chargement…" }: { label?: string }) {
	return (
		<div
			role="status"
			className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-500"
		>
			<Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
			{label}
		</div>
	);
}

/** Grey placeholder block for skeleton screens. */
export function Skeleton({ className = "" }: { className?: string }) {
	return <div aria-hidden="true" className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

/** Wraps a skeleton so assistive tech hears "loading" once instead of empty blocks. */
export function SkeletonGroup({
	label = "Chargement…",
	className = "",
	children,
}: {
	label?: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div role="status" aria-busy="true" className={className}>
			<span className="sr-only">{label}</span>
			{children}
		</div>
	);
}

/** `rows` list lines, e.g. while a table or a list loads. */
export function ListSkeleton({ rows = 6, avatar = false }: { rows?: number; avatar?: boolean }) {
	return (
		<SkeletonGroup className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
			{Array.from({ length: rows }, (_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
				<div key={index} className="flex items-center gap-4 px-4 py-4">
					{avatar && <Skeleton className="h-10 w-10 !rounded-full" />}
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className={`h-4 ${index % 2 ? "w-1/2" : "w-2/3"}`} />
						<Skeleton className="h-3 w-1/4" />
					</div>
					<Skeleton className="hidden h-6 w-20 sm:block" />
					<Skeleton className="h-8 w-16" />
				</div>
			))}
		</SkeletonGroup>
	);
}

/**
 * <img> that shows a pulsing placeholder and a spinner until the file has loaded, so
 * a freshly processed image never appears as an empty box.
 */
export function LoadingImage({
	src,
	alt = "",
	className = "",
}: {
	src: string;
	alt?: string;
	className?: string;
}) {
	const [loaded, setLoaded] = useState<string | null>(null);
	const ready = loaded === src;
	return (
		<span className={`relative block overflow-hidden bg-gray-100 ${className}`}>
			{!ready && (
				<span className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
					<Loader2 className="h-6 w-6 animate-spin text-gray-400" aria-hidden="true" />
				</span>
			)}
			<img
				src={src}
				alt={alt}
				ref={(img) => {
					if (img?.complete && img.naturalWidth > 0) setLoaded(img.getAttribute("src"));
				}}
				onLoad={() => setLoaded(src)}
				className={`h-full w-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
			/>
		</span>
	);
}

/** Page-by-page navigation for back-office lists (hidden with a single page). */
export function Pager({
	page,
	pageCount,
	onPage,
}: {
	page: number;
	pageCount: number;
	onPage: (page: number) => void;
}) {
	if (pageCount <= 1) return null;
	// First, last, and a window around the current page, with gaps as "…".
	const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
		(p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
	);
	const button =
		"flex h-9 min-w-9 items-center justify-center rounded px-2 text-sm font-500 disabled:opacity-40";
	return (
		<nav aria-label="Pagination" className="flex items-center gap-1">
			<button
				type="button"
				className={`${button} text-primary hover:bg-primary-light/10`}
				disabled={page <= 1}
				onClick={() => onPage(page - 1)}
				aria-label="Page précédente"
			>
				<ChevronLeft className="h-4 w-4" aria-hidden="true" />
			</button>
			{pages.map((p, index) => (
				<span key={p} className="flex items-center gap-1">
					{index > 0 && p - (pages[index - 1] ?? p) > 1 && (
						<span className="px-1 text-gray-400" aria-hidden="true">
							…
						</span>
					)}
					<button
						type="button"
						className={`${button} ${p === page ? "bg-primary text-white" : "text-primary hover:bg-primary-light/10"}`}
						aria-current={p === page ? "page" : undefined}
						aria-label={`Page ${p}`}
						onClick={() => onPage(p)}
					>
						{p}
					</button>
				</span>
			))}
			<button
				type="button"
				className={`${button} text-primary hover:bg-primary-light/10`}
				disabled={page >= pageCount}
				onClick={() => onPage(page + 1)}
				aria-label="Page suivante"
			>
				<ChevronRight className="h-4 w-4" aria-hidden="true" />
			</button>
		</nav>
	);
}

/** Modal dialog built on the native <dialog> (focus trap + Escape for free). */
export function Modal({
	open,
	title,
	onClose,
	children,
	wide = false,
}: {
	open: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
	wide?: boolean;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	const titleId = useId();

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			aria-labelledby={titleId}
			onClose={onClose}
			className={`m-auto w-full ${wide ? "max-w-3xl" : "max-w-md"} rounded-lg p-0 shadow-xl backdrop:bg-near-black/40`}
		>
			<div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
				<h2 id={titleId} className="font-700 text-near-black">
					{title}
				</h2>
				<button
					type="button"
					onClick={onClose}
					className="rounded p-1 text-gray-500 hover:bg-gray-100"
					aria-label="Fermer"
				>
					<X className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>
			<div className="px-5 py-4">{children}</div>
		</dialog>
	);
}

export function ConfirmModal({
	open,
	title,
	message,
	confirmLabel,
	busy,
	onConfirm,
	onClose,
}: {
	open: boolean;
	title: string;
	message: ReactNode;
	confirmLabel: string;
	busy?: boolean;
	onConfirm: () => void;
	onClose: () => void;
}) {
	return (
		<Modal open={open} title={title} onClose={onClose}>
			<div className="text-sm text-gray-700">{message}</div>
			<div className="mt-5 flex justify-end gap-2">
				<BoButton variant="secondary" onClick={onClose}>
					Annuler
				</BoButton>
				<BoButton variant="danger" busy={busy} onClick={onConfirm}>
					{confirmLabel}
				</BoButton>
			</div>
		</Modal>
	);
}

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
	return (
		<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
			<h1 className="text-2xl font-700 text-near-black">{title}</h1>
			{actions && <div className="flex flex-wrap gap-2">{actions}</div>}
		</div>
	);
}
