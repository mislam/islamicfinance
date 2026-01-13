/**
 * SEO utility functions
 */

import type { SEOData } from "./types"

/**
 * Generate structured data HTML for JSON-LD
 * @param structuredData - The structured data object or array of objects
 * @returns HTML string with script tag(s)
 */
export function generateStructuredDataHtml(structuredData: object | object[]): string {
	const scriptOpen = '<script type="application/ld+json">'
	const scriptClose = "</" + "script>"

	// If array, create separate script tags for each item (recommended by Google)
	if (Array.isArray(structuredData)) {
		return structuredData.map((item) => scriptOpen + JSON.stringify(item) + scriptClose).join("\n")
	}

	// Single object
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
