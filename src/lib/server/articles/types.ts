/**
 * Article metadata (without content)
 */
export interface ArticleMetadata {
	slug: string
	title: string
	headline: string // H1 from markdown (for display), stored in DB for performance
	description: string
	author: string
	publishedAt: string | null
	updatedAt: string | null
	tags: string[]
	category: string | null
	featuredImage: string | null
	keywords: string | null
}

/**
 * Full article (with processed HTML content)
 */
export interface Article extends ArticleMetadata {
	content: string // Processed HTML
	// headline is inherited from ArticleMetadata (stored in DB)
}
