<script lang="ts">
	import { resolve } from "$app/paths"
	import { page } from "$app/state"
	import { Head } from "$lib/seo"
	import { createSEOData } from "$lib/seo"

	import ArticleCard from "./ArticleCard.svelte"

	let { data } = $props<{
		data: Awaited<ReturnType<typeof import("./+page.server").load>>
	}>()

	const hasActiveFilters = $derived(!!(data.filters.tag || data.filters.category))

	const filterTitle = $derived.by(() => {
		if (data.filters.tag) {
			return `Articles tagged "${data.filters.tag}"`
		}
		if (data.filters.category) {
			return `Articles in "${data.filters.category}"`
		}
		return "Islamic Finance Articles"
	})

	// SEO metadata for articles listing page
	const seo = $derived.by(() => {
		const title = hasActiveFilters
			? `${filterTitle} | Islamic Finance Articles`
			: "Islamic Finance Articles | Knowledge Base & Guides"

		const description = hasActiveFilters
			? `Browse ${data.articles.length} article${data.articles.length !== 1 ? "s" : ""} ${data.filters.tag ? `tagged "${data.filters.tag}"` : `in category "${data.filters.category}"`} on Islamic finance, halal investing, and sharia-compliant banking.`
			: "Explore comprehensive articles on Islamic finance, halal investing, sharia-compliant banking, and Islamic financial principles. Expert guides and insights."

		return createSEOData(
			{
				title,
				description,
				keywords:
					"islamic finance articles, halal finance guides, sharia finance knowledge, islamic banking education",
				structuredData: {
					"@context": "https://schema.org",
					"@type": "CollectionPage",
					name: filterTitle,
					description,
					url: `${page.url.origin}${page.url.pathname}`,
					publisher: {
						"@type": "Organization",
						name: "Islamic Finance",
						url: page.url.origin,
						logo: {
							"@type": "ImageObject",
							url: `${page.url.origin}/images/logo-square.svg`,
							width: 512,
							height: 512,
						},
					},
				},
			},
			page.url.pathname,
			page.url.origin,
		)
	})
</script>

<Head {seo} />

<main class="container mx-auto px-5 py-12">
	<header class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold">{filterTitle}</h1>
		{#if !hasActiveFilters}
			<p class="mx-auto max-w-2xl text-lg text-base-content/70">
				Comprehensive guides on Islamic finance, halal investing, sharia-compliant banking, and
				Islamic financial principles.
			</p>
		{/if}
	</header>

	{#if hasActiveFilters}
		<div class="mb-6 flex flex-wrap items-center justify-center gap-2">
			{#if data.filters.tag}
				<span class="badge gap-2 badge-lg badge-primary">
					Tag: {data.filters.tag}
					<a href={resolve("/articles")} class="hover:opacity-70" aria-label="Clear tag filter">
						×
					</a>
				</span>
			{/if}
			{#if data.filters.category}
				<span class="badge gap-2 badge-lg badge-secondary">
					Category: {data.filters.category}
					<a
						href={resolve("/articles")}
						class="hover:opacity-70"
						aria-label="Clear category filter"
					>
						×
					</a>
				</span>
			{/if}
			<a href={resolve("/articles")} class="btn btn-ghost btn-sm">Clear all filters</a>
		</div>
	{/if}

	{#if data.articles.length === 0}
		<div class="text-center">
			<p class="mb-4 text-base-content/60">
				{hasActiveFilters
					? "No articles found matching your filters."
					: "No articles available yet. Check back soon!"}
			</p>
			{#if hasActiveFilters}
				<a href={resolve("/articles")} class="btn btn-primary">View all articles</a>
			{/if}
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.articles as article (article.slug)}
				<ArticleCard {article} />
			{/each}
		</div>
	{/if}
</main>
