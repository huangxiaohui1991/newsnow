/**
 * Spotlight Hook
 * Fetches cross-platform hot topics
 */

import { useQuery } from "@tanstack/react-query"

export interface SpotlightPlatform {
  sourceId: string
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

export function useSpotlightQuery(options?: {
  enabled?: boolean
  refetchInterval?: number
}) {
  const { enabled = true, refetchInterval = 5 * 60 * 1000 } = options || {}

  return useQuery({
    queryKey: ["spotlight"],
    queryFn: async () => {
      const response = await myFetch("/api/spotlight") as SpotlightResponse
      return response
    },
    refetchInterval,
    staleTime: 4 * 60 * 1000, // 4 minutes
    enabled,
    retry: 2,
  })
}
