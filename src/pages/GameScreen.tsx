import { useState, useEffect, useRef } from 'react'
import { useGameStore, Action } from '@/store/gameStore'
import { SCENARIOS, getTurnStartDate, getTurnEndDate } from '@/data/scenarios'
import { useScenarioLoader } from '@/hooks/useScenarioLoader'
import { useCountUp } from '@/hooks/useCountUp'
import ResizableLayout from '@/components/ResizableLayout'
import CandleChart from '@/components/CandleChart'
import ActionButtons from '@/components/ActionButtons'
import EmotionPanel from '@/components/EmotionPanel'
import MidCheckModal from '@/components/MidCheckModal'
import IntroModal from '@/components/IntroModal'

type Phase = 'first' | 'emotion'

const ACTION_LABEL: Record<NonNullable<Action>, string> = {
  buy: '매수 📈', sell: '매도 📉', hold: '보유 ⏸',
}
const PCT_OPTIONS = [10, 25, 50, 100]

function getFgDescription(value: number): string {
  if (value < 20) return `극도의 공포 (패닉/리스크 회피 강화)`
  if (value < 40) return `공포 (방어적 포지션 확대)`
  if (value < 60) return `중립 (방향성 탐색)`
  if (value < 80) return `탐욕 (추격 매수·낙관 확대)`
  return `극도의 탐욕 (과열/과도한 자신감)`
}

