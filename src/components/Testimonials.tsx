import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { TESTIMONIALS } from "@/lib/constants";

export function Testimonials() {
	return (
		<section id="temoignages" className="bg-primary py-20">
			<div className="mx-auto max-w-6xl px-6">
				<SectionHeading light>{TESTIMONIALS.sectionTitle}</SectionHeading>
				<div className="grid gap-6 md:grid-cols-3">
					{TESTIMONIALS.items.map((t, i) => (
						<TestimonialCard
							key={t.author}
							quote={t.quote}
							author={t.author}
							profession={t.profession}
							delay={i * 100}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
