"use client";

import { type FormEvent, useState } from "react";
import { contactItems } from "@/components/contactItems";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT, OTHER_SUBJECT } from "@/lib/constants";

const labelClass = "mb-1 block text-sm font-500 text-near-black";
// Keep the brand border+ring on focus, but do NOT suppress the outline: the global
// :focus-visible rule (globals.css) supplies the high-contrast keyboard indicator.
const inputClass =
	"w-full rounded border border-gray-300 px-4 py-2 font-300 text-sm text-near-black focus:border-primary-light focus:ring-2 focus:ring-primary-light/30 transition-colors";

type Status = "idle" | "submitting" | "success" | "error";

export function Contact() {
	const [subject, setSubject] = useState("");
	const [status, setStatus] = useState<Status>("idle");

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const payload = Object.fromEntries(new FormData(form).entries());

		setStatus("submitting");
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Request failed");
			form.reset();
			setSubject("");
			setStatus("success");
		} catch {
			setStatus("error");
		}
	};

	return (
		<section id="contact" className="bg-white py-20">
			<div className="mx-auto max-w-6xl px-6">
				<SectionHeading>{CONTACT.sectionTitle}</SectionHeading>
				<div className="grid gap-12 md:grid-cols-2">
					{/* Contact info */}
					<div>
						<h3 className="mb-6 text-xl font-700 text-near-black">Coordonnées</h3>
						<div className="space-y-4">
							{contactItems.map(({ Icon, text, href, external }) => (
								<div key={text} className="flex items-start gap-3">
									<span className="flex h-5 shrink-0 items-center">
										<Icon className="h-5 w-5 text-primary-light" />
									</span>
									{href ? (
										<a
											href={href}
											target={external ? "_blank" : undefined}
											rel={external ? "noopener noreferrer" : undefined}
											className="text-sm font-300 leading-5 text-gray-700 transition-colors hover:text-primary-light"
										>
											{text}
										</a>
									) : (
										<p className="text-sm font-300 leading-5 text-gray-700">{text}</p>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="lastName" className={labelClass}>
									{CONTACT.formFields.lastName}
								</label>
								<input id="lastName" name="lastName" type="text" required className={inputClass} />
							</div>
							<div>
								<label htmlFor="firstName" className={labelClass}>
									{CONTACT.formFields.firstName}
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									required
									className={inputClass}
								/>
							</div>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="email" className={labelClass}>
									{CONTACT.formFields.email}
								</label>
								<input id="email" name="email" type="email" required className={inputClass} />
							</div>
							<div>
								<label htmlFor="phone" className={labelClass}>
									{CONTACT.formFields.phone}
								</label>
								<input id="phone" name="phone" type="tel" className={inputClass} />
							</div>
						</div>
						<div>
							<label id="subject-label" htmlFor="subject" className={labelClass}>
								{CONTACT.formFields.subject}
							</label>
							{/* VoiceOver is unreliable at announcing a native <select>'s label via
							    implicit for/id association, so reference the label explicitly with
							    aria-labelledby. The placeholder is a disabled prompt (not a real
							    value) so screen readers present the actual options as the choices. */}
							<select
								id="subject"
								name="subject"
								aria-labelledby="subject-label"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								className={inputClass}
							>
								<option value="" disabled>
									-- Sélectionnez --
								</option>
								{CONTACT.subjectOptions.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</select>
						</div>
						{subject === OTHER_SUBJECT && (
							<div>
								<label htmlFor="customSubject" className={labelClass}>
									{CONTACT.formFields.customSubject}
								</label>
								<input id="customSubject" name="customSubject" type="text" className={inputClass} />
							</div>
						)}
						<div>
							<label htmlFor="message" className={labelClass}>
								{CONTACT.formFields.message}
							</label>
							<textarea id="message" name="message" rows={5} required className={inputClass} />
						</div>
						<Button type="submit" disabled={status === "submitting"}>
							{status === "submitting" ? CONTACT.formMessages.sending : CONTACT.formFields.submit}
						</Button>
						{status === "success" && (
							<p role="status" className="text-sm font-300 text-primary-light">
								{CONTACT.formMessages.success}
							</p>
						)}
						{status === "error" && (
							<p role="alert" className="text-sm font-300 text-red-600">
								{CONTACT.formMessages.error}
							</p>
						)}
					</form>
				</div>
			</div>
		</section>
	);
}
