import { describe, expect, it } from "vitest"

import { formatReadingTime, readingMins, readingSeconds } from "./reading-time"

describe("readingSeconds", () => {
	describe("empty and whitespace", () => {
		it("returns 0 for empty string", () => expect(readingSeconds("")).toBe(0))
		it("returns 0 for whitespace only", () => expect(readingSeconds("   \n\t  ")).toBe(0))
	})

	describe("plain prose", () => {
		it("counts words, 265 WPM", () => expect(readingSeconds("one two three")).toBe(1))
		it("265 words → 60", () => {
			expect(readingSeconds(Array.from({ length: 265 }, (_, i) => `w${i}`).join(" "))).toBe(60)
		})
		it("266 words → 61", () => {
			expect(readingSeconds(Array.from({ length: 266 }, (_, i) => `w${i}`).join(" "))).toBe(61)
		})
		it("530 words → 120", () => {
			expect(readingSeconds(Array(530).fill("w").join(" "))).toBe(120)
		})
		it("collapses multiple spaces and newlines", () =>
			expect(readingSeconds("a   b\n\n  c")).toBe(1))
	})

	describe("links", () => {
		it("keeps only link text", () =>
			expect(readingSeconds("[Quran 2:275](https://quran.com/2/275)")).toBe(1))
		it("handles empty link text", () =>
			expect(readingSeconds("before [](https://x.com) after")).toBe(1))
	})

	describe("images", () => {
		it("keeps only alt text", () => expect(readingSeconds("![alt text here](image.png)")).toBe(1))
		it("handles empty alt", () => expect(readingSeconds("![](img.jpg)")).toBe(0))
	})

	describe("headings", () => {
		it("strips # from h1", () => expect(readingSeconds("# One")).toBe(1))
		it("strips ## from h2", () => expect(readingSeconds("## What Is Riba?")).toBe(1))
		it("does not strip # in the middle of a line", () =>
			expect(readingSeconds("Section # one")).toBe(1))
	})

	describe("unordered lists", () => {
		it("strips - * + marker", () => {
			expect(readingSeconds("- Item")).toBe(1)
			expect(readingSeconds("* Item")).toBe(1)
			expect(readingSeconds("+ Item")).toBe(1)
		})
		it("leaves -Item (no space) as single token", () => expect(readingSeconds("-Item")).toBe(1))
	})

	describe("ordered lists", () => {
		it("strips 1. 2. etc", () => expect(readingSeconds("2. Second\n10. Tenth")).toBe(1))
		it("does not strip 1. in the middle of a line", () =>
			expect(readingSeconds("See 1. first item")).toBe(1))
	})

	describe("blockquotes", () => {
		it("strips > marker", () => expect(readingSeconds("> Quote")).toBe(1))
		it("does not strip > in the middle of a line", () =>
			expect(readingSeconds("2 > 1 is true")).toBe(2)) // "2" ">" "1" "is" "true" = 5
	})

	describe("inline code", () => {
		it("strips backticks", () => expect(readingSeconds("Use `code` here")).toBe(1))
	})

	describe("fenced code blocks", () => {
		it("counts words inside", () => expect(readingSeconds("```\nconst x = 1\n```")).toBe(2))
	})

	describe("mixed real-world", () => {
		it("strips all markdown in a short passage", () => {
			const md = `## What Is Riba?
Riba is an **important** concept. See [Quran 2:275](https://quran.com/2/275).
- First point
- Second point
> A key quote here.
Use \`murabaha\` in practice.`
			expect(readingSeconds(md)).toBe(6) // ~23 words
		})
	})
})

describe("readingMins", () => {
	it("0 → 1 (min for display)", () => expect(readingMins(0)).toBe(1))
	it("1 → 1", () => expect(readingMins(1)).toBe(1))
	it("60 → 1", () => expect(readingMins(60)).toBe(1))
	it("61 → 2", () => expect(readingMins(61)).toBe(2))
	it("90 → 2", () => expect(readingMins(90)).toBe(2))
	it("120 → 2", () => expect(readingMins(120)).toBe(2))
})

describe("formatReadingTime", () => {
	it("0 → 1 min read", () => expect(formatReadingTime(0)).toBe("1 min read"))
	it("60 → 1 min read", () => expect(formatReadingTime(60)).toBe("1 min read"))
	it("90 → 2 min read", () => expect(formatReadingTime(90)).toBe("2 min read"))
	it("120 → 2 min read", () => expect(formatReadingTime(120)).toBe("2 min read"))
})
