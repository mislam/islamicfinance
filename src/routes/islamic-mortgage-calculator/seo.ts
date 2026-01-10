/**
 * SEO metadata for Islamic Mortgage Calculator page
 */

import type { SEOData } from "$lib/seo"
import { createSEOData } from "$lib/seo"

/**
 * Generate SEO metadata for the Islamic Mortgage Calculator page
 * @param pathname - Current page pathname (from page.url.pathname)
 * @param baseUrl - Base URL of the site
 * @returns Complete SEO metadata object
 */
export function getSEOData(pathname: string, baseUrl: string): SEOData {
	const title = "Islamic Home Financing Calculator | Compare Halal vs Conventional Mortgage"
	const description =
		"Free Islamic mortgage calculator comparing Diminishing Musharaka (halal financing) with conventional interest-based mortgages. Calculate payments, ownership, and total costs side-by-side."
	const keywords =
		"islamic mortgage, halal financing, diminishing musharaka, islamic home financing, sharia compliant mortgage, riba free mortgage, islamic finance calculator, halal home loan, conventional mortgage comparison, islamic banking"

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "Islamic Home Financing Calculator",
		description,
		url: `${baseUrl}${pathname}`,
		applicationCategory: "FinanceApplication",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "5",
			ratingCount: "1",
		},
		featureList: [
			"Compare Islamic and conventional mortgages",
			"Calculate monthly payments and total costs",
			"View ownership progression over time",
			"Adjust interest rates and rental rates",
			"Multiple growth scenarios (conservative, balanced, optimistic)",
		],
	}

	return createSEOData(
		{
			title,
			description,
			keywords,
			structuredData,
		},
		pathname,
		baseUrl,
	)
}
