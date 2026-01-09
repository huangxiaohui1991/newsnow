import { useSetAtom } from "jotai"
import { sources } from "@shared/sources"
import { clsx } from "clsx"
import { readingUrlAtom } from "~/atoms"
import type { SpotlightTopic } from "~/hooks/useSpotlight"

interface SpotlightItemProps {
  topic: SpotlightTopic
}

export function SpotlightItem({ topic }: SpotlightItemProps) {
  const setReadingUrl = useSetAtom(readingUrlAtom)

  const handleOpenZen = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    if (url) {
      setReadingUrl({ url })
    }
  }

  return (
    <div
      className="py-4 border-b border-neutral-500/5 last:border-0 group cursor-pointer transition-all hover:bg-neutral-500/5 px-2 -mx-2 rounded-xl"
      onClick={e => handleOpenZen(e, topic.platforms[0]?.url)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="font-bold text-[15px] leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {topic.title}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 ml-3.5">
            {topic.platforms.map((p, i) => (
              <PlatformTag
                key={`${p.sourceId}-${i}`}
                id={p.sourceId}
                name={p.sourceName}
                rank={p.rank}
                color={(sources as any)[p.sourceId]?.color || "gray"}
              />
            ))}
          </div>
        </div>
        <span className="i-ph:caret-right-bold text-xs self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-orange-500" />
      </div>
    </div>
  )
}

function PlatformTag({
  id,
  name,
  rank,
  color,
}: {
  id: string
  name: string
  rank: number
  color: string
}) {
  return (
    <div
      className={clsx(
        "group/tag inline-flex items-center rounded-full h-5 pl-1 pr-1.5 gap-1.5 transition-all duration-300",
        "bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10",
        "hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/10 shadow-sm",
      )}
    >
      {/* Platform Icon */}
      <div
        className="w-3.5 h-3.5 rounded-full bg-cover bg-center shrink-0 grayscale-[0.4] group-hover/tag:grayscale-0 transition-all"
        style={{
          backgroundImage: `url(/icons/${id.split("-")[0]}.png)`,
        }}
      />

      {/* Platform Name */}
      <span className={clsx(
        "text-[9px] font-black uppercase tracking-wider",
        `text-${color}-600/80 dark:text-${color}-400/80 group-hover/tag:text-${color}-600 dark:group-hover/tag:text-${color}-400`,
      )}
      >
        {name}
      </span>

      {/* Vertical Divider */}
      <div className="w-[1px] h-2 bg-neutral-500/20 dark:bg-white/10" />

      {/* Rank Indicator */}
      <div className={clsx(
        "flex items-center justify-center min-w-[14px] h-[14px] rounded-full px-1",
        `bg-${color}-500/10 dark:bg-${color}-500/20`,
        `text-${color}-600 dark:text-${color}-400`,
      )}
      >
        <span className="text-[8px] font-black tabular-nums">
          #
          {rank}
        </span>
      </div>
    </div>
  )
}
