import type { NewsItem, SourceID, SourceResponse } from "@shared/types"
import { useQuery } from "@tanstack/react-query"
import type { HTMLMotionProps } from "framer-motion"
import { motion, useInView } from "framer-motion"
import { useWindowSize } from "react-use"
import { forwardRef, useImperativeHandle } from "react"
import { useSetAtom } from "jotai"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import { safeParseString } from "~/utils"

import { cn } from "~/utils/cn"
import { readingUrlAtom } from "~/atoms"

export interface ItemsProps extends HTMLMotionProps<"div"> {
  id: SourceID
  /**
   * 是否显示透明度，拖动时原卡片的样式
   */
  isDragging?: boolean
  setHandleRef?: (ref: HTMLElement | null) => void
  layoutId?: string
}

interface NewsCardProps {
  id: SourceID
  setHandleRef?: (ref: HTMLElement | null) => void
}

export const CardWrapper = forwardRef<HTMLElement, ItemsProps>(({ id, isDragging, setHandleRef, style, className, layoutId, ...props }, dndRef) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const color = sources[id].color

  useImperativeHandle(dndRef, () => ref.current! as HTMLDivElement)

  return (
    <motion.div
      ref={ref}
      layoutId={layoutId}
      className={cn(
        "relative p-[1px] h-500px rounded-[2rem] overflow-hidden group/card transition-all duration-500",
        isDragging && "opacity-50 scale-95",
        className,
      )}
      style={{
        transformOrigin: "50% 50%",
        ...style,
      }}
      {...props}
    >
      {/* Cyber Light Strip Border */}
      <div className={cn(
        "absolute inset-0 opacity-30 group-hover/card:opacity-100 transition-opacity duration-700",
        `bg-gradient-to-br from-${color}-500 via-${color}-400 to-transparent`,
      )}
      />

      {/* Frosted Black Inner Content */}
      <div className="relative h-full w-full bg-[#0a0a0b]/90 dark:bg-black/95 backdrop-blur-3xl rounded-[calc(2.2rem-1px)] p-3 md:p-5 flex flex-col overflow-hidden">
        {inView && <NewsCard id={id} setHandleRef={setHandleRef} />}
      </div>
    </motion.div>
  )
})

