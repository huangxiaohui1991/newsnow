import { motion } from "framer-motion"
import { fixedColumnIds, metadata } from "@shared/metadata"
import { Link, useLocation } from "@tanstack/react-router"
import { useAtomValue } from "jotai"
import { currentColumnIDAtom } from "~/atoms"
import { cn } from "~/utils/cn"
import { useSearchBar } from "~/hooks/useSearch"

export function FloatingNav() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const { toggle } = useSearchBar()
  const pathname = useLocation({ select: location => location.pathname })
  const isHome = pathname === "/"

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div className={cn(
        "flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-full",
        "bg-white/80 dark:bg-black/80 backdrop-blur-xl",
        "border border-neutral-200 dark:border-white/10",
        "shadow-2xl shadow-black/10 dark:shadow-black/50",
      )}
      >
        {/* Search Button */}
        <button
          onClick={() => toggle(true)}
          className={cn(
            "p-2.5 sm:p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors shrink-0",
            "text-neutral-500 dark:text-neutral-400",
          )}
          title="Search (Cmd+K)"
        >
          <div className="i-ph:magnifying-glass-duotone text-lg sm:text-xl" />
        </button>

        <div className="w-[1px] h-5 sm:h-6 bg-neutral-200 dark:bg-white/10 mx-1 shrink-0" />

        {/* Home Link */}
        <Link
          to="/"
          className={cn(
            "px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all relative shrink-0",
            isHome
              ? "text-primary-600 dark:text-primary-400"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10",
          )}
        >
          {isHome && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/20 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <span className="i-ph:house-duotone text-lg shrink-0" />
            <span className="hidden sm:inline">首页</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-0.5">
          {fixedColumnIds.map((columnId) => {
            const isActive = currentId === columnId && !isHome
            return (
              <Link
                key={columnId}
                to="/$column"
                params={{ column: columnId }}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all relative shrink-0",
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/20 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{metadata[columnId].name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