export default function GameScreen() {
  useScenarioLoader()

  const {
    currentTurn, totalTurns,
    scenarioId, candles, bgCandles, isLoading,
    cash, holdings, fearGreedMap, avgPrice,
    recordFirstChoice, recordSecondChoice, nextTurn,
    records, setScreen,
  } = useGameStore()

  const [phase, setPhase] = useState<Phase>('first')
  const [firstChoice, setFirstChoice] = useState<Action>(null)
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [modalAction, setModalAction] = useState<Action>(null)
  const [modalPct, setModalPct] = useState(50)
  const [showIntro, setShowIntro] = useState(true)
  const [showMidCheck, setShowMidCheck] = useState(false)
  const midCheckShown = useRef(false)
  const [gaugeDisplayVal, setGaugeDisplayVal] = useState(0)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const coinTicker = scenario.market.split('-')[1]
  const visibleCandles = candles.slice(0, currentTurn * scenario.intervalDays)
  const currentPrice = visibleCandles[visibleCandles.length - 1]?.trade_price ?? 0
  const prevPrice = visibleCandles[visibleCandles.length - 2]?.trade_price ?? 0
  const priceUp = prevPrice > 0 ? currentPrice >= prevPrice : null
  const turnDisplayDate = getTurnStartDate(scenario, currentTurn)
  const turnEndDate = getTurnEndDate(scenario, currentTurn)

  const holdingsValue = holdings * currentPrice
  const totalAsset = cash + holdingsValue
  const profit = totalAsset - 100_000_000
  const profitRate = (profit / 100_000_000) * 100

  const fg = fearGreedMap[turnEndDate]
  const fgValue = fg?.value ?? null
  const fgLabel = fg?.classification ?? '데이터 없음'

  const animTotalAsset = useCountUp(totalAsset, 600)
  const animProfit = useCountUp(profit, 600)

  useEffect(() => {
    if (phase !== 'first' && fgValue !== null) {
      setGaugeDisplayVal(0)
      const t = setTimeout(() => setGaugeDisplayVal(fgValue), 60)
      return () => clearTimeout(t)
    } else {
      setGaugeDisplayVal(0)
    }
  }, [phase, fgValue])

  const midPoint = Math.floor(totalTurns / 2) + 1
  useEffect(() => {
    if (currentTurn === midPoint && !midCheckShown.current && currentTurn > 1) {
      midCheckShown.current = true
      const t = setTimeout(() => setShowMidCheck(true), 400)
      return () => clearTimeout(t)
    }
  }, [currentTurn, midPoint])

  const changedCount = records.filter((r) => r.firstChoice !== r.secondChoice).length

  const handleFirstChoice = (action: Action) => {
    setFirstChoice(action)
    recordFirstChoice(action)
    setPhase('emotion')
  }

  const openFinalModal = () => {
    setModalAction(firstChoice)
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

  const buyAmount = Math.floor(cash * modalPct / 100)
  const sellCoins = holdings * modalPct / 100
  const sellValue = Math.floor(sellCoins * currentPrice)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">시장 데이터 불러오는 중...</p>
        </div>
      </div>
    )
  }

  /* ── 공포탐욕 위젯 (공통) ── */
  const fearGreedWidget = (
    <div className="px-4 py-2.5 border-b border-zinc-200">
      <p className="text-[10px] text-zinc-400 mb-1.5">공포탐욕지수</p>
      {!fg || phase === 'first' ? (
        <div className="flex items-center gap-2 text-zinc-400 text-xs">
          <span>🔒</span><span>1차 결정 후 공개</span>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-2xl font-bold font-mono transition-colors duration-500 ${
              fgValue! >= 60 ? 'text-red-500' : fgValue! >= 40 ? 'text-zinc-700' : 'text-blue-500'
            }`}>{fgValue}</span>
            <div className="flex-1">
              <div className="relative h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 mb-1">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-zinc-400 shadow transition-all duration-700 ease-out"
                  style={{ left: `calc(${gaugeDisplayVal}% - 6px)` }}
                />
              </div>
              <p className={`text-[10px] ${
                fgValue! >= 60 ? 'text-red-500' : fgValue! >= 40 ? 'text-zinc-600' : 'text-blue-500'
              }`}>{fgLabel}</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400">{getFgDescription(fgValue!)}</p>
        </div>
      )}
    </div>
  )

  /* ── 데스크탑 좌측 패널 ── */
  const leftPanel = (
    <div className="flex flex-col h-full border-r border-zinc-200">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-zinc-200 shrink-0">
        <button
          onClick={() => setScreen('scenario')}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors mr-1"
        >
          ←
        </button>
        <span className="font-bold text-sm text-zinc-800">{scenario.market}</span>
        {currentPrice > 0 && (
          <span className={`font-bold font-mono text-sm ${priceUp === true ? 'text-red-500' : priceUp === false ? 'text-blue-500' : 'text-zinc-700'}`}>
            ₩{currentPrice.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <CandleChart bgCandles={bgCandles} gameCandles={visibleCandles} scenarioStartDate={scenario.startDate} />
      </div>
    </div>
  )

  /* ── 데스크탑 우측 패널 ── */
  const rightPanel = (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-zinc-200 shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-2xl font-bold font-mono tracking-wide text-zinc-900">{turnDisplayDate}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{scenario.title} · 턴 {currentTurn}/{totalTurns}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 transition-colors ${
            phase === 'first' ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-900 text-white'
          }`}>
            {phase === 'first' ? '① 1차 결정' : '② 신호 확인'}
          </span>
        </div>
        <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-900 rounded-full transition-all duration-500"
            style={{ width: `${(currentTurn / totalTurns) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 py-3 border-b border-zinc-200 shrink-0">
        <div className="mb-3">
          <p className="text-[10px] text-zinc-400 mb-0.5">평가 자산</p>
          <p className="text-xl font-bold font-mono text-zinc-900">₩{animTotalAsset.toLocaleString()}</p>
          <p className={`text-xs font-mono ${animProfit >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
            {animProfit >= 0 ? '+' : ''}{animProfit.toLocaleString()} ({profitRate.toFixed(2)}%)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-zinc-100 rounded-xl px-3 py-2">
            <p className="text-[10px] text-zinc-400 mb-0.5">현금</p>
            <p className="text-base font-bold font-mono text-zinc-900">
              ₩{cash >= 10000 ? `${Math.floor(cash / 10000).toLocaleString()}만` : cash.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-100 rounded-xl px-3 py-2">
            <p className="text-[10px] text-zinc-400 mb-0.5">보유 {coinTicker}</p>
            <p className="text-base font-bold font-mono text-zinc-900">{holdings > 0 ? holdings.toFixed(2) : '0'}</p>
            {holdings > 0 && (
              <p className="text-[10px] text-zinc-400">
                ≈ ₩{Math.floor(holdingsValue / 10000).toLocaleString()}만
                {avgPrice > 0 && (
                  <span className={`ml-1 ${currentPrice >= avgPrice ? 'text-red-500' : 'text-blue-500'}`}>
                    ({currentPrice >= avgPrice ? '+' : ''}{(((currentPrice - avgPrice) / avgPrice) * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        {phase === 'first' && (
          <>
            <p className="text-xs text-zinc-500 mb-2">
              <span className="text-zinc-900 font-bold">차트만 보고</span> 1차 결정 — 감정 신호 공개 전
            </p>
            <ActionButtons onSelect={handleFirstChoice} canBuy={cash > 0} canSell={holdings > 0} />
          </>
        )}
        {phase === 'emotion' && (
          <p className="text-xs text-zinc-500 text-center py-1">
            1차 선택: <span className="text-zinc-900 font-bold">{firstChoice ? ACTION_LABEL[firstChoice] : '—'}</span>
            {' '}— 아래 감정 신호 확인 후 최종 결정
          </p>
        )}
      </div>

      {fearGreedWidget}

      <div className="flex-1 flex flex-col min-h-0">
        <EmotionPanel scenarioId={scenarioId!} turnEndDate={turnEndDate}
          isRevealed={phase !== 'first'} onConfirm={openFinalModal} showConfirm={phase === 'emotion'} />
      </div>
    </div>
  )

  /* ── 최종 결정 팝업 ── */
  const finalModal = showFinalModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowFinalModal(false)}>
      <div className="relative w-80 bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setShowFinalModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-lg leading-none transition-colors">✕</button>
        <p className="text-xs text-zinc-400 mb-0.5">최종 결정</p>
        <p className="text-sm text-zinc-500 mb-4">
          1차 선택: <span className="text-zinc-900 font-bold">{firstChoice ? ACTION_LABEL[firstChoice] : '—'}</span>
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['buy', 'hold', 'sell'] as const).map((act) => {
            const isDisabled = (act === 'buy' && cash <= 0) || (act === 'sell' && holdings <= 0)
            return (
              <button key={act} onClick={() => !isDisabled && setModalAction(act)} disabled={isDisabled}
                className={`py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  isDisabled ? 'opacity-30 cursor-not-allowed bg-zinc-100 text-zinc-400'
                  : modalAction === act
                    ? act === 'buy' ? 'bg-red-500 text-white' : act === 'sell' ? 'bg-blue-500 text-white' : 'bg-zinc-600 text-white'
                    : act === 'buy' ? 'bg-red-50 border border-red-300 text-red-500 hover:bg-red-100'
                      : act === 'sell' ? 'bg-blue-50 border border-blue-300 text-blue-500 hover:bg-blue-100'
                      : 'bg-zinc-100 border border-zinc-300 text-zinc-600 hover:bg-zinc-200'
                }`}>
                {act === 'buy' ? '매수' : act === 'sell' ? '매도' : '보유'}
                {isDisabled && <span className="block text-[9px] font-normal mt-0.5">{act === 'buy' ? '현금 없음' : '보유 없음'}</span>}
              </button>
            )
          })}
        </div>
        {(modalAction === 'buy' || modalAction === 'sell') && (
          <div className="mb-4">
            <p className="text-[10px] text-zinc-400 mb-2">
              {modalAction === 'buy' ? '매수 비율 (현금 기준)' : '매도 비율 (수량 기준)'}
            </p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {PCT_OPTIONS.map((pct) => (
                <button key={pct} onClick={() => setModalPct(pct)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    modalPct === pct ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}>{pct}%</button>
              ))}
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs">
              {modalAction === 'buy' ? (
                <div className="flex justify-between text-zinc-600">
                  <span>₩{buyAmount.toLocaleString()} 사용</span>
                  <span className="text-red-500">≈ {(buyAmount / currentPrice).toFixed(2)} {coinTicker}</span>
                </div>
              ) : (
                <div className="flex justify-between text-zinc-600">
                  <span>{sellCoins.toFixed(2)} {coinTicker} 매도</span>
                  <span className="text-blue-500">≈ ₩{sellValue.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <button onClick={handleSecondChoice} disabled={!modalAction}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            modalAction
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30'
              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
          }`}>
          {!modalAction ? '위에서 선택하세요'
            : modalAction === 'hold' ? '보유 확정'
            : `${modalAction === 'buy' ? '매수' : '매도'} ${modalPct}% 확정`}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ────── 모바일 레이아웃 (<md) ────── */}
      <div className="md:hidden flex flex-col h-screen bg-white overflow-hidden">
        <div className="shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-200">
            <button
              onClick={() => setScreen('scenario')}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              ←
            </button>
            <span className="font-bold text-xs text-zinc-700">{scenario.market}</span>
            {currentPrice > 0 && (
              <span className={`font-bold font-mono text-xs ${priceUp === true ? 'text-red-500' : priceUp === false ? 'text-blue-500' : 'text-zinc-700'}`}>
                ₩{currentPrice.toLocaleString()}
              </span>
            )}
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
              phase === 'first' ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-900 text-white'
            }`}>
              {phase === 'first' ? '① 1차 결정' : '② 신호 확인'}
            </span>
          </div>
          <div className="h-[38vh]">
            <CandleChart bgCandles={bgCandles} gameCandles={visibleCandles} scenarioStartDate={scenario.startDate} />
          </div>
          <div className="h-0.5 bg-zinc-200">
            <div className="h-full bg-zinc-900 transition-all duration-500"
              style={{ width: `${(currentTurn / totalTurns) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-3 pb-2 border-b border-zinc-200">
            <p className="text-lg font-bold font-mono text-zinc-900">{turnDisplayDate}</p>
            <p className="text-[10px] text-zinc-400">{scenario.title} · 턴 {currentTurn}/{totalTurns}</p>
          </div>

          <div className="px-4 py-3 border-b border-zinc-200">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <p className="text-[10px] text-zinc-400">평가 자산</p>
                <p className="text-lg font-bold font-mono text-zinc-900">₩{animTotalAsset.toLocaleString()}</p>
              </div>
              <p className={`text-sm font-mono ${animProfit >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {animProfit >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-100 rounded-lg px-3 py-2">
                <p className="text-[10px] text-zinc-400">현금</p>
                <p className="text-sm font-bold font-mono text-zinc-900">
                  ₩{cash >= 10000 ? `${Math.floor(cash / 10000).toLocaleString()}만` : cash.toLocaleString()}
                </p>
              </div>
              <div className="bg-zinc-100 rounded-lg px-3 py-2">
                <p className="text-[10px] text-zinc-400">보유 {coinTicker}</p>
                <p className="text-sm font-bold font-mono text-zinc-900">{holdings > 0 ? holdings.toFixed(2) : '0'}</p>
                {holdings > 0 && avgPrice > 0 && (
                  <p className={`text-[10px] ${currentPrice >= avgPrice ? 'text-red-500' : 'text-blue-500'}`}>
                    {currentPrice >= avgPrice ? '+' : ''}{(((currentPrice - avgPrice) / avgPrice) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
            {phase === 'emotion' && (
              <p className="text-xs text-zinc-500 text-center mt-2">
                1차 선택: <span className="text-zinc-900 font-bold">{firstChoice ? ACTION_LABEL[firstChoice] : '—'}</span>
              </p>
            )}
          </div>

          {fearGreedWidget}

          <EmotionPanel scenarioId={scenarioId!} turnEndDate={turnEndDate}
            isRevealed={phase !== 'first'} onConfirm={openFinalModal}
            showConfirm={false} scrollLayout />

          <div className="px-4 py-5 border-t border-zinc-200 mt-2">
            {phase === 'first' ? (
              <>
                <p className="text-xs text-zinc-500 mb-3 text-center">
                  <span className="text-zinc-900 font-bold">차트만 보고</span> 1차 결정하세요
                </p>
                <ActionButtons onSelect={handleFirstChoice} canBuy={cash > 0} canSell={holdings > 0} />
              </>
            ) : (
              <button onClick={openFinalModal}
                className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold text-sm active:scale-95 transition-all shadow-lg shadow-orange-500/30">
                감정 신호 확인 완료 — 최종 결정하기 →
              </button>
            )}
          </div>

          <div className="h-8" />
        </div>
      </div>

      {/* ────── 데스크탑 레이아웃 (md+) ────── */}
      <div className="hidden md:block h-screen">
        <ResizableLayout left={leftPanel} right={rightPanel}
          defaultLeftPct={60} minLeftPct={35} maxLeftPct={75} />
      </div>

      {finalModal}
      {showIntro && <IntroModal scenario={scenario} onStart={() => setShowIntro(false)} />}
      {showMidCheck && (
        <MidCheckModal totalTurns={totalTurns} profit={profit} profitRate={profitRate}
          changedCount={changedCount} totalDecisions={records.length}
          onClose={() => setShowMidCheck(false)} />
      )}
    </>
  )
}
