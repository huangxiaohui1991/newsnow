/**
 * Spotlight API
 * Returns cross-platform hot topics
 */

import { getSpotlight } from "../../services/spotlight"
import { getPlatform, isCloudflare } from "../../utils/platform"

export default defineEventHandler(async (event) => {
  try {
    console.log(`[Spotlight API] Platform: ${getPlatform()}, isCloudflare: ${isCloudflare}`)

    const query = getQuery(event)
    const forceRefresh = query.refresh === "true"

    console.log(`[Spotlight API] Fetching, forceRefresh: ${forceRefresh}`)

    const data = await getSpotlight({ forceRefresh })

    console.log(`[Spotlight API] Success, topics count: ${data.topics?.length || 0}`)

    return data
  } catch (error: any) {
    console.error("[Spotlight API] Error:", error?.message || error)
    console.error("[Spotlight API] Stack:", error?.stack)
    console.error("[Spotlight API] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to fetch spotlight topics",
    })
  }
})
