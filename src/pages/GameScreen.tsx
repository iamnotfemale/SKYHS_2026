import { useState } from 'react'
import { useGameStore, Action } from '@/store/gameStore'
import { SCENARIOS, getTurnEndDate } from '@/data/scenarios'
import { useScenarioLoader } from '@/hooks/useScenarioLoader'
import ResizableLayout from '@/components/ResizableLayout'
import CandleChart from '@/components/CandleChart'
import ActionButtons from '@/components/ActionButtons'
import TradeHistory from '@/components/TradeHistory'
import EmotionPanel from '@/components/EmotionPanel'

type Phase = 'first' | 'emotion'

const ACTION_LABEL: Record<NonNullable<Action>, string> = {
  buy: '매수 📈',
  sell: '매도 📉',
  hold: '보유 ⏸',
}
const PCT_OPTIONS = [10, 25, 50, 100]

export default function GameScreen() {
  useScenarioLoader()

  const {
    currentTurn, totalTurns,
    scenarioId, candles, bgCandles, isLoading,
    cash, holdings, fearGreedMap, avgPrice,
    recordFirstChoice, recordSecondChoice, nextTurn,
  } = useGameStore()

  const [phase, setPhase] = useState<Phase>('first')
  const [firstChoice, setFirstChoice] = useState<Action>(null)
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [modalAction, setModalAction] = useState<Action>(null)
  const [modalPct, setModalPct] = useState(50)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const coinTicker = scenario.market.split('-')[1]
  const visibleCandles = candles.slice(0, currentTurn * scenario.intervalDays)
  const currentPrice = visibleCandles[visibleCandles.length - 1]?.trade_price ?? 0
  const turnEndDate = getTurnEndDate(scenario, currentTurn)

  const holdingsValue = holdings * currentPrice
  const totalAsset = cash + holdingsValue
  const profit = totalAsset - 100_000_000
  const profitRate = (profit / 100_000_000) * 100

  const fg = fearGreedMap[turnEndDate]
  const fgValue = fg?.value ?? null
  const fgLabel = fg?.classification ?? '데이터 없음'

  const handleFirstChoice = (action: Action) => {
    setFirstChoice(action)
    recordFirstChoice(action)
    setPhase('emotion')
  }

  const openFinalModal = () => {
    setModalAction(firstChoice)   // 1차 선택 pre-select
    setModalPct(50)
    setShowFinalModal(true)
  }

  const handleSecondChoice = () => {
    if (!modalAction) return
    const pct = modalAction === 'hold' ? 1 : modalPct / 100
    setShowFinalModal(false)
    recordSecondChoice(modalAction, currentPrice, pct)
    setPhase('first')
    setFirstChoice(null)
    nextTurn()
  }

  const closeModal = () => {
    setShowFinalModal(false)
  }

  // 매수 예상 금액 / 매도 예상 수량
  const buyAmount = Math.floor(cash * modalPct / 100)
  const sellCoins = holdings * modalPct / 100
  const sellValue = Math.floor(sellCoins * currentPrice)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <span className="text-white font-mono text-sm">₩{currentPrice.toLocaleString()}</span>
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
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">

      {/* 날짜 + 턴 */}
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-2xl font-bold font-mono tracking-wide">{turnEndDate}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{scenario.title} · 턴 {currentTurn}/{totalTurns}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 ${
            phase === 'first' ? 'bg-zinc-700 text-zinc-300' : 'bg-white/10 text-white'
          }`}>
            {phase === 'first' ? '① 1차 결정' : '② 신호 확인'}
          </span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(currentTurn / totalTurns) * 100}%` }} />
        </div>
      </div>

      {/* 자산 현황 */}
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        {/* 평가 자산 */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-[10px] text-zinc-500 mb-0.5">평가 자산</p>
            <p className="text-xl font-bold font-mono">₩{totalAsset.toLocaleString()}</p>
            <p className={`text-xs font-mono ${profit >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ({profitRate.toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* 현금 / 코인 보유 현황 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-zinc-900 rounded-xl px-3 py-2">
            <p className="text-[10px] text-zinc-500 mb-0.5">현금</p>
            <p className="text-base font-bold font-mono text-white">
              ₩{cash >= 10000 ? `${Math.floor(cash / 10000).toLocaleString()}만` : cash.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl px-3 py-2">
            <p className="text-[10px] text-zinc-500 mb-0.5">보유 {coinTicker}</p>
            <p className="text-base font-bold font-mono text-white">
              {holdings > 0 ? holdings.toFixed(2) : '0'}
            </p>
            {holdings > 0 && (
              <p className="text-[10px] text-zinc-500">
                ≈ ₩{Math.floor(holdingsValue / 10000).toLocaleString()}만
                {avgPrice > 0 && (
                  <span className={` ml-1 ${currentPrice >= avgPrice ? 'text-red-400' : 'text-blue-400'}`}>
                    ({currentPrice >= avgPrice ? '+' : ''}{(((currentPrice - avgPrice) / avgPrice) * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* 1차 결정 버튼 */}
        {phase === 'first' && (
          <>
            <p className="text-xs text-zinc-400 mb-2">
              <span className="text-white font-bold">차트만 보고</span> 1차 결정 — 감정 신호 공개 전
            </p>
            <ActionButtons onSelect={handleFirstChoice} />
          </>
        )}
        {phase === 'emotion' && (
          <p className="text-xs text-zinc-400 text-center py-1">
            1차 선택: <span className="text-white font-bold">
              {firstChoice ? ACTION_LABEL[firstChoice] : '—'}
            </span> — 아래 감정 신호 확인 후 최종 결정
          </p>
        )}
      </div>

      {/* 공포탐욕지수 위젯 */}
      <div className="px-4 py-2.5 border-b border-zinc-800 shrink-0">
        <p className="text-[10px] text-zinc-500 mb-1.5">공포탐욕지수</p>
        {!fg || phase === 'first' ? (
          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <span>🔒</span><span>1차 결정 후 공개</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold font-mono ${
              fgValue! >= 60 ? 'text-red-400' : fgValue! >= 40 ? 'text-white' : 'text-blue-400'
            }`}>{fgValue}</span>
            <div className="flex-1">
              <div className="relative h-2 rounded-full bg-gradient-to-r from-blue-600 via-yellow-400 to-red-500 mb-1">
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-zinc-900 shadow"
                  style={{ left: `calc(${fgValue}% - 6px)` }} />
              </div>
              <p className={`text-[10px] ${
                fgValue! >= 60 ? 'text-red-400' : fgValue! >= 40 ? 'text-white' : 'text-blue-400'
              }`}>{fgLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* 뉴스·커뮤니티 패널 */}
      <div className="flex-1 flex flex-col min-h-0">
        <EmotionPanel
          scenarioId={scenarioId!}
          turnEndDate={turnEndDate}
          isRevealed={phase !== 'first'}
          onConfirm={openFinalModal}
          showConfirm={phase === 'emotion'}
        />
      </div>

      {/* 매매 내역 */}
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
    <>
      <ResizableLayout
        left={leftPanel}
        right={rightPanel}
        defaultLeftPct={60}
        minLeftPct={35}
        maxLeftPct={75}
      />

      {/* 최종 결정 팝업 */}
      {showFinalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-80 bg-[#1c1c1c] border border-zinc-700 rounded-2xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 text-lg leading-none">✕</button>

            <p className="text-xs text-zinc-500 mb-0.5">최종 결정</p>
            <p className="text-sm text-zinc-400 mb-4">
              1차 선택: <span className="text-white font-bold">{firstChoice ? ACTION_LABEL[firstChoice] : '—'}</span>
            </p>

            {/* 액션 선택 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['buy', 'hold', 'sell'] as const).map((act) => {
                const isDisabled =
                  (act === 'buy' && cash <= 0) ||
                  (act === 'sell' && holdings <= 0)
                return (
                  <button
                    key={act}
                    onClick={() => !isDisabled && setModalAction(act)}
                    disabled={isDisabled}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      isDisabled
                        ? 'opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-600'
                        : modalAction === act
                          ? act === 'buy' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : act === 'sell' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-zinc-500 text-white'
                          : act === 'buy' ? 'bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25'
                            : act === 'sell' ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400 hover:bg-blue-500/25'
                            : 'bg-zinc-700/40 border border-zinc-600 text-zinc-300 hover:bg-zinc-700/60'
                    }`}
                  >
                    {act === 'buy' ? '매수' : act === 'sell' ? '매도' : '보유'}
                    {isDisabled && <span className="block text-[9px] font-normal mt-0.5">{act === 'buy' ? '현금 없음' : '보유 없음'}</span>}
                  </button>
                )
              })}
            </div>

            {/* 비율 선택 (매수/매도만) */}
            {(modalAction === 'buy' || modalAction === 'sell') && (
              <div className="mb-4">
                <p className="text-[10px] text-zinc-500 mb-2">
                  {modalAction === 'buy' ? '매수 비율 (보유 현금 기준)' : '매도 비율 (보유 수량 기준)'}
                </p>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {PCT_OPTIONS.map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setModalPct(pct)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                        modalPct === pct ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* 거래 미리보기 */}
                <div className="bg-zinc-900/80 rounded-xl px-3 py-2.5 text-xs">
                  {modalAction === 'buy' ? (
                    <div className="flex justify-between text-zinc-300">
                      <span>₩{buyAmount.toLocaleString()} 사용</span>
                      <span className="text-red-400">≈ {(buyAmount / currentPrice).toFixed(2)} {coinTicker} 매수</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-zinc-300">
                      <span>{sellCoins.toFixed(2)} {coinTicker} 매도</span>
                      <span className="text-blue-400">≈ ₩{sellValue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 확정 버튼 */}
            <button
              onClick={handleSecondChoice}
              disabled={!modalAction}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                modalAction
                  ? 'bg-white text-black hover:bg-white/80'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {!modalAction
                ? '위에서 선택하세요'
                : modalAction === 'hold'
                ? '보유 확정'
                : `${modalAction === 'buy' ? '매수' : '매도'} ${modalPct}% 확정`
              }
            </button>

            <button onClick={closeModal} className="mt-2 w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              취소하고 다시 보기
            </button>
          </div>
        </div>
      )}
    </>
  )
}


