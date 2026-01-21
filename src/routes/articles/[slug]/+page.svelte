<script lang="ts">
	import { page } from "$app/state"
	import { Head } from "$lib/seo"
	import { createSEOData } from "$lib/seo"
	import { getArticleDetailSrcSet, getArticleOgImageUrl } from "$lib/vercel-image"

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
		const ogImageUrl = article.featuredImage
			? getArticleOgImageUrl(article.featuredImage, baseUrl)
			: undefined

		return createSEOData(
			{
				title: `${article.headline} | Islamic Finance`,
				description: article.description,
				keywords: article.keywords || "",
				ogImage: ogImageUrl,
				twitterImage: ogImageUrl,
				ogType: "article",
				articlePublishedTime: article.publishedAt || undefined,
				articleModifiedTime: article.updatedAt, // Always present (required field)
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
					dateModified: article.updatedAt, // Always present (required field)
					image: ogImageUrl
						? {
								"@type": "ImageObject",
								url: ogImageUrl,
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
	<article class="mx-auto max-w-2xl">
		<ArticleHeader article={data.article} />

		{#if data.article.featuredImage}
			{@const detail = getArticleDetailSrcSet(data.article.featuredImage, page.url.origin)}
			<figure class="-mx-5 my-8 sm:mx-0">
				<img
					src={detail.src}
					srcset={detail.srcSet}
					sizes={detail.sizes}
					alt={data.article.headline}
					class="w-full object-cover"
					width="672"
					height="378"
				/>
			</figure>
		{:else}
			<hr class="my-6 border-base-content/10" />
		{/if}

		<ArticleContent content={data.article.content} />

		<ArticleFooter article={data.article} />
	</article>
</div>
