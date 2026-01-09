import { AnimatePresence, motion } from "framer-motion"
import { useAtom } from "jotai"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import DOMPurify from "dompurify"
import { readingUrlAtom } from "~/atoms"
import { cn } from "~/utils/cn"
import { sources } from "@shared/sources"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import { myFetch } from "~/utils"

export function ReadingOverlay() {
    const [readingData, setReadingUrl] = useAtom(readingUrlAtom)
    const [mode, setMode] = useState<"zen" | "iframe">("zen")
    const url = readingData?.url
    const sourceId = readingData?.sourceId
    const color = sourceId ? sources[sourceId]?.color : null

    const { data: article, isLoading, isError } = useQuery({
        queryKey: ["article", url],
        queryFn: async () => {
            if (!url) return null
            const res = await myFetch(`/read?url=${encodeURIComponent(url)}`)
            return res as {
                title: string
                content: string
                byline?: string
                siteName?: string
                excerpt?: string
            }
        },
        enabled: !!url && mode === "zen",
        staleTime: 1000 * 60 * 60, // 1 hour
    })

    // Reset mode when URL changes
    useEffect(() => {
        if (url) {
            setMode("zen")
        }
    }, [url])

    return (
        <AnimatePresence>
            {url && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6 lg:p-12">
                    {/* Immersive Backdrop with heavy blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md"
                        onClick={() => setReadingUrl(null)}
                    />

                    {/* Glassmorphism Container synced with Source Theme */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className={cn(
                            "relative w-full h-full max-w-6xl overflow-hidden flex flex-col shadow-2xl transition-all",
                            "backdrop-blur-2xl border border-white/40 dark:border-white/10",
                            "rounded-none md:rounded-[2rem]",
                            color
                                ? `bg-${color}-500/20 dark:bg-${color}/20`
                                : "bg-white/80 dark:bg-neutral-900/80"
                        )}
                    >
                        {/* Premium Header - Semi-transparent matching the box */}
                        <div className={cn(
                            "flex items-center justify-between p-4 px-6 border-b border-black/5 dark:border-white/5 backdrop-blur-md z-10",
                            color ? `bg-white/30 dark:bg-black/40` : "bg-white/30 dark:bg-black/20"
                        )}>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[40%]">
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    color ? `bg-${color}-500/10 text-${color}-600 dark:text-${color}-400` : "bg-primary-500/10 text-primary-600"
                                )}>
                                    <span className={mode === "zen" ? "i-ph:sparkle-duotone" : "i-ph:globe-duotone text-xl"} />
                                </div>
                                <span className="truncate opacity-80 font-bold">{article?.title || url}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Mode Toggle Pilled */}
                                <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 rounded-xl items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setMode("zen")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                            mode === "zen"
                                                ? "bg-white dark:bg-neutral-800 shadow-sm text-primary-600 dark:text-primary-400"
                                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                        )}
                                    >
                                        <span className="i-ph:read-cv-app-fill" />
                                        <span>阅读模式</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode("iframe")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                            mode === "iframe"
                                                ? "bg-white dark:bg-neutral-800 shadow-sm text-primary-600 dark:text-primary-400"
                                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                        )}
                                    >
                                        <span className="i-ph:monitor-fill" />
                                        <span>原网页</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all font-medium text-sm shadow-lg",
                                            color ? `bg-${color}-500 hover:bg-${color}-600 shadow-${color}-500/20` : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
                                        )}
                                    >
                                        <span className="i-ph:arrow-square-out-bold" />
                                        <span className="hidden md:inline">浏览器</span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setReadingUrl(null)}
                                        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 transition-colors"
                                    >
                                        <span className="i-ph:x-bold text-xl" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 w-full h-full bg-white dark:bg-neutral-900 relative overflow-hidden">
                            {mode === "zen" ? (
                                <OverlayScrollbar defer className="h-full w-full">
                                    <div className="max-w-3xl mx-auto px-6 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {isLoading
                                            ? (
                                                <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <div className="h-10 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse w-full" />
                                                    <div className="h-10 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse w-2/3" />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full animate-pulse w-24" />
                                                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full animate-pulse w-32" />
                                                </div>
                                                <div className="space-y-4 pt-8">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className="h-4 bg-black/5 dark:bg-white/5 rounded animate-pulse w-full" />
                                                    ))}
                                                    </div>
                                                </div>
                                            )
                                            : isError
                                            ? (
                                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center mb-6">
                                                    <span className="i-ph:warning-circle-duotone text-5xl text-orange-500" />
                                                </div>
                                                <h3 className="text-2xl font-black mb-3 dark:text-white">糟糕，提取失败了</h3>
                                                <p className="text-neutral-500 max-w-sm mb-8">
                                                    该网页可能主要是由于视频内容或复杂的交互逻辑，导致我们无法直接提取正文。
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setMode("iframe")}
                                                    className="px-8 py-3 bg-neutral-900 dark:bg-white dark:text-black text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
                                                >
                                                        尝试加载原网页
                                                    </button>
                                                </div>
                                            )
                                            : (
                                                <article className="zen-article">
                                                <header className="mb-12">
                                                    <h1 className="text-3xl md:text-5xl font-black mb-6 Leading-tight dark:text-white">
                                                        {article.title}
                                                    </h1>
                                                    {article.byline && (
                                                        <div className="flex flex-wrap items-center gap-3 text-neutral-500 dark:text-neutral-400 text-base font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <span className="i-ph:user-circle-duotone text-xl" />
                                                                <span>{article.byline}</span>
                                                            </div>
                                                            {article.siteName && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="opacity-30">•</span>
                                                                    <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-xs font-bold uppercase tracking-widest">
                                                                        {article.siteName}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </header>

                                                <div
                                                    className="zen-content"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(article.content, {
                                                            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
                                                            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel'],
                                                            ALLOW_DATA_ATTR: false
                                                        })
                                                    }}
                                                />

                                                <footer className="mt-20 pt-12 border-t border-black/5 dark:border-white/5 opacity-50 text-center">
                                                    <p className="text-sm">阅读结束 • 感谢您的支持</p>
                                                </footer>
                                            </article>
                                        )}
                                    </div>
                                </OverlayScrollbar>
                            ) : (
                                <div className="w-full h-full relative">
                                    <iframe
                                        src={url}
                                        className="w-full h-full border-none z-0 bg-white"
                                        title="News Content"
                                        sandbox="allow-same-origin allow-forms"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                    />

                                    {/* Visual Fallback for Iframe */}
                                    <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-8 text-center bg-neutral-50 dark:bg-neutral-950">
                                        <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-6 flex items-center justify-center">
                                            <span className="i-ph:globe-duotone text-4xl text-neutral-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 dark:text-white">正在努力加载原网页...</h3>
                                        <p className="text-sm text-neutral-500 max-w-sm Leading-relaxed">
                                            如果长时间未刷新出内容，可能是该站设置了“防爬链接”。建议点击右上角“浏览器”打开。
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .zen-content {
                    font-size: 1.25rem;
                    line-height: 1.8;
                    color: #374151;
                }
                .dark .zen-content {
                    color: #d1d5db;
                }
                .zen-content p {
                    margin-bottom: 2rem;
                }
                .zen-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 1.5rem;
                    margin: 2.5rem 0;
                    display: block;
                    box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.1);
                }
                .zen-content h2 {
                    font-size: 1.875rem;
                    font-weight: 800;
                    margin-top: 3.5rem;
                    margin-bottom: 1.5rem;
                    color: #111827;
                }
                .dark .zen-content h2 {
                    color: #f9fafb;
                }
                .zen-content a {
                    color: #3b82f6;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                }
                .zen-content blockquote {
                    border-left: 6px solid #3b82f6;
                    padding-left: 2rem;
                    font-style: italic;
                    margin: 3rem 0;
                    color: #4b5563;
                    font-size: 1.35rem;
                }
                .dark .zen-content blockquote {
                    color: #9ca3af;
                }
                .zen-content ul, .zen-content ol {
                    padding-left: 2rem;
                    margin-bottom: 2rem;
                }
                .zen-content li {
                    margin-bottom: 0.75rem;
                }
            `}} />
        </AnimatePresence>
    )
}
