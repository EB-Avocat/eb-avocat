import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REVIEW_CTA, REVIEW_URL } from "@/lib/constants";

export function Testimonials() {
	return (
		<section id="avis" className="bg-primary py-20">
			<div className="mx-auto max-w-2xl px-6 text-center">
				<SectionHeading light>{REVIEW_CTA.title}</SectionHeading>
				<p className="-mt-6 mb-10 text-base font-300 leading-relaxed text-white/80">
					{REVIEW_CTA.subtitle}
				</p>
				<div className="flex justify-center">
					<a
						href={REVIEW_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded border-2 border-white px-8 py-3 font-500 text-base text-white transition-all duration-300 hover:bg-white/10"
					>
						<Star className="h-5 w-5" strokeWidth={1.5} />
						Laisser un avis
					</a>
				</div>
			</div>
		</section>
	);
}
