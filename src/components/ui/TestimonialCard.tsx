"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

type TestimonialCardProps = {
	quote: string;
	author: string;
	profession: string;
	delay?: number;
};

export function TestimonialCard({ quote, author, profession, delay = 0 }: TestimonialCardProps) {
	const { ref, isVisible } = useIntersectionObserver(0.1);

	return (
		<div
			ref={ref}
			className="rounded-lg bg-white/10 p-6 backdrop-blur-sm"
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0)" : "translateY(20px)",
				transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
			}}
		>
			<p className="mb-4 text-base font-300 italic leading-relaxed text-white">
				&laquo;&nbsp;{quote}&nbsp;&raquo;
			</p>
			<p className="text-sm font-700 text-white">{author}</p>
			<p className="text-sm font-300 text-white/70">{profession}</p>
		</div>
	);
}
