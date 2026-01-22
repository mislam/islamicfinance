<script lang="ts">
	import "./layout.css"

	import { resolve } from "$app/paths"
	import { page } from "$app/state"
	import { trackPageView } from "$lib/analytics"
	import Footer from "$lib/components/Footer.svelte"
	import Header from "$lib/components/Header.svelte"

	let { children } = $props()

	// Track page views on navigation
	$effect(() => {
		if (page.url.pathname) {
			trackPageView(page.url.pathname)
		}
	})

	// RSS feed URL for auto-discovery
	const rssUrl = $derived(`${page.url.origin}${resolve("/rss.xml")}`)
</script>

<svelte:head>
	<!-- RSS Feed -->
	<link rel="alternate" type="application/rss+xml" title="Islamic Finance RSS Feed" href={rssUrl} />
</svelte:head>

<Header />
<main class="pt-14">
	{@render children()}
</main>
<Footer />
