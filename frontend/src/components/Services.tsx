import { Building2, FileText, GraduationCap, HandHeart, Handshake, Scale } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { SERVICES } from "@/lib/constants";

const icons = {
	building: Building2,
	handshake: Handshake,
	document: FileText,
	scale: Scale,
	heart: HandHeart,
	graduation: GraduationCap,
};

export function Services() {
	return (
		<section id="domaines-intervention" className="bg-primary-light/5 py-20">
			<div className="mx-auto max-w-6xl px-6">
				<SectionHeading>{SERVICES.sectionTitle}</SectionHeading>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{SERVICES.items.map((service, i) => {
						const Icon = icons[service.icon];
						return (
							<ServiceCard
								key={service.title}
								title={service.title}
								description={service.description}
								icon={<Icon className="h-8 w-8" strokeWidth={1.5} />}
								delay={i * 100}
							/>
						);
					})}
				</div>
			</div>
		</section>
	);
}
