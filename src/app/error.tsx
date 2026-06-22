"use client";

import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/ui/Main";
import { ERROR_PAGE } from "@/lib/constants";

// Route-level error boundary. Catches runtime errors thrown while rendering a
// route segment and shows a friendly recovery screen instead of a blank crash.
// The root layout still renders around this, so it reuses the site chrome.
export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Surface the error for debugging / monitoring; `digest` ties it to the
		// matching server-side log entry in production.
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar variant="solid" />
			<Main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center text-near-black">
				<h1 className="text-3xl font-700 md:text-4xl">{ERROR_PAGE.title}</h1>
				<p className="mt-4 max-w-xl font-300 text-lg leading-relaxed text-near-black/70">
					{ERROR_PAGE.message}
				</p>
				<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
					<button
						type="button"
						onClick={reset}
						className="inline-block cursor-pointer rounded bg-primary-light px-8 py-3 font-500 text-white transition-all duration-300 hover:bg-primary"
					>
						{ERROR_PAGE.retryCta}
					</button>
					<a
						href="/"
						className="inline-block rounded border-2 border-primary px-8 py-3 font-500 text-primary transition-all duration-300 hover:bg-primary hover:text-white"
					>
						{ERROR_PAGE.homeCta}
					</a>
				</div>
			</Main>
			<Footer variant="solid" />
		</div>
	);
}
