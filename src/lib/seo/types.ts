/**
 * SEO metadata types
 */

export interface SEOData {
	title: string
	description: string
	keywords: string
	pageUrl: string
	structuredData?: object
	structuredDataHtml?: string
	ogImage?: string
	twitterImage?: string
}

export interface SEOConfig {
	siteName?: string
	author?: string
	locale?: string
	defaultBaseUrl?: string
}
