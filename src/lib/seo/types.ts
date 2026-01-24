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
	// Article-specific meta tags
	ogType?: "website" | "article"
	articlePublishedTime?: string // ISO 8601 date/time
	articleModifiedTime?: string // ISO 8601 date/time
	articleAuthor?: string
	articleSection?: string // Category
	articleTags?: string[] // Tags array
	// LCP image preload data (optional, for any page with a critical above-the-fold image)
	// When provided, adds <link rel="preload"> for the LCP image to improve Largest Contentful Paint
	lcpImageSrc?: string
	lcpImageSrcSet?: string
	lcpImageSizes?: string
}

export interface SEOConfig {
	siteName?: string
	author?: string
	locale?: string
	defaultBaseUrl?: string
}
