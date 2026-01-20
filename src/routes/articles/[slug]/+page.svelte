<script lang="ts">
	import { page } from "$app/state"
	import { Head } from "$lib/seo"
	import { createSEOData } from "$lib/seo"

	import ArticleContent from "./ArticleContent.svelte"
	import ArticleFooter from "./ArticleFooter.svelte"
	import ArticleHeader from "./ArticleHeader.svelte"

	let { data } = $props<{
		data: { article: Awaited<ReturnType<typeof import("./+page.server").load>>["article"] }
	}>()

	// SEO metadata for individual article
	const seo = $derived.by(() => {
		const article = data.article
		const baseUrl = page.url.origin
		const articleUrl = `${baseUrl}${page.url.pathname}`

		return createSEOData(
			{
				title: `${article.title} | Islamic Finance`,
				description: article.description,
				keywords: article.keywords || "",
				ogImage: article.featuredImage || undefined,
				ogType: "article",
				articlePublishedTime: article.publishedAt || undefined,
				articleModifiedTime: article.updatedAt || undefined,
				articleAuthor: article.author || undefined,
				articleSection: article.category || undefined,
				articleTags: article.tags.length > 0 ? article.tags : undefined,
				structuredData: {
					"@context": "https://schema.org",
					"@type": "Article",
					headline: article.headline,
					description: article.description,
					author: {
						"@type": "Person",
						name: article.author,
					},
					publisher: {
						"@type": "Organization",
						name: "Islamic Finance",
						url: baseUrl,
						logo: {
							"@type": "ImageObject",
							url: `${baseUrl}/images/logo-square.svg`,
							width: 512,
							height: 512,
						},
					},
					datePublished: article.publishedAt || undefined,
					dateModified: article.updatedAt || undefined,
					image: article.featuredImage
						? {
								"@type": "ImageObject",
								url: article.featuredImage,
								width: 1200,
								height: 630,
							}
						: undefined,
					url: articleUrl,
					mainEntityOfPage: {
						"@type": "WebPage",
						"@id": articleUrl,
					},
					inLanguage: "en-US",
					...(article.category && { articleSection: article.category }),
				},
			},
			page.url.pathname,
			page.url.origin,
		)
	})
</script>

<Head {seo} />

<div class="container mx-auto px-5 py-8">
	<article class="mx-auto max-w-3xl">
		<ArticleHeader article={data.article} />

		{#if data.article.featuredImage}
			<figure class="my-8">
				<img
					src={data.article.featuredImage}
					alt={data.article.headline}
					class="w-full rounded-lg object-cover"
				/>
			</figure>
		{/if}

		<ArticleContent content={data.article.content} />

		<ArticleFooter article={data.article} />
	</article>
</div>
