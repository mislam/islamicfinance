<script lang="ts">
	// Content is sanitized via rehype-sanitize in the markdown processing pipeline
	// See: src/lib/server/articles.ts -> processMarkdown()
	let { content } = $props<{ content: string }>()
</script>

<!-- Content is sanitized server-side via rehype-sanitize before rendering -->
<div class="prose prose-lg max-w-none prose-slate dark:prose-invert">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html content}
</div>

<style>
	/* Custom styling for markdown content using CSS variables for DaisyUI compatibility */
	:global(.prose) {
		color: hsl(var(--bc));
	}

	:global(.prose h2) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		font-size: 1.875rem;
		font-weight: 700;
	}

	:global(.prose h3) {
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		font-size: 1.5rem;
		font-weight: 600;
	}

	:global(.prose h4) {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	:global(.prose p) {
		margin-bottom: 1rem;
		line-height: 1.6; /* Standard line-height for optimal readability */
	}

	:global(.prose ul),
	:global(.prose ol) {
		margin-bottom: 1rem;
		padding-left: 1.5em; /* Mobile-friendly indentation */
	}

	/* More indentation on larger screens where we have more room */
	@media (min-width: 768px) {
		:global(.prose ul),
		:global(.prose ol) {
			padding-left: 2em;
		}
	}

	:global(.prose li) {
		margin-bottom: 0.5rem;
		line-height: 1.6; /* Match paragraph line-height for consistency */
	}

	:global(.prose a) {
		color: hsl(var(--p));
		text-decoration: underline;
	}

	:global(.prose a:hover) {
		color: hsl(var(--pf));
	}

	:global(.prose code) {
		border-radius: 0.25rem;
		background-color: hsl(var(--b2));
		padding: 0.125rem 0.375rem;
		font-size: 0.875rem;
	}

	:global(.prose pre) {
		margin-bottom: 1rem;
		overflow-x: auto;
		border-radius: 0.5rem;
		background-color: hsl(var(--b2));
		padding: 1rem;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
	}

	:global(.prose blockquote) {
		margin-top: 1rem;
		margin-bottom: 1rem;
		border-left: 4px solid hsl(var(--p));
		padding-left: 1rem;
		font-style: italic;
	}

	:global(.prose img) {
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
		border-radius: 0.5rem;
	}

	:global(.prose table) {
		margin-top: 1rem;
		margin-bottom: 1rem;
		width: 100%;
		border-collapse: collapse;
	}

	:global(.prose th),
	:global(.prose td) {
		border: 1px solid hsl(var(--bc) / 0.2);
		padding: 0.5rem 1rem;
	}

	:global(.prose th) {
		background-color: hsl(var(--b2));
		font-weight: 600;
	}

	/* Remove underlines from headings that are wrapped in anchor links */
	:global(.prose h1 a),
	:global(.prose h2 a),
	:global(.prose h3 a),
	:global(.prose h4 a),
	:global(.prose h5 a),
	:global(.prose h6 a) {
		text-decoration: none;
	}

	:global(.anchor-link) {
		color: hsl(var(--bc) / 0.4);
		text-decoration: none;
	}

	:global(.anchor-link:hover) {
		color: hsl(var(--p));
	}
</style>
