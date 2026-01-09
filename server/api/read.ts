import { Readability } from "@mozilla/readability"
import { parseHTML } from "linkedom"

// Allowed domains for SSRF protection
// All domains in this list are allowed for fetching
// Note: Sites marked with [SPA] require JavaScript rendering and may fail content extraction
const ALLOWED_DOMAINS = [
  // ========== Chinese News Sites ==========
  "weibo.com",
  "weibo.cn",
  "news.qq.com",
  "qq.com",
  "sina.com.cn",
  "163.com",
  "people.com.cn",
  "xinhuanet.com",
  "cctv.com",
  "chinadaily.com.cn",
  "cnr.cn",
  "thepaper.cn",
  "36kr.com",
  "ithome.com",
  "zcool.com.cn",
  "bilibili.com",
  "zhihu.com",
  "toutiao.com",
  "sohu.com",
  "ifeng.com",
  "gov.cn",
  "news.cn",

  // ========== Additional Chinese Sites ==========
  "sputniknews.cn",
  "zaochenbao.com",
  "juejin.cn",
  "sspai.com",
  "smzdm.com",
  "solidot.org",
  "fastbull.com",
  "gelonghui.com",
  "ghxi.com",
  "douban.com",
  "cankaoxiaoxi.com",

  // ========== Tech & Development ==========
  "github.com",
  "v2ex.com",
  "linux.do",
  "freebuf.com",
  "hackernews.com",

  // ========== Entertainment ==========
  "douyin.com",
  "kuaishou.com",
  "iqiyi.com",
  "bilibili.com",
  "steampowered.com",

  // ========== Finance (Note: Many are SPAs) ==========
  "wallstreetcn.com", // [SPA] Requires JS for content
  "xueqiu.com", // [SPA] Requires JS for content
  "jin10.com",
  "mktnews.net",

  // ========== Shopping ==========
  "producthunt.com",
  "smzdm.com",

  // ========== Others ==========
  "tieba.baidu.com",
  "baidu.com",
  "nowcoder.com",
  "hupu.com",
  "kaopustorage.blob.core.windows.net",
  "chongbuluo.com",

  // ========== Subdomains ==========
  "s.weibo.com",
  "s.search.bilibili.com",
  "api.bilibili.com",
  "search.bilibili.com",
  "www.bilibili.com",
  "i.news.qq.com",
  "cache.thepaper.cn",
  "stock.xueqiu.com",
  "www.zhihu.com",
  "www.toutiao.com",
  "tieba.baidu.com",
  "top.baidu.com",
  "login.douyin.com",
  "www.douyin.com",
  "bbs.hupu.com",
  "www.nowcoder.com",
  "gw-c.nowcoder.com",
  "www.kuaishou.com",
  "www.jin10.com",
  "flash.jin10.com",
  "api-one.wallstcn.com",
  "api.mktnews.net",
  "www.producthunt.com",
  "post.smzdm.com",
  "www.solidot.org",
  "www.fastbull.com",
  "www.gelonghui.com",
  "www.ghxi.com",
  "m.douban.com",
  "movie.douban.com",
  "china.cankaoxiaoxi.com",
  "www.chongbuluo.com",
  "store.steampowered.com",
  "www.freebuf.com",
  "news.ycombinator.com",
  "www.v2ex.com",
  "linux.do",
  "api.juejin.cn",
  "sspai.com",
  "www.sspai.com",
  "www.steampowered.com",
  "www.qq.com",
  "www.ifeng.com",
  "bbs.pcbeta.com",
  "pbaccess.video.qq.com",
  "v.qq.com",
  "mesh.if.iqiyi.com",
  "www.iqiyi.com",
  "www.ithome.com",
  "www.36kr.com",
  "www.zaochenbao.com",
]

// Domains that are known to be Single Page Applications (SPAs)
// These are in ALLOWED_DOMAINS but will likely fail content extraction
const SPA_DOMAINS = [
  // 财经类
  "wallstreetcn.com",
  "xueqiu.com",
  "jin10.com",
  "gelonghui.com",
  // 科技资讯
  "36kr.com",
  "juejin.cn",
  // 社交/热搜类
  "zhihu.com",
  "weibo.com",
  "toutiao.com",
  // 视频类
  "bilibili.com",
  "douyin.com",
  "kuaishou.com",
  "iqiyi.com",
]

