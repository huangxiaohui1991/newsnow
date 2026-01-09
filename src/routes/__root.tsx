import "~/styles/globals.css"
import "virtual:uno.css"
import { Outlet, createRootRouteWithContext, useLocation } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { isMobile } from "react-device-detect"
import { Header } from "~/components/header"
import { GlobalOverlayScrollbar } from "~/components/common/overlay-scrollbar"
import { Footer } from "~/components/footer"
import { Toast } from "~/components/common/toast"
import { SearchBar } from "~/components/common/search-bar"
import { FloatingNav } from "~/components/layout/floating-nav"
import { ZenModeOverlay } from "~/components/dashboard/zen-mode-overlay"
import { ReadingOverlay } from "~/components/dashboard/reading-overlay"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  const nav = Route.useNavigate()
  nav({
    to: "/",
  })
}

function RootComponent() {
  useOnReload()
  useSync()
  usePWA()

  const setReadingUrl = useSetAtom(readingUrlAtom)
  const setZenModeId = useSetAtom(zenModeIdAtom)
  const pathname = useLocation({ select: (l: any) => l.pathname })

  // Cleanup overlays on route change
  useEffect(() => {
    setReadingUrl(null)
    setZenModeId(null)
  }, [pathname, setReadingUrl, setZenModeId])

  return (
    <>
      <GlobalOverlayScrollbar
        className={$([
          !isMobile && "px-4",
          "h-full overflow-x-auto",
          "md:(px-10)",
          "lg:(px-24)",
        ])}
      >
        <header
          className={$([
            "grid items-center py-4 px-4 sm:px-6",
            "lg:(py-6 px-8)",
            "sticky top-0 z-40 backdrop-blur-md bg-white/50 dark:bg-black/50 border-b border-neutral-200/50 dark:border-white/5",
          ])}
          style={{
            gridTemplateColumns: "1fr auto 1fr",
          }}
        >
          <Header />
        </header>
        <main className={$([
          "mt-2",
          "min-h-[calc(100vh-180px)]",
          "md:(min-h-[calc(100vh-175px)])",
          "lg:(min-h-[calc(100vh-194px)])",
        ])}
        >
          <Outlet />
        </main>
        <FloatingNav />
        <ZenModeOverlay />
        <ReadingOverlay />
        <footer className="py-6 flex flex-col items-center justify-center text-sm text-neutral-500 font-mono">
          <Footer />
        </footer>
      </GlobalOverlayScrollbar>
      <Toast />
      <SearchBar />
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </>
  )
}
