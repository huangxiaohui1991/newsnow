import { AnimatePresence, motion } from "framer-motion"
import { useSetAtom } from "jotai"
import { loginVisibleAtom } from "~/atoms"
import { cn } from "~/utils/cn"

export function Menu() {
  const { loggedIn, logout, userInfo, enableLogin } = useLogin()
  const setLoginVisible = useSetAtom(loginVisibleAtom)
  const [shown, show] = useState(false)

  if (!enableLogin) return null

  return (
    <span
      className="relative"
      onMouseEnter={() => show(true)}
      onMouseLeave={() => show(false)}
    >
      {/* Identity Trigger Button */}
      <button
        type="button"
        onClick={() => !loggedIn && setLoginVisible(true)}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300",
          "bg-white/5 dark:bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-lg",
          loggedIn ? "border-cyan-500/30" : "border-orange-500/20",
        )}
      >
        {loggedIn
          ? (
              <>
                <div className="relative w-6 h-6 shrink-0">
                  {/* Rotating Neon Ring */}
                  <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 animate-spin-slow opacity-50" />
                  <div
                    className="absolute inset-0 rounded-full bg-cover bg-center border border-black/50"
                    style={{ backgroundImage: `url(${userInfo.avatar}&s=48)` }}
                  />
                  {/* Status Dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-black shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
                <span className="hidden md:block text-[10px] font-black tracking-widest text-cyan-400 truncate max-w-[80px] uppercase">
                  {userInfo.name || "Agent"}
                </span>
              </>
            )
          : (
              <>
                <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <span className="i-ph:fingerprint-duotone text-orange-500 text-lg animate-pulse" />
                </div>
                <span className="hidden md:block text-[10px] font-black tracking-widest text-neutral-500 group-hover:text-orange-400 transition-colors uppercase">
                  Identify
                </span>
              </>
            )}
      </button>

      {/* Cyber Dropdown Menu */}
      <AnimatePresence>
        {shown && (
          <div key="menu-dropdown" className="absolute right-0 z-[100] pt-3 top-full min-w-[220px]">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="p-[1px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-transparent shadow-2xl"
            >
              <div className="bg-[#0a0a0b]/95 backdrop-blur-2xl rounded-[calc(1rem+4px)] overflow-hidden">
                {/* Clearance Header */}
                <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Clearance Level</span>
                    <span className={cn(
                      "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                      loggedIn ? "bg-cyan-500/20 text-cyan-400" : "bg-neutral-500/20 text-neutral-500",
                    )}
                    >
                      {loggedIn ? "Level 4" : "Restricted"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full", loggedIn ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "bg-neutral-600")}
                      initial={{ width: 0 }}
                      animate={{ width: loggedIn ? "100%" : "20%" }}
                    />
                  </div>
                </div>

                <ol className="p-2 space-y-1">
                  {loggedIn
                    ? (
                        <li
                          onClick={logout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-all cursor-pointer group/item"
                        >
                          <span className="i-ph:sign-out-duotone text-lg group-hover/item:scale-110 transition-transform" />
                          <span className="text-sm font-bold">终止访问 (Logout)</span>
                        </li>
                      )
                    : (
                        <li
                          onClick={() => setLoginVisible(true)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cyan-500/10 text-neutral-400 hover:text-cyan-400 transition-all cursor-pointer group/item"
                        >
                          <span className="i-ph:fingerprint-duotone text-lg group-hover/item:scale-110 transition-transform" />
                          <span className="text-sm font-bold">初始认证 (Identity Auth)</span>
                        </li>
                      )}
                </ol>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </span>
  )
}
