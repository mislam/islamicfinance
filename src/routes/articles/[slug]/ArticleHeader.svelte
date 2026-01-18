<script lang="ts">
	import { format } from "date-fns"

	import type { ArticleMetadata } from "$lib/server/articles"

	let { article } = $props<{ article: ArticleMetadata }>()

	// Format dates - will use user's timezone on client after hydration
	// Note: For date-only formats (no time), timezone usually doesn't change the displayed date
	// unless the date crosses midnight boundaries in different timezones
	const publishedDate = $derived(
		article.publishedAt ? format(new Date(article.publishedAt), "MMMM d, yyyy") : null,
	)

	// const updatedDate = $derived(
	// 	article.updatedAt && article.updatedAt !== article.publishedAt
	// 		? format(new Date(article.updatedAt), "MMMM d, yyyy")
	// 		: null,
	// )
</script>

<header class="mb-6 border-b border-base-content/10 pb-6">
	{#if article.category}
		<div class="mb-4">
			<span class="badge badge-outline badge-lg">{article.category}</span>
		</div>
	{/if}

	<h1 class="mb-4 text-4xl leading-tight font-bold">{article.headline}</h1>

	<p class="mb-6 text-xl text-base-content/70">{article.description}</p>

	<div class="flex flex-wrap items-center gap-2 text-base-content/70">
		{#if publishedDate}
			<time datetime={article.publishedAt}>{publishedDate}</time>
		{/if}
		{#if publishedDate}
			<span aria-hidden="true">·</span>
		{/if}
		<time datetime={"PT" + article.readingMinutes + "M"}>{article.readingMinutes} min read</time>

		<!-- {#if updatedDate}
			<span>
				Updated: <time datetime={article.updatedAt}>{updatedDate}</time>
			</span>
		{/if} -->
	</div>
</header>
