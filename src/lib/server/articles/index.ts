import { and, desc, eq } from "drizzle-orm"
import type { Element, Root } from "hast"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkCustomHeaderId from "remark-custom-header-id"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import { visit } from "unist-util-visit"

import { articles, db } from "$lib/server/db"

import type { Article, ArticleMetadata } from "./types"

/**
 * Rehype plugin to wrap the last paragraph in blockquotes with <footer><cite> tags
 * Unwraps the paragraph element, keeping its children (text and links) inside <cite>,
 * then wraps <cite> in <footer> for semantic HTML structure
 */
function rehypeWrapCitations() {
	return (tree: Root) => {
		visit(tree, "element", (node) => {
			if (
				node.tagName === "blockquote" &&
				Array.isArray(node.children) &&
				node.children.length > 0
			) {
				// Find the last paragraph in the blockquote
				let lastParagraphIndex = -1
				for (let i = node.children.length - 1; i >= 0; i--) {
					const child = node.children[i]
					if (
						child &&
						typeof child === "object" &&
						"type" in child &&
						child.type === "element" &&
						"tagName" in child &&
						child.tagName === "p"
					) {
						lastParagraphIndex = i
						break
					}
				}

				// Wrap the last paragraph's children in <cite>, then wrap <cite> in <footer>
				if (lastParagraphIndex >= 0) {
					const lastParagraph = node.children[lastParagraphIndex]
					if (
						lastParagraph &&
						typeof lastParagraph === "object" &&
						"type" in lastParagraph &&
						lastParagraph.type === "element" &&
						"children" in lastParagraph &&
						Array.isArray(lastParagraph.children)
					) {
						const citeNode: Element = {
							type: "element",
							tagName: "cite",
							properties: {},
							children: lastParagraph.children,
						}
						const footerNode: Element = {
							type: "element",
							tagName: "footer",
							properties: {
								"aria-label": "Source citation",
							},
							children: [citeNode],
						}
						node.children[lastParagraphIndex] = footerNode
					}
				}
			}
		})
	}
}

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
 * Rehype plugin to inject disclaimer after the first paragraph
 */
function rehypeInjectDisclaimer() {
	return (tree: Root) => {
		let firstParagraphFound = false

		visit(tree, "element", (node, index, parent) => {
			// Find the first paragraph that's a direct child of the root
			if (
				!firstParagraphFound &&
				node.tagName === "p" &&
				parent &&
				"children" in parent &&
				Array.isArray(parent.children) &&
				typeof index === "number"
			) {
				firstParagraphFound = true

				// Create disclaimer element with proper HTML structure
				const disclaimerNode: Element = {
					type: "element",
					tagName: "aside",
					properties: {
						role: "note",
						"aria-label": "Important disclaimer",
						class: "disclaimer",
					},
					children: [
						{
							type: "element",
							tagName: "p",
							properties: {},
							children: [
								{
									type: "element",
									tagName: "strong",
									properties: {},
									children: [{ type: "text", value: "Important Disclaimer:" }],
								},
								{
									type: "text",
									value:
										" This article provides educational information about Islamic finance based on established scholarly sources. We are not qualified Islamic scholars, muftis, or licensed financial advisors. For specific rulings (fatwas) or financial decisions related to your personal circumstances, always consult qualified Islamic scholars and licensed financial professionals. Islamic rulings may vary by school of thought, and individual situations require personalized guidance.",
								},
							],
						},
					],
				}

				// Insert disclaimer after the first paragraph
				parent.children.splice(index + 1, 0, disclaimerNode)
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
		// Allow cite and footer elements for semantic citations
		// Allow aside element for disclaimer
		tagNames: [...(defaultSchema.tagNames || []), "cite", "footer", "aside"],
		attributes: {
			...defaultSchema.attributes,
			// Extend anchor attributes: defaultSchema already includes className in nested format
			// We need to preserve the existing structure and add target/rel
			a: [...(defaultSchema.attributes?.a || []), "target", "rel", "class"],
			footer: [...(defaultSchema.attributes?.footer || []), "aria-label"],
			aside: [...(defaultSchema.attributes?.aside || []), "role", "aria-label", "class"],
		},
	}

	const processor = remark()
		.use(remarkGfm)
		.use(remarkCustomHeaderId) // Process {#id} syntax in headings BEFORE converting to HTML
		.use(remarkRehype)
		.use(rehypeSlug) // Add IDs to headings that don't have them yet (those without {#id})
		.use(rehypeAutolinkHeadings, {
			behavior: "wrap",
			properties: {
				class: "anchor-link",
			},
		})
		.use(rehypeWrapCitations) // Wrap citation links in <cite> tags
		.use(rehypeExternalLinks) // Add target="_blank" to external links
		.use(rehypeInjectDisclaimer) // Inject disclaimer after first paragraph
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
		| "readingSeconds"
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
		updatedAt: row.updatedAt.toISOString(), // Required field, always present
		readingSeconds: row.readingSeconds!,
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
			readingSeconds: articles.readingSeconds,
			tags: articles.tags,
			category: articles.category,
			featuredImage: articles.featuredImage,
			seoKeywords: articles.seoKeywords,
			viewCount: articles.viewCount,
		})
		.from(articles)
		.where(eq(articles.status, "published"))
		.orderBy(desc(articles.updatedAt))

	// Convert to metadata (sorted by updatedAt DESC from DB)
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
			readingSeconds: articles.readingSeconds,
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
