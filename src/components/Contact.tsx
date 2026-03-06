"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT } from "@/lib/constants";

const contactItems = [
	{
		icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
		text: CONTACT.address,
	},
	{
		icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
		text: CONTACT.phone,
	},
	{
		icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
		text: CONTACT.email,
	},
];

const labelClass = "mb-1 block text-sm font-500 text-near-black";
const inputClass =
	"w-full rounded border border-gray-300 px-4 py-2 font-300 text-sm text-near-black focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 focus:outline-none transition-colors";

export function Contact() {
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
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
							{contactItems.map((item) => (
								<div key={item.text} className="flex items-start gap-3">
									<svg
										className="mt-1 h-5 w-5 shrink-0 text-primary-light"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={1.5}
									>
										{item.icon.split(" M").map((segment, i) => (
											<path
												key={segment.slice(0, 10)}
												strokeLinecap="round"
												strokeLinejoin="round"
												d={i === 0 ? segment : `M${segment}`}
											/>
										))}
									</svg>
									<p className="text-sm font-300 text-gray-700">{item.text}</p>
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
								<input id="lastName" type="text" className={inputClass} />
							</div>
							<div>
								<label htmlFor="firstName" className={labelClass}>
									{CONTACT.formFields.firstName}
								</label>
								<input id="firstName" type="text" className={inputClass} />
							</div>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="email" className={labelClass}>
									{CONTACT.formFields.email}
								</label>
								<input id="email" type="email" className={inputClass} />
							</div>
							<div>
								<label htmlFor="phone" className={labelClass}>
									{CONTACT.formFields.phone}
								</label>
								<input id="phone" type="tel" className={inputClass} />
							</div>
						</div>
						<div>
							<label htmlFor="subject" className={labelClass}>
								{CONTACT.formFields.subject}
							</label>
							<select id="subject" className={inputClass}>
								<option value="">-- Sélectionnez --</option>
								{CONTACT.subjectOptions.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="message" className={labelClass}>
								{CONTACT.formFields.message}
							</label>
							<textarea id="message" rows={5} className={inputClass} />
						</div>
						<Button type="submit">{CONTACT.formFields.submit}</Button>
					</form>
				</div>
			</div>
		</section>
	);
}
