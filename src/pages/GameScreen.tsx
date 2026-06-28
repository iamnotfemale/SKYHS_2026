import { useState } from 'react'
import { useGameStore, Action } from '@/store/gameStore'
import { SCENARIOS, getTurnEndDate } from '@/data/scenarios'
import { useScenarioLoader } from '@/hooks/useScenarioLoader'
import CandleChart from '@/components/CandleChart'
import EmotionPanel from '@/components/EmotionPanel'
import ActionButtons from '@/components/ActionButtons'
import Portfolio from '@/components/Portfolio'

type Phase = 'first' | 'emotion' | 'second'

export default function GameScreen() {
  useScenarioLoader()

  const {
    currentTurn, totalTurns,
    scenarioId, candles, isLoading,
    recordFirstChoice, recordSecondChoice, nextTurn,
  } = useGameStore()

  const [phase, setPhase] = useState<Phase>('first')
  const [firstChoice, setFirstChoice] = useState<Action>(null)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const visibleCandles = candles.slice(0, currentTurn * scenario.intervalDays)
  const currentPrice = visibleCandles[visibleCandles.length - 1]?.trade_price ?? 0
  const turnEndDate = getTurnEndDate(scenario, currentTurn)

  const handleFirstChoice = (action: Action) => {
    setFirstChoice(action)
    recordFirstChoice(action)
    setPhase('emotion')
  }

  const handleSecondChoice = (action: Action) => {
    recordSecondChoice(action, currentPrice)
    setPhase('first')
    setFirstChoice(null)
    nextTurn()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400">데이터 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 gap-4 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-sm">턴 {currentTurn} / {totalTurns}</span>
        <div className="flex-1 mx-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all"
            style={{ width: `${(currentTurn / totalTurns) * 100}%` }}
          />
        </div>
        <Portfolio currentPrice={currentPrice} />
      </div>

      {/* 날짜 */}
      <p className="text-xs text-zinc-500 text-center">{turnEndDate} 기준</p>

      {/* 차트 */}
      <CandleChart candles={visibleCandles} />

      {/* 1차 선택 */}
      {phase === 'first' && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-zinc-300">
            <span className="text-yellow-400 font-bold">차트만 보고</span> 결정하세요
          </p>
          <ActionButtons onSelect={handleFirstChoice} />
        </div>
      )}

      {/* 감정 신호 */}
      {phase === 'emotion' && (
        <EmotionPanel
          turnEndDate={turnEndDate}
          onConfirm={() => setPhase('second')}
        />
      )}

      {/* 2차 선택 */}
      {phase === 'second' && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-zinc-300">
            감정 신호를 본 뒤 <span className="text-yellow-400 font-bold">최종 결정</span>하세요
          </p>
          {firstChoice && (
            <p className="text-center text-xs text-zinc-500">
              1차 선택: {firstChoice === 'buy' ? '매수' : firstChoice === 'sell' ? '매도' : '보유'}
            </p>
          )}
          <ActionButtons onSelect={handleSecondChoice} />
        </div>
      )}
    </div>
  )
}
