/**
 * Spotlight Banner Component
 * Displays cross-platform hot topics
 */

import { AnimatePresence, motion } from "framer-motion"
import { clsx } from "clsx"
import { SpotlightItem } from "./item"
import { useSpotlightQuery } from "~/hooks/useSpotlight"
import { useLocalStorage } from "~/utils/local-storage"

interface SpotlightBannerProps {
  className?: string
}

export function SpotlightBanner({ className }: SpotlightBannerProps) {
  const { data, isLoading, isError, error } = useSpotlightQuery()
  const [collapsed, setCollapsed] = useLocalStorage("spotlight-collapsed", false)

  // Don't render if no topics
  if (!isLoading && !isError && data?.topics.length === 0) {
    return null
  }

  if (collapsed) {
    return <CollapsedSpotlight onExpand={() => setCollapsed(false)} hasData={!!data?.topics.length} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "relative p-[1px] rounded-[2.5rem] overflow-hidden group/spotlight shadow-2xl mb-8 transition-all duration-500 hover:shadow-orange-500/10",
        className,
      )}
    >
      {/* Cyber Light Strip - Orange theme for Spotlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-transparent opacity-30 group-hover/spotlight:opacity-100 transition-opacity duration-700" />

      {/* Frosted Black Inner Content */}
      <div className="relative bg-[#0a0a0b]/90 dark:bg-black/95 backdrop-blur-3xl rounded-[calc(2.5rem-1px)] p-6 sm:p-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <span className="i-ph:fire-duotone text-orange-500 text-2xl" />
            </div>
            <div>
              <h2 className="font-bold text-xl sm:text-2xl leading-tight">正在发生的大事</h2>
              {data?.topics.length
                ? (
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-60">
                      {data.topics.length}
                      {" "}
                      Cross-Platform Trends
                    </p>
                  )
                : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-500/10 rounded-full transition-all group"
            aria-label="收起"
          >
            <span className="i-ph:caret-up-bold text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200" />
          </button>
        </div>

        {/* Content - News List Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12">
          {isLoading
            ? (
                <SpotlightSkeleton />
              )
            : isError
              ? (
                  <SpotlightError message={error?.message} />
                )
              : (
                  <AnimatePresence mode="popLayout">
                    {data?.topics.map((topic, idx) => (
                      <motion.div
                        key={`${topic.id}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <SpotlightItem topic={topic} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
        </div>

        {/* Footer */}
        {!isLoading && !isError && data?.topics.length === 0 && (
          <div className="text-center text-sm text-neutral-400 py-6 opacity-50">
            暂无跨平台热点话题
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CollapsedSpotlight({
  onExpand,
  hasData,
}: {
  onExpand: () => void
  hasData: boolean
}) {
  if (!hasData) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <button
        type="button"
        onClick={onExpand}
        className={clsx(
          "w-full py-4 px-6 rounded-2xl text-sm font-bold tracking-wide",
          "bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "transition-all border border-white/20 dark:border-white/10 shadow-lg",
          "flex items-center justify-center gap-3",
        )}
      >
        <span className="i-ph:fire-duotone text-orange-500" />
        <span>查看跨平台热点爆发点</span>
        <span className="i-ph:caret-down-bold text-neutral-400" />
      </button>
    </motion.div>
  )
}

function SpotlightSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array.from({ length: 6 })].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items don't have unique IDs
        <div key={i} className="animate-pulse flex items-start gap-4">
          <div className="w-2 h-2 rounded-full bg-neutral-400/20 mt-2" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-400/20 rounded w-full" />
            <div className="h-3 bg-neutral-400/10 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SpotlightError({ message }: { message?: string }) {
  return (
    <div className="text-center py-8">
      <span className="i-ph:warning-circle-duotone text-orange-500 text-3xl mb-3 block" />
      <p className="text-sm text-neutral-400">加载热点失败</p>
      {message && <p className="text-xs text-neutral-500 mt-2">{message}</p>}
    </div>
  )
}
