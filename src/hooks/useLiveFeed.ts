import { useInfiniteQuery } from "@tanstack/react-query"

export interface LiveFeedItem {
  id: string
  sourceId: string
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

export function useLiveFeedInfiniteQuery(options?: {
  category?: "all" | "finance" | "tech" | "world"
  enabled?: boolean
}) {
  const {
    category = "all",
    enabled = true,
  } = options || {}

  return useInfiniteQuery({
    queryKey: ["livefeed-infinite", category],
    queryFn: async ({ pageParam = 50 }) => {
      const response = await myFetch(`/api/livefeed?category=${category}&limit=${pageParam}`) as LiveFeedResponse
      return response
    },
    initialPageParam: 50,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      return (allPages.length + 1) * 50
    },
    enabled,
    staleTime: 30 * 1000,
  })
}
