<script lang="ts">
	import "./layout.css"

	import { page } from "$app/state"
	import { trackPageView } from "$lib/analytics"

	let { children } = $props()

	// Track page views on navigation
	$effect(() => {
		if (page.url.pathname) {
			trackPageView(page.url.pathname)
		}
	})
</script>

{@render children()}
