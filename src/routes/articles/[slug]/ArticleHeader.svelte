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

	const updatedDate = $derived(
		article.updatedAt && article.updatedAt !== article.publishedAt
			? format(new Date(article.updatedAt), "MMMM d, yyyy")
			: null,
	)

	function getTagUrl(tag: string): string {
		return `${resolve("/articles")}?tag=${tag}`
	}
</script>

<header class="mb-8">
	{#if article.category}
		<div class="mb-4">
			<span class="badge badge-lg badge-primary">{article.category}</span>
		</div>
	{/if}

	<h1 class="mb-4 text-4xl leading-tight font-bold">{article.title}</h1>

	<p class="mb-6 text-xl text-base-content/70">{article.description}</p>

	<div class="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
		{#if article.author}
			<div class="flex items-center gap-2">
				<span>By</span>
				<span class="font-semibold">{article.author}</span>
			</div>
		{/if}

		{#if publishedDate}
			<time datetime={article.publishedAt || undefined}>{publishedDate}</time>
		{/if}

		{#if updatedDate}
			<span>Updated: {updatedDate}</span>
		{/if}
	</div>

	{#if article.tags.length > 0}
		<div class="mt-4 flex flex-wrap gap-2">
			{#each article.tags as tag (tag)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={getTagUrl(tag)} class="badge badge-outline badge-sm hover:badge-primary">
					{tag}
				</a>
			{/each}
		</div>
	{/if}
</header>
