<script lang="ts">
	import type { SEOData } from "./types"

	interface Props {
		seo: SEOData
		siteName?: string
		author?: string
		locale?: string
	}

	let {
		seo,
		siteName = "Islamic Finance",
		author = "Islamic Finance",
		locale = "en_US",
	}: Props = $props()
</script>

<svelte:head>
	<title>{seo.title}</title>

	<!-- Primary Meta Tags -->
	<meta name="title" content={seo.title} />
	<meta name="description" content={seo.description} />
	{#if seo.keywords}
		<meta name="keywords" content={seo.keywords} />
	{/if}
	<meta name="author" content={author} />
	<meta name="robots" content="index, follow" />
	<meta name="language" content="English" />
	<link rel="canonical" href={seo.pageUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={seo.ogType || "website"} />
	<meta property="og:url" content={seo.pageUrl} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content={locale} />
	{#if seo.ogImage}
		<meta property="og:image" content={seo.ogImage} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content={seo.title} />
	{/if}

	<!-- Article-specific Open Graph meta tags -->
	{#if seo.ogType === "article"}
		{#if seo.articlePublishedTime}
			<meta property="article:published_time" content={seo.articlePublishedTime} />
		{/if}
		{#if seo.articleModifiedTime}
			<meta property="article:modified_time" content={seo.articleModifiedTime} />
		{/if}
		{#if seo.articleAuthor}
			<meta property="article:author" content={seo.articleAuthor} />
		{/if}
		{#if seo.articleSection}
			<meta property="article:section" content={seo.articleSection} />
		{/if}
		{#if seo.articleTags}
			{#each seo.articleTags as tag (tag)}
				<meta property="article:tag" content={tag} />
			{/each}
		{/if}
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={seo.pageUrl} />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	{#if seo.twitterImage}
		<meta name="twitter:image" content={seo.twitterImage} />
	{/if}

	<!-- Structured Data (JSON-LD) -->
	{#if seo.structuredDataHtml}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html seo.structuredDataHtml}
	{/if}
</svelte:head>
