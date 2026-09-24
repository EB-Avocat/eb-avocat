import { Shell } from "@/components/backoffice/Shell";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
	return <Shell>{children}</Shell>;
}
