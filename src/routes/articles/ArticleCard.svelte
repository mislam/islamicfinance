<script lang="ts">
	import { EyeIcon } from "@lucide/svelte"
	import { format } from "date-fns"

	import { resolve } from "$app/paths"
	import type { ArticleMetadata } from "$lib/server/articles"
	import { formatReadingTime, readingMins } from "$lib/utils/reading-time"
	import { getArticleThumbSrcSet } from "$lib/vercel-image"

	let { article, baseUrl } = $props<{ article: ArticleMetadata; baseUrl: string }>()

	const dateLabel = $derived(
		article.updatedAt
			? { label: "Updated", value: article.updatedAt }
			: article.publishedAt
				? { label: "Published", value: article.publishedAt }
				: null,
	)
	const dateFormatted = $derived(
		dateLabel ? format(new Date(dateLabel.value), "MMM d, yyyy") : null,
	)
</script>

<article class="flex h-full flex-col">
	<a
		href={resolve(`/articles/${article.slug}`)}
		class="flex flex-row flex-wrap items-start gap-4 sm:gap-6"
		data-sveltekit-preload-data="false"
	>
		<div class="flex min-w-0 flex-1 flex-col gap-2">
			<!-- {#if article.category}
				<div class="badge badge-soft badge-sm">{article.category}</div>
			{/if} -->
			<h2 class="text-xl font-bold sm:text-2xl">{article.headline}</h2>
			<p class="text-base-content/70">{article.description}</p>
		</div>
		{#if article.featuredImage}
			{@const thumb = getArticleThumbSrcSet(article.featuredImage, baseUrl)}
			<figure class="aspect-4/3 w-24 shrink-0 overflow-hidden sm:w-48">
				<img
					src={thumb.src}
					srcset={thumb.srcSet}
					alt={article.headline}
					class="h-full w-full object-cover"
					width="192"
					height="144"
					fetchpriority="low"
				/>
			</figure>
		{/if}
		<span class="flex w-full flex-wrap items-center gap-2 text-sm text-base-content/70">
			{#if dateLabel && dateFormatted}
				<time datetime={dateLabel.value}>{dateLabel.label} {dateFormatted}</time>
			{/if}
			{#if dateFormatted}<span aria-hidden="true">·</span>{/if}
			<time datetime={"PT" + readingMins(article.readingSeconds) + "M"}>
				{formatReadingTime(article.readingSeconds)}
			</time>
			{#if article.viewCount > 0}
				<span
					class="ml-2 inline-flex items-center gap-1"
					aria-label={article.viewCount === 1 ? "1 view" : `${article.viewCount} views`}
				>
					<EyeIcon size={12} aria-hidden="true" />{article.viewCount}
				</span>
			{/if}
		</span>
	</a>
</article>
