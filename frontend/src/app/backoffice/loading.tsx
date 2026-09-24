import { FullPageSpinner } from "@/components/backoffice/ui";

/** Shown while a back-office route loads (first visit to the secret URL included). */
export default function BackofficeLoading() {
	return <FullPageSpinner />;
}
