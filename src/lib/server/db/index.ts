import { neon } from "@neondatabase/serverless"
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"

import * as schema from "./schema"

// Environment detection that works in both SvelteKit runtime and CLI contexts
// SvelteKit: use $env/static/private
// CLI: fall back to process.env
let dev: boolean
let DATABASE_URL: string

try {
	// Try SvelteKit's environment system first (works in SvelteKit runtime)
	const { dev: svelteDev } = await import("$app/environment")
	const { DATABASE_URL: svelteDbUrl } = await import("$env/static/private")
	dev = svelteDev
	DATABASE_URL = svelteDbUrl
} catch {
	// Fallback for CLI contexts (Better Auth CLI, Drizzle CLI, etc.)
	// In CLI, process.env is populated from .env files by the CLI tool
	dev = process.env.NODE_ENV !== "production"
	DATABASE_URL = process.env.DATABASE_URL || ""
}

if (!DATABASE_URL) throw new Error("DATABASE_URL environment variable is not set!")

export const db = dev
	? drizzlePg(DATABASE_URL, { schema })
	: drizzleNeon(neon(DATABASE_URL), { schema })

export * from "./schema"
