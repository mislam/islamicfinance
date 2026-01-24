import { describe, expect, it } from "vitest"

import { formatReadingTime, readingMins, readingSeconds } from "./reading-time"

/** Fixed WPM for tests so expectations are independent of $lib/config. With 60, seconds = word count. */
const TEST_WPM = 60
const rt = (md: string) => readingSeconds(md, { wpm: TEST_WPM })

describe("readingSeconds", () => {
	describe("empty and whitespace", () => {
		it("returns 0 for empty string", () => expect(rt("")).toBe(0))
		it("returns 0 for whitespace only", () => expect(rt("   \n\t  ")).toBe(0))
	})

	describe("plain prose", () => {
		it("counts words and applies WPM", () => expect(rt("one two three")).toBe(3))
		it("60 words → 60s at 60 WPM", () => {
			expect(rt(Array.from({ length: 60 }, (_, i) => `w${i}`).join(" "))).toBe(60)
		})
		it("61 words → 61s at 60 WPM", () => {
			expect(rt(Array.from({ length: 61 }, (_, i) => `w${i}`).join(" "))).toBe(61)
		})
		it("120 words → 120s at 60 WPM", () => {
			expect(rt(Array(120).fill("w").join(" "))).toBe(120)
		})
		it("collapses multiple spaces and newlines", () => expect(rt("a   b\n\n  c")).toBe(3))
	})

	describe("links", () => {
		it("keeps only link text", () => expect(rt("[Quran 2:275](https://quran.com/2/275)")).toBe(2))
		it("handles empty link text", () => expect(rt("before [](https://x.com) after")).toBe(2))
	})

	describe("images", () => {
		it("keeps only alt text", () => expect(rt("![alt text here](image.png)")).toBe(3))
		it("handles empty alt", () => expect(rt("![](img.jpg)")).toBe(0))
	})

	describe("headings", () => {
		it("strips # from h1", () => expect(rt("# One")).toBe(1))
		it("strips ## from h2", () => expect(rt("## What Is Riba?")).toBe(3))
		it("does not strip # in the middle of a line", () => expect(rt("Section # one")).toBe(3))
	})

	describe("unordered lists", () => {
		it("strips - * + marker", () => {
			expect(rt("- Item")).toBe(1)
			expect(rt("* Item")).toBe(1)
			expect(rt("+ Item")).toBe(1)
		})
		it("leaves -Item (no space) as single token", () => expect(rt("-Item")).toBe(1))
	})

	describe("ordered lists", () => {
		it("strips 1. 2. etc", () => expect(rt("2. Second\n10. Tenth")).toBe(2))
		it("does not strip 1. in the middle of a line", () => expect(rt("See 1. first item")).toBe(4))
	})

	describe("blockquotes", () => {
		it("strips > marker", () => expect(rt("> Quote")).toBe(1))
		it("does not strip > in the middle of a line", () => expect(rt("2 > 1 is true")).toBe(5))
	})

	describe("inline code", () => {
		it("strips backticks", () => expect(rt("Use `code` here")).toBe(3))
	})

	describe("fenced code blocks", () => {
		it("counts words inside", () => expect(rt("```\nconst x = 1\n```")).toBe(6))
	})

	describe("mixed real-world", () => {
		it("strips all markdown in a short passage", () => {
			const md = `## What Is Riba?
Riba is an **important** concept. See [Quran 2:275](https://quran.com/2/275).
- First point
- Second point
> A key quote here.
Use \`murabaha\` in practice.`
			expect(rt(md)).toBe(23)
		})
	})
})

describe("readingMins", () => {
	it("0 → 1 (min for display)", () => expect(readingMins(0)).toBe(1))
	it("1 → 1", () => expect(readingMins(1)).toBe(1))
	it("29 → 1 (below 0.5 min, rounds down but min is 1)", () => expect(readingMins(29)).toBe(1))
	it("30 → 1 (0.5 min, rounds up)", () => expect(readingMins(30)).toBe(1))
	it("31 → 1 (above 0.5 min, rounds up)", () => expect(readingMins(31)).toBe(1))
	it("59 → 1 (just below 1 min)", () => expect(readingMins(59)).toBe(1))
	it("60 → 1 (exactly 1 min)", () => expect(readingMins(60)).toBe(1))
	it("61 → 1 (just above 1 min, rounds down)", () => expect(readingMins(61)).toBe(1))
	it("89 → 1 (below 1.5 min, rounds down)", () => expect(readingMins(89)).toBe(1))
	it("90 → 2 (1.5 min, rounds up)", () => expect(readingMins(90)).toBe(2))
	it("91 → 2 (above 1.5 min, rounds up)", () => expect(readingMins(91)).toBe(2))
	it("120 → 2 (exactly 2 min)", () => expect(readingMins(120)).toBe(2))
	it("149 → 2 (below 2.5 min, rounds down)", () => expect(readingMins(149)).toBe(2))
	it("150 → 3 (2.5 min, rounds up)", () => expect(readingMins(150)).toBe(3))
	it("151 → 3 (above 2.5 min, rounds up)", () => expect(readingMins(151)).toBe(3))
})

describe("formatReadingTime", () => {
	it("0 → 1 min read", () => expect(formatReadingTime(0)).toBe("1 min read"))
	it("30 → 1 min read (0.5 min rounds up)", () => expect(formatReadingTime(30)).toBe("1 min read"))
	it("60 → 1 min read", () => expect(formatReadingTime(60)).toBe("1 min read"))
	it("61 → 1 min read (rounds down)", () => expect(formatReadingTime(61)).toBe("1 min read"))
	it("89 → 1 min read (rounds down)", () => expect(formatReadingTime(89)).toBe("1 min read"))
	it("90 → 2 min read (1.5 min rounds up)", () => expect(formatReadingTime(90)).toBe("2 min read"))
	it("91 → 2 min read (rounds up)", () => expect(formatReadingTime(91)).toBe("2 min read"))
	it("120 → 2 min read", () => expect(formatReadingTime(120)).toBe("2 min read"))
	it("149 → 2 min read (rounds down)", () => expect(formatReadingTime(149)).toBe("2 min read"))
	it("150 → 3 min read (2.5 min rounds up)", () =>
		expect(formatReadingTime(150)).toBe("3 min read"))
})
