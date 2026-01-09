import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import { ofetch } from 'ofetch'
import iconv from 'iconv-lite'
import { Buffer } from 'node:buffer'

// Allowed domains for SSRF protection
const ALLOWED_DOMAINS = [
    'weibo.com', 'weibo.cn',
    'news.qq.com', 'qq.com',
    'sina.com.cn',
    '163.com',
    'people.com.cn',
    'xinhuanet.com',
    'cctv.com',
    'chinadaily.com.cn',
    'cnr.cn',
    'thepaper.cn',
    '36kr.com',
    'ithome.com',
    'zcool.com.cn',
    'bilibili.com',
    'zhihu.com',
    'toutiao.com',
    'sohu.com',
    'ifeng.com',
    '163.com',
    'gov.cn',
    'news.cn'
]

// Check if hostname is a private IP or localhost
function isPrivateIP(hostname: string): boolean {
    const privatePatterns = [
        /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
        /^localhost$/i,
        /^metadata\.google\.internal$/i,
        /^169\.254\.169\.254$/
    ]
    return privatePatterns.some(pattern => pattern.test(hostname))
}

// Validate URL to prevent SSRF attacks
function validateUrl(url: string): boolean {
    try {
        const parsed = new URL(url)

        // Only allow http/https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false
        }

        // Block private IPs and localhost
        if (isPrivateIP(parsed.hostname)) {
            return false
        }

        // Check if domain is in whitelist
        return ALLOWED_DOMAINS.some(domain =>
            parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
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
        })
    }

    try {
        // 1. Fetch the page as a buffer/arrayBuffer to handle encoding manually
        const response = await ofetch.native(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
        })

        const buffer = Buffer.from(await response.arrayBuffer())
        const contentType = response.headers.get('content-type') || ''

        let charset = 'utf-8'
        const charsetMatch = contentType.match(/charset=([\w-]+)/i)
        if (charsetMatch) {
            charset = charsetMatch[1].toLowerCase()
        } else {
            // Fallback: sniff from HTML meta tags
            // Use 'latin1' to preserve byte structure for non-ASCII content
            const tempHtml = buffer.toString('latin1')
            const metaMatch = tempHtml.match(/<meta[^>]+charset=["']?([\w-]+)/i)
            if (metaMatch) {
                charset = metaMatch[1].toLowerCase()
            }
        }

        // 2. Decode content
        let html = ''
        try {
            html = iconv.decode(buffer, charset)
        } catch {
            console.warn(`[ZenReader] Failed to decode with ${charset}, falling back to utf-8`)
            html = buffer.toString('utf-8')
        }

        // 3. Parse DOM
        const { document } = parseHTML(html) as any

        // 4. Extract content
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
            url: url
        }

    } catch (error: any) {
        console.error(`[ZenReader] Failed to read ${url}:`, error)
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to extract content",
            data: error.message
        })
    }
})
