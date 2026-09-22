"use client";

import { useState } from "react";

/**
 * User avatar. The initials on the brand colour stay underneath until the photo has
 * loaded (or when there is none / it fails), then the photo fades in. Decorative.
 */
export function Avatar({
	src,
	name,
	size = 32,
}: {
	src: string | null;
	name: string;
	size?: number;
}) {
	const [loaded, setLoaded] = useState<string | null>(null);
	const initials = name
		.split(/[\s@.]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");

	return (
		<span
			aria-hidden="true"
			style={{ width: size, height: size, fontSize: size * 0.4 }}
			className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-500 text-white"
		>
			{initials}
			{src && (
				<img
					src={src}
					alt=""
					ref={(img) => {
						if (img?.complete && img.naturalWidth > 0) setLoaded(img.getAttribute("src"));
					}}
					onLoad={() => setLoaded(src)}
					className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${loaded === src ? "opacity-100" : "opacity-0"}`}
				/>
			)}
		</span>
	);
}
