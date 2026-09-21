/**
 * Article body as rendered on the public site. The HTML comes from the backend,
 * which renders the article's Markdown and sanitises it (nh3 allow-list), so it
 * is safe to inject. Shared with the back-office preview so both look identical.
 */
export function ArticleBody({ html }: { html: string }) {
	return (
		<div
			className="prose prose-neutral max-w-none prose-headings:font-museo prose-headings:text-near-black prose-a:text-primary hover:prose-a:text-primary-light prose-img:rounded-lg"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
