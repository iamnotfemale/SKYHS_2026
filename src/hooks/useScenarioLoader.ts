import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { fetchDayCandles, Candle } from '@/api/upbit'
import { fetchFearGreedHistory } from '@/api/fearGreed'
import { SCENARIOS, getScenarioToParam } from '@/data/scenarios'

export function useScenarioLoader() {
  const { scenarioId, setCandles, setBgCandles, setFearGreedMap, setLoading } = useGameStore()

  useEffect(() => {
    if (!scenarioId) return
    const scenario = SCENARIOS.find((s) => s.id === scenarioId)
    if (!scenario) return

    const load = async () => {
      setLoading(true)
      try {
        const toParam = getScenarioToParam(scenario)
        const gameCount = scenario.totalTurns * scenario.intervalDays + 5

        // 배경 차트: 시나리오 시작일 기준 약 1년 전 (200캔들 ≈ 6.5개월)
        // Upbit 1회 최대 200개 제한으로 두 번 호출해 ~1년치 확보
        const bgTo = scenario.startDate + 'T00:00:00Z'

        const [gameCandleData, bg1, bg2, fearGreedMap] = await Promise.all([
          fetchDayCandles(scenario.market, toParam, gameCount),
          fetchDayCandles(scenario.market, bgTo, 200),
          fetchDayCandles(scenario.market, getBgMidPoint(scenario.startDate), 200),
          fetchFearGreedHistory(2200),
        ])

        // 중복 제거 후 시간순 병합
        const bgAll = dedup([...bg2, ...bg1])

        setCandles(gameCandleData)
        setBgCandles(bgAll)
        setFearGreedMap(fearGreedMap)
      } catch (e) {
        console.error('데이터 로딩 실패', e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [scenarioId])
}

/** 시작일로부터 약 200일 전 날짜 (두 번째 배경 페이지 기준점) */
function getBgMidPoint(startDate: string): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() - 200)
  return d.toISOString().split('.')[0] + 'Z'
}

/** timestamp 기준 중복 캔들 제거 후 시간순 정렬 */
function dedup(candles: Candle[]): Candle[] {
  const seen = new Set<number>()
  return candles
    .filter((c) => {
      if (seen.has(c.timestamp)) return false
      seen.add(c.timestamp)
      return true
    })
    .sort((a, b) => a.timestamp - b.timestamp)
}
