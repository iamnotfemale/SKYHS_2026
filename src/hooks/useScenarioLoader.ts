import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { fetchDayCandles } from '@/api/upbit'
import { fetchFearGreedHistory } from '@/api/fearGreed'
import { SCENARIOS, getScenarioToParam } from '@/data/scenarios'

export function useScenarioLoader() {
  const { scenarioId, setCandles, setFearGreedMap, setLoading } = useGameStore()

  useEffect(() => {
    if (!scenarioId) return
    const scenario = SCENARIOS.find((s) => s.id === scenarioId)
    if (!scenario) return

    const load = async () => {
      setLoading(true)
      try {
        const toParam = getScenarioToParam(scenario)
        const count = scenario.totalTurns * scenario.intervalDays + 5

        const [candles, fearGreedMap] = await Promise.all([
          fetchDayCandles(scenario.market, toParam, count),
          fetchFearGreedHistory(2200),
        ])

        setCandles(candles)
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
