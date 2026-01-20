<script lang="ts">
	import { resolve } from "$app/paths"
	import type { ArticleMetadata } from "$lib/server/articles"

	let { article } = $props<{ article: ArticleMetadata }>()

	function getTagUrl(tag: string): string {
		return `${resolve("/articles")}?tag=${encodeURIComponent(tag)}`
	}
</script>

<footer class="mt-6 border-t border-base-content/10 pt-6">
	{#if article.tags.length > 0}
		<div class="flex flex-wrap gap-2" aria-label="Article tags">
			{#each article.tags as tag (tag)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={getTagUrl(tag)} class="badge badge-outline badge-sm hover:badge-primary">
					{tag}
				</a>
			{/each}
		</div>
	{/if}
</footer>
