// Auth is currently disabled - uncomment below to enable
// import { svelteKitHandler } from "better-auth/svelte-kit"
// import { building } from "$app/environment"
// import { auth } from "$lib/auth/server"

import { dev } from "$app/environment"
import { PUBLIC_GA_MEASUREMENT_ID } from "$env/static/public"

export async function handle({ event, resolve }) {
	// Auth disabled - pass through to SvelteKit's default handler
	// To enable auth, uncomment the import statements above and the code below:
	// return svelteKitHandler({ auth, event, resolve, building })

	return resolve(event, {
		transformPageChunk: ({ html }) => {
			// Inject Google Analytics tag immediately after <head> if in production and ID is set
			if (!dev && PUBLIC_GA_MEASUREMENT_ID) {
				// Restrict cookies to www subdomain only (exclude media subdomain for cookie-free image requests)
				const googleTag = `<script async src="https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_MEASUREMENT_ID}"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${PUBLIC_GA_MEASUREMENT_ID}', {'cookie_domain': 'www.islamicfinance.app'});</script>`
				return html.replace("%sveltekit.googleAnalytics%", googleTag)
			}
			// Remove placeholder if not in production or ID not set
			return html.replace("%sveltekit.googleAnalytics%", "")
		},
	})
}
