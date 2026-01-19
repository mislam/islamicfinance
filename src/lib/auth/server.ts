import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { sveltekitCookies } from "better-auth/svelte-kit"

import { getRequestEvent } from "$app/server"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private"
import { db } from "$lib/server/db"

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // PostgreSQL
		usePlural: true, // Plural table names (users, sessions, accounts, verifications)
	}),
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID as string,
			clientSecret: GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [sveltekitCookies(getRequestEvent)], // Make sure this is the last plugin in the array
})
