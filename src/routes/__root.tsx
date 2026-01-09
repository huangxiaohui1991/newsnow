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
import { LoginOverlay } from "~/components/dashboard/login-overlay"

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
      {/* Immersive Ambilight Background */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#020203]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[120px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <GlobalOverlayScrollbar
        className={$([
          !isMobile && "px-4",
          "h-full overflow-x-auto relative",
          "md:(px-10)",
          "lg:(px-24)",
        ])}
      >
        {/* Cyber-style Sticky Header */}
        <div className="sticky top-4 z-50 mb-6 p-[1px] rounded-[1.5rem] group/header transition-all duration-500 shadow-2xl">
          {/* Light Strip Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500 opacity-20 group-hover/header:opacity-100 rounded-[1.5rem] transition-opacity duration-700" />

          <header
            className={$([
              "relative grid items-center py-3 px-4 sm:px-6",
              "bg-[#0a0a0b]/80 dark:bg-black/90 backdrop-blur-2xl rounded-[calc(1.5rem-1px)]",
            ])}
            style={{
              gridTemplateColumns: "1fr auto 1fr",
            }}
          >
            <Header />
          </header>
        </div>

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
        <LoginOverlay />
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
