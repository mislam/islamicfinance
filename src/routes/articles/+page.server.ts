import { getAllArticles, getArticlesByCategory, getArticlesByTag } from "$lib/server/articles"

export async function load({ url }) {
	const tag = url.searchParams.get("tag")
	const category = url.searchParams.get("category")

	let articles

	if (tag) {
		articles = await getArticlesByTag(tag)
	} else if (category) {
		articles = await getArticlesByCategory(category)
	} else {
		articles = await getAllArticles()
	}

	return {
		articles,
		filters: {
			tag: tag || null,
			category: category || null,
		},
	}
}
