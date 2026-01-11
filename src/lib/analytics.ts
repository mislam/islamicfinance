/**
 * Google Analytics 4 (GA4) integration
 * Handles page view tracking for SvelteKit's client-side routing
 *
 * Note: The Google tag script is injected server-side in hooks.server.ts
 * immediately after <head> following Google's recommendation
 */

import { browser, dev } from "$app/environment"
import { PUBLIC_GA_MEASUREMENT_ID } from "$env/static/public"

/**
 * Track a page view
 * Call this on navigation changes
 */
export function trackPageView(url: string) {
	if (!browser || dev || !window.gtag || !PUBLIC_GA_MEASUREMENT_ID) return

	window.gtag("config", PUBLIC_GA_MEASUREMENT_ID, {
		page_path: url,
	})
}

/**
 * Track a custom event
 * @param eventName - The name of the event (e.g., 'button_click', 'form_submit')
 * @param eventParams - Optional parameters object (e.g., { button_id: 'subscribe', value: 100 })
 *
 * @example
 * trackEvent('calculator_used', { calculator_type: 'mortgage', home_price: 300000 })
 */
export function trackEvent(eventName: string, eventParams?: Record<string, unknown>) {
	if (!browser || dev || !window.gtag || !PUBLIC_GA_MEASUREMENT_ID) return

	// GA4 requires event parameters to be an object, not undefined
	window.gtag("event", eventName, eventParams || {})
}

// Type declarations for gtag
declare global {
	interface Window {
		dataLayer: unknown[]
		gtag: (...args: unknown[]) => void
	}
}
