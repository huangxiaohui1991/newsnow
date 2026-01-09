/**
 * Live Feed Component
 * Displays aggregated real-time news stream
 */

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { clsx } from "clsx"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import { LiveFeedItemComponent } from "./item"
import { type LiveFeedItem, useLiveFeedInfiniteQuery } from "~/hooks/useLiveFeed"

interface LiveFeedProps {
  className?: string
  defaultCategory?: "all" | "finance" | "tech"
}

export function LiveFeed({ className, defaultCategory = "all" }: LiveFeedProps) {
  const [category, setCategory] = useState<"all" | "finance" | "tech">(defaultCategory)
  const [isPaused, setIsPaused] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLiveFeedInfiniteQuery({
    category,
    enabled: !isPaused,
  })

  // Flatten all pages of items
  const allItems = data?.pages.flatMap(page => page.items) || []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "relative p-[1px] rounded-[2.5rem] overflow-hidden group/live shadow-2xl transition-all duration-500 hover:shadow-blue-500/10",
        className,
      )}
    >
      {/* Cyber Light Strip - Blue theme for Live Feed */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-400 to-transparent opacity-30 group-hover/live:opacity-100 transition-opacity duration-700" />

      {/* Frosted Black Inner Content */}
      <div className="relative bg-[#0a0a0b]/90 dark:bg-black/95 backdrop-blur-3xl rounded-[calc(2.5rem-1px)] p-6 sm:p-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center relative shrink-0">
              <span className="i-ph:lightning-duotone text-blue-500 text-3xl" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-2xl leading-tight tracking-tight">全球快讯脉搏</h3>
              <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                Real-time global pulse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-neutral-500/5 dark:bg-white/5 p-1.5 rounded-2xl">
            <CategoryTabs value={category} onChange={setCategory} />
            <div className="w-[1px] h-6 bg-neutral-200 dark:bg-white/10 mx-1 shrink-0" />
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="w-11 h-11 flex items-center justify-center hover:bg-neutral-500/10 dark:hover:bg-white/10 rounded-xl transition-all group shrink-0"
              title={isPaused ? "继续更新" : "暂停更新"}
            >
              {isPaused
                ? (
                    <span className="i-ph:play-duotone text-xl text-neutral-400 group-hover:text-blue-500" />
                  )
                : (
                    <span className="i-ph:pause-duotone text-xl text-neutral-400 group-hover:text-amber-500" />
                  )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative overflow-hidden">
          <OverlayScrollbar className="h-[500px] pr-4 custom-scrollbar">
            {isLoading
              ? <LiveFeedSkeleton />
              : isError
                ? <LiveFeedError message={error?.message} />
                : (
                    <div className="space-y-1">
                      <AnimatePresence mode="popLayout">
                        {allItems.map((item: LiveFeedItem, idx: number) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: Math.min(idx * 0.02, 0.5), // Limit delay for many items
                            }}
                          >
                            <LiveFeedItemComponent item={item} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
          </OverlayScrollbar>

          {/* Bottom Shade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/50 dark:from-neutral-900/50 to-transparent pointer-events-none" />
        </div>

        {/* Footer / Load More */}
        <div className="mt-8">
          {!isLoading && !isError && allItems.length === 0
            ? (
                <div className="text-center text-sm text-neutral-400 py-10 opacity-50">
                  暂无快讯
                </div>
              )
            : hasNextPage && !isLoading && !isError
              ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-full flex items-center gap-4">
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-neutral-500/10" />
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-neutral-500/10" />
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className={clsx(
                        "group relative flex items-center justify-center gap-3 px-10 py-4 rounded-2xl transition-all overflow-hidden",
                        "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-transparent",
                        "text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50",
                      )}
                    >
                      {isFetchingNextPage
                        ? (
                            <span className="i-ph:circle-dashed-duotone animate-spin text-lg" />
                          )
                        : (
                            <span className="i-ph:caret-double-down-bold transition-transform group-hover:translate-y-0.5 shrink-0" />
                          )}
                      <span>{isFetchingNextPage ? "正在加载..." : "查看更多历史快讯"}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                    <p className="text-[10px] text-neutral-400 font-bold opacity-60">
                      滑动到底部或点击按钮加载
                    </p>
                  </div>
                )
              : null}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
        }
      `,
        }}
        />
      </div>
    </motion.div>
  )
}

function CategoryTabs({
  value,
  onChange,
}: {
  value: "all" | "finance" | "tech"
  onChange: (value: "all" | "finance" | "tech") => void
}) {
  const tabs = [
    { key: "all" as const, label: "全部", icon: "i-ph:sparkle-duotone" },
    { key: "finance" as const, label: "财经", icon: "i-ph:chart-line-up-duotone" },
    { key: "tech" as const, label: "科技", icon: "i-ph:cpu-duotone" },
  ]

  return (
    <div className="flex gap-1.5 bg-neutral-500/5 dark:bg-white/5 rounded-xl p-1 shrink-0">
      {tabs.map((tab) => {
        const isActive = value === tab.key
        return (
          <button
            type="button"
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={clsx(
              "px-3 sm:px-5 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0",
              isActive
                ? "bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 shadow-md scale-[1.02]"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
            )}
          >
            <span className={clsx(tab.icon, "text-base sm:text-lg shrink-0")} />
            <span className="whitespace-nowrap tracking-wide">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function LiveFeedSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array.from({ length: 6 })].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items don't have unique IDs
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="w-1 bg-neutral-500/10 rounded-full h-12" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-neutral-500/10 rounded w-full" />
            <div className="h-3 bg-neutral-500/5 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function LiveFeedError({ message }: { message?: string }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="i-ph:warning-circle-duotone text-orange-500 text-3xl" />
      </div>
      <h4 className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">加载快讯失败</h4>
      <p className="text-sm text-neutral-500 max-w-xs mx-auto">
        {message || "请检查网络连接或稍后重试"}
      </p>
    </div>
  )
}
