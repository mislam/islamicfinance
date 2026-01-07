#!/usr/bin/env node

import crypto from "crypto"
import fs from "fs"
import path from "path"

const red = "\x1b[31m"
const green = "\x1b[32m"
const yellow = "\x1b[33m"
const reset = "\x1b[0m"

const generateBase62Secret = (length = 64) => {
	const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	let secret = ""
	const bytes = crypto.randomBytes(length)
	for (let i = 0; i < length; i++) {
		secret += chars[bytes[i] % 62]
	}
	return secret
}

const updateBetterAuthSecret = () => {
	const envFile = path.join(process.cwd(), ".env")

	if (!fs.existsSync(envFile)) {
		throw new Error(".env file not found")
	}

	let content = fs.readFileSync(envFile, "utf8")
	const newSecret = generateBase62Secret(64)
	const secretRegex = /^BETTER_AUTH_SECRET=.*$/m

	if (secretRegex.test(content)) {
		content = content.replace(secretRegex, `BETTER_AUTH_SECRET=${newSecret}`)
	} else {
		throw new Error("BETTER_AUTH_SECRET not found in .env")
	}

	fs.writeFileSync(envFile, content)

	console.log(
		`${green}✓${reset} Generated new BETTER_AUTH_SECRET ${green}${newSecret.substring(0, 20)}...${reset}`,
	)
	console.log(`  Length: 64 characters (~380 bits entropy)`)
	console.log(`  ${yellow}Updated .env with the new secret${reset}`)
}

try {
	updateBetterAuthSecret()
} catch (error) {
	console.error(`${red}${error.message}${reset}`)
}
