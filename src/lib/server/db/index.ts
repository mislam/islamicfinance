import { neon } from "@neondatabase/serverless"
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"

import { dev } from "$app/environment"
import { DATABASE_URL } from "$env/static/private"

import * as schema from "./schema"

if (!DATABASE_URL) throw new Error("DATABASE_URL environment variable is not set!")

export const db = dev
	? drizzlePg(DATABASE_URL, { schema })
	: drizzleNeon(neon(DATABASE_URL), { schema })

export * from "./schema"
