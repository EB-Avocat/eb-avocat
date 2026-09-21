"use client";

import { Loader2, X } from "lucide-react";
import {
	type ButtonHTMLAttributes,
	type InputHTMLAttributes,
	type ReactNode,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
	useEffect,
	useId,
	useRef,
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

/** Modal dialog built on the native <dialog> (focus trap + Escape for free). */
export function Modal({
	open,
	title,
	onClose,
	children,
}: {
	open: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
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
			className="m-auto w-full max-w-md rounded-lg p-0 shadow-xl backdrop:bg-near-black/40"
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
