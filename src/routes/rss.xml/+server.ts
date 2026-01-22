import { getAllArticles } from "$lib/server/articles"

import type { RequestHandler } from "./$types"

/**
 * RSS 2.0 feed for Islamic Finance articles
 * Returns the most recent published articles
 */
export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin
	const siteName = "Islamic Finance"
	const siteDescription = "Free Islamic finance tools and calculators for halal financial planning"

	// Get all published articles (already sorted by publishedAt desc from DB)
	const allArticles = await getAllArticles()

	// Limit to most recent 20 articles for RSS feed
	// RSS feeds typically show 10-50 items, 20 is a good balance
	const recentArticles = allArticles.slice(0, 20)

	// Format date for RSS (RFC 822 format)
	function formatRSSDate(isoDate: string | null): string {
		if (!isoDate) return new Date().toUTCString()
		const date = new Date(isoDate)
		return date.toUTCString()
	}

	// Escape XML special characters
	function escapeXml(unsafe: string): string {
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&apos;")
	}

	// Generate RSS items
	const items = recentArticles
		.map((article) => {
			const articleUrl = `${baseUrl}/articles/${article.slug}`
			const pubDate = formatRSSDate(article.publishedAt || article.updatedAt)

			// Build description with metadata
			let description = escapeXml(article.description)
			if (article.tags.length > 0) {
				const tags = article.tags.map((tag) => escapeXml(tag)).join(", ")
				description += ` | Tags: ${tags}`
			}

			return `<item>
			<title>${escapeXml(article.headline)}</title>
			<link>${articleUrl}</link>
			<description>${description}</description>
			<pubDate>${pubDate}</pubDate>
			<guid isPermaLink="true">${articleUrl}</guid>
		${article.category ? `	<category>${escapeXml(article.category)}</category>` : ""}
		</item>`
		})
		.join("\n		")

	// Generate full RSS feed
	const lastBuildDate =
		recentArticles.length > 0
			? formatRSSDate(recentArticles[0].updatedAt)
			: new Date().toUTCString()

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(siteName)}</title>
		<link>${baseUrl}</link>
		<description>${escapeXml(siteDescription)}</description>
		<language>en-US</language>
		<lastBuildDate>${lastBuildDate}</lastBuildDate>
		<atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
		${items}
	</channel>
</rss>`

	return new Response(rss, {
		headers: {
			"Content-Type": "application/rss+xml; charset=UTF-8",
			"Cache-Control": "public, max-age=3600", // Cache for 1 hour
		},
	})
}
