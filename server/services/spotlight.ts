/**
 * Spotlight Service
 * Aggregates cross-platform hot topics
 */

import process from "node:process"
import type { NewsItem, SourceID } from "@shared/types"
import { sources } from "@shared/sources"
import { getters } from "../getters"
import { groupByTopic } from "../utils/topic-matcher"

export interface SpotlightPlatform {
  sourceId: SourceID
  sourceName: string
  rank: number
  title: string
  url: string
}

export interface SpotlightTopic {
  id: string
  keyword: string
  title: string
  platforms: SpotlightPlatform[]
  platformCount: number
  maxRank: number
  firstSeenAt: string
  updatedAt: string
}

export interface SpotlightResponse {
  topics: SpotlightTopic[]
  updatedAt: string
}

// Cache for spotlight data (in-memory for Cloudflare Workers)
let spotlightCache: {
  data: SpotlightTopic[]
  updatedAt: number
} | null = null

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get all hot list sources (type: "hottest" or weibo)
 */
function getHotListSources(): SourceID[] {
  const hotSources: SourceID[] = []
  const isCF = !!process.env.CF_PAGES

  Object.entries(sources).forEach(([id, config]) => {
    // Skip disabled sources
    if (config.disable === true || (isCF && config.disable === "cf")) {
      return
    }
    // Skip redirect sources
    if ((config as any).redirect) {
      return
    }
    // Include sources marked as "hottest" type
    if (config.type === "hottest") {
      hotSources.push(id as SourceID)
    } else if (id === "weibo") {
      // Include weibo as it's always a hot source
      hotSources.push(id as SourceID)
    }
  })

  return hotSources
}

/**
 * Fetch data from multiple sources
 */
async function fetchMultipleSources(sourceIds: SourceID[]): Promise<Array<{
  sourceId: SourceID
  items: NewsItem[]
}>> {
  const results = await Promise.allSettled(
    sourceIds.map(async (id) => {
      try {
        if (typeof getters[id] !== "function") {
          console.warn(`[Spotlight] Getter not found for ${id}`)
          return {
            sourceId: id,
            items: [],
          }
        }
        const items = await getters[id]()
        return {
          sourceId: id,
          items: items || [],
        }
      } catch (error) {
        console.error(`[Spotlight] Failed to fetch ${id}:`, error)
        return {
          sourceId: id,
          items: [],
        }
      }
    }),
  )

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value
    }
    console.error(`[Spotlight] Promise rejected for ${sourceIds[index]}:`, result.reason)
    return {
      sourceId: sourceIds[index],
      items: [],
    }
  })
}

/**
 * Get spotlight topics
 */
export async function getSpotlight(options: {
  forceRefresh?: boolean
} = {}): Promise<SpotlightResponse> {
  const now = Date.now()

  // Check cache
  if (!options.forceRefresh && spotlightCache) {
    if (now - spotlightCache.updatedAt < CACHE_TTL) {
      return {
        topics: spotlightCache.data,
        updatedAt: new Date(spotlightCache.updatedAt).toISOString(),
      }
    }
  }

  // Fetch all hot list sources
  const hotSourceIds = getHotListSources()
  const sourceData = await fetchMultipleSources(hotSourceIds)

  // Group by topic
  const topicGroups = groupByTopic(sourceData, {
    minPlatforms: 3, // Only show topics appearing on 3+ platforms
    similarityThreshold: 0.3,
  })

  // Convert to spotlight topics
  const topics: SpotlightTopic[] = topicGroups.slice(0, 10).map((group, index) => {
    // Use the title from the highest-ranked item
    const bestItem = group.items.reduce((best, item) =>
      item.rank < best.rank ? item : best,
    )

    return {
      id: `spotlight-${now}-${index}`,
      keyword: group.keyword,
      title: bestItem.title,
      platforms: group.items.map(item => ({
        sourceId: item.sourceId,
        sourceName: sources[item.sourceId].name,
        rank: item.rank,
        title: item.title,
        url: item.url,
      })),
      platformCount: group.platformCount,
      maxRank: group.maxRank,
      firstSeenAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    }
  })

  // Update cache
  spotlightCache = {
    data: topics,
    updatedAt: now,
  }

  return {
    topics,
    updatedAt: new Date(now).toISOString(),
  }
}
