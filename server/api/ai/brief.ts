import process from "node:process"

export default defineEventHandler(async (event) => {
  const apiKey = process.env.BIGMODEL_API_KEY
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server API Key not confirmed",
    })
  }

  // 1. Fetch top news
  // Allow client to specify sources
  const query = getQuery(event)
  let sourcesToScan: string[] = ["36kr", "zhihudaily", "ithome"]

  if (query.sources) {
    const customSources = String(query.sources).split(",").filter(s => s.trim().length > 0)
    if (customSources.length > 0) {
      sourcesToScan = customSources.slice(0, 5) // Limit to 5 sources to avoid timeout
    }
  }

  const newsData: { title: string, url: string, source: string }[] = []

  try {
    const promises = sourcesToScan.map(id => $fetch(`/s?id=${id}&type=hottest`))
    const results = await Promise.allSettled(promises)

    results.forEach((res, index) => {
      if (res.status === "fulfilled" && (res.value as any)?.items) {
        const sourceId = sourcesToScan[index]
        const items = (res.value as any).items.slice(0, 5).map((item: any) => ({
          title: item.title,
          url: item.url,
          source: sourceId,
        }))
        newsData.push(...items)
      }
    })
  } catch (e) {
    console.error("Failed to fetch news for brief:", e)
  }

  if (newsData.length === 0) {
    return {
      points: [{ content: "No sufficient news data to generate a brief.", title: "", url: "" }],
    }
  }

  const prompt = `
  You are a professional news editor. Please summarize the aggregated news headlines into 3-5 concise, engaging bullet points for a "Morning Brief".
  For each point, identify WHICH headline it corresponds to and return the response in strict JSON format.

  Input News:
  ${newsData.map((item, i) => `[${i}] ${item.title}`).join("\n")}

  Desired JSON format:
  {
    "points": [
      {
        "content": "Summzarized point text",
        "sourceIndex": 0
      }
    ]
  }

  Rules:
  1. Language: Chinese.
  2. Keep it professional and neutral.
  3. Strict JSON only.
  `

  // 2. Call GLM-4
  try {
    const response: any = await $fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: {
        model: "glm-4-flash",
        messages: [
          { role: "system", content: "You are a helpful news assistant that outputs strict JSON." },
          { role: "user", content: prompt },
        ],
        stream: false,
        response_format: { type: "json_object" },
      },
    })

    const resultJson = JSON.parse(response.choices?.[0]?.message?.content || "{}")
    const points = (resultJson.points || []).map((p: any) => {
      const original = newsData[p.sourceIndex] || { title: "", url: "" }
      return {
        content: p.content,
        title: original.title,
        url: original.url,
      }
    })

    return { points }
  } catch (e) {
    console.error("AI API Error:", e)
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to generate summary via AI",
    })
  }
})
