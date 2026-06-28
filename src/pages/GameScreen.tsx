import { useState } from 'react'
import { useGameStore, Action } from '@/store/gameStore'
import { SCENARIOS, getTurnEndDate } from '@/data/scenarios'
import { useScenarioLoader } from '@/hooks/useScenarioLoader'
import ResizableLayout from '@/components/ResizableLayout'
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

  const leftPanel = (
    <div className="flex flex-col h-full border-r border-zinc-800">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-zinc-800 shrink-0">
        <span className="font-bold text-sm">{scenario.market}</span>
        {currentPrice > 0 && (
          <span className="text-white font-mono text-sm">
            ₩{currentPrice.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <CandleChart
          bgCandles={bgCandles}
          gameCandles={visibleCandles}
          scenarioStartDate={scenario.startDate}
        />
      </div>
    </div>
  )

  const rightPanel = (
    <div className="flex flex-col h-full overflow-hidden bg-[#0f0f0f]">

      {/* 날짜 + 턴 */}
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-2xl font-bold font-mono tracking-wide">{turnEndDate}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{scenario.title} · 턴 {currentTurn}/{totalTurns}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              phase === 'first' ? 'bg-zinc-700 text-zinc-300'
              : phase === 'emotion' ? 'bg-yellow-400/20 text-yellow-400'
              : 'bg-green-400/20 text-green-400'
            }`}>
              {phase === 'first' ? '① 1차 결정' : phase === 'emotion' ? '② 신호 확인' : '③ 최종 결정'}
            </span>
          </div>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(currentTurn / totalTurns) * 100}%` }} />
        </div>
      </div>

      {/* 자산 + 액션 */}
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-zinc-500">평가 자산</p>
            <p className="text-lg font-bold font-mono">₩{totalAsset.toLocaleString()}</p>
            <p className={`text-xs font-mono ${profit >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ({profitRate.toFixed(2)}%)
            </p>
          </div>
          {holdings > 0 && (
            <div className="text-right text-[10px] text-zinc-500 space-y-0.5">
              <p>현금 ₩{Math.floor(cash / 10000).toLocaleString()}만</p>
              <p>보유 {holdings.toFixed(2)} DOGE</p>
            </div>
          )}
        </div>

        {phase === 'first' && (
          <>
            <p className="text-xs text-zinc-400 mb-2">
              <span className="text-yellow-400 font-bold">차트만 보고</span> 1차 결정 — 감정 신호 공개 전
            </p>
            <ActionButtons onSelect={handleFirstChoice} />
          </>
        )}
        {phase === 'emotion' && (
          <p className="text-xs text-zinc-400 text-center py-1">
            1차 선택: <span className="text-yellow-400 font-bold">
              {firstChoice === 'buy' ? '매수 📈' : firstChoice === 'sell' ? '매도 📉' : '보유 ⏸'}
            </span> — 아래 감정 신호 확인 후 최종 결정
          </p>
        )}
        {phase === 'second' && (
          <>
            <p className="text-xs text-zinc-400 mb-2">
              감정 신호를 봤습니다. <span className="text-yellow-400 font-bold">최종 결정</span>하세요
            </p>
            <ActionButtons onSelect={handleSecondChoice} />
          </>
        )}
      </div>

      {/* 감정 신호 탭 (메인 콘텐츠) */}
      <div className="flex-1 flex flex-col min-h-0">
        <EmotionPanel
          scenarioId={scenarioId!}
          turnEndDate={turnEndDate}
          isRevealed={phase !== 'first'}
          onConfirm={() => setPhase('second')}
          showConfirm={phase === 'emotion'}
        />
      </div>

      {/* 매매 내역 (접어두기 가능) */}
      <details className="border-t border-zinc-800 shrink-0">
        <summary className="px-4 py-2 text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 select-none">
          매매 내역 ({useGameStore.getState().records.length}건)
        </summary>
        <div className="px-4 pb-3 max-h-40 overflow-y-auto">
          <TradeHistory />
        </div>
      </details>
    </div>
  )

  return (
    <ResizableLayout
      left={leftPanel}
      right={rightPanel}
      defaultLeftPct={35}
      minLeftPct={20}
      maxLeftPct={60}
    />
  )
}
