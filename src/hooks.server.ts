// Auth is currently disabled - uncomment below to enable
// import { svelteKitHandler } from "better-auth/svelte-kit"
// import { building } from "$app/environment"
// import { auth } from "$lib/auth"

export async function handle({ event, resolve }) {
	// Auth disabled - pass through to SvelteKit's default handler
	// To enable auth, uncomment the import statements above and the code below:
	// return svelteKitHandler({ auth, event, resolve, building })
	return resolve(event)
}
