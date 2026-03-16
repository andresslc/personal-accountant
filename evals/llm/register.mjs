import { register } from "node:module"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

// Load .env.local into process.env
const root = resolve(fileURLToPath(import.meta.url), "..", "..", "..")
try {
  const envContent = readFileSync(resolve(root, ".env.local"), "utf-8")
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
} catch {}

// Register tsx for TypeScript transpilation
import { register as tsxRegister } from "tsx/esm/api"
tsxRegister()
// Register custom loader for @/ path aliases and .ts extension resolution
register("./loader.mjs", import.meta.url)
