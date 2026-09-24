"use client";

import Image from "next/image";
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
					<div className="flex items-center justify-center">
						<div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg">
							<Image
								src="/images/portrait.jpeg"
								alt="Me Eva Biezunski"
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 384px"
								priority
							/>
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
