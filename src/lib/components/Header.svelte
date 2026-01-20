<script lang="ts">
	import { MenuIcon, XIcon } from "@lucide/svelte"
	import { tick } from "svelte"

	import { resolve } from "$app/paths"
	import { page } from "$app/state"
	import Logo from "$lib/components/Logo.svelte"

	const pathname = $derived(page.url.pathname)
	let open = $state(false)
	let menuButton: HTMLButtonElement | undefined
	let headerVisible = $state(true)
	let lastScrollY = 0
	let scrollRafId = 0

	const navLinks = [
		{ path: "/articles", label: "Articles", match: "prefix" },
		{ path: "/islamic-mortgage-calculator", label: "Mortgage Calculator", match: "exact" },
		{ path: "/loan-agreement-generator", label: "Loan Contract", match: "exact" },
	] as const

	function toggleMenu() {
		open = !open
		if (open) {
			tick().then(() => document.querySelector<HTMLAnchorElement>("#main-nav a")?.focus())
		}
	}

	function closeMenu() {
		open = false
		tick().then(() => menuButton?.focus())
	}

	// Escape to close drawer
	$effect(() => {
		if (!open) return
		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeMenu()
		}
		document.addEventListener("keydown", onKeydown)
		return () => document.removeEventListener("keydown", onKeydown)
	})

	// Body scroll lock when drawer is open
	$effect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = "hidden"
		return () => {
			document.body.style.overflow = prev || ""
		}
	})

	// Close drawer when resizing to desktop
	$effect(() => {
		const mql = window.matchMedia("(min-width: 768px)")
		const handler = () => {
			if (mql.matches) open = false
		}
		mql.addEventListener("change", handler)
		return () => mql.removeEventListener("change", handler)
	})

	// Hide header on scroll down, show on scroll up (always show when near top)
	const SCROLL_TOP_THRESHOLD = 20
	const SCROLL_DELTA_THRESHOLD = 10

	$effect(() => {
		if (typeof window === "undefined") return
		lastScrollY = window.scrollY

		const onScroll = () => {
			if (open) return // keep header visible while mobile drawer is open
			if (scrollRafId) return // coalesce: at most one update per frame
			scrollRafId = requestAnimationFrame(() => {
				scrollRafId = 0
				const y = window.scrollY
				if (y <= SCROLL_TOP_THRESHOLD) {
					headerVisible = true
					lastScrollY = y
					return
				}
				const delta = y - lastScrollY
				if (delta > SCROLL_DELTA_THRESHOLD) headerVisible = false
				else if (delta < -SCROLL_DELTA_THRESHOLD) headerVisible = true
				lastScrollY = y
			})
		}

		window.addEventListener("scroll", onScroll, { passive: true })
		return () => {
			if (scrollRafId) cancelAnimationFrame(scrollRafId)
			scrollRafId = 0
			window.removeEventListener("scroll", onScroll)
		}
	})
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 bg-base-100 transition-transform duration-200 ease-out"
	class:-translate-y-full={!headerVisible}
>
	<nav
		aria-label="Main navigation"
		class="flex h-14 items-center justify-between border-b border-base-content/10 px-5 text-base-content md:px-6"
	>
		<a
			href={resolve("/")}
			aria-current={pathname === "/" ? "page" : undefined}
			aria-label="Islamic Finance homepage"
			class="inline-flex items-center"
		>
			<Logo class="h-5 w-auto" />
		</a>

		<button
			type="button"
			class="-mr-2 flex size-12 shrink-0 items-center justify-center md:hidden"
			aria-expanded={open}
			aria-controls="main-nav"
			aria-label={open ? "Close menu" : "Open menu"}
			onclick={toggleMenu}
			bind:this={menuButton}
		>
			{#if open}
				<XIcon aria-hidden="true" size={32} />
			{:else}
				<MenuIcon aria-hidden="true" size={32} />
			{/if}
		</button>

		{#if open}
			<div
				class="fixed inset-0 top-14 z-40 bg-black/50 md:hidden"
				aria-hidden="true"
				onclick={closeMenu}
			></div>
		{/if}

		<div
			id="main-nav"
			class="{open
				? 'fixed inset-x-0 top-14 z-50 flex flex-col gap-4 bg-base-100 p-6'
				: 'hidden'} md:static md:z-auto md:flex md:flex-row md:gap-x-6 md:gap-y-2 md:bg-transparent md:p-0"
		>
			<ul
				class="flex flex-col items-center gap-4 text-lg text-base-content/70 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2 md:text-base"
			>
				{#each navLinks as item (item.path)}
					{@const href = resolve(item.path)}
					{@const isCurrent =
						item.match === "prefix"
							? pathname === href || pathname.startsWith(href + "/")
							: pathname === href}
					<li>
						<a
							{href}
							aria-current={isCurrent ? "page" : undefined}
							class:current={isCurrent}
							onclick={() => (open = false)}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
</header>

<style lang="postcss">
	nav a.current {
		color: var(--color-base-content);
		@media (min-width: 768px) {
			border-top: 4px solid var(--color-base-content);
			padding-top: 14px;
		}
	}
</style>
