import { pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core"

import { articles } from "./articles"

/**
 * Records that a visitor (vid) has viewed an article. One row per (visitor, article).
 * Used to deduplicate view counts: we only increment articles.view_count on first view.
 * No retention/cleanup; table grows with unique (visitor, article) pairs.
 * Uses article_id (not slug) so dedup stays correct if an article's slug changes.
 * fingerprint: hash(IP+UA) to detect returning visitors who cleared the vid cookie.
 */
export const articleViews = pgTable(
	"article_views",
	{
		visitorId: text("visitor_id").notNull(),
		articleId: text("article_id")
			.notNull()
			.references(() => articles.id, { onDelete: "cascade" }),
		firstViewedAt: timestamp("first_viewed_at").defaultNow().notNull(),
		fingerprint: text("fingerprint"), // hash(IP+UA), used when vid is missing (cookie clear)
	},
	(t) => [
		primaryKey({ columns: [t.visitorId, t.articleId] }),
		unique("article_views_article_id_fingerprint_key").on(t.articleId, t.fingerprint),
	],
)
