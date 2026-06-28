import axios from 'axios'

export interface NewsItem {
  id: string
  title: string
  body: string
  url: string
  source: string
  published_on: number
}

export type NewsMap = Record<string, NewsItem[]>  // "YYYY-MM-DD" → items

async function fetchPage(categories: string, beforeTs: number): Promise<NewsItem[]> {
  const { data } = await axios.get('https://min-api.cryptocompare.com/data/v2/news/', {
    params: { categories, lTs: beforeTs, lang: 'EN', sortOrder: 'latest' },
  })
  return (data.Data ?? []) as NewsItem[]
}

/**
 * startDate ~ endDate 기간의 뉴스를 날짜별 맵으로 반환.
 * CryptoCompare는 최대 50건/페이지 → 역순 페이지네이션으로 전 기간 수집.
 */
export async function fetchScenarioNews(
  categories: string,
  startDate: string,
  endDate: string,
): Promise<NewsMap> {
  const map: NewsMap = {}
  const startTs = Math.floor(new Date(startDate).getTime() / 1000)

  const afterEnd = new Date(endDate)
  afterEnd.setDate(afterEnd.getDate() + 1)
  let currentTs = Math.floor(afterEnd.getTime() / 1000)

  for (let page = 0; page < 8; page++) {
    const items = await fetchPage(categories, currentTs)
    if (items.length === 0) break

    let reachedStart = false
    for (const item of items) {
      if (item.published_on < startTs) { reachedStart = true; break }
      const date = new Date(item.published_on * 1000).toISOString().split('T')[0]
      if (!map[date]) map[date] = []
      map[date].push(item)
    }

    if (reachedStart) break
    currentTs = items[items.length - 1].published_on - 1
    await new Promise((r) => setTimeout(r, 120))  // rate limit 방지
  }

  return map
}
