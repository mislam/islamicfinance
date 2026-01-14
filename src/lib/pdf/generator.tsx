import { Document, Image, Page, Path, pdf, StyleSheet, Svg, Text, View } from "@react-pdf/renderer"
import React from "react"

import type { PDFContent, PDFTemplate, SignatureCell, SignatureRow } from "./types"

// React PDF styles are dynamic and accept various types
type PDFStyle = Record<string, string | number | undefined>

/**
 * Convert millimeters to points (1mm = 2.83465pt)
 * Points are the standard unit for PDF measurements
 */
export function mmToPt(mm: number): number {
	return mm * 2.83465
}

/**
 * Create styles for PDF document
 */
function createStyles(template: PDFTemplate) {
	const marginPt = mmToPt(template.margins)

	return StyleSheet.create({
		page: {
			fontFamily: template.fontFamily,
			padding: marginPt,
			fontSize: 10,
		},
		text: {
			fontSize: 10,
			lineHeight: 1.4,
		},
		line: {
			borderBottomWidth: 1,
			borderBottomColor: "#000000",
			width: "100%",
		},
		signatureGrid: {
			marginTop: 16,
			marginBottom: 16,
		},
		signatureRow: {
			flexDirection: "row",
			marginBottom: 20,
			gap: 32,
		},
		signatureCell: {
			flex: "0 0 50%", // Fixed 50% width, gap is handled by the row's gap property
		},
		signatureLabel: {
			fontSize: 10,
			fontWeight: "bold",
			marginBottom: 4,
		},
		signatureName: {
			fontSize: 10,
			marginBottom: 2,
		},
		signatureAddress: {
			fontSize: 10,
			marginBottom: 2,
		},
		signatureContact: {
			fontSize: 10,
		},
		signatureLineContainer: {
			position: "relative",
			flexDirection: "row",
			marginTop: 30,
			gap: 8,
		},
		signatureLineLeft: {
			flex: "0 0 calc(66.666% - 4pt)", // 2/3 width minus half the gap
			borderTopWidth: 0.5,
			borderTopColor: "#000000",
			height: 0.5,
		},
		signatureLineRight: {
			flex: "0 0 calc(33.333% - 4pt)", // 1/3 width minus half the gap
			borderTopWidth: 0.5,
			borderTopColor: "#000000",
			height: 0.5,
			position: "relative",
		},
		signatureDatePlaceholder: {
			position: "absolute",
			bottom: 0,
			left: 22,
			right: 0,
			fontSize: 14,
			color: "#666666",
		},
		signatureArrow: {
			position: "absolute",
			left: -6,
			top: -18,
			width: 6,
			height: 12,
		},
		signatureText: {
			fontSize: 10,
			marginTop: 2,
		},
		signatureTextContainer: {
			flexDirection: "row",
			gap: 8,
			marginTop: 2,
		},
		signatureTextLeft: {
			flex: "0 0 calc(66.666% - 4pt)",
			fontSize: 10,
		},
		signatureTextRight: {
			flex: "0 0 calc(33.333% - 4pt)",
			fontSize: 10,
		},
		footer: {
			position: "absolute",
			left: mmToPt(template.margins),
			bottom: template.footer ? mmToPt(template.footer.position.bottom) : mmToPt(20),
			fontSize: template.footer?.fontSize || 10,
			color: template.footer?.color || "#666666",
		},
		footerPageNumber: {
			position: "absolute",
			right: template.footer ? mmToPt(template.footer.position.right) : mmToPt(20),
			bottom: template.footer ? mmToPt(template.footer.position.bottom) : mmToPt(20),
			fontSize: template.footer?.fontSize || 10,
			color: template.footer?.color || "#666666",
		},
		footerLink: {
			textDecoration: "underline",
		},
	})
}

/**
 * Render a signature cell
 */
function SignatureCellComponent({
	cell,
	styles,
}: {
	cell: SignatureCell
	styles: ReturnType<typeof createStyles>
}) {
	// Skip rendering empty spacer cells
	if (!cell.label && !cell.fullName) {
		return <View style={styles.signatureCell} />
	}

	return (
		<View style={styles.signatureCell}>
			<Text style={styles.signatureLabel}>{cell.label}</Text>
			<Text style={styles.signatureName}>{cell.fullName}</Text>
			{cell.address && <Text style={styles.signatureAddress}>{cell.address}</Text>}
			{cell.contact && <Text style={styles.signatureContact}>{cell.contact}</Text>}
			<View style={styles.signatureLineContainer}>
				<Svg style={styles.signatureArrow} viewBox="0 0 6 12">
					<Path d="M0 0 L6 6 L0 12 Z" fill="#000000" />
				</Svg>
				<View style={styles.signatureLineLeft} />
				<View style={styles.signatureLineRight}>
					<Text style={styles.signatureDatePlaceholder}>/{"      "}/</Text>
				</View>
			</View>
			<View style={styles.signatureTextContainer}>
				<Text style={styles.signatureTextLeft}>Signature</Text>
				<Text style={styles.signatureTextRight}>Date</Text>
			</View>
		</View>
	)
}

/**
 * Render a signature row
 */
