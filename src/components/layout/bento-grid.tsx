import { motion } from "framer-motion"
import { cn } from "~/utils/cn"

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function BentoItem({
  className,
  children,
  header,
  icon,
  onClick,
}: {
  className?: string
  children?: React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <motion.div
      layoutId={onClick ? "card-layout" : undefined}
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-sm dark:shadow-none p-4 bg-white dark:bg-neutral-900 border border-transparent dark:border-white/10 flex flex-col space-y-4",
        onClick && "cursor-pointer active:scale-95",
        className,
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
