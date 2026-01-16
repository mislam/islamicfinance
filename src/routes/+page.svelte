<script lang="ts">
	import { resolve } from "$app/paths"
	import { page } from "$app/state"
	import { Head } from "$lib/seo"
	import { createSEOData } from "$lib/seo"

	// SEO metadata for homepage
	const seo = $derived.by(() => {
		const baseUrl = page.url.origin

		const webSiteSchema = {
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Islamic Finance",
			description: "Free Islamic finance tools and calculators for halal financial planning",
			url: `${baseUrl}${page.url.pathname}`,
			potentialAction: {
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate: `${baseUrl}/islamic-mortgage-calculator`,
				},
				"query-input": "required name=search_term_string",
			},
		}

		const organizationSchema = {
			"@context": "https://schema.org",
			"@type": "Organization",
			name: "Islamic Finance",
			url: baseUrl,
			logo: {
				"@type": "ImageObject",
				url: `${baseUrl}/favicon.svg`,
			},
			description: "Free Islamic finance tools and calculators for halal financial planning",
			// sameAs can be added when social media profiles are available
			// sameAs: [
			//   "https://twitter.com/...",
			//   "https://facebook.com/..."
			// ]
		}

		return createSEOData(
			{
				title: "Islamic Finance | Halal Financial Tools & Calculators",
				description:
					"Free Islamic finance tools and calculators. Compare halal financing options, calculate mortgage payments, and make sharia-compliant financial decisions.",
				keywords:
					"islamic finance, halal finance, sharia compliant, islamic banking, halal mortgage, islamic calculator, riba free",
				structuredData: [webSiteSchema, organizationSchema],
			},
			page.url.pathname,
			page.url.origin,
		)
	})

	// No longer auto-redirecting - show both tools
</script>

<Head {seo} />

<main class="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold">Islamic Finance</h1>
		<p class="mb-8 text-lg text-base-content/70">Halal Financial Tools & Calculators</p>
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			<a
				href={resolve("/islamic-mortgage-calculator")}
				class="btn btn-lg btn-primary"
				aria-label="Go to Islamic Mortgage Calculator"
			>
				Islamic Mortgage Calculator
			</a>
			<a
				href={resolve("/loan-agreement-generator")}
				class="btn btn-lg btn-secondary"
				aria-label="Go to Muslim Loan Contract Generator"
			>
				Loan Contract Generator
			</a>
			<a href={resolve("/articles")} class="btn btn-ghost btn-lg" aria-label="Go to Articles">
				Articles & Guides
			</a>
		</div>
	</div>
</main>
