<script lang="ts">
	import { resolve } from "$app/paths"
	import { page } from "$app/state"
	import { Head } from "$lib/seo"
	import { createSEOData } from "$lib/seo"

	// SEO metadata for homepage
	const seo = $derived.by(() => {
		return createSEOData(
			{
				title: "Islamic Finance | Halal Financial Tools & Calculators",
				description:
					"Free Islamic finance tools and calculators. Compare halal financing options, calculate mortgage payments, and make sharia-compliant financial decisions.",
				keywords:
					"islamic finance, halal finance, sharia compliant, islamic banking, halal mortgage, islamic calculator, riba free",
				structuredData: {
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: "Islamic Finance",
					description: "Free Islamic finance tools and calculators for halal financial planning",
					url: `${page.url.origin}${page.url.pathname}`,
					potentialAction: {
						"@type": "SearchAction",
						target: {
							"@type": "EntryPoint",
							urlTemplate: `${page.url.origin}/islamic-mortgage-calculator`,
						},
						"query-input": "required name=search_term_string",
					},
				},
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
		</div>
	</div>
</main>
