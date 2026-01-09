import { AnimatePresence, motion } from "framer-motion"
import { useAtom } from "jotai"
import { zenModeIdAtom } from "~/atoms"
import { CardWrapper } from "~/components/column/card"

export function ZenModeOverlay() {
  const [zenModeId, setZenModeId] = useAtom(zenModeIdAtom)

  return (
    <AnimatePresence>
      {zenModeId && (
        <div key="zen-mode-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setZenModeId(null)}
          />
          <CardWrapper
            id={zenModeId}
            layoutId={`card-${zenModeId}`}
            className="w-full h-full max-w-5xl max-h-[90vh] shadow-2xl z-10 !h-full"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </AnimatePresence>
  )
}
