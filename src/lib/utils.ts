/**
 * Common utility functions
 */

/**
 * Convert number to words (simplified version)
 * Supports numbers up to 999,999,999
 * @param num - The number to convert
 * @returns The number in words (e.g., "one hundred twenty-three")
 */
export function numberToWords(num: number): string {
	const ones = [
		"",
		"one",
		"two",
		"three",
		"four",
		"five",
		"six",
		"seven",
		"eight",
		"nine",
		"ten",
		"eleven",
		"twelve",
		"thirteen",
		"fourteen",
		"fifteen",
		"sixteen",
		"seventeen",
		"eighteen",
		"nineteen",
	]
	const tens = [
		"",
		"",
		"twenty",
		"thirty",
		"forty",
		"fifty",
		"sixty",
		"seventy",
		"eighty",
		"ninety",
	]

	if (num === 0) return "zero"
	if (num < 20) return ones[num]
	if (num < 100) {
		const ten = Math.floor(num / 10)
		const one = num % 10
		return tens[ten] + (one > 0 ? "-" + ones[one] : "")
	}
	if (num < 1000) {
		const hundred = Math.floor(num / 100)
		const remainder = num % 100
		return ones[hundred] + " hundred" + (remainder > 0 ? " " + numberToWords(remainder) : "")
	}
	if (num < 1000000) {
		const thousand = Math.floor(num / 1000)
		const remainder = num % 1000
		return (
			numberToWords(thousand) + " thousand" + (remainder > 0 ? " " + numberToWords(remainder) : "")
		)
	}
	if (num < 1000000000) {
		const million = Math.floor(num / 1000000)
		const remainder = num % 1000000
		return (
			numberToWords(million) + " million" + (remainder > 0 ? " " + numberToWords(remainder) : "")
		)
	}
	return num.toString() // fallback for very large numbers
}

/**
 * Format currency amount using Intl.NumberFormat
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (e.g., "USD", "EUR", "GBP")
 * @param locale - Optional locale string (defaults to "en-US" for consistency in legal documents)
 * @returns Formatted currency string (e.g., "$5,000")
 */
export function formatCurrency(amount: number, currency: string, locale = "en-US"): string {
	const formatter = new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
	return formatter.format(amount)
}

/**
 * Format currency amount with words (e.g., "Five thousand US dollars")
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (e.g., "USD", "EUR", "GBP")
 * @returns Currency amount in words with currency name
 */
export function formatCurrencyWithWords(amount: number, currency: string): string {
	const currencyNames: Record<string, string> = {
		USD: "US dollars",
		EUR: "euros",
		GBP: "British pounds",
		CAD: "Canadian dollars",
		AUD: "Australian dollars",
		JPY: "Japanese yen",
		CHF: "Swiss francs",
		CNY: "Chinese yuan",
		INR: "Indian rupees",
		SGD: "Singapore dollars",
		AED: "UAE dirhams",
		SAR: "Saudi riyals",
		MYR: "Malaysian ringgit",
		IDR: "Indonesian rupiah",
		PKR: "Pakistani rupees",
		BDT: "Bangladeshi taka",
	}

	const currencyName = currencyNames[currency] || currency
	const words = numberToWords(amount)
	// Capitalize all words for legal documents (standard convention)
	const capitalizedWords = words
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
	const capitalizedCurrencyName = currencyName
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")

	return `${capitalizedWords} ${capitalizedCurrencyName}`
}
