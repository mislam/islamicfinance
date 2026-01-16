import { getAllArticles } from "$lib/server/articles"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin

	// Get all articles
	const articles = await getAllArticles()

	// Define static pages/routes
	const staticPages = [
		{
			url: `${baseUrl}/`,
			changefreq: "weekly",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/islamic-mortgage-calculator`,
			changefreq: "monthly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/loan-agreement-generator`,
			changefreq: "monthly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/articles`,
			changefreq: "weekly",
			priority: 0.8,
		},
	]

	// Generate article entries
	const articleEntries = articles.map((article) => {
		const lastmod = article.updatedAt || article.publishedAt || undefined
		return {
			url: `${baseUrl}/articles/${article.slug}`,
			changefreq: "monthly" as const,
			priority: 0.9,
			lastmod,
		}
	})

	// Combine all pages
	const allPages = [...staticPages, ...articleEntries]

	// Generate XML sitemap
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map((page) => {
		const lastmod = "lastmod" in page && page.lastmod ? `\n		<lastmod>${page.lastmod}</lastmod>` : ""
		return `	<url>
		<loc>${page.url}</loc>
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>${lastmod}
	</url>`
	})
	.join("\n")}
</urlset>`

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
		},
	})
}
