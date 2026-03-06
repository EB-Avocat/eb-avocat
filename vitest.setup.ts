import "@testing-library/jest-dom/vitest";

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
