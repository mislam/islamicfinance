import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

import { load } from "js-yaml"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"

import type { Article, ArticleMetadata } from "./types"

const articlesDir = join(process.cwd(), "src/content/articles")

/**
 * Process markdown content to HTML (without frontmatter)
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
	}

	const processor = remark()
		.use(remarkFrontmatter)
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, {
			behavior: "wrap",
			properties: {
				className: ["anchor-link"],
			},
		})
		.use(rehypeSanitize, sanitizeSchema)
		.use(rehypeStringify)

	const result = await processor.process(content)
	return String(result)
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): {
	frontmatter: Record<string, unknown>
	body: string
} {
	// Split content by frontmatter delimiters
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
	const match = content.match(frontmatterRegex)

	if (!match) {
		return { frontmatter: {}, body: content }
	}

	const frontmatterStr = match[1]
	const body = match[2]

	// Parse YAML frontmatter using js-yaml
	let frontmatter: Record<string, unknown> = {}
	try {
		frontmatter = (load(frontmatterStr) as Record<string, unknown>) || {}
	} catch {
		// If YAML parsing fails, return empty frontmatter
		frontmatter = {}
	}

	return { frontmatter, body }
}

/**
 * Get all article metadata (without content)
 */
export async function getAllArticles(): Promise<ArticleMetadata[]> {
	const files = await readdir(articlesDir)
	const articles: ArticleMetadata[] = []

	for (const file of files) {
		if (!file.endsWith(".md")) continue

		// Use filename as slug to locate the file
		// getArticleMetadata will use frontmatter slug if present, otherwise filename
		const filenameSlug = file.replace(/\.md$/, "")
		const metadata = await getArticleMetadata(filenameSlug)
		if (metadata) {
			articles.push(metadata)
		}
	}

	// Sort by publishedAt (newest first)
	return articles.sort((a, b) => {
		if (!a.publishedAt) return 1
		if (!b.publishedAt) return -1
		return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
	})
}

/**
 * Get article metadata by slug
 */
export async function getArticleMetadata(slug: string): Promise<ArticleMetadata | null> {
	try {
		const filePath = join(articlesDir, `${slug}.md`)
		const content = await readFile(filePath, "utf-8")
		const { frontmatter } = parseFrontmatter(content)

		// Use slug from frontmatter if present, otherwise use filename-based slug
		// This allows explicit slug definition and makes DB migration easier
		const articleSlug = (frontmatter.slug as string) || slug

		// Optional: Warn if slug in frontmatter doesn't match filename (in development)
		if (process.env.NODE_ENV === "development" && frontmatter.slug && frontmatter.slug !== slug) {
			console.warn(
				`[Article] Slug mismatch in ${slug}.md: frontmatter slug "${frontmatter.slug}" doesn't match filename slug "${slug}"`,
			)
		}

		return {
			slug: articleSlug,
			title: (frontmatter.title as string) || "",
			description: (frontmatter.description as string) || "",
			author: (frontmatter.author as string) || "",
			publishedAt: frontmatter.publishedAt
				? new Date(frontmatter.publishedAt as string).toISOString()
				: null,
			updatedAt: frontmatter.updatedAt
				? new Date(frontmatter.updatedAt as string).toISOString()
				: frontmatter.publishedAt
					? new Date(frontmatter.publishedAt as string).toISOString()
					: null,
			tags: (frontmatter.tags as string[]) || [],
			category: (frontmatter.category as string) || null,
			featuredImage: (frontmatter.featuredImage as string) || null,
			keywords: (frontmatter.keywords as string) || null,
		}
	} catch {
		return null
	}
}

/**
 * Get full article by slug (with processed HTML content)
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
	try {
		const filePath = join(articlesDir, `${slug}.md`)
		const content = await readFile(filePath, "utf-8")
		const { body } = parseFrontmatter(content)

		// Process markdown to HTML (body already has frontmatter removed)
		const html = await processMarkdown(body)

		const metadata = await getArticleMetadata(slug)
		if (!metadata) return null

		return {
			...metadata,
			content: html,
		}
	} catch {
		return null
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
