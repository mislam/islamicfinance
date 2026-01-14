/**
 * PDF Template types - Generic and reusable for any PDF generation
 */

export interface PDFTemplate {
	pageSize: "A4" | "LETTER"
	margins: number // in mm
	fontFamily: string
	content: PDFContent[]
	footer?: PDFFooter
}

export interface PDFContent {
	type: "text" | "image" | "line" | "signature-grid" | "spacer"
	// Text content
	text?: string
	fontSize?: number
	fontWeight?: "normal" | "bold" | "italic"
	align?: "left" | "center" | "right"
	color?: string
	lineHeight?: number
	marginTop?: number
	marginBottom?: number
	// Image content
	imageSrc?: string
	imageWidth?: number // in mm
	imageHeight?: number // in mm
	// Line content
	lineWidth?: number // in pt
	// Spacer content
	spacerHeight?: number // in pt
	// Signature grid
	signatureRows?: SignatureRow[]
}

export interface SignatureRow {
	cells: SignatureCell[]
}

export interface SignatureCell {
	label: string
	fullName: string
	address?: string
	contact?: string
}

export interface PDFFooter {
	text: string
	url?: string
	fontSize: number
	color: string
	position: {
		right: number // in mm
		bottom: number // in mm
	}
}
