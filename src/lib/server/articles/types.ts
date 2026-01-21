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
	updatedAt: string // Required: defaults to publishedAt if not explicitly set
	readingSeconds: number // reading time in seconds
	tags: string[]
	category: string | null
	featuredImage: string | null
	keywords: string | null
	/** Present only when loading a full article (detail page). */
	viewCount?: number
}

/**
 * Full article (with processed HTML content)
 */
export interface Article extends ArticleMetadata {
	content: string // Processed HTML
	// headline is inherited from ArticleMetadata (stored in DB)
}
