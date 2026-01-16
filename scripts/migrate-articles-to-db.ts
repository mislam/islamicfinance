/**
 * Migration script to import markdown articles from files to database
 * Run with: pnpm articles:migrate
 */

// Load environment variables from .env file FIRST (before any imports that use them)
import { config } from "dotenv"
config()

import { randomUUID } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

import { eq } from "drizzle-orm"
import { load } from "js-yaml"

const articlesDir = join(process.cwd(), "src/content/articles")

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): {
	frontmatter: Record<string, unknown>
	body: string
} {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
	const match = content.match(frontmatterRegex)

	if (!match) {
		return { frontmatter: {}, body: content }
	}

	const frontmatterStr = match[1]
	const body = match[2]

	let frontmatter: Record<string, unknown> = {}
	try {
		frontmatter = (load(frontmatterStr) as Record<string, unknown>) || {}
	} catch {
		frontmatter = {}
	}

	return { frontmatter, body }
}

async function migrateArticles() {
	// Dynamically import database after env vars are loaded
	const { articles, db } = await import("../src/lib/server/db/index.js")

	console.log("Starting article migration from files to database...\n")

	const files = await readdir(articlesDir)
	const mdFiles = files.filter((file) => file.endsWith(".md"))

	if (mdFiles.length === 0) {
		console.log("No markdown files found to migrate.")
		return
	}

	console.log(`Found ${mdFiles.length} article(s) to migrate:\n`)

	for (const file of mdFiles) {
		const filePath = join(articlesDir, file)
		const content = await readFile(filePath, "utf-8")
		const { frontmatter, body } = parseFrontmatter(content)

		// Use slug from frontmatter if present, otherwise use filename
		const slug = (frontmatter.slug as string) ?? file.replace(/\.md$/, "")
		const title = (frontmatter.title as string) ?? slug
		const description = (frontmatter.description as string) ?? ""
		const author = (frontmatter.author as string) ?? "Islamic Finance"

		// Parse publishedAt: supports both date-only (YYYY-MM-DD) and full ISO 8601 (with time/timezone)
		// Date-only strings are interpreted as UTC midnight (00:00:00Z)
		// For SEO best practices, use full ISO 8601: "2026-01-16T00:00:00Z" or "2026-01-16T09:00:00+05:00"
		const publishedAt = frontmatter.publishedAt ? new Date(frontmatter.publishedAt as string) : null

		// Parse updatedAt: same format support as publishedAt
		const updatedAt = frontmatter.updatedAt
			? new Date(frontmatter.updatedAt as string)
			: (publishedAt ?? new Date())
		const tags = (frontmatter.tags as string[]) ?? []
		const category = (frontmatter.category as string) ?? null
		const featuredImage = (frontmatter.featuredImage as string) ?? null
		const keywords = Array.isArray(frontmatter.keywords)
			? (frontmatter.keywords as string[]).join(", ")
			: ((frontmatter.keywords as string) ?? null)

		// Check if article already exists - if so, update it instead of skipping
		const [existing] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1)

		if (existing) {
			console.log(`⚠️  Article "${slug}" already exists. Updating...`)
			await db
				.update(articles)
				.set({
					title,
					description,
					content: body,
					author,
					publishedAt,
					updatedAt,
					status: "published",
					featuredImage,
					tags,
					category,
					seoKeywords: keywords,
				})
				.where(eq(articles.slug, slug))
			console.log(`✅ Updated: ${slug}`)
			continue
		}

		// Insert article
		await db.insert(articles).values({
			id: randomUUID(),
			slug,
			title,
			description,
			content: body, // Store markdown content
			author, // Store author name from frontmatter
			authorId: null, // Can be linked to user later
			publishedAt,
			updatedAt,
			status: "published",
			featuredImage,
			tags,
			category,
			seoKeywords: keywords,
			viewCount: 0,
		})

		console.log(`✅ Migrated: ${slug}`)
	}

	console.log(`\n✅ Migration complete! ${mdFiles.length} article(s) processed.`)
}

migrateArticles()
	.then(() => {
		console.log("\nMigration script completed successfully.")
		process.exit(0)
	})
	.catch((error) => {
		console.error("\n❌ Migration failed:", error)
		process.exit(1)
	})
