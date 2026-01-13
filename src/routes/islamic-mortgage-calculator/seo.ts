/**
 * SEO metadata for Islamic Home Financing Calculator page
 */

import type { SEOData } from "$lib/seo"
import { createSEOData } from "$lib/seo"

/**
 * Generate SEO metadata for the Islamic Home Financing Calculator page
 * @param pathname - Current page pathname (from page.url.pathname)
 * @param baseUrl - Base URL of the site
 * @returns Complete SEO metadata object
 */
export function getSEOData(pathname: string, baseUrl: string): SEOData {
	const title = "Islamic Home Financing Calculator | Halal vs Conventional Comparison"
	const description =
		"Free calculator comparing Islamic home financing (Diminishing Musharaka) with conventional mortgages. Calculate payments, ownership, and costs. Sharia-compliant, riba-free alternative."
	const keywords =
		"islamic mortgage, halal financing, diminishing musharaka, islamic home financing, sharia compliant mortgage, riba free mortgage, islamic finance calculator, halal home loan, conventional mortgage comparison, islamic banking, mortgage simulator, mortgage comparison tool, halal mortgage simulator, islamic finance simulator, partnership financing, islamic property financing"

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
		featureList: [
			"Compare Islamic home financing (Diminishing Musharaka) with conventional mortgages",
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
			ogImage: `${baseUrl}/images/og-islamic-mortgage-calculator.jpg`,
			twitterImage: `${baseUrl}/images/og-islamic-mortgage-calculator.jpg`,
		},
		pathname,
		baseUrl,
	)
}
