/**
 * SEO metadata for Muslim Loan Contract Generator page
 */

import type { SEOData } from "$lib/seo"
import { createSEOData } from "$lib/seo"

/**
 * Generate SEO metadata for the Muslim Loan Contract Generator page
 * @param pathname - Current page pathname (from page.url.pathname)
 * @param baseUrl - Base URL of the site
 * @returns Complete SEO metadata object
 */
export function getSEOData(pathname: string, baseUrl: string): SEOData {
	const title = "Loan Agreement Generator | Free Islamic & Interest-Free Loan Contracts"
	const description =
		"Free loan agreement generator for personal loans, Islamic loan agreements, and interest-free loan agreements. Create sharia-compliant loan agreements (qard hasan) based on Surah Al-Baqarah verse 282. Generate and download PDF contracts with proper documentation and witness requirements."
	const keywords =
		"loan agreement generator, personal loan agreement generator, islamic loan agreement, interest free loan agreement, sharia compliant loan agreement, qard hasan agreement, free loan agreement generator, halal loan agreement, sharia compliant loan, islamic debt contract, muslim loan contract, quran 2:282 loan contract, islamic contract generator, interest-free loan template"

	const faqStructuredData = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: [
			{
				"@type": "Question",
				name: "What is a Muslim loan contract based on Surah Al-Baqarah, verse 282?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "A Muslim loan contract based on Surah Al-Baqarah verse 282 follows the Quranic guidance for documenting debts between parties. It requires written documentation, witnesses (two men, or one man and two women), and clear terms. This loan agreement generator creates sharia-compliant loan agreements that fulfill these requirements.",
				},
			},
			{
				"@type": "Question",
				name: "Why is written documentation important for Islamic loans?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "The Surah Al-Baqarah, verse 282 specifically instructs believers to write down debt contracts. Written documentation prevents disputes, ensures clarity of terms, and provides legal protection for both parties. According to the majority of Islamic jurisprudence schools, this is considered a highly recommended practice (mustahabb) when contracting debts.",
				},
			},
			{
				"@type": "Question",
				name: "How many witnesses are required for a Muslim loan contract?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "According to Surah Al-Baqarah, verse 282, at least two male witnesses are required. If two men are not available, then one man and two women may serve as witnesses. This contract generator allows you to add up to three witnesses to ensure compliance with Islamic requirements.",
				},
			},
			{
				"@type": "Question",
				name: "Is interest (riba) allowed in Islamic loan contracts?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "No, interest (riba) is strictly prohibited in Islam. This contract generator creates interest-free loan agreements. The borrower must repay only the principal amount borrowed, without any additional charges for the use of money. Any form of exploitation or unfair practices is prohibited.",
				},
			},
			{
				"@type": "Question",
				name: "Can I use this contract for business loans?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Yes, this contract template can be used for personal or business loans between two parties. Simply specify the loan purpose in the form. However, for complex business arrangements, you may want to consult with an Islamic finance expert to ensure all terms comply with Shariah principles.",
				},
			},
			{
				"@type": "Question",
				name: "What happens if there's a dispute in an Islamic loan contract?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "The contract includes an arbitration and dispute resolution clause. Both parties agree to resolve disputes through arbitration or mediation in accordance with Islamic principles. This ensures fair resolution while maintaining the spirit of mutual trust and good faith required in Islamic transactions.",
				},
			},
		],
	}

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "Loan Agreement Generator",
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
			"Free personal loan agreement generator",
			"Generate Islamic loan agreements (qard hasan) based on Surah Al-Baqarah, verse 282",
			"Create interest-free and sharia-compliant loan agreements",
			"Document borrower and lender information",
			"Add required witnesses (minimum 2)",
			"Specify loan terms and repayment dates",
			"Download contract as PDF for printing",
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
			ogImage: `${baseUrl}/images/og-loan-agreement-generator.jpg`,
			twitterImage: `${baseUrl}/images/og-loan-agreement-generator.jpg`,
		},
		pathname,
		baseUrl,
	)
}
