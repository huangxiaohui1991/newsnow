import { useQuery } from "@tanstack/react-query"
import { useAtomValue, useSetAtom } from "jotai"
import { cn } from "~/utils/cn"
import { myFetch } from "~/utils"
import { focusSourcesAtom, readingUrlAtom } from "~/atoms"

export function MorningBriefCard({ className }: { className?: string }) {
  const focusSources = useAtomValue(focusSourcesAtom)
  const setReadingUrl = useSetAtom(readingUrlAtom)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["morning-brief", focusSources],
    queryFn: () => myFetch(`/ai/brief?sources=${focusSources.join(",")}`),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false,
  })

  const handleOpenZen = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    if (url) {
      setReadingUrl({ url })
    }
  }

  return (
    <div className={cn("relative p-[1px] rounded-[2.5rem] overflow-hidden group/brief shadow-2xl transition-all duration-500 hover:shadow-cyan-500/10", className)}>
      {/* High-Tech Gradient Border (The Light Strip) */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 via-indigo-500 to-emerald-500 opacity-40 group-hover/brief:opacity-100 transition-opacity duration-700 animate-gradient-slow" />

      {/* Frosted Black Card Content */}
      <div className="relative bg-[#0a0a0b]/90 dark:bg-black/95 backdrop-blur-3xl rounded-[calc(2.5rem-1px)] p-8 h-full flex flex-col">
        {/* Decorative Sparkle */}
        <div className="absolute top-0 right-0 p-6">
          <div className="i-ph:sparkle-fill text-3xl text-cyan-400 opacity-20 group-hover/brief:opacity-100 group-hover/brief:scale-110 transition-all duration-700 blur-[2px] group-hover/brief:blur-0" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
            <span className="i-ph:robot-duotone text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-purple-400">
              智能简报
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">AI Synthesis Active</span>
            </div>
          </div>
        </div>

        {/* Points List */}
        <div className="space-y-4 flex-1">
          {isLoading
            ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 items-start animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/30 mt-2 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-full" />
                    </div>
                  </div>
                ))
              )
            : isError
              ? (
                  <div className="flex flex-col items-center justify-center py-10 text-neutral-500 border border-white/5 rounded-2xl bg-white/5">
                    <span className="i-ph:warning-circle-duotone mb-2 text-3xl text-orange-400" />
                    <p className="text-sm font-medium">摘要生成引擎暂时离线</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all active:scale-95 text-white"
                    >
                      重新激活
                    </button>
                  </div>
                )
              : (
                  (data?.points || []).map((point: any, i: number) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-4 items-start group transition-all rounded-2xl p-3 border border-transparent hover:border-white/5 hover:bg-white/[0.03]",
                        point.url ? "cursor-pointer" : "",
                      )}
                      onClick={e => point.url && handleOpenZen(e, point.url)}
                    >
                      <div className="mt-2 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-neutral-400 leading-relaxed group-hover:text-white transition-colors">
                          {point.content}
                        </p>
                      </div>
                      {point.url && (
                        <span className="i-ph:arrow-right-bold text-xs self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-cyan-400" />
                      )}
                    </div>
                  ))
                )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center text-[8px] font-bold text-neutral-500">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">
              Analysis Matrix
            </span>
          </div>
          {!isError && !isLoading && (
            <button className="px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-black tracking-widest uppercase rounded-xl transition-all flex items-center gap-2 active:scale-95 border border-cyan-500/20 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10">
              <span className="i-ph:headphones-duotone text-lg" />
              Audio Brief
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