function SignatureRowComponent({
	row,
	styles,
}: {
	row: SignatureRow
	styles: ReturnType<typeof createStyles>
}) {
	return (
		<View style={styles.signatureRow}>
			{row.cells.map((cell, index) => (
				<SignatureCellComponent key={index} cell={cell} styles={styles} />
			))}
		</View>
	)
}

/**
 * Render PDF content
 */
function renderContent(
	content: PDFContent,
	styles: ReturnType<typeof createStyles>,
	index: number,
) {
	const baseStyle: PDFStyle = {
		marginTop: content.marginTop ? mmToPt(content.marginTop) : 0,
		marginBottom: content.marginBottom ? mmToPt(content.marginBottom) : 0,
	}

	switch (content.type) {
		case "text": {
			const textStyle: PDFStyle = {
				...styles.text,
				...baseStyle,
			}

			if (content.fontSize) {
				textStyle.fontSize = content.fontSize
			}
			if (content.fontWeight === "bold") {
				textStyle.fontWeight = "bold"
			}
			if (content.fontWeight === "italic") {
				textStyle.fontStyle = "italic"
			}
			if (content.align === "center") {
				textStyle.textAlign = "center"
			}
			if (content.align === "right") {
				textStyle.textAlign = "right"
			}
			if (content.color) {
				textStyle.color = content.color
			}
			if (content.lineHeight) {
				textStyle.lineHeight = content.lineHeight
			}

			// Handle bold formatting for currency amounts and dates
			const text = content.text || ""
			const parts: (string | React.ReactElement)[] = []
			let lastIndex = 0
			let keyCounter = 0

			// Combined regex to find both currency amounts and dates
			// Currency: $5,000 or similar
			// Dates: January 15, 2024 or similar
			const combinedRegex = /(\$[\d,]+|[A-Z][a-z]+ \d{1,2}, \d{4})/g
			let match

			while ((match = combinedRegex.exec(text)) !== null) {
				// Add text before the match
				if (match.index > lastIndex) {
					parts.push(text.substring(lastIndex, match.index))
				}
				// Add the matched currency/date as bold
				parts.push(
					<Text key={`bold-${keyCounter++}`} style={{ fontWeight: "bold" }}>
						{match[0]}
					</Text>,
				)
				lastIndex = match.index + match[0].length
			}

			// Add remaining text
			if (lastIndex < text.length) {
				parts.push(text.substring(lastIndex))
			}

			// If we found matches, render with parts, otherwise render plain text
			if (parts.length > 0) {
				return (
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					<Text key={index} style={textStyle as any}>
						{parts}
					</Text>
				)
			}

			return (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				<Text key={index} style={textStyle as any}>
					{text}
				</Text>
			)
		}

		case "image": {
			if (!content.imageSrc) return null

			const imageStyle: PDFStyle = {
				...baseStyle,
				width: content.imageWidth ? mmToPt(content.imageWidth) : undefined,
				height: content.imageHeight ? mmToPt(content.imageHeight) : undefined,
				alignSelf: content.align === "center" ? "center" : "flex-start",
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return <Image key={index} src={content.imageSrc} style={imageStyle as any} cache={false} />
		}

		case "line": {
			const lineStyle: PDFStyle = {
				...styles.line,
				...baseStyle,
				borderBottomWidth: content.lineWidth || 1,
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return <View key={index} style={lineStyle as any} />
		}

		case "spacer": {
			const spacerStyle: PDFStyle = {
				...baseStyle,
				height: content.spacerHeight || mmToPt(4),
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return <View key={index} style={spacerStyle as any} />
		}

		case "signature-grid": {
			if (!content.signatureRows) return null

			return (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				<View key={index} style={[styles.signatureGrid, baseStyle] as any}>
					{content.signatureRows.map((row, rowIndex) => (
						<SignatureRowComponent key={rowIndex} row={row} styles={styles} />
					))}
				</View>
			)
		}

		default:
			return null
	}
}

/**
 * Create PDF Document component from template
 */
function PDFDocument({ template }: { template: PDFTemplate }) {
	const styles = createStyles(template)

	return (
		<Document>
			<Page size={template.pageSize} style={styles.page}>
				{template.content.map((content, index) => renderContent(content, styles, index))}
				{template.footer && (
					<>
						<Text fixed wrap={false} style={styles.footer}>
							{template.footer.url
								? template.footer.text.split(template.footer.url).map((part, i, arr) =>
										i < arr.length - 1 ? (
											<React.Fragment key={i}>
												{part}
												<Text style={styles.footerLink}>{template.footer?.url}</Text>
											</React.Fragment>
										) : (
											part
										),
									)
								: template.footer.text}
						</Text>
						<Text
							fixed
							wrap={false}
							style={styles.footerPageNumber}
							render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
						/>
					</>
				)}
			</Page>
		</Document>
	)
}

/**
 * Generate and download PDF from template
 * This is a reusable function that works with any PDFTemplate
 * @param template - PDF template structure
 * @param filename - Name for the downloaded PDF file
 */
export async function generatePDF(template: PDFTemplate, filename: string): Promise<void> {
	try {
		const doc = <PDFDocument template={template} />
		const blob = await pdf(doc).toBlob()

		// Create download link
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	} catch (error) {
		console.error("Error generating PDF:", error)
		throw error
	}
}
