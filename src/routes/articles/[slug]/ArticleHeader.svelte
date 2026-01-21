<script lang="ts">
	import { EyeIcon } from "@lucide/svelte"
	import { format } from "date-fns"

	import type { ArticleMetadata } from "$lib/server/articles"
	import { formatReadingTime, readingMins } from "$lib/utils/reading-time"

	let { article } = $props<{ article: ArticleMetadata }>()

	// Show "Updated" if updatedAt differs from publishedAt, otherwise "Published"
	const dateLabel = $derived(
		article.publishedAt && article.updatedAt !== article.publishedAt
			? { label: "Updated", value: article.updatedAt }
			: article.publishedAt
				? { label: "Published", value: article.publishedAt }
				: { label: "Updated", value: article.updatedAt }, // Fallback if publishedAt missing
	)
	const dateFormatted = $derived(format(new Date(dateLabel.value), "MMM d, yyyy"))
</script>

<header>
	<!-- {#if article.category}
		<div class="mb-4">
			<span class="badge badge-soft badge-lg">{article.category}</span>
		</div>
	{/if} -->

	<h1 class="mb-4 text-4xl leading-tight font-bold">{article.headline}</h1>

	<p class="mb-6 text-xl text-base-content/70">{article.description}</p>

	<div class="flex flex-wrap items-center gap-2 text-base-content/70">
		<time datetime={"PT" + readingMins(article.readingSeconds) + "M"}>
			{formatReadingTime(article.readingSeconds)}
		</time>
		<span aria-hidden="true">·</span>
		<time datetime={dateLabel.value}>{dateLabel.label} {dateFormatted}</time>
		{#if article.viewCount > 0}
			<span
				class="ml-2 inline-flex items-center gap-1"
				aria-label={article.viewCount === 1 ? "1 view" : `${article.viewCount} views`}
			>
				<EyeIcon size={14} aria-hidden="true" />{article.viewCount}
			</span>
		{/if}
	</div>
</header>
