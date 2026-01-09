import { createFileRoute } from "@tanstack/react-router"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect } from "react"
import { currentColumnIDAtom, focusSourcesAtom } from "~/atoms"
import { BentoGrid } from "~/components/layout/bento-grid"
import { MorningBriefCard } from "~/components/dashboard/morning-brief"
import { SpotlightBanner } from "~/components/spotlight"
import { LiveFeed } from "~/components/live-feed"
import { useEntireQuery } from "~/hooks/query"

export const Route = createFileRoute("/")({
  component: IndexComponent,
})

function IndexComponent() {
  const focusSources = useAtomValue(focusSourcesAtom)
  useEntireQuery(focusSources)
  const setCurrentColumn = useSetAtom(currentColumnIDAtom)

  useEffect(() => {
    setCurrentColumn("focus")
  }, [setCurrentColumn])

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-4xl font-black tracking-tighter sm:text-6xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-400 dark:from-white dark:via-neutral-400 dark:to-neutral-600">
          NewsNow
          <span className="text-primary-600 dark:text-primary-400">.</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium tracking-tight">Your intelligent news dashboard.</p>
      </div>

      <BentoGrid className="!md:auto-rows-min gap-6">
        {/* Row 1: The Core Intelligence */}
        <div className="md:col-span-2">
          <MorningBriefCard className="h-full" />
        </div>

        <div className="md:col-span-2">
          <LiveFeed className="h-full" />
        </div>

        {/* Row 2: Deep Spotlight (Full Width) */}
        <div className="md:col-span-4 mt-2">
          <SpotlightBanner />
        </div>
      </BentoGrid>
    </div>
  )
}