function NewsCard({ id, setHandleRef }: NewsCardProps) {
  const { refresh } = useRefetch()
  const { data, isFetching, isError } = useQuery({
    queryKey: ["source", id],
    queryFn: async ({ queryKey }) => {
      const id = queryKey[1] as SourceID
      let url = `/s?id=${id}`
      const headers: Record<string, any> = {}
      if (refetchSources.has(id)) {
        url = `/s?id=${id}&latest`
        const jwt = safeParseString(localStorage.getItem("jwt"))
        if (jwt) headers.Authorization = `Bearer ${jwt}`
        refetchSources.delete(id)
      } else if (cacheSources.has(id)) {
        // wait animation
        await delay(200)
        return cacheSources.get(id)
      }

      const response: SourceResponse = await myFetch(url, {
        headers,
      })

      function diff() {
        try {
          if (response.items && sources[id].type === "hottest" && cacheSources.has(id)) {
            response.items.forEach((item, i) => {
              const o = cacheSources.get(id)!.items.findIndex(k => k.id === item.id)
              item.extra = {
                ...item?.extra,
                diff: o === -1 ? undefined : o - i,
              }
            })
          }
        } catch (e) {
          console.error(e)
        }
      }

      diff()

      cacheSources.set(id, response)
      return response
    },
    placeholderData: prev => prev,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const { isFocused, toggleFocus } = useFocusWith(id)

  return (
    <>
      <div className={$("flex justify-between mx-2 mt-0 mb-2 items-center")}>
        <div className="flex gap-2 items-center">
          <a
            className={$("w-8 h-8 rounded-full bg-cover")}
            target="_blank"
            href={sources[id].home}
            title={sources[id].desc}
            style={{
              backgroundImage: `url(/icons/${id.split("-")[0]}.png)`,
            }}
          />
          <span className="flex flex-col">
            <span className="flex items-center gap-2">
              <span
                className="text-xl font-bold"
                title={sources[id].desc}
              >
                {sources[id].name}
              </span>
              {sources[id]?.title && <span className={$("text-sm", `color-${sources[id].color} bg-base op-80 bg-op-50! px-1 rounded`)}>{sources[id].title}</span>}
            </span>
            <span className="text-xs op-70"><UpdatedTime isError={isError} updatedTime={data?.updatedTime} /></span>
          </span>
        </div>
        <div className={$("flex gap-2 text-lg", `color-${sources[id].color}`)}>
          <button
            type="button"
            className={$("btn i-ph:arrow-counter-clockwise-duotone", isFetching && "animate-spin i-ph:circle-dashed-duotone")}
            onClick={() => refresh(id)}
          />
          <button
            type="button"
            className={$("btn", isFocused ? "i-ph:star-fill" : "i-ph:star-duotone")}
            onClick={toggleFocus}
          />
          {/* firefox cannot drag a button */}
          {setHandleRef && (
            <div
              ref={setHandleRef}
              className={$("btn", "i-ph:dots-six-vertical-duotone", "cursor-grab")}
            />
          )}
        </div>
      </div>

      <OverlayScrollbar
        className={$([
          "h-full p-2 overflow-y-auto rounded-2xl bg-base bg-op-70!",
          isFetching && `animate-pulse`,
          `sprinkle-${sources[id].color}`,
        ])}
        options={{
          overflow: { x: "hidden" },
        }}
        defer
      >
        <div className={$("transition-opacity-500", isFetching && "op-20")}>
          {!!data?.items?.length && (sources[id].type === "hottest" ? <NewsListHot items={data.items} sourceId={id} /> : <NewsListTimeLine items={data.items} sourceId={id} />)}
        </div>
      </OverlayScrollbar>
    </>
  )
}

function UpdatedTime({ isError, updatedTime }: { updatedTime: any, isError: boolean }) {
  const relativeTime = useRelativeTime(updatedTime ?? "")
  if (relativeTime) return `${relativeTime}更新`
  if (isError) return "获取失败"
  return "加载中..."
}

function ExtraInfo({ item }: { item: NewsItem }) {
  if (item?.extra?.info) {
    const isHeat = /[\d.]+/.test(item.extra.info)
    return (
      <div className="flex items-center gap-1 opacity-70">
        {isHeat && <span className="i-ph:flame-duotone text-orange-500" />}
        <span>{item.extra.info}</span>
      </div>
    )
  }
  if (item?.extra?.icon) {
    const { url, scale } = typeof item.extra.icon === "string" ? { url: item.extra.icon, scale: undefined } : item.extra.icon
    return (
      <div className="flex items-center group-hover:scale-110 transition-transform">
        <img
          src={url}
          style={{
            transform: `scale(${scale ?? 1})`,
          }}
          className="h-3.5 w-auto rounded-sm ring-1 ring-white/20 shadow-sm"
          referrerPolicy="no-referrer"
          onError={e => e.currentTarget.parentElement!.style.display = "none"}
        />
      </div>
    )
  }
  return null
}

function NewsUpdatedTime({ date }: { date: string | number }) {
  const relativeTime = useRelativeTime(date)
  return <>{relativeTime}</>
}
function NewsListHot({ items, sourceId }: { items: NewsItem[], sourceId: SourceID }) {
  const { width } = useWindowSize()
  const setReadingUrl = useSetAtom(readingUrlAtom)

  const handleOpen = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    setReadingUrl({ url, sourceId })
  }

  return (
    <motion.ol
      className="flex flex-col gap-1.5"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.04 } },
      }}
    >
      {items?.map((item, i) => {
        const url = width < 768 ? item.mobileUrl || item.url : item.url
        return (
          <motion.a
            variants={{
              hidden: { opacity: 0, x: -8 },
              visible: { opacity: 1, x: 0 },
            }}
            href={url}
            target="_blank"
            key={`${item.id}-${i}`}
            title={item.extra?.hover}
            onClick={e => handleOpen(e, url)}
            className={cn(
              "group flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl transition-all duration-300 relative overflow-hidden",
              "hover:bg-white/40 dark:hover:bg-white/5 hover:shadow-sm",
              "cursor-pointer visited:(text-neutral-400)",
            )}
          >
            {/* Index / Rank Badge */}
            <div className={cn(
              "w-7 h-7 shrink-0 flex items-center justify-center rounded-lg font-black text-xs transition-transform group-hover:scale-110",
              i === 0
                ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950 shadow-sm"
                : i === 1
                  ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-sm"
                  : i === 2
                    ? "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-sm"
                    : "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400",
            )}
            >
              {i + 1}
            </div>

            {/* Title & Info Container */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] md:text-[14.5px] font-bold tracking-tight text-neutral-800 dark:text-neutral-200 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {item.title}
                </span>

                {/* Trend Indicators */}
                {item.extra?.diff !== undefined && (
                  <TrendIndicator diff={item.extra.diff} />
                )}

                {/* Hot / Special Tags */}
                {i === 0 && (
                  <span className="shrink-0 text-[9px] bg-red-500 text-white px-1 py-0.5 rounded font-black italic animate-pulse">HOT</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400/80">
                <ExtraInfo item={item} />
              </div>
            </div>

            {/* Interaction Indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              <span className="i-ph:arrow-right-bold text-xs text-primary-500" />
            </div>
          </motion.a>
        )
      })}
    </motion.ol>
  )
}

function TrendIndicator({ diff }: { diff: number }) {
  if (diff === 0) return null

  const isUp = diff > 0
  return (
    <div className={cn(
      "flex items-center text-[10px] font-black italic shrink-0",
      isUp ? "text-red-500" : "text-green-500",
    )}
    >
      {isUp
        ? (
            <span className="i-ph:caret-double-up-fill" />
          )
        : (
            <span className="i-ph:caret-double-down-fill" />
          )}
      <span className="ml-0.5">{Math.abs(diff)}</span>
    </div>
  )
}

function NewsListTimeLine({ items, sourceId }: { items: NewsItem[], sourceId: SourceID }) {
  const { width } = useWindowSize()
  const setReadingUrl = useSetAtom(readingUrlAtom)

  const handleOpen = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    setReadingUrl({ url, sourceId })
  }

  return (
    <motion.ol
      className="relative space-y-3 md:space-y-4 ml-2 border-s-2 border-dashed border-neutral-500/10 dark:border-white/5 pl-4 md:pl-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {items?.map((item, i) => {
        const url = width < 768 ? item.mobileUrl || item.url : item.url
        return (
          <motion.li
            key={`${item.id}-${i}`}
            className="group relative"
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[21px] md:-left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-300 dark:bg-neutral-700 group-hover:bg-primary-500 group-hover:scale-125 transition-all shadow-sm" />

            <div className="flex flex-col gap-1">
              {/* Time & Meta Tag */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-500/5 text-neutral-400 dark:text-neutral-500">
                  {(item.pubDate || item?.extra?.date) && <NewsUpdatedTime date={(item.pubDate || item?.extra?.date)!} />}
                </span>
                <div className="text-[9px] font-bold">
                  <ExtraInfo item={item} />
                </div>
              </div>

              {/* Title */}
              <a
                className={cn(
                  "text-[13px] md:text-[14px] font-medium leading-relaxed text-neutral-700 dark:text-neutral-300",
                  "hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer block",
                  "visited:(text-neutral-400/80)",
                )}
                href={url}
                title={item.extra?.hover}
                target="_blank"
                onClick={e => handleOpen(e, url)}
              >
                {item.title}
              </a>
            </div>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}
