import { Link } from "@tanstack/react-router"
import { useIsFetching } from "@tanstack/react-query"
import type { SourceID } from "@shared/types"
import { Menu } from "./menu"
import { currentSourcesAtom, goToTopAtom } from "~/atoms"

function GoTop() {
  const { ok, fn: goToTop } = useAtomValue(goToTopAtom)
  return (
    <button
      type="button"
      title="Go To Top"
      className={$("i-ph:arrow-fat-up-duotone", ok ? "op-50 btn" : "op-0")}
      onClick={goToTop}
    />
  )
}

function Refresh() {
  const currentSources = useAtomValue(currentSourcesAtom)
  const { refresh } = useRefetch()
  const refreshAll = useCallback(() => refresh(...currentSources), [refresh, currentSources])

  const isFetching = useIsFetching({
    predicate: (query) => {
      const [type, id] = query.queryKey as ["source" | "entire", SourceID]
      return (type === "source" && currentSources.includes(id)) || type === "entire"
    },
  })

  return (
    <button
      type="button"
      title="Refresh"
      className={$("i-ph:arrow-counter-clockwise-duotone btn", isFetching && "animate-spin i-ph:circle-dashed-duotone")}
      onClick={refreshAll}
    />
  )
}

export function Header() {
  return (
    <>
      <span className="flex justify-self-start items-center">
        <Link to="/" className="flex gap-2 sm:gap-3 items-center group/logo">
          {/* Cyber Icon */}
          <div className="h-8 w-8 sm:h-9 sm:w-9 bg-cover transition-transform duration-500 group-hover/logo:rotate-12" title="logo" style={{ backgroundImage: "url(/icon.svg)" }} />

          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-black tracking-tighter leading-none flex items-center">
              <span className="text-white dark:text-white opacity-90">News</span>
              <span className="text-cyan-400">N</span>
              <span className="text-neutral-500 dark:text-neutral-400">ow</span>
            </span>
          </div>
        </Link>
      </span>
      <span className="justify-self-center block sm:hidden">
        {/* Navigation is consolidated in the bottom Floating Nav */}
      </span>
      <span className="justify-self-end flex gap-1.5 sm:gap-2 items-center text-lg sm:text-xl text-primary-600 dark:text-primary">
        <GoTop />
        <Refresh />
        <Menu />
      </span>
    </>
  )
}
