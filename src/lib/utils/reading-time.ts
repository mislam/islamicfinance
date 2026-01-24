import { READING_WPM } from "../config"

/**
 * Reading time in seconds from markdown. Store as-is; use formatReadingTime for display.
 * Strips markdown: links→text, headings/list/blockquote/inline-code syntax removed.
 * Uses opts.wpm when provided, otherwise READING_WPM from $lib/config.
 */
export function readingSeconds(markdown: string, opts?: { wpm?: number }): number {
	const wpm = opts?.wpm ?? READING_WPM
	const text = markdown
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s*/gm, "")
		.replace(/^\s*[-*+]\s+/gm, "")
		.replace(/^\s*\d+\.\s+/gm, "")
		.replace(/^\s*>\s*/gm, "")
		.replace(/`([^`]+)`/g, "$1")
	const n = text.split(/\s+/).filter(Boolean).length
	return Math.round((n / wpm) * 60)
}

/** Reading time in whole minutes for display (round up, min 1). For "X min read" and <time datetime="PT{X}M">. */
export function readingMins(seconds: number): number {
	return Math.max(1, Math.round(seconds / 60))
}

export function formatReadingTime(seconds: number): string {
	return `${readingMins(seconds)} min read`
}
