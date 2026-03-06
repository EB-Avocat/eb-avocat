type SectionHeadingProps = {
	children: React.ReactNode;
	light?: boolean;
};

export function SectionHeading({ children, light = false }: SectionHeadingProps) {
	return (
		<h2
			className={`text-3xl font-700 mb-12 text-center md:text-4xl ${light ? "text-white" : "text-near-black"}`}
		>
			{children}
		</h2>
	);
}
