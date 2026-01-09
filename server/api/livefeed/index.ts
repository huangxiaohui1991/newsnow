/**
 * Live Feed API
 * Returns aggregated real-time news
 */

import { getLiveFeed } from "../../services/livefeed"
import { getPlatform, isCloudflare } from "../../utils/platform"

export default defineEventHandler(async (event) => {
  try {
    console.log(`[LiveFeed API] Platform: ${getPlatform()}, isCloudflare: ${isCloudflare}`)

    const query = getQuery(event)
    const category = (query.category as string) || "all"
    const limit = Number.parseInt(query.limit as string) || 50

    console.log(`[LiveFeed API] Fetching category: ${category}, limit: ${limit}`)

    const data = await getLiveFeed({
      category: category as "all" | "finance" | "tech" | "world",
      limit,
    })

    console.log(`[LiveFeed API] Success, items count: ${data.items?.length || 0}`)

    return data
  } catch (error: any) {
    console.error("[LiveFeed API] Error:", error?.message || error)
    console.error("[LiveFeed API] Stack:", error?.stack)
    console.error("[LiveFeed API] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to fetch live feed",
    })
  }
})
