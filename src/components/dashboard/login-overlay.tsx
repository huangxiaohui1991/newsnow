import { useAtom } from "jotai"
import { AnimatePresence, motion } from "framer-motion"
import { loginVisibleAtom } from "~/atoms"

export function LoginOverlay() {
  const [visible, setVisible] = useAtom(loginVisibleAtom)

  // Helper for login redirect
  const handleLogin = (platform: string) => {
    // In a real app, this would point to specific providers
    // For now we use the existing /api/login which is likely GitHub
    window.location.href = platform === "github" ? "/api/login" : `/api/login?provider=${platform}`
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      {visible && (
        <div key="login-overlay" className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVisible(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Login Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md p-[1px] rounded-[2.5rem] overflow-hidden group/login shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Dynamic Light Strip */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-orange-500 animate-gradient-slow opacity-50" />

            <div className="relative bg-[#0a0a0b]/95 backdrop-blur-3xl rounded-[calc(2.5rem-1px)] p-10 flex flex-col items-center">

              {/* Scanning Animation Header */}
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group/icon">
                  <span className="i-ph:shield-checkered-duotone text-5xl text-cyan-400" />
                  {/* Moving Scan Line */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] z-10"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                {/* Decorative Ring */}
                <div className="absolute inset-[-10px] rounded-full border border-cyan-500/20 animate-ping-slow" />
              </div>

              <div className="text-center mb-10">
                <h2 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-white">
                  IDENTITY PROTOCOL
                </h2>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em] mt-2">
                  Verification level required: 04
                </p>
              </div>

              {/* Social Login Modules */}
              <div className="w-full space-y-4">
                {/* Github */}
                <button
                  onClick={() => handleLogin("github")}
                  className="w-full group/btn relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                    <span className="i-ph:github-logo-fill text-2xl text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-black tracking-tight text-white group-hover/btn:text-cyan-400 transition-colors uppercase">
                      Github Module
                    </div>
                    <div className="text-[9px] font-bold text-neutral-500 tracking-wider">SECURE_OAUTH_v2.0</div>
                  </div>
                  <span className="i-ph:arrow-right-bold text-neutral-600 group-hover/btn:text-cyan-400 group-hover/btn:translate-x-1 transition-all" />

                  {/* Hover Beam */}
                  <div className="absolute -left-full top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent group-hover/btn:left-full transition-all duration-1000 ease-in-out" />
                </button>

                {/* Google - Simulated */}
                <button
                  onClick={() => handleLogin("google")}
                  className="w-full group/btn relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                    <span className="i-ph:google-logo-fill text-2xl text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-black tracking-tight text-white group-hover/btn:text-purple-400 transition-colors uppercase">
                      Google Module
                    </div>
                    <div className="text-[9px] font-bold text-neutral-500 tracking-wider">GLOBAL_IDENTITY_PASS</div>
                  </div>
                  <span className="i-ph:arrow-right-bold text-neutral-600 group-hover/btn:text-purple-400 group-hover/btn:translate-x-1 transition-all" />
                </button>

                {/* WeChat - Simulated */}
                <button
                  onClick={() => handleLogin("wechat")}
                  className="w-full group/btn relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                    <span className="i-ph:wechat-logo-fill text-2xl text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-black tracking-tight text-white group-hover/btn:text-emerald-400 transition-colors uppercase">
                      WeChat Module
                    </div>
                    <div className="text-[9px] font-bold text-neutral-500 tracking-wider">LOCAL_SYNC_AUTH</div>
                  </div>
                  <span className="i-ph:arrow-right-bold text-neutral-600 group-hover/btn:text-emerald-400 group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>

              {/* Footer Status */}
              <div className="mt-10 flex items-center gap-6 opacity-30">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Protocol</span>
                  <span className="text-[10px] font-black text-cyan-400">TLS 1.3</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Status</span>
                  <span className="text-[10px] font-black text-emerald-400">ACTIVE</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Latency</span>
                  <span className="text-[10px] font-black text-orange-400">24ms</span>
                </div>
              </div>
            </div>

            {/* Top-Right Decorative Triangles */}
            <div className="absolute top-0 right-0 p-4">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-cyan-500/40" />
                <div className="w-1 h-3 bg-cyan-500/20" />
                <div className="w-1 h-2 bg-cyan-500/60" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
