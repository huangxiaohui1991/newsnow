import { useSetAtom } from "jotai"
import { clsx } from "clsx"
import { readingUrlAtom } from "~/atoms"
import type { LiveFeedItem } from "~/hooks/useLiveFeed"

interface LiveFeedItemProps {
  item: LiveFeedItem
}

export function LiveFeedItemComponent({ item }: LiveFeedItemProps) {
  const relativeTime = useRelativeTime(item.pubDate)
  const setReadingUrl = useSetAtom(readingUrlAtom)

  const handleOpenZen = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    if (url) {
      setReadingUrl({ url })
    }
  }

  return (
    <div
      onClick={e => handleOpenZen(e, item.url)}
      className={clsx(
        "group cursor-pointer flex gap-4 py-4 px-3 -mx-3 rounded-2xl transition-all",
        "hover:bg-primary-500/5 dark:hover:bg-white/5",
        "border-b border-neutral-500/5 last:border-0",
      )}
    >
      <div className="flex flex-col items-end gap-1 w-14 shrink-0 mt-0.5">
        <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-tighter">
          {relativeTime}
        </span>
        <div className={clsx(
          "h-1.5 w-1.5 rounded-full transition-all group-hover:scale-150",
          item.sourceColor ? `bg-${item.sourceColor}-500` : "bg-neutral-300",
        )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={clsx(
              "text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider",
              `bg-${item.sourceColor}-500/10 text-${item.sourceColor}-600 dark:text-${item.sourceColor}-400`,
            )}
          >
            {item.sourceName}
          </span>
        </div>
        <div className="text-sm font-medium leading-relaxed group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {item.title}
        </div>
        {item.extra?.info && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 pl-3 border-l-2 border-neutral-500/10 italic">
            {item.extra.info}
          </p>
        )}
      </div>

      <span className="i-ph:arrow-up-right-bold text-xs self-start mt-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500" />
    </div>
  )
}

/**
 * Hook to get relative time string
 */
function useRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  }
  if (hours > 0) {
    return `${hours}小时前`
  }
  if (minutes > 0) {
    return `${minutes}分钟前`
  }
  return "刚刚"
}
