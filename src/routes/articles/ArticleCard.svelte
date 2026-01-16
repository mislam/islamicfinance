<script lang="ts">
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

<article class="card-bordered card bg-base-100 shadow-sm transition-shadow hover:shadow-md">
	{#if article.featuredImage}
		<figure class="aspect-video">
			<img src={article.featuredImage} alt={article.title} class="h-full w-full object-cover" />
		</figure>
	{/if}
	<div class="card-body">
		{#if article.category}
			<div class="mb-2 badge badge-outline badge-sm">{article.category}</div>
		{/if}
		<h2 class="card-title text-xl">
			<a href={resolve(`/articles/${article.slug}`)} class="link link-hover">
				{article.title}
			</a>
		</h2>
		<p class="line-clamp-3 text-sm text-base-content/70">{article.description}</p>
		<div class="mt-4 card-actions flex items-center justify-between">
			<div class="flex flex-wrap gap-2">
				{#each article.tags.slice(0, 3) as tag (tag)}
					<span class="badge badge-ghost badge-sm">{tag}</span>
				{/each}
			</div>
			{#if publishedDate}
				<time class="text-xs text-base-content/50" datetime={article.publishedAt || undefined}>
					{publishedDate}
				</time>
			{/if}
		</div>
	</div>
</article>
