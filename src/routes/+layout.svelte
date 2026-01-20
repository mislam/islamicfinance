<script lang="ts">
	import "./layout.css"

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
</script>

<Header />
<main class="pt-14">
	{@render children()}
</main>
<Footer />
