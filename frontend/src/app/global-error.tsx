"use client";

import { useEffect } from "react";
import { ERROR_PAGE } from "@/lib/constants";
import "./globals.css";

// Last-resort boundary: catches errors thrown in the root layout itself, which
// the segment-level error.tsx cannot recover. It replaces the whole document, so
// it must render its own <html>/<body> and pull in the global styles directly.
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="fr">
			<body className="font-museo antialiased">
				<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-darker-teal to-dark-teal px-6 py-24 text-center text-white">
					<h1 className="text-3xl font-700 md:text-4xl">{ERROR_PAGE.title}</h1>
					<p className="mt-4 max-w-xl font-300 text-lg leading-relaxed text-white/80">
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
							className="inline-block rounded border-2 border-white px-8 py-3 font-500 text-white transition-all duration-300 hover:bg-white/10"
						>
							{ERROR_PAGE.homeCta}
						</a>
					</div>
				</main>
			</body>
		</html>
	);
}
