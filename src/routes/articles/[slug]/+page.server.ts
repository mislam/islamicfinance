import { error } from "@sveltejs/kit"

import { getArticleBySlug } from "$lib/server/articles"

export async function load({ params }) {
	const article = await getArticleBySlug(params.slug)

	if (!article) {
		error(404, "Article not found")
	}

	return {
		article,
	}
}
