import axios from 'axios'

interface FGRawEntry {
  value: string
  value_classification: string
  timestamp: string
}

export interface FearGreedEntry {
  value: number
  classification: string
}

export type FearGreedMap = Record<string, FearGreedEntry> // "YYYY-MM-DD" → entry

export async function fetchFearGreedHistory(limit = 2200): Promise<FearGreedMap> {
  const { data } = await axios.get('https://api.alternative.me/fng/', {
    params: { limit, format: 'json' },
  })

  const map: FearGreedMap = {}
  for (const entry of data.data as FGRawEntry[]) {
    const date = new Date(parseInt(entry.timestamp) * 1000)
    const dateStr = date.toISOString().split('T')[0]
    map[dateStr] = {
      value: parseInt(entry.value),
      classification: entry.value_classification,
    }
  }
  return map
}
