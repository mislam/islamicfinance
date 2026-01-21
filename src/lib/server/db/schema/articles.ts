import { relations } from "drizzle-orm"
import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { users } from "./auth"

export const articleStatus = pgEnum("article_status", ["draft", "published", "archived"])

export const articles = pgTable(
	"articles",
	{
		// Identity
		id: text("id").primaryKey(),
		slug: text("slug").notNull().unique(),
		// Content
		title: text("title").notNull(),
		headline: text("headline"), // H1 from markdown (for display), extracted and stored for performance
		description: text("description").notNull(), // SEO meta description
		content: text("content").notNull(), // Markdown or HTML
		// Author
		author: text("author"), // Author name (can be used independently or with authorId)
		authorId: text("author_id").references(() => users.id),
		// Publication
		publishedAt: timestamp("published_at"),
		updatedAt: timestamp("updated_at").notNull(),
		status: articleStatus("status").default("draft").notNull(),
		// Metadata / SEO
		featuredImage: text("featured_image"),
		tags: text("tags").array(), // PostgreSQL array
		category: text("category"),
		seoKeywords: text("seo_keywords"),
		// Counters / derived
		viewCount: integer("view_count").default(0),
		readingSeconds: integer("reading_seconds"), // reading time in seconds
		// System
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("articles_slug_idx").on(table.slug),
		index("articles_published_at_idx").on(table.publishedAt),
		index("articles_status_idx").on(table.status),
	],
)

export const articlesRelations = relations(articles, ({ one }) => ({
	author: one(users, {
		fields: [articles.authorId],
		references: [users.id],
	}),
}))
