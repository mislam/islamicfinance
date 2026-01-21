/**
 * Vercel Image Optimization helpers for article featured images.
 *
 * Uses /_vercel/image in production; falls back to raw absolute URL in dev
 * (/_vercel/image may not be available locally). Retina is handled via
 * srcset with 1x/2x or width descriptors; the browser selects automatically
 * (devicePixelRatio 1 does not load 2x).
 */

import { dev } from "$app/environment"

/**
 * Get the media domain for Vercel Image Optimization.
 * Uses a cookie-free subdomain (media.*) to avoid sending cookies with asset requests.
 * This subdomain can serve images, videos, fonts, and other static assets.
 * Falls back to the provided baseUrl if subdomain is not configured (dev/localhost).
 */
function getMediaDomain(baseUrl: string): string {
	// In production, use media subdomain for cookie-free requests
	// In dev, use the provided baseUrl (localhost)
	if (dev) return baseUrl

	// Extract domain from baseUrl and construct media subdomain
	try {
		const url = new URL(baseUrl)
		// Replace www with media, or prepend media if no subdomain
		const hostname = url.hostname
		if (hostname.startsWith("www.")) {
			url.hostname = hostname.replace("www.", "media.")
		} else if (!hostname.includes(".")) {
			// localhost or similar - keep as is
			return baseUrl
		} else {
			// No www prefix - prepend media
			url.hostname = `media.${hostname}`
		}
		// Ensure HTTPS in production
		url.protocol = "https:"
		return url.origin
	} catch {
		// Fallback if URL parsing fails
		return baseUrl
	}
}

function toAbsolute(src: string, baseUrl: string): string {
	if (src.startsWith("http://") || src.startsWith("https://")) return src
	const mediaDomain = getMediaDomain(baseUrl)
	return src.startsWith("/") ? mediaDomain + src : mediaDomain + "/" + src
}

export interface VercelImageOpts {
	w: number
	h?: number
	q?: number
}

/**
 * Build a Vercel Image Optimization URL, or raw absolute URL in dev.
 * @param src - Relative path (e.g. /images/articles/x.jpg) or absolute URL
 * @param opts - w (width), optional h (height), q (quality, default 75)
 * @param baseUrl - Origin (e.g. page.url.origin)
 */
export function getVercelImageUrl(
	src: string | null,
	opts: VercelImageOpts,
	baseUrl: string,
): string {
	if (!src) return ""
	const absolute = toAbsolute(src, baseUrl)
	if (dev) return absolute
	const { w, h, q = 75 } = opts
	// NOTE: Using absolute URL even for same-origin images.
	// Docs suggest relative paths + localPatterns for same-origin, but that caused
	// INVALID_IMAGE_OPTIMIZE_REQUEST. Using absolute URLs + remotePatterns works reliably.
	// This treats same-origin images as "external" but is a proven workaround.
	const params = new URLSearchParams({ url: absolute, w: String(w), q: String(q) })
	if (h != null) params.set("h", String(h))
	// Use media subdomain for /_vercel/image endpoint to avoid sending cookies
	const mediaDomain = getMediaDomain(baseUrl)
	return `${mediaDomain}/_vercel/image?${params.toString()}`
}

/**
 * 4:3 thumbnail for ArticleCard (index page).
 * Display: w-24 (96px) on mobile, sm:w-48 (192px) on sm+.
 * srcset 1x/2x: browser chooses; density 1 does not load 2x.
 */
export function getArticleThumbSrcSet(
	src: string,
	baseUrl: string,
): { src: string; srcSet: string } {
	const oneX = getVercelImageUrl(src, { w: 192, q: 75 }, baseUrl)
	const twoX = getVercelImageUrl(src, { w: 384, q: 75 }, baseUrl)
	return { src: oneX, srcSet: `${oneX} 1x, ${twoX} 2x` }
}

/**
 * Wide featured image for article detail (slug) page.
 * Layout: mobile 100vw, sm+ max-w-2xl (672px).
 * srcset by width + sizes; browser picks including retina.
 */
export function getArticleDetailSrcSet(
	src: string,
	baseUrl: string,
): { src: string; srcSet: string; sizes: string } {
	const w430 = getVercelImageUrl(src, { w: 430, q: 80 }, baseUrl)
	const w672 = getVercelImageUrl(src, { w: 672, q: 80 }, baseUrl)
	const w860 = getVercelImageUrl(src, { w: 860, q: 80 }, baseUrl)
	const w1344 = getVercelImageUrl(src, { w: 1344, q: 80 }, baseUrl)
	return {
		src: w672,
		srcSet: `${w430} 430w, ${w672} 672w, ${w860} 860w, ${w1344} 1344w`,
		sizes: "(max-width: 640px) 100vw, 672px",
	}
}

/**
 * OG / Twitter / JSON-LD: 1200×630 (1.91:1). Use this URL for
 * og:image, twitter:image, and Article image in JSON-LD.
 */
export function getArticleOgImageUrl(src: string, baseUrl: string): string {
	return getVercelImageUrl(src, { w: 1200, h: 630, q: 85 }, baseUrl)
}
