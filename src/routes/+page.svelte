<script lang="ts">
	import { authClient } from "$lib/client"

	const session = authClient.useSession()

	async function signInWithGoogle() {
		await authClient.signIn.social({
			provider: "google",
		})
	}

	async function signOut() {
		await authClient.signOut()
	}
</script>

<div class="flex h-screen flex-col items-center justify-center">
	{#if $session.data}
		<div class="flex flex-col items-center justify-center gap-2">
			<p>
				Welcome, {$session.data.user.name}
			</p>
			<button onclick={signOut} class="rounded-md bg-red-500 px-2 py-1 text-white">Sign Out</button>
		</div>
	{:else}
		<button onclick={signInWithGoogle} class="rounded-md bg-blue-500 px-2 py-1 text-white">
			Continue with Google
		</button>
	{/if}
</div>
