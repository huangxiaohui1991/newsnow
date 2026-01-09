/**
 * Keyword Extraction Utility
 * Extracts core keywords from news titles for topic matching
 */

const STOP_WORDS = [
  "的",
  "了",
  "在",
  "是",
  "我",
  "有",
  "和",
  "就",
  "不",
  "人",
  "都",
  "一",
  "一个",
  "上",
  "也",
  "很",
  "到",
  "说",
  "要",
  "去",
  "你",
  "会",
  "着",
  "没有",
  "看",
  "好",
  "自己",
  "这",
  "与",
  "及",
  "等",
  "或",
]

/**
 * Extract hashtags from title
 * @example extractHashtags("#苹果发布会#引发热议") => ["苹果发布会"]
 */
export function extractHashtags(title: string): string[] {
  const hashtagMatch = title.match(/#([^#]+)#/g)
  if (hashtagMatch) {
    return hashtagMatch.map(h => h.replace(/#/g, ""))
  }
  return []
}

/**
 * Extract core keywords from title
 * Strategy:
 * 1. If title contains #xxx#, extract hashtag directly
 * 2. Otherwise use simple word segmentation
 * 3. Filter stop words
 * 4. Return top 3 keywords
 *
 * @example extractKeywords("#苹果发布会#引发热议") => ["苹果发布会"]
 * @example extractKeywords("这是一个关于苹果的新闻") => ["苹果", "新闻"]
 */
export function extractKeywords(title: string): string[] {
  // 1. Extract hashtag first
  const hashtags = extractHashtags(title)
  if (hashtags.length > 0) {
    return hashtags
  }

  // 2. Simple word segmentation (can be optimized with jieba later)
  const words = title
    .replace(/[^\u4E00-\u9FA5a-z0-9]/gi, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2)
    .filter(w => !STOP_WORDS.includes(w))

  // 3. Return top 3 keywords
  return words.slice(0, 3)
}

/**
 * Normalize keyword for matching (remove special chars, lowercase)
 */
export function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^\u4E00-\u9FA5a-z0-9]/g, "")
    .trim()
}
