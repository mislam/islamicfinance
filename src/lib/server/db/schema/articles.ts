import { relations } from "drizzle-orm"
import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { users } from "./auth"

export const articleStatus = pgEnum("article_status", ["draft", "published", "archived"])

export const articles = pgTable(
	"articles",
	{
		id: text("id").primaryKey(),
		slug: text("slug").notNull().unique(),
		title: text("title").notNull(),
		description: text("description").notNull(), // SEO meta description
		content: text("content").notNull(), // Markdown or HTML
		author: text("author"), // Author name (can be used independently or with authorId)
		authorId: text("author_id").references(() => users.id),
		publishedAt: timestamp("published_at"),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date()),
		status: articleStatus("status").default("draft").notNull(),
		featuredImage: text("featured_image"),
		tags: text("tags").array(), // PostgreSQL array
		category: text("category"),
		seoKeywords: text("seo_keywords"),
		viewCount: integer("view_count").default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		slugIdx: index("articles_slug_idx").on(table.slug),
		publishedAtIdx: index("articles_published_at_idx").on(table.publishedAt),
		statusIdx: index("articles_status_idx").on(table.status),
	}),
)

export const articlesRelations = relations(articles, ({ one }) => ({
	author: one(users, {
		fields: [articles.authorId],
		references: [users.id],
	}),
}))
