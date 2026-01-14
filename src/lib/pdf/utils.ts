import type { PDFTemplate } from "./types"

/**
 * Convert SVG to PNG data URI with high resolution
 * This is required for @react-pdf/renderer which doesn't support SVG directly
 * Uses 300 DPI for print-quality output
 * @param svgUrl - URL or path to the SVG file
 * @param widthMm - Optional width in millimeters
 * @param heightMm - Optional height in millimeters
 * @returns Promise resolving to PNG data URI
 */
async function svgToPngDataUri(
	svgUrl: string,
	widthMm?: number,
	heightMm?: number,
): Promise<string> {
	try {
		// Fetch the SVG
		const response = await fetch(svgUrl)
		if (!response.ok) {
			throw new Error(`Failed to fetch SVG: ${response.statusText}`)
		}
		const svgText = await response.text()

		// Create an image element to load the SVG
		return new Promise((resolve, reject) => {
			const img = new window.Image()
			const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
			const url = URL.createObjectURL(svgBlob)

			img.onload = () => {
				// Create canvas with high DPI (300 DPI for print quality)
				// 1mm = 11.811 pixels at 300 DPI (300 DPI / 25.4 mm per inch)
				const DPI = 300
				const PIXELS_PER_MM = DPI / 25.4

				const canvas = document.createElement("canvas")
				const ctx = canvas.getContext("2d", { alpha: true })

				if (!ctx) {
					URL.revokeObjectURL(url)
					reject(new Error("Could not get canvas context"))
					return
				}

				// Calculate dimensions at high resolution
				let canvasWidth: number
				let canvasHeight: number

				if (widthMm && heightMm) {
					// Use provided dimensions in mm, convert to pixels at 300 DPI
					canvasWidth = Math.round(widthMm * PIXELS_PER_MM)
					canvasHeight = Math.round(heightMm * PIXELS_PER_MM)
				} else {
					// Use natural dimensions and scale up for high DPI
					const naturalWidth = img.naturalWidth || img.width || 170
					const naturalHeight = img.naturalHeight || img.height || 25
					// Scale up 3x for high resolution (300 DPI vs ~96 DPI screen)
					canvasWidth = naturalWidth * 3
					canvasHeight = naturalHeight * 3
				}

				canvas.width = canvasWidth
				canvas.height = canvasHeight

				// Enable high-quality rendering
				ctx.imageSmoothingEnabled = true
				ctx.imageSmoothingQuality = "high"

				// Draw the image to canvas at high resolution
				ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

				// Convert to PNG with high quality
				const pngDataUri = canvas.toDataURL("image/png")
				URL.revokeObjectURL(url)
				resolve(pngDataUri)
			}

			img.onerror = () => {
				URL.revokeObjectURL(url)
				reject(new Error("Failed to load SVG image"))
			}

			img.src = url
		})
	} catch (error) {
		console.error("Error converting SVG to PNG:", error)
		throw error
	}
}

/**
 * Convert SVG images in PDF template to PNG data URIs
 * This is required for @react-pdf/renderer which doesn't support SVG directly
 * Uses high-resolution conversion (300 DPI) for print quality
 * @param template - PDF template to process
 */
export async function convertSvgImagesToPng(template: PDFTemplate): Promise<void> {
	for (const content of template.content) {
		if (content.type === "image" && content.imageSrc?.endsWith(".svg")) {
			try {
				// Pass dimensions in mm - function will convert to high-res pixels (300 DPI)
				const pngDataUri = await svgToPngDataUri(
					content.imageSrc,
					content.imageWidth,
					content.imageHeight,
				)
				content.imageSrc = pngDataUri
			} catch (error) {
				console.error("Failed to convert SVG to PNG:", error)
				// Continue without the image if conversion fails
				content.imageSrc = undefined
			}
		}
	}
}
