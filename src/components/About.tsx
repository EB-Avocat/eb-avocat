"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ABOUT } from "@/lib/constants";

export function About() {
	const { ref, isVisible } = useIntersectionObserver(0.1);

	return (
		<section id="a-propos" className="bg-white py-20">
			<div className="mx-auto max-w-6xl px-6">
				<SectionHeading>{ABOUT.sectionTitle}</SectionHeading>
				<div
					ref={ref}
					className="grid items-center gap-12 md:grid-cols-2"
					style={{
						opacity: isVisible ? 1 : 0,
						transform: isVisible ? "translateY(0)" : "translateY(30px)",
						transition: "opacity 0.8s ease, transform 0.8s ease",
					}}
				>
					{/* Photo placeholder */}
					<div className="flex items-center justify-center">
						<div className="flex aspect-[3/4] w-full max-w-sm items-center justify-center rounded-lg border-4 border-primary-light/20 bg-gradient-to-br from-primary/5 to-primary-light/10">
							<span className="text-sm font-300 text-primary/40">Photo de Me Biezunski</span>
						</div>
					</div>

					{/* Text */}
					<div>
						{ABOUT.paragraphs.map((p) => (
							<p
								key={p.slice(0, 30)}
								className="mb-4 text-base font-300 leading-relaxed text-gray-700 last:mb-0"
							>
								{p}
							</p>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
