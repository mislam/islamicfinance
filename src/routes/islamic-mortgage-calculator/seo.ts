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

	const faqStructuredData = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: [
			{
				"@type": "Question",
				name: "What is Diminishing Musharaka and how does it differ from a conventional mortgage?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Diminishing Musharaka is a Sharia-compliant partnership financing structure where you and the financial institution co-own the property. You pay rent on the institution's share and gradually buy out their ownership. Unlike a mortgage (which is a loan with interest), this is a true partnership where both parties share ownership and expenses proportionally.",
				},
			},
			{
				"@type": "Question",
				name: "Is Islamic home financing just interest with a different name?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "No. Interest (riba) is payment for the use of money, which is prohibited. In Diminishing Musharaka, you pay rent for the use of a physical asset (the property), which is permissible. The rental rate must reflect fair market value, not be disguised interest. The key difference: interest is payment for money, rent is payment for an asset.",
				},
			},
			{
				"@type": "Question",
				name: "Why is rent allowed in Islam but interest is not?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Islamic law distinguishes between riba (interest on money) and rent (payment for use of an asset). Riba is prohibited because money has no intrinsic value - charging for its use creates wealth without productive activity. Rent is allowed because you're paying for the use of a real asset (property) that has value and can generate benefit. The rental rate must reflect fair market value.",
				},
			},
			{
				"@type": "Question",
				name: "Is Islamic home financing more expensive than conventional mortgages?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Costs vary based on rental rates, buyout terms, and market conditions. In some cases, halal financing can be competitive or even more cost-effective, especially when considering ownership structure and shared expenses. Use this calculator to compare total costs, payments, and net gain for your specific scenario.",
				},
			},
			{
				"@type": "Question",
				name: "What happens if I can't make payments in Diminishing Musharaka?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "The terms depend on your contract, but typically the institution may exercise rights as a co-owner, such as selling the property and distributing proceeds based on ownership percentages. This differs from foreclosure in conventional mortgages. Always review your specific contract terms.",
				},
			},
			{
				"@type": "Question",
				name: "Can I pay off my Islamic home financing early?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Yes, you can typically buy out the institution's remaining share at any time. Unlike conventional mortgages that may have prepayment penalties, early buyout in Diminishing Musharaka simply accelerates your ownership acquisition. Check your specific contract for any terms or conditions.",
				},
			},
			{
				"@type": "Question",
				name: "How is ownership shared in Diminishing Musharaka?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Ownership is proportional to each party's investment. If you put down 20% and the institution provides 80%, you own 20% and they own 80% initially. As you make buyout payments, your ownership increases and theirs decreases. Expenses (insurance, property tax) are also shared proportionally based on ownership percentages.",
				},
			},
			{
				"@type": "Question",
				name: "Is Diminishing Musharaka really halal and approved by Islamic scholars?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Yes, Diminishing Musharaka is widely accepted by Islamic scholars as a Sharia-compliant alternative to interest-based mortgages. It's based on the principles of Musharaka (partnership) and Ijarah (leasing), both recognized as valid Islamic finance structures. However, implementation details matter - the rental rate must reflect fair market value, not disguised interest.",
				},
			},
		],
	}

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

	// Combine structured data - WebApplication and FAQPage
	const combinedStructuredData = [structuredData, faqStructuredData]

	return createSEOData(
		{
			title,
			description,
			keywords,
			structuredData: combinedStructuredData,
			ogImage: `${baseUrl}/images/og-islamic-mortgage-calculator.jpg`,
			twitterImage: `${baseUrl}/images/og-islamic-mortgage-calculator.jpg`,
		},
		pathname,
		baseUrl,
	)
}
