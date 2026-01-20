/**
 * Reading time in seconds from markdown (265 WPM). Store as-is; use formatReadingTime for display.
 * Strips markdown: links→text, headings/list/blockquote/inline-code syntax removed.
 */
export function readingSeconds(markdown: string): number {
	const text = markdown
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s*/gm, "")
		.replace(/^\s*[-*+]\s+/gm, "")
		.replace(/^\s*\d+\.\s+/gm, "")
		.replace(/^\s*>\s*/gm, "")
		.replace(/`([^`]+)`/g, "$1")
	const n = text.split(/\s+/).filter(Boolean).length
	return Math.ceil((n / 265) * 60)
}

/** Reading time in whole minutes for display (round up, min 1). For "X min read" and <time datetime="PT{X}M">. */
export function readingMins(seconds: number): number {
	return Math.max(1, Math.ceil(seconds / 60))
}

export function formatReadingTime(seconds: number): string {
	return `${readingMins(seconds)} min read`
}
