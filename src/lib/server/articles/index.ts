import { and, desc, eq } from "drizzle-orm"
import type { Root } from "hast"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import { visit } from "unist-util-visit"

import { articles, db } from "$lib/server/db"

import type { Article, ArticleMetadata } from "./types"

/**
 * Rehype plugin to add target="_blank" and rel="noopener noreferrer" to external links
 */
function rehypeExternalLinks() {
	return (tree: Root) => {
		visit(tree, "element", (node) => {
			if (node.tagName === "a" && node.properties?.href) {
				const href = String(node.properties.href)

				// Check if link is external (starts with http:// or https://)
				// Internal links (relative paths, fragments) stay in same tab
				if (href.startsWith("http://") || href.startsWith("https://")) {
					node.properties.target = "_blank"
					node.properties.rel = "noopener noreferrer"
				}
			}
		})
	}
}

/**
 * Process markdown content to HTML
 */
async function processMarkdown(content: string): Promise<string> {
	// Custom sanitize schema that allows fragment links (#id) for anchor navigation
	const sanitizeSchema = {
		...defaultSchema,
		// Allow fragment links (hash anchors) for heading navigation
		protocols: {
			...defaultSchema.protocols,
			href: [...(defaultSchema.protocols?.href || []), "#"],
		},
		// Don't prefix IDs to avoid breaking fragment links
		// Since we control the markdown content, this is safe
		clobberPrefix: "",
		// Allow target and rel attributes on links for external links
		tagNames: [...(defaultSchema.tagNames || []), "a"],
		attributes: {
			...defaultSchema.attributes,
			a: [...(defaultSchema.attributes?.a || []), "target", "rel"],
		},
	}

	const processor = remark()
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, {
			behavior: "wrap",
			properties: {
				className: ["anchor-link"],
			},
		})
		.use(rehypeExternalLinks) // Add target="_blank" to external links
		.use(rehypeSanitize, sanitizeSchema)
		.use(rehypeStringify)

	const result = await processor.process(content)
	return String(result)
}

/**
 * Convert database article row to ArticleMetadata
 * Accepts either full row or partial row (for optimized queries)
 */
function dbRowToMetadata(
	row: Pick<
		typeof articles.$inferSelect,
		| "slug"
		| "title"
		| "headline"
		| "description"
		| "author"
		| "publishedAt"
		| "updatedAt"
		| "readingMinutes"
		| "tags"
		| "category"
		| "featuredImage"
		| "seoKeywords"
	>,
): ArticleMetadata {
	return {
		slug: row.slug,
		title: row.title,
		headline: row.headline ?? row.title, // Use stored headline or fallback to title
		description: row.description,
		author: row.author ?? "Islamic Finance", // Use author field
		publishedAt: row.publishedAt?.toISOString() ?? null,
		updatedAt: row.updatedAt?.toISOString() ?? null,
		readingMinutes: row.readingMinutes!,
		tags: row.tags ?? [],
		category: row.category ?? null,
		featuredImage: row.featuredImage ?? null,
		keywords: row.seoKeywords ?? null,
	}
}

/**
 * Get all published article metadata (without content)
 * Optimized: Only selects needed fields, excludes large content column
 */
export async function getAllArticles(): Promise<ArticleMetadata[]> {
	const rows = await db
		.select({
			slug: articles.slug,
			title: articles.title,
			headline: articles.headline,
			description: articles.description,
			author: articles.author,
			publishedAt: articles.publishedAt,
			updatedAt: articles.updatedAt,
			readingMinutes: articles.readingMinutes,
			tags: articles.tags,
			category: articles.category,
			featuredImage: articles.featuredImage,
			seoKeywords: articles.seoKeywords,
			viewCount: articles.viewCount,
		})
		.from(articles)
		.where(eq(articles.status, "published"))
		.orderBy(desc(articles.publishedAt))

	// Convert to metadata (already sorted by publishedAt desc from DB)
	return rows.map((r) => ({
		...dbRowToMetadata(r),
		...(r.viewCount != null && { viewCount: r.viewCount }),
	}))
}

/**
 * Get article metadata by slug (published articles only)
 * Optimized: Only selects needed fields, excludes large content column
 */
export async function getArticleMetadata(slug: string): Promise<ArticleMetadata | null> {
	const [row] = await db
		.select({
			id: articles.id,
			slug: articles.slug,
			title: articles.title,
			headline: articles.headline,
			description: articles.description,
			author: articles.author,
			publishedAt: articles.publishedAt,
			updatedAt: articles.updatedAt,
			readingMinutes: articles.readingMinutes,
			tags: articles.tags,
			category: articles.category,
			featuredImage: articles.featuredImage,
			seoKeywords: articles.seoKeywords,
		})
		.from(articles)
		.where(and(eq(articles.slug, slug), eq(articles.status, "published")))
		.limit(1)

	if (!row) return null

	return dbRowToMetadata(row)
}

/** Article with id included for server-side use (e.g. view dedup). Not exposed to the client. */
export type ArticleWithId = Article & { id: string }

/**
 * Get full article by slug (with processed HTML content) - published articles only.
 * Returns id for server-side use; strip before sending to the client.
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithId | null> {
	const [row] = await db
		.select()
		.from(articles)
		.where(and(eq(articles.slug, slug), eq(articles.status, "published")))
		.limit(1)

	if (!row) return null

	// Process markdown content to HTML
	const html = await processMarkdown(row.content)

	const metadata = dbRowToMetadata(row)

	return {
		...metadata,
		content: html,
		viewCount: row.viewCount ?? 0,
		id: row.id,
		// Use stored headline from database (already extracted during migration/update)
		// Falls back to title if headline is not set
	}
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(tag: string): Promise<ArticleMetadata[]> {
	const allArticles = await getAllArticles()
	return allArticles.filter((article) => article.tags.includes(tag))
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(category: string): Promise<ArticleMetadata[]> {
	const allArticles = await getAllArticles()
	return allArticles.filter((article) => article.category === category)
}

// Re-export types for convenience
export type { Article, ArticleMetadata } from "./types"
