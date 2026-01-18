import { error } from "@sveltejs/kit"

import { dev } from "$app/environment"
import { getArticleBySlug } from "$lib/server/articles"
import { recordArticleView } from "$lib/server/view-count"

export async function load({ cookies, getClientAddress, params, request }) {
	const result = await getArticleBySlug(params.slug)

	if (!result) {
		error(404, "Article not found")
	}

	const { id, ...article } = result

	const { counted } = await recordArticleView({
		articleId: id,
		slug: params.slug,
		cookies,
		getClientAddress,
		request,
		secure: !dev,
	})
	if (counted) {
		article.viewCount = (article.viewCount ?? 0) + 1
	}

	return {
		article,
	}
}
