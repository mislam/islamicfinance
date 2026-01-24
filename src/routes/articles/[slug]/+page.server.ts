import { error } from "@sveltejs/kit"
import { waitUntil } from "@vercel/functions"

import { dev } from "$app/environment"
import { getArticleBySlug } from "$lib/server/articles"
import { recordArticleView } from "$lib/server/view-count"

export async function load({ cookies, getClientAddress, params, request }) {
	const result = await getArticleBySlug(params.slug)

	if (!result) {
		error(404, "Article not found")
	}

	const { id, ...article } = result

	// Track view count in background (non-blocking, analytics only)
	// waitUntil ensures task completes in Vercel serverless functions
	const viewCountPromise = recordArticleView({
		articleId: id,
		slug: params.slug,
		cookies,
		getClientAddress,
		request,
		secure: !dev,
	}).catch((err) => {
		console.error("Failed to record article view:", err)
	})

	waitUntil(viewCountPromise)

	return {
		article,
	}
}
