/**
 * Live Feed API
 * Returns aggregated real-time news
 */

import { getLiveFeed } from "../../services/livefeed"

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const category = (query.category as string) || "all"
    const limit = Number.parseInt(query.limit as string) || 50

    const data = await getLiveFeed({
      category: category as "all" | "finance" | "tech" | "world",
      limit,
    })

    return data
  } catch (error: any) {
    console.error("[LiveFeed API] Error:", error?.message || error)
    console.error("[LiveFeed API] Stack:", error?.stack)
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to fetch live feed",
    })
  }
})
