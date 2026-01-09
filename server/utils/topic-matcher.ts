/**
 * Topic Matching Utility
 * Groups similar topics across different platforms using similarity algorithms
 */

import type { NewsItem, SourceID } from "@shared/types"
import { extractKeywords, normalizeKeyword } from "./keyword-extractor"

export interface TopicItem {
  sourceId: SourceID
  rank: number
  title: string
  url: string
  keywords: string[]
  pubDate?: number | string
}

export interface TopicGroup {
  keyword: string // Representative keyword
  items: TopicItem[]
  platformCount: number
  maxRank: number // Highest rank (smaller is better)
}

/**
 * Calculate Jaccard similarity between two keyword arrays
 * @returns 0-1, where 1 means identical, 0 means no overlap
 *
 * @example calculateSimilarity(['苹果', '发布会'], ['苹果', '发布会']) => 1
 * @example calculateSimilarity(['苹果'], ['华为']) => 0
 * @example calculateSimilarity(['苹果', '发布会'], ['苹果', '手机']) => 0.33
 */
export function calculateSimilarity(
  keywords1: string[],
  keywords2: string[],
): number {
  const set1 = new Set(keywords1.map(normalizeKeyword))
  const set2 = new Set(keywords2.map(normalizeKeyword))

  if (set1.size === 0 && set2.size === 0) return 0

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return union.size === 0 ? 0 : intersection.size / union.size
}

/**
 * Check if two topics should be grouped together
 */
export function shouldGroup(
  keywords1: string[],
  keywords2: string[],
  threshold = 0.3,
): boolean {
  return calculateSimilarity(keywords1, keywords2) >= threshold
}

/**
 * Group news items by topic similarity
 * Uses a greedy clustering algorithm
 */
export function groupByTopic(
  allNews: Array<{
    sourceId: SourceID
    items: NewsItem[]
  }>,
  options: {
    minPlatforms?: number // Minimum platforms to be considered a cross-platform topic
    similarityThreshold?: number // Similarity threshold for grouping
  } = {},
): TopicGroup[] {
  const { minPlatforms = 3, similarityThreshold = 0.3 } = options

  // 1. Extract all news items with keywords
  const items: TopicItem[] = []
  allNews.forEach(({ sourceId, items: sourceItems }) => {
    sourceItems.forEach((item, index) => {
      items.push({
        sourceId,
        rank: index + 1,
        title: item.title,
        url: item.url,
        keywords: extractKeywords(item.title),
        pubDate: item.pubDate,
      })
    })
  })

  // 2. Greedy clustering
  const groups: TopicGroup[] = []
  const used = new Set<number>()

  items.forEach((item, itemIndex) => {
    if (used.has(itemIndex)) return

    // Start a new group
    const group: TopicGroup = {
      keyword: item.keywords[0] || item.title.slice(0, 20),
      items: [item],
      platformCount: 1,
      maxRank: item.rank,
    }

    used.add(itemIndex)

    // Find similar items
    items.forEach((otherItem, otherIndex) => {
      if (used.has(otherIndex)) return
      if (otherItem.sourceId === item.sourceId) return // Skip same platform

      if (shouldGroup(item.keywords, otherItem.keywords, similarityThreshold)) {
        group.items.push(otherItem)
        group.platformCount++
        group.maxRank = Math.min(group.maxRank, otherItem.rank)
        used.add(otherIndex)
      }
    })

    groups.push(group)
  })

  // 3. Filter groups that appear on multiple platforms
  return groups
    .filter(g => g.platformCount >= minPlatforms)
    .sort((a, b) => {
      // Sort by platform count (desc), then by max rank (asc)
      if (b.platformCount !== a.platformCount) {
        return b.platformCount - a.platformCount
      }
      return a.maxRank - b.maxRank
    })
}
