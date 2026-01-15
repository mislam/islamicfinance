import { format, parseISO } from "date-fns"

import type { PDFContent, PDFTemplate, SignatureRow } from "$lib/pdf"
import { convertSvgImagesToPng, generatePDF } from "$lib/pdf"
import { formatCurrency, formatCurrencyWithWords } from "$lib/utils"

import type { ContractData } from "./types"

/**
 * Build signature grid from witnesses
 */
function buildSignatureGrid(
	borrower: ContractData["borrower"],
	lender: ContractData["lender"],
	witnesses: ContractData["witnesses"],
): SignatureRow[] {
	const rows: SignatureRow[] = []

	// Row 1: Borrower and Lender
	rows.push({
		cells: [
			{
				label: "Borrower:",
				fullName: borrower.fullName,
				address: borrower.address,
				contact: [borrower.phone, borrower.email].filter(Boolean).join(", "),
			},
			{
				label: "Lender:",
				fullName: lender.fullName,
				address: lender.address,
				contact: [lender.phone, lender.email].filter(Boolean).join(" | "),
			},
		],
	})

	// Row 2: Witnesses (2 witnesses side by side)
	if (witnesses.length >= 2) {
		const gender1 = witnesses[0].gender === "male" ? "Male" : "Female"
		const gender2 = witnesses[1].gender === "male" ? "Male" : "Female"
		rows.push({
			cells: [
				{
					label: `Witness 1 (${gender1}):`,
					fullName: witnesses[0].fullName,
					address: witnesses[0].address,
					contact: [witnesses[0].phone, witnesses[0].email].filter(Boolean).join(" | "),
				},
				{
					label: `Witness 2 (${gender2}):`,
					fullName: witnesses[1].fullName,
					address: witnesses[1].address,
					contact: [witnesses[1].phone, witnesses[1].email].filter(Boolean).join(" | "),
				},
			],
		})
	}

	// Row 3: Third witness (if exists, with empty spacer to maintain half width)
	if (witnesses.length >= 3) {
		const gender3 = witnesses[2].gender === "male" ? "Male" : "Female"
		rows.push({
			cells: [
				{
					label: `Witness 3 (${gender3}):`,
					fullName: witnesses[2].fullName,
					address: witnesses[2].address,
					contact: [witnesses[2].phone, witnesses[2].email].filter(Boolean).join(" | "),
				},
				{
					label: "",
					fullName: "",
				},
			],
		})
	}

	return rows
}

/**
 * Default styles for PDF content
 */
const DEFAULTS = {
	fontSize: 10,
	fontWeight: "normal" as const,
	align: "left" as const,
	lineHeight: 1.4,
	color: undefined as string | undefined,
}

/**
 * Helper function to create text content with defaults
 */
function text(
	content: string,
	overrides?: Partial<
		Pick<
			PDFContent,
			"fontSize" | "fontWeight" | "align" | "lineHeight" | "color" | "marginTop" | "marginBottom"
		>
	>,
): PDFContent {
	return {
		type: "text",
		text: content,
		fontSize: overrides?.fontSize ?? DEFAULTS.fontSize,
		fontWeight: overrides?.fontWeight ?? DEFAULTS.fontWeight,
		align: overrides?.align ?? DEFAULTS.align,
		lineHeight: overrides?.lineHeight ?? DEFAULTS.lineHeight,
		color: overrides?.color ?? DEFAULTS.color,
		marginTop: overrides?.marginTop,
		marginBottom: overrides?.marginBottom,
	}
}

/**
 * Helper function to create image content
 */
function image(
	src: string,
	width: number,
	height: number,
	overrides?: Partial<Pick<PDFContent, "align" | "marginBottom">>,
): PDFContent {
	return {
		type: "image",
		imageSrc: src,
		imageWidth: width,
		imageHeight: height,
		align: overrides?.align ?? "center",
		marginBottom: overrides?.marginBottom,
	}
}

/**
 * Helper function to create line content
 */
function line(
	overrides?: Partial<Pick<PDFContent, "lineWidth" | "marginTop" | "marginBottom">>,
): PDFContent {
	return {
		type: "line",
		lineWidth: overrides?.lineWidth ?? 1,
		marginTop: overrides?.marginTop,
		marginBottom: overrides?.marginBottom,
	}
}

/**
 * Convert ContractData to PDFTemplate
 */
