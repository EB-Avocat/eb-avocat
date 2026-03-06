"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

type ServiceCardProps = {
	title: string;
	description: string;
	icon: React.ReactNode;
	delay?: number;
};

export function ServiceCard({ title, description, icon, delay = 0 }: ServiceCardProps) {
	const { ref, isVisible } = useIntersectionObserver(0.1);

	return (
		<div
			ref={ref}
			className="rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0)" : "translateY(20px)",
				transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
			}}
		>
			<div className="mb-4 text-primary-light">{icon}</div>
			<h3 className="mb-2 text-xl font-700 text-near-black">{title}</h3>
			<p className="text-sm font-300 leading-relaxed text-gray-600">{description}</p>
		</div>
	);
}
