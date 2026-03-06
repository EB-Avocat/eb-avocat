import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "outline";
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
	const base =
		"inline-block px-8 py-3 font-500 text-base rounded transition-all duration-300 cursor-pointer";
	const variants = {
		primary: "bg-primary-light text-white hover:bg-primary",
		outline: "border-2 border-white text-white hover:bg-white/10",
	};

	return (
		<button className={`${base} ${variants[variant]} ${className}`} {...props}>
			{children}
		</button>
	);
}
