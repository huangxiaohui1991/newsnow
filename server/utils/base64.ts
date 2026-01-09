/**
 * Base64 encoding/decoding utilities
 * Compatible with Cloudflare Workers, Node.js, Deno, and Bun
 */

/**
 * Decode a base64 URL-encoded string
 * @param str - Base64 URL-encoded string
 * @returns Decoded string
 */
export function decodeBase64URL(str: string): string {
  // Decode URI component first
  const decoded = decodeURIComponent(str)

  // Use Web API btoa/atob (works in Cloudflare Workers, browsers, and modern Node.js)
  try {
    // Use atob to decode base64
    const binaryString = atob(decoded)
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    // Decode to string
    return new TextDecoder().decode(bytes)
  } catch (error) {
    throw new Error(`Failed to decode base64 URL: ${error}`)
  }
}

/**
 * Encode a string to base64 URL format
 * @param str - String to encode
 * @returns Base64 URL-encoded string
 */
export function encodeBase64URL(str: string): string {
  try {
    // Convert string to binary
    const bytes = new TextEncoder().encode(str)
    // Convert bytes to binary string
    const binaryString = String.fromCharCode(...bytes)
    // Encode to base64
    const base64 = btoa(binaryString)
    // Encode URI component
    return encodeURIComponent(base64)
  } catch (error) {
    throw new Error(`Failed to encode base64 URL: ${error}`)
  }
}

/**
 * Decode a base64 string
 * @param str - Base64 string
 * @returns Decoded string
 */
export function decodeBase64(str: string): string {
  try {
    const binaryString = atob(str)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error}`)
  }
}

/**
 * Encode a string to base64
 * @param str - String to encode
 * @returns Base64-encoded string
 */
export function encodeBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str)
    const binaryString = String.fromCharCode(...bytes)
    return btoa(binaryString)
  } catch (error) {
    throw new Error(`Failed to encode base64: ${error}`)
  }
}
