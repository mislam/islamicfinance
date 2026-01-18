/**
 * Article view-count: dedupes by vid cookie + (article, fingerprint).
 * @see docs/view-count.md — how it works, fingerprint, tables, integration.
 */

import { createHash } from "node:crypto"

import { createId } from "@paralleldrive/cuid2"
import type { Cookies } from "@sveltejs/kit"
import { and, eq, sql } from "drizzle-orm"

import { articles, articleViews, db } from "$lib/server/db"

// ---------------------------------------------------------------------------
// Bot detection
// ---------------------------------------------------------------------------

const BOT_UA_PATTERNS = [
	/Googlebot/i,
	/Bingbot/i,
	/Slurp/i,
	/DuckDuckBot/i,
	/Baiduspider/i,
	/YandexBot/i,
	/facebookexternalhit/i,
	/Twitterbot/i,
	/rogerbot/i,
	/LinkedInBot/i,
	/embedly/i,
	/quora link preview/i,
	/showyoubot/i,
	/outbrain/i,
	/pinterest/i,
	/slackbot/i,
	/vkshare/i,
	/W3C_Validator/i,
	/redditbot/i,
	/Applebot/i,
	/WhatsApp/i,
	/flipboard/i,
	/tumblr/i,
	/bitlybot/i,
	/SkypeUriPreview/i,
	/nginx/i,
	/HeadlessChrome/i,
	/Selenium/i,
	/PhantomJS/i,
	/curl/i,
	/wget/i,
]

function isLikelyBot(userAgent: string | null): boolean {
	if (!userAgent) return false
	return BOT_UA_PATTERNS.some((p) => p.test(userAgent))
}

// ---------------------------------------------------------------------------
// Fingerprint (IP + UA hash, survives cookie clear)
// ---------------------------------------------------------------------------

function normalizeClientAddress(addr: string): string {
	if (!addr) return ""
	if (addr === "::1" || addr.startsWith("::1%")) return "127.0.0.1"
	if (addr.toLowerCase().startsWith("::ffff:")) return addr.slice(7)
	return addr
}

function computeFingerprint(clientAddress: string, userAgent: string | null): string {
	const normalized = normalizeClientAddress(clientAddress)
	return createHash("sha256")
		.update(`${normalized}|${userAgent ?? ""}`)
		.digest("hex")
		.slice(0, 32)
}

// ---------------------------------------------------------------------------
// Visitor ID cookie
// ---------------------------------------------------------------------------

const VID_COOKIE_NAME = "vid"
const VID_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 // 1 year

function getOrCreateVid(cookies: Cookies, options: { secure: boolean }): string {
	let vid = cookies.get(VID_COOKIE_NAME)
	if (!vid) {
		vid = createId()
		cookies.set(VID_COOKIE_NAME, vid, {
			httpOnly: true,
			maxAge: VID_COOKIE_MAX_AGE_SECONDS,
			path: "/",
			sameSite: "lax",
			secure: options.secure,
		})
	}
	return vid
}

// ---------------------------------------------------------------------------
// Persistence: article_views + articles.view_count
// ---------------------------------------------------------------------------

async function recordViewIfNew(
	visitorId: string,
	articleId: string,
	fingerprint: string | null,
): Promise<boolean> {
	const rows = await db
		.insert(articleViews)
		.values({ visitorId, articleId, fingerprint })
		.onConflictDoNothing()
		.returning()
	return rows.length > 0
}

async function incrementArticleViewCount(slug: string): Promise<void> {
	await db
		.update(articles)
		.set({ viewCount: sql`${articles.viewCount} + 1` })
		.where(and(eq(articles.slug, slug), eq(articles.status, "published")))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type RecordArticleViewContext = {
	articleId: string
	slug: string
	cookies: Cookies
	getClientAddress: () => string | Promise<string>
	request: Request
	/** Pass e.g. !dev so the vid cookie is secure in production. */
	secure: boolean
}

export type RecordArticleViewResult = { counted: boolean }

/**
 * Record an article view when appropriate: skip bots, dedupe by (vid, article) and
 * (article, fingerprint). Returns { counted: true } when the view was newly
 * recorded and articles.view_count was incremented.
 */
export async function recordArticleView(
	ctx: RecordArticleViewContext,
): Promise<RecordArticleViewResult> {
	const ua = ctx.request.headers.get("user-agent")
	if (isLikelyBot(ua)) return { counted: false }

	const vid = getOrCreateVid(ctx.cookies, { secure: ctx.secure })
	const addr = await Promise.resolve(ctx.getClientAddress()) // sync or async depending on adapter
	const fingerprint = computeFingerprint(addr, ua)

	const isNew = await recordViewIfNew(vid, ctx.articleId, fingerprint)
	if (isNew) await incrementArticleViewCount(ctx.slug)

	return { counted: isNew }
}
