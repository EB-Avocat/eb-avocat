/** User avatar, or initials on the brand colour when there is none. Decorative. */
export function Avatar({
	src,
	name,
	size = 32,
}: {
	src: string | null;
	name: string;
	size?: number;
}) {
	const initials = name
		.split(/[\s@.]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
	const style = { width: size, height: size };

	if (src) {
		return <img src={src} alt="" style={style} className="shrink-0 rounded-full object-cover" />;
	}
	return (
		<span
			aria-hidden="true"
			style={{ ...style, fontSize: size * 0.4 }}
			className="flex shrink-0 items-center justify-center rounded-full bg-primary font-500 text-white"
		>
			{initials}
		</span>
	);
}
