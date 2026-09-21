"use client";

import { use } from "react";
import { ArticleEditor } from "@/components/backoffice/ArticleEditor";

export default function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	// "nouveau" opens an empty editor; the article is created on first save.
	return <ArticleEditor key={id} id={id === "nouveau" ? null : id} />;
}
