type SectionHeadingProps = {
	children: React.ReactNode;
	light?: boolean;
	// Defaults to h2 (section headings on the home page, which already has the hero
	// h1). Standalone pages with no other top-level heading pass "h1" so the page
	// has a proper level-one heading.
	as?: "h1" | "h2";
};

export function SectionHeading({ children, light = false, as: Tag = "h2" }: SectionHeadingProps) {
	return (
		<Tag
			className={`text-3xl font-700 mb-12 text-center md:text-4xl ${light ? "text-white" : "text-near-black"}`}
		>
			{children}
		</Tag>
	);
}
