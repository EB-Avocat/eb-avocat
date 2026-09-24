import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { vi } from "vitest";

// Mock next/image as a plain <img>, stripping Next-only props that are not
// valid DOM attributes (avoids React "non-boolean attribute" warnings).
vi.mock("next/image", () => ({
	default: (props: Record<string, unknown>) => {
		const NEXT_ONLY_PROPS = new Set([
			"fill",
			"priority",
			"sizes",
			"quality",
			"placeholder",
			"loader",
		]);
		const imgProps = Object.fromEntries(
			Object.entries(props).filter(([key]) => !NEXT_ONLY_PROPS.has(key)),
		);
		return createElement("img", imgProps);
	},
}));

// Mock IntersectionObserver for jsdom
class MockIntersectionObserver {
	readonly root: Element | null = null;
	readonly rootMargin: string = "";
	readonly thresholds: ReadonlyArray<number> = [];
	constructor(private callback: IntersectionObserverCallback) {}
	observe() {
		// Immediately trigger with isIntersecting: true for tests
		this.callback(
			[{ isIntersecting: true } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver,
		);
	}
	unobserve() {}
	disconnect() {}
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
}

globalThis.IntersectionObserver =
	MockIntersectionObserver as unknown as typeof IntersectionObserver;
