<script lang="ts">
	import { resolve } from "$app/paths"

	const year = new Date().getFullYear()
</script>

<footer class="border-t border-base-content/10 px-5 py-4 text-sm text-base-content/70 md:px-6">
	<nav aria-label="Footer" class="flex flex-wrap justify-center gap-x-4 gap-y-1">
		<a href={resolve("/")}>Home</a>
		<a href={resolve("/articles")}>Articles</a>
		<a href={resolve("/islamic-mortgage-calculator")}>Mortgage Calculator</a>
		<a href={resolve("/loan-agreement-generator")}>Loan Contract</a>
	</nav>
	<p class="mt-2 text-center">© {year} Islamic Finance</p>
</footer>
