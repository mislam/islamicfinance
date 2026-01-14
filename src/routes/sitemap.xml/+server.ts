import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin

	// Define all pages/routes
	const pages = [
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
	]

	// Generate XML sitemap
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(page) => `	<url>
		<loc>${page.url}</loc>
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>
	</url>`,
	)
	.join("\n")}
</urlset>`

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
		},
	})
}
