/**
 * Platform detection and compatibility utilities
 * Provides a unified API for different runtimes: Node.js, Cloudflare Workers, Deno, Bun
 */

/**
 * Platform detection flags
 */
export const isCloudflare = typeof caches !== "undefined" && typeof (caches as any).default !== "undefined"
// eslint-disable-next-line node/prefer-global/process
export const isNode = typeof process !== "undefined" && process.versions && process.versions.node !== undefined
export const isDeno = typeof Deno !== "undefined"
export const isBun = typeof Bun !== "undefined"

/**
 * Get current platform name
 */
export function getPlatform(): string {
  if (isCloudflare) return "cloudflare"
  if (isNode) return "node"
  if (isDeno) return "deno"
  if (isBun) return "bun"
  return "unknown"
}

/**
 * Get environment variable (compatible across platforms)
 * @param key - Environment variable name
 * @returns Environment variable value or undefined
 */
export function getEnv(key: string): string | undefined {
  // Cloudflare Workers and Node.js both support process.env via polyfills
  // But we should also check globalThis for Workers bindings
  if (isCloudflare) {
    // In Cloudflare Workers, bindings might be on globalThis
    const value = (globalThis as any)[key]
    if (value !== undefined) return value
  }

  // Fallback to process.env (works in Node.js and Cloudflare via unenv)
  // eslint-disable-next-line node/prefer-global/process
  return process.env[key]
}

/**
 * Standard fetch wrapper (compatible across platforms)
 * Uses native fetch in all modern runtimes
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function standardFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // All modern platforms (Node.js 18+, Cloudflare Workers, Deno, Bun) have native fetch
  if (typeof fetch !== "undefined") {
    return fetch(url, options)
  }

  // Fallback for older Node.js versions (shouldn't happen with Node.js 20+)
  throw new Error("Fetch API not available in this environment")
}

/**
 * Decode text from Uint8Array (compatible across platforms)
 * Uses TextDecoder which is available in all modern runtimes
 * @param uint8Array - Byte array to decode
 * @param charset - Character set (default: utf-8)
 * @returns Decoded string
 */
export function decodeText(uint8Array: Uint8Array, charset = "utf-8"): string {
  // TextDecoder is available in Cloudflare Workers, Deno, Bun, and Node.js 11+
  if (typeof TextDecoder !== "undefined") {
    try {
      const decoder = new TextDecoder(charset, { fatal: true })
      return decoder.decode(uint8Array)
    } catch {
      // Fallback to non-strict mode
      const fallbackDecoder = new TextDecoder("utf-8")
      return fallbackDecoder.decode(uint8Array)
    }
  }

  // Should not happen with modern Node.js versions
  throw new Error("TextDecoder not available in this environment")
}

/**
 * Convert ArrayBuffer to Uint8Array (compatible across platforms)
 * @param buffer - ArrayBuffer to convert
 * @returns Uint8Array
 */
export function toUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer)
}

/**
 * Log platform information (useful for debugging)
 */
export function logPlatformInfo(): void {
  const platform = getPlatform()
  console.log(`[Platform] Running on: ${platform}`)
  console.log(`[Platform] isCloudflare: ${isCloudflare}`)
  console.log(`[Platform] isNode: ${isNode}`)
  console.log(`[Platform] isDeno: ${isDeno}`)
  console.log(`[Platform] isBun: ${isBun}`)
}
