/**
 * Live Feed Service
 * Aggregates real-time news from all realtime sources
 */

import type { SourceID } from "@shared/types"
import { sources } from "@shared/sources"
import { getters } from "../getters"

export interface LiveFeedItem {
  id: string
  sourceId: SourceID
  sourceName: string
  sourceColor: string
  title: string
  url: string
  mobileUrl?: string
  pubDate: string
  extra?: {
    info?: string
  }
}

export interface LiveFeedResponse {
  items: LiveFeedItem[]
  hasMore: boolean
  updatedAt: string
}

// Get all realtime sources
function getRealtimeSources(): SourceID[] {
  const realtimeSources: SourceID[] = []

  Object.entries(sources).forEach(([id, config]) => {
    // Include sources marked as "realtime" type, but skip if it's a redirect source
    if (config.type === "realtime" && !(config as any).redirect) {
      realtimeSources.push(id as SourceID)
    }
  })

  return realtimeSources
}

// Get category for a source
function getSourceCategory(sourceId: SourceID): "all" | "finance" | "tech" | "world" {
  const source = sources[sourceId]

  // Check if it's a sub-source
  if (sourceId.includes("-")) {
    const mainId = sourceId.split("-")[0] as SourceID
    const mainSource = sources[mainId]
    if (mainSource?.column === "finance") return "finance"
    if (mainSource?.column === "tech") return "tech"
    if (mainSource?.column === "world") return "world"
  }

  // Check main source
  if (source?.column === "finance") return "finance"
  if (source?.column === "tech") return "tech"
  if (source?.column === "world") return "world"

  return "all"
}

/**
 * Fetch and aggregate live feed items
 */
export async function getLiveFeed(options: {
  category?: "all" | "finance" | "tech" | "world"
  limit?: number
} = {}): Promise<LiveFeedResponse> {
  const { category = "all", limit = 50 } = options

  // 1. Get all realtime sources
  const realtimeSourceIds = getRealtimeSources()

  // 2. Filter by category if needed
  const sourceIds = category === "all"
    ? realtimeSourceIds
    : realtimeSourceIds.filter(id => getSourceCategory(id) === category)

  // 3. Fetch data from all sources
  const sourceData = await Promise.allSettled(
    sourceIds.map(async (id) => {
      try {
        if (typeof getters[id] !== "function") throw new Error(`Getter not found for ${id}`)
        const items = await getters[id]()
        return {
          sourceId: id,
          items,
        }
      } catch (error) {
        console.error(`Failed to fetch ${id}:`, error)
        return {
          sourceId: id,
          items: [],
        }
      }
    }),
  )

  // 4. Merge and sort by time
  const allItems = sourceData
    .flatMap((result, index) => {
      if (result.status === "fulfilled") {
        const sourceId = sourceIds[index]
        return result.value.items.map((item, itemIndex) => ({
          id: `livefeed-${sourceId}-${item.id || itemIndex}`,
          sourceId,
          sourceName: sources[sourceId]?.name || sourceId,
          sourceColor: sources[sourceId]?.color || "gray",
          title: item.title,
          url: item.url,
          mobileUrl: item.mobileUrl,
          pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          extra: {
            ...item.extra,
            info: typeof item.extra?.info === "string" ? item.extra.info : undefined,
          },
        }))
      }
      return []
    })
    .sort((a, b) => {
      // Sort by pubDate descending (newest first)
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    })
    .slice(0, limit)

  return {
    items: allItems,
    hasMore: allItems.length === limit,
    updatedAt: new Date().toISOString(),
  }
}
