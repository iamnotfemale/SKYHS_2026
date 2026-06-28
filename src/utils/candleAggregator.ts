import { Candle } from '@/api/upbit'

export type Interval = 'day' | 'week' | 'month'

function getGroupKey(kstDateStr: string, interval: Interval): string {
  const d = new Date(kstDateStr.split('T')[0])
  if (interval === 'day') return kstDateStr.split('T')[0]
  if (interval === 'week') {
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day // 월요일 기준
    d.setDate(d.getDate() + diff)
    return d.toISOString().split('T')[0]
  }
  // month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function aggregateCandles(candles: Candle[], interval: Interval): Candle[] {
  if (interval === 'day') return candles

  const groups = new Map<string, Candle[]>()
  for (const c of candles) {
    const key = getGroupKey(c.candle_date_time_kst, interval)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(c)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({
      ...group[0],
      candle_date_time_kst: key + 'T09:00:00',
      opening_price: group[0].opening_price,
      trade_price: group[group.length - 1].trade_price,
      high_price: Math.max(...group.map((c) => c.high_price)),
      low_price: Math.min(...group.map((c) => c.low_price)),
      candle_acc_trade_volume: group.reduce((s, c) => s + c.candle_acc_trade_volume, 0),
    }))
}
