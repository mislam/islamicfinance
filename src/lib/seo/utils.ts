/**
 * SEO utility functions
 */

import type { SEOData } from "./types"

/**
 * Generate structured data HTML for JSON-LD
 * @param structuredData - The structured data object
 * @returns HTML string with script tag
 */
export function generateStructuredDataHtml(structuredData: object): string {
	const scriptOpen = '<script type="application/ld+json">'
	const scriptClose = "</" + "script>"
	return scriptOpen + JSON.stringify(structuredData) + scriptClose
}

/**
 * Generate complete SEO data with defaults
 * @param data - Partial SEO data
 * @param pathname - Current page pathname
 * @param baseUrl - Base URL of the site
 * @returns Complete SEO data object
 */
export function createSEOData(
	data: Partial<SEOData> & Pick<SEOData, "title" | "description">,
	pathname: string,
	baseUrl: string,
): SEOData {
	const pageUrl = `${baseUrl}${pathname}`

	return {
		title: data.title,
		description: data.description,
		keywords: data.keywords || "",
		pageUrl,
		structuredData: data.structuredData,
		structuredDataHtml: data.structuredData
			? generateStructuredDataHtml(data.structuredData)
			: undefined,
		ogImage: data.ogImage,
		twitterImage: data.twitterImage,
	}
}
