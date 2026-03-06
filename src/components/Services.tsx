import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { SERVICES } from "@/lib/constants";

const icons = [
	// Building
	<svg
		key="building"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M2 22h20M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18M10 6h4M10 10h4M10 14h4"
		/>
	</svg>,
	// Handshake
	<svg
		key="handshake"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M7 11l3-3 4 4 3-3M4 15l3.5-3.5M20 15l-3.5-3.5M9 20l3-3 3 3M2 8h4M18 8h4"
		/>
	</svg>,
	// Document
	<svg
		key="document"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
		/>
	</svg>,
	// Light bulb
	<svg
		key="bulb"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
		/>
	</svg>,
	// Scale
	<svg
		key="scale"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 3v18m0-18l-7 7h14l-7-7zM5 10l-2 7h6l-2-7M19 10l-2 7h6l-2-7"
		/>
	</svg>,
	// Shield
	<svg
		key="shield"
		className="h-8 w-8"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
		/>
	</svg>,
];

export function Services() {
	return (
		<section id="services" className="bg-primary-light/5 py-20">
			<div className="mx-auto max-w-6xl px-6">
				<SectionHeading>{SERVICES.sectionTitle}</SectionHeading>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{SERVICES.items.map((service, i) => (
						<ServiceCard
							key={service.title}
							title={service.title}
							description={service.description}
							icon={icons[i]}
							delay={i * 100}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
