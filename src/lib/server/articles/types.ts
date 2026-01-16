/**
 * Article metadata (without content)
 */
export interface ArticleMetadata {
	slug: string
	title: string
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
}
