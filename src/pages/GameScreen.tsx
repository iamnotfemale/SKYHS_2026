import { useState } from 'react'
import { useGameStore, Action } from '@/store/gameStore'
import { SCENARIOS, getTurnEndDate } from '@/data/scenarios'
import { useScenarioLoader } from '@/hooks/useScenarioLoader'
import CandleChart from '@/components/CandleChart'
import ActionButtons from '@/components/ActionButtons'
import TradeHistory from '@/components/TradeHistory'
import EmotionPanel from '@/components/EmotionPanel'

type Phase = 'first' | 'emotion' | 'second'

export default function GameScreen() {
  useScenarioLoader()

  const {
    currentTurn, totalTurns,
    scenarioId, candles, bgCandles, isLoading,
    cash, holdings,
    recordFirstChoice, recordSecondChoice, nextTurn,
  } = useGameStore()

  const [phase, setPhase] = useState<Phase>('first')
  const [firstChoice, setFirstChoice] = useState<Action>(null)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const visibleCandles = candles.slice(0, currentTurn * scenario.intervalDays)
  const currentPrice = visibleCandles[visibleCandles.length - 1]?.trade_price ?? 0
  const turnEndDate = getTurnEndDate(scenario, currentTurn)

  const holdingsValue = holdings * currentPrice
  const totalAsset = cash + holdingsValue
  const profit = totalAsset - 100_000_000
  const profitRate = (profit / 100_000_000) * 100

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
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">시장 데이터 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f0f]">

      {/* ── 좌측: 차트 영역 ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800">
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800">
          <span className="font-bold text-sm">{scenario.market}</span>
          <span className="text-zinc-400 text-sm">{turnEndDate} 기준</span>
          {currentPrice > 0 && (
            <span className="text-white font-mono text-sm">
              ₩{currentPrice.toLocaleString()}
            </span>
          )}
        </div>
        {/* 차트 */}
        <div className="flex-1 min-h-0">
          <CandleChart
            bgCandles={bgCandles}
            gameCandles={visibleCandles}
            scenarioStartDate={scenario.startDate}
          />
        </div>
      </div>

      {/* ── 우측: 정보 패널 ── */}
      <div className="w-[320px] flex flex-col overflow-y-auto bg-[#0f0f0f]">

        {/* 턴 진행 */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">{scenario.title}</span>
            <span className="text-xs text-zinc-400">턴 {currentTurn} / {totalTurns}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all"
              style={{ width: `${(currentTurn / totalTurns) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-center text-zinc-500">
            {phase === 'first' && '① 차트만 보고 결정'}
            {phase === 'emotion' && '② 감정 신호 확인 중'}
            {phase === 'second' && '③ 최종 결정'}
          </div>
        </div>

        {/* 평가 자산 */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">평가 자산</p>
          <p className="text-xl font-bold font-mono">
            ₩{totalAsset.toLocaleString()}
          </p>
          <p className={`text-xs font-mono mt-0.5 ${profit >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
            {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ({profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)
          </p>
          <div className="flex gap-4 mt-2 text-xs text-zinc-500">
            <span>현금 ₩{cash.toLocaleString()}</span>
            {holdings > 0 && (
              <span>보유 {holdings.toFixed(4)} ({scenario.market.split('-')[1]})</span>
            )}
          </div>
        </div>

        {/* 액션 영역 */}
        <div className="px-4 py-3 border-b border-zinc-800">
          {phase === 'first' && (
            <>
              <p className="text-xs text-zinc-400 mb-2">
                <span className="text-yellow-400 font-bold">차트만 보고</span> 결정하세요 (1차)
              </p>
              <ActionButtons onSelect={handleFirstChoice} />
            </>
          )}
          {phase === 'emotion' && (
            <p className="text-xs text-zinc-400 text-center py-2">
              1차 선택: <span className="text-yellow-400">
                {firstChoice === 'buy' ? '매수' : firstChoice === 'sell' ? '매도' : '보유'}
              </span> — 감정 신호 확인 후 최종 결정하세요
            </p>
          )}
          {phase === 'second' && (
            <>
              <p className="text-xs text-zinc-400 mb-2">
                감정 신호를 본 뒤 <span className="text-yellow-400 font-bold">최종 결정</span>하세요 (2차)
              </p>
              <ActionButtons onSelect={handleSecondChoice} />
            </>
          )}
        </div>

        {/* 감정 신호 (감정 확인 단계에서만) */}
        {phase === 'emotion' && (
          <div className="border-b border-zinc-800">
            <EmotionPanel turnEndDate={turnEndDate} onConfirm={() => setPhase('second')} />
          </div>
        )}

        {/* 매매 내역 */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2">매매 내역</p>
          <TradeHistory />
        </div>

        {/* 커뮤니티 / 뉴스 (감정 신호 단계 외에도 상시 표시 — 이전 턴 데이터) */}
        <div className="px-4 py-3">
          <p className="text-xs text-zinc-500 mb-2">이전 턴 뉴스</p>
          <p className="text-zinc-600 text-xs">(뉴스 작성 예정)</p>
        </div>
      </div>
    </div>
  )
}