// Check if hostname is a private IP or localhost
function isPrivateIP(hostname: string): boolean {
  const privatePatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^localhost$/i,
    /^metadata\.google\.internal$/i,
    /^169\.254\.169\.254$/,
  ]
  return privatePatterns.some(pattern => pattern.test(hostname))
}

// Validate URL to prevent SSRF attacks
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    // Only allow http/https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false
    }

    // Block private IPs and localhost
    if (isPrivateIP(parsed.hostname)) {
      return false
    }

    // Check if domain is in whitelist
    return ALLOWED_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`),
    )
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: "URL is required",
    })
  }

  // Validate URL to prevent SSRF attacks
  if (!validateUrl(url)) {
    throw createError({
      statusCode: 403,
      statusMessage: "URL is not allowed",
      data: {
        url,
        hint: "This domain is not in the allowed whitelist. Note that Single Page Applications (SPAs) that require JavaScript to render content are not supported.",
        allowedDomains: ALLOWED_DOMAINS.slice(0, 5).concat("..."), // Show first 5 domains
      },
    })
  }

  try {
    // Check if URL is from a known SPA domain
    const urlObj = new URL(url)
    const isSPA = SPA_DOMAINS.some(domain =>
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`),
    )

    if (isSPA) {
      console.warn(`[ZenReader] ${urlObj.hostname} is a known SPA - content extraction may fail`)
    }

    // 1. Fetch the page using standard fetch API (compatible with Cloudflare Workers)
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `HTTP ${response.status}: ${response.statusText}`,
      })
    }

    // 2. Get content type
    const contentType = response.headers.get("content-type") || ""

    // 3. Read content using standard Web APIs
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // 4. Charset detection - 先从 Content-Type 获取
    let charset = "utf-8"
    const charsetMatch = contentType.match(/charset=([\w-]+)/i)
    if (charsetMatch) {
      charset = charsetMatch[1].toLowerCase()
    }

    // 5. 如果 Content-Type 没有指定 charset，先用 ASCII 兼容方式预读取 HTML 检测 meta 标签
    if (!charsetMatch) {
      // 用 latin1 预读取（不会损坏任何字节）
      const previewDecoder = new TextDecoder("latin1")
      const preview = previewDecoder.decode(uint8Array.slice(0, 2048)) // 只读前 2KB

      // 检测 <meta charset="xxx"> 或 <meta http-equiv="Content-Type" content="text/html; charset=xxx">
      const metaCharsetMatch = preview.match(/<meta[^>]+charset=["']?([\w-]+)/i)
        || preview.match(/content=["'][^"']*charset=([\w-]+)/i)

      if (metaCharsetMatch) {
        charset = metaCharsetMatch[1].toLowerCase()
        // 标准化常见的编码名称
        if (charset === "gb2312" || charset === "gb_2312" || charset === "gbk") {
          charset = "gbk"
        }
      }
    }

    // 6. Decode content using TextDecoder
    let html = ""
    try {
      const decoder = new TextDecoder(charset, { fatal: false })
      html = decoder.decode(uint8Array)
    } catch {
      // 如果指定的编码不支持，回退到 UTF-8
      console.warn(`[ZenReader] Charset ${charset} not supported, falling back to UTF-8`)
      const utf8Decoder = new TextDecoder("utf-8", { fatal: false })
      html = utf8Decoder.decode(uint8Array)
    }

    // 6. Parse DOM
    const { document } = parseHTML(html) as any

    // 7. Extract content
    const reader = new Readability(document as any)
    const article = reader.parse()

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: "Could not extract content from this page",
      })
    }

    return {
      title: article.title,
      content: article.content, // HTML string
      excerpt: article.excerpt,
      byline: article.byline,
      siteName: article.siteName,
      length: article.length,
      url,
    }
  } catch (error: any) {
    console.error(`[ZenReader] Failed to read ${url}:`, error)

    // Check if this is a SPA-related error
    const urlObj = new URL(url)
    const isSPA = SPA_DOMAINS.some(domain =>
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`),
    )

    // Provide more detailed error information for debugging
    const errorMessage = error.message || String(error)
    const hint = isSPA
      ? "This site is a Single Page Application (SPA) that requires JavaScript to render content. Server-side extraction cannot work with SPAs."
      : "This page might have anti-scraping protection or use a complex HTML structure that Readability cannot parse."

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to extract content",
      data: {
        url,
        error: errorMessage,
        hint,
        isSPA,
      },
    })
  }
})
