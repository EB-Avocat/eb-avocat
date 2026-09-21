import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

// Shared shell for the publications routes (list + article). These pages have no
// hero, so — like the other standalone pages — the Navbar/Footer use the "solid"
// variant and point their in-page anchors back to the home page.
export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar variant="solid" />
			{children}
			<Footer variant="solid" />
		</div>
	);
}
