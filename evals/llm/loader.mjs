import { resolve as resolvePath } from "node:path"
import { pathToFileURL, fileURLToPath } from "node:url"
import { existsSync } from "node:fs"

const ROOT = resolvePath(fileURLToPath(import.meta.url), "..", "..", "..")

export function resolve(specifier, context, nextResolve) {
  let resolved = specifier

  // Resolve @/ alias to project root
  if (specifier.startsWith("@/")) {
    resolved = pathToFileURL(resolvePath(ROOT, specifier.slice(2))).href
  }

  // Try adding .ts extension for extensionless imports
  if (
    !resolved.endsWith(".ts") &&
    !resolved.endsWith(".js") &&
    !resolved.endsWith(".mjs") &&
    !resolved.endsWith(".json")
  ) {
    const asFileURL = resolved.startsWith("file://")
      ? resolved
      : context.parentURL
        ? new URL(resolved, context.parentURL).href
        : resolved

    try {
      const filePath = fileURLToPath(asFileURL)
      if (existsSync(filePath + ".ts")) {
        return nextResolve(asFileURL + ".ts", context)
      }
      // Check for index.ts in directory
      if (existsSync(resolvePath(filePath, "index.ts"))) {
        return nextResolve(
          pathToFileURL(resolvePath(filePath, "index.ts")).href,
          context,
        )
      }
    } catch {
      // Not a file URL, skip
    }
  }

  return nextResolve(resolved, context)
}
