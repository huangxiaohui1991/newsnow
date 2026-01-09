import type { PropsWithChildren } from "react"
import type { SourceID } from "@shared/types"
import type { BaseEventPayload, ElementDragType } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { createPortal } from "react-dom"
import { useThrottleFn } from "ahooks"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { motion } from "framer-motion"
import { useWindowSize } from "react-use"
import { isMobile } from "react-device-detect"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { DndContext } from "../common/dnd"
import { useSortable } from "../common/dnd/useSortable"
import type { ItemsProps } from "./card"
import { CardWrapper } from "./card"
import { currentColumnIDAtom, currentSourcesAtom, zenModeIdAtom } from "~/atoms"

const AnimationDuration = 200
const WIDTH = 350
export function Dnd() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const [items, setItems] = useAtom(currentSourcesAtom)
  const [parent] = useAutoAnimate({ duration: AnimationDuration })
  useEntireQuery(items)
  const { width } = useWindowSize()
  const minWidth = useMemo(() => {
    // double padding = 32
    return Math.min(width - 32, WIDTH)
  }, [width])

  const isHottest = currentId === "hottest"
  const isRealtime = currentId === "realtime"

  if (!items.length) return null

  const isVerticalLayout = isRealtime || isMobile

  return (
    <DndWrapper items={items} setItems={setItems} axis={isVerticalLayout ? "vertical" : "grid"}>
      <div className="flex flex-col gap-8 px-4 sm:px-0">
        <motion.ol
          className={cn(
            "pb-20",
            // Mobile: Always full width vertical list to avoid squeezing
            isMobile && "flex flex-col gap-6 w-full",
            // Desktop Hottest: Relaxed 2-column waterfall
            !isMobile && isHottest && "columns-1 md:columns-2 gap-8 space-y-8 max-w-6xl mx-auto w-full",
            // Desktop Realtime: Focused single column
            !isMobile && isRealtime && "flex flex-col gap-8 max-w-3xl mx-auto w-full",
            // Desktop Others: Standard Grid
            !isMobile && !isHottest && !isRealtime && "grid gap-6",
          )}
          ref={parent}
          style={!isMobile && !isHottest && !isRealtime
            ? {
                gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
              }
            : undefined}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.1,
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {items.map((id, _index) => (
            <motion.li
              key={`${id}-${_index}`}
              className={cn(
                isMobile && "w-full",
                !isMobile && isHottest && "break-inside-avoid",
              )}
              style={isMobile ? { width: "100%" } : undefined}
              transition={{
                type: "tween",
                duration: AnimationDuration / 1000,
              }}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              <SortableCardWrapper id={id} />
            </motion.li>
          ))}
        </motion.ol>
      </div>

      {isMobile && !isVerticalLayout && !isHottest && !isRealtime && (
        <div className="flex justify-center mt-[-40px]">
          <span className="text-sm text-gray-500 text-center">左右滑动查看更多</span>
        </div>
      )}
    </DndWrapper>
  )
}

function DndWrapper({ items, setItems, axis, children }: PropsWithChildren<{
  items: SourceID[]
  setItems: (items: SourceID[]) => void
  axis: "vertical" | "horizontal" | "grid"
}>) {
  const onDropTargetChange = useCallback(({ location, source }: BaseEventPayload<ElementDragType>) => {
    const traget = location.current.dropTargets[0]
    if (!traget?.data || !source?.data) return
    const closestEdgeOfTarget = extractClosestEdge(traget.data)
    const fromIndex = items.indexOf(source.data.id as SourceID)
    const toIndex = items.indexOf(traget.data.id as SourceID)
    if (fromIndex === toIndex || fromIndex === -1 || toIndex === -1) return
    const update = reorderWithEdge({
      list: items,
      startIndex: fromIndex,
      indexOfTarget: toIndex,
      closestEdgeOfTarget,
      axis: axis === "grid" ? "vertical" : axis, // Practical fallback
    })
    setItems(update)
  }, [items, setItems, axis])
  // 避免动画干扰
  const { run } = useThrottleFn(onDropTargetChange, {
    leading: true,
    trailing: true,
    wait: AnimationDuration,
  })
  const { el } = useAtomValue(goToTopAtom)
  return (
    <DndContext onDropTargetChange={run} autoscroll={el ? { element: el } : undefined}>
      {children}
    </DndContext>
  )
}

function CardOverlay({ id }: { id: SourceID }) {
  return (
    <div className={$(
      "flex flex-col p-4 backdrop-blur-5",
      `bg-${sources[id].color}-500 dark:bg-${sources[id].color} bg-op-40!`,
      !isiOS() && "rounded-2xl",
    )}
    >
      <div className={$("flex justify-between mx-2 items-center")}>
        <div className="flex gap-2 items-center">
          <div
            className={$("w-8 h-8 rounded-full bg-cover")}
            style={{
              backgroundImage: `url(/icons/${id.split("-")[0]}.png)`,
            }}
          />
          <span className="flex flex-col">
            <span className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {sources[id].name}
              </span>
              {sources[id]?.title && <span className={$("text-sm", `color-${sources[id].color} bg-base op-80 bg-op-50! px-1 rounded`)}>{sources[id].title}</span>}
            </span>
            <span className="text-xs op-70">拖拽中</span>
          </span>
        </div>
        <div className={$("flex gap-2 text-lg", `color-${sources[id].color}`)}>
          <button
            type="button"
            className={$("i-ph:dots-six-vertical-duotone", "cursor-grabbing")}
          />
        </div>
      </div>
    </div>
  )
}

function SortableCardWrapper({ id }: ItemsProps) {
  const {
    isDragging,
    setNodeRef,
    setHandleRef,
    OverlayContainer,
  } = useSortable({ id })
  const setZenModeId = useSetAtom(zenModeIdAtom)

  useEffect(() => {
    if (OverlayContainer) {
      OverlayContainer!.className += $(`bg-base`, !isiOS() && "rounded-2xl")
    }
  }, [OverlayContainer])

  return (
    <>
      <div onClick={() => setZenModeId(id)} className="cursor-pointer">
        <CardWrapper
          ref={setNodeRef}
          id={id}
          isDragging={isDragging}
          setHandleRef={setHandleRef}
          layoutId={`card-${id}`}
          className="pointer-events-none" // Disable interaction inside card to allow container click
        />
      </div>
      {OverlayContainer && createPortal(<CardOverlay id={id} />, OverlayContainer)}
    </>
  )
}
