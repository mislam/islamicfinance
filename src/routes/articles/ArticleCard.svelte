<script lang="ts">
	import { EyeIcon } from "@lucide/svelte"
	import { format } from "date-fns"

	import { resolve } from "$app/paths"
	import type { ArticleMetadata } from "$lib/server/articles"

	let { article } = $props<{ article: ArticleMetadata }>()

	// Format dates - will use user's timezone on client after hydration
	// Note: For date-only formats (no time), timezone usually doesn't change the displayed date
	// unless the date crosses midnight boundaries in different timezones
	const publishedDate = $derived(
		article.publishedAt ? format(new Date(article.publishedAt), "MMMM d, yyyy") : null,
	)
</script>

<article class="flex h-full flex-col">
	<a
		href={resolve(`/articles/${article.slug}`)}
		class="flex min-h-0 flex-1 flex-col rounded-lg text-base-content no-underline transition-colors hover:bg-base-200/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
		data-sveltekit-preload-data="false"
	>
		{#if article.featuredImage}
			<figure class="aspect-video">
				<img
					src={article.featuredImage}
					alt={article.headline}
					class="h-full w-full object-cover"
				/>
			</figure>
		{/if}
		<div class="flex flex-1 flex-col gap-2">
			<!-- {#if article.category}
				<div class="badge badge-soft badge-sm">{article.category}</div>
			{/if} -->
			<h2 class="text-2xl font-semibold">{article.headline}</h2>
			<p class="text-base-content/60">{article.description}</p>
			<span class="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
				{#if publishedDate}
					<time datetime={article.publishedAt}>{publishedDate}</time>
				{/if}
				{#if publishedDate}<span aria-hidden="true">·</span>{/if}
				<time datetime={"PT" + article.readingMinutes + "M"}>
					{article.readingMinutes} min read
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
		</div>
	</a>
</article>