export function buildContractTemplate(data: ContractData): PDFTemplate {
	const currency = data.loan.currency
	const pageSize: "A4" | "LETTER" = currency === "USD" || currency === "CAD" ? "LETTER" : "A4"

	const loanDate = parseISO(data.loan.loanDate)
	const repaymentDate = parseISO(data.loan.repaymentDate)

	const formattedLoanDate = format(loanDate, "MMMM d, yyyy")
	const formattedRepaymentDate = format(repaymentDate, "MMMM d, yyyy")

	const currencyAmount = formatCurrency(data.loan.amount, currency)
	const currencyWords = formatCurrencyWithWords(data.loan.amount, currency)

	const content: PDFContent[] = []

	// Bismillah SVG
	content.push(image("/images/bismillah.svg", 60, 8.97, { marginBottom: 2 }))

	// "In the name of Allah..." text
	content.push(
		text("In the name of Allah, the Most Compassionate, the Most Merciful.", {
			align: "center",
			marginBottom: 3,
		}),
	)

	// Quranic Verse
	content.push(
		text(
			"“O believers! When you contract a debt for a specified term, write it down... And bring two witnesses from among your men. If two men are not available, then one man and two women, so that if one of the two women forgets, the other can remind her.”",
			{
				fontWeight: "italic",
			},
		),
	)

	// Quranic Verse Reference
	content.push(
		text("—  Quran, Surah Al-Baqarah (2:282)", {
			align: "right",
			fontWeight: "italic",
			marginTop: -3,
			marginBottom: 1,
		}),
	)

	// Horizontal Line
	content.push(line())

	// Title
	content.push(
		text("ISLAMIC LOAN AGREEMENT", {
			fontWeight: "bold",
			align: "center",
			lineHeight: 1,
			marginTop: 4,
			marginBottom: 4,
		}),
	)

	// Acknowledgment paragraph
	// const acknowledgmentText = `This agreement acknowledges that ${data.borrower.fullName} (the "Borrower") has received a loan of ${currencyAmount} (${currencyWords}) from ${data.lender.fullName} (the "Lender") for the purpose of ${data.loan.purpose}. The loan was given on ${formattedLoanDate} and must be repaid in full by ${formattedRepaymentDate}.`
	const acknowledgmentText = `Between ${data.lender.fullName} (the “Lender”) and ${data.borrower.fullName} (the “Borrower”), dated ${formattedLoanDate}. The Borrower acknowledges receipt of ${currencyAmount} (${currencyWords}) on this date for business investment to expand retail operations. The Borrower shall repay the full principal amount on or before ${formattedRepaymentDate}.`
	content.push(text(acknowledgmentText))

	// Sharia Compliance section
	content.push(text("SHARIA COMPLIANCE", { fontWeight: "bold", marginTop: 4, marginBottom: 1 }))

	content.push(
		text(
			"This agreement is executed in accordance with Islamic principles. The loan is interest-free (riba-free). The Borrower shall repay only the principal amount with no interest, fees, or additional charges.",
		),
	)

	// Default and Dispute Resolution section
	content.push(
		text("DEFAULT AND DISPUTE RESOLUTION", { fontWeight: "bold", marginTop: 4, marginBottom: 1 }),
	)

	content.push(
		text(
			"If the Borrower fails to repay the full principal amount by the due date, any dispute shall first be resolved through Islamic arbitration or mediation. If the dispute remains unresolved within 30 days, the Lender may pursue legal action under the applicable local laws. Both parties shall act in good faith throughout the term of this agreement.",
		),
	)

	// Signature Grid
	const signatureRows = buildSignatureGrid(data.borrower, data.lender, data.witnesses)
	content.push({
		type: "signature-grid",
		signatureRows,
		marginTop: 4,
	})

	return {
		pageSize,
		margins: 20, // 20mm on all sides
		fontFamily: "Helvetica",
		content,
		footer: {
			text: "This document was generated using www.islamicfinance.app",
			url: "www.islamicfinance.app",
			fontSize: 9,
			color: "#666666",
			position: {
				right: 20, // 20mm from right
				bottom: 10, // 20mm from bottom
			},
		},
	}
}

/**
 * Download PDF for Muslim Loan Contract
 * This is the contract-specific entry point called from the form
 * @param contractData - The contract data to generate PDF from
 * @param filename - Name for the downloaded PDF file
 */
export async function downloadPDF(contractData: ContractData, filename: string): Promise<void> {
	const template = buildContractTemplate(contractData)

	// Convert SVG images to PNG data URIs (required by @react-pdf/renderer)
	// Use high-resolution conversion for print quality
	await convertSvgImagesToPng(template)

	await generatePDF(template, filename)
}
