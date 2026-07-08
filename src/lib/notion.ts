import "server-only";
import bookmarkPlugin from "@notion-render/bookmark-plugin";
import { createBlockRenderer, NotionRenderer } from "@notion-render/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import type { PageObjectResponse } from "@notionhq/client";
import { Client, isFullBlock, isFullPage } from "@notionhq/client";
import { uploadNotionFileIfMissing } from "./blob-images";

// Server-only Notion access: query the publications data source and render a
// page body to an HTML string. The framework-agnostic pipeline is ported from
// the reference Astro site; the query uses the v5 data-source API and the
// renderer is extended for nested lists + nested-image mirroring.

const notion = new Client({ auth: process.env.NOTION_TOKEN });

let dataSourceIdPromise: Promise<string> | undefined;

/**
 * Resolve the data source id backing the publications database. Prefers the
 * explicit NOTION_DATA_SOURCE_ID; otherwise looks it up once from the database
 * (v5 requires querying a data source, not a database, id).
 */
export function resolveDataSourceId(): Promise<string> {
	if (!dataSourceIdPromise) {
		dataSourceIdPromise = (async () => {
			const explicit = process.env.NOTION_DATA_SOURCE_ID;
			if (explicit) return explicit;
			const databaseId = process.env.NOTION_DATABASE_ID;
			if (!databaseId) {
				throw new Error("NOTION_DATABASE_ID or NOTION_DATA_SOURCE_ID must be set");
			}
			const db = await notion.databases.retrieve({ database_id: databaseId });
			const first = "data_sources" in db ? db.data_sources[0] : undefined;
			if (!first) {
				throw new Error(`Notion database ${databaseId} exposes no data sources`);
			}
			return first.id;
		})();
	}
	return dataSourceIdPromise;
}

/** All non-draft publication pages, newest first (paginated over the data source). */
export async function queryPublishedPages(): Promise<PageObjectResponse[]> {
	const dataSourceId = await resolveDataSourceId();
	const pages: PageObjectResponse[] = [];
	let cursor: string | undefined;
	do {
		const res = await notion.dataSources.query({
			data_source_id: dataSourceId,
			filter: { property: "draft", checkbox: { equals: false } },
			sorts: [{ property: "pubDate", direction: "descending" }],
			start_cursor: cursor,
			page_size: 100,
		});
		for (const page of res.results) {
			if (isFullPage(page)) pages.push(page);
		}
		cursor = res.next_cursor ?? undefined;
	} while (cursor);
	return pages;
}

// Custom list-item renderer that appends nested children. The built-in renderers
// emit only the item's own text and drop `has_children`, so nested lists (and any
// block nested under a list item) would be lost; `renderBlock` fetches + renders
// them recursively via the client.
const listItemRenderer = (type: "bulleted_list_item" | "numbered_list_item") =>
	createBlockRenderer(type, async (data, r) => {
		const item = data[type];
		const children = data.has_children ? await r.renderBlock(data.id) : "";
		return `<li class="notion-${data.type} notion-color-${item.color}">${await r.render(...item.rich_text)}${children}</li>`;
	});

const renderer = new NotionRenderer({
	client: notion,
	// Rewrite Notion-hosted (`file`) image blocks to permanent Blob URLs. As an
	// extension it runs on nested blocks fetched on demand (inside toggles/columns)
	// too — the reference only rewrote top-level images.
	extensions: [
		async (blocks) =>
			Promise.all(
				blocks.map(async (block) => {
					if (block?.type !== "image" || block.image?.type !== "file") return block;
					const newUrl = await uploadNotionFileIfMissing(block.image.file.url);
					return {
						...block,
						image: { ...block.image, file: { ...block.image.file, url: newUrl } },
					};
				}),
			),
	],
	renderers: [listItemRenderer("bulleted_list_item"), listItemRenderer("numbered_list_item")],
});

let pluginsReady: Promise<void> | undefined;

function ensurePlugins(): Promise<void> {
	if (!pluginsReady) {
		pluginsReady = (async () => {
			await renderer.use(hljsPlugin({}));
			await renderer.use(bookmarkPlugin(undefined));
		})();
	}
	return pluginsReady;
}

async function fetchTopLevelBlocks(pageId: string) {
	const blocks = [];
	let cursor: string | undefined;
	do {
		const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor });
		for (const block of res.results) {
			if (isFullBlock(block)) blocks.push(block);
		}
		cursor = res.next_cursor ?? undefined;
	} while (cursor);
	return blocks;
}

/**
 * Render a Notion page body to an HTML string. Only top-level blocks are fetched
 * here; the renderer descends into nested blocks itself (via its client) and the
 * image extension mirrors both top-level and nested images to Blob.
 */
export async function renderNotionPage(pageId: string): Promise<string> {
	await ensurePlugins();
	const blocks = await fetchTopLevelBlocks(pageId);
	return renderer.render(...blocks);
}
