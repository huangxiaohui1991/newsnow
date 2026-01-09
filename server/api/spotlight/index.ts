/**
 * Spotlight API
 * Returns cross-platform hot topics
 */

import { getSpotlight } from "../../services/spotlight"

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const forceRefresh = query.refresh === "true"

    const data = await getSpotlight({ forceRefresh })

    return data
  } catch (error: any) {
    console.error("[Spotlight API] Error:", error?.message || error)
    console.error("[Spotlight API] Stack:", error?.stack)
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to fetch spotlight topics",
    })
  }
})
