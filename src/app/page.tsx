import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { Main } from "@/components/ui/Main";

export default function Home() {
	return (
		<>
			<Navbar />
			<Main>
				<Hero />
				<About />
				<Services />
				<Testimonials />
				<Contact />
			</Main>
			<Footer />
		</>
	);
}
