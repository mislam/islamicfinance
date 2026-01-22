import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin
	const sitemapUrl = `${baseUrl}/sitemap.xml`

	const robotsTxt = `# allow crawling everything by default
User-agent: *
Disallow:

# Sitemap location
Sitemap: ${sitemapUrl}
`

	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain",
		},
	})
}
