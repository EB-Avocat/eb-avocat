type MainProps = {
	children: React.ReactNode;
	className?: string;
};

// Single source of the skip-link target. The skip link in the root layout points
// at #contenu, and tabIndex={-1} lets it move focus into the main content. Every
// page renders its content through this so the "exactly one focusable #contenu"
// invariant lives in one place rather than being copy-pasted per page.
export function Main({ children, className }: MainProps) {
	return (
		<main id="contenu" tabIndex={-1} className={className}>
			{children}
		</main>
	);
}
