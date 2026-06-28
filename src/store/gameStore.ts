import { create } from 'zustand'
import { Screen } from '@/App'
import { Candle } from '@/api/upbit'
import { FearGreedMap } from '@/api/fearGreed'
import { NewsMap } from '@/api/cryptoNews'

export type Action = 'buy' | 'sell' | 'hold' | null

export interface TurnRecord {
  turn: number
  firstChoice: Action
  secondChoice: Action
}

interface GameState {
  screen: Screen
  scenarioId: number | null
  currentTurn: number
  totalTurns: number
  cash: number
  holdings: number
  avgPrice: number
  records: TurnRecord[]
  // API 데이터
  candles: Candle[]
  bgCandles: Candle[]      // 시나리오 시작 전 1년치 배경 데이터
  fearGreedMap: FearGreedMap
  newsMap: NewsMap
  isLoading: boolean
  // actions
  setScreen: (screen: Screen) => void
  selectScenario: (id: number) => void
  setCandles: (candles: Candle[]) => void
  setBgCandles: (candles: Candle[]) => void
  setFearGreedMap: (map: FearGreedMap) => void
  setNewsMap: (map: NewsMap) => void
  setLoading: (loading: boolean) => void
  recordFirstChoice: (action: Action) => void
  recordSecondChoice: (action: Action, price: number, pct: number) => void
  nextTurn: () => void
  reset: () => void
}

const INITIAL_CASH = 100_000_000

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'start',
  scenarioId: null,
  currentTurn: 1,
  totalTurns: 12,
  cash: INITIAL_CASH,
  holdings: 0,
  avgPrice: 0,
  records: [],
  candles: [],
  bgCandles: [],
  fearGreedMap: {},
  newsMap: {},
  isLoading: false,

  setScreen: (screen) => set({ screen }),

  selectScenario: (id) =>
    set({
      scenarioId: id,
      screen: 'game',
      currentTurn: 1,
      cash: INITIAL_CASH,
      holdings: 0,
      avgPrice: 0,
      records: [],
      candles: [],
      bgCandles: [],
      fearGreedMap: {},
      newsMap: {},
    }),

  setCandles: (candles) => set({ candles }),
  setBgCandles: (bgCandles) => set({ bgCandles }),
  setFearGreedMap: (fearGreedMap) => set({ fearGreedMap }),
  setNewsMap: (newsMap) => set({ newsMap }),
  setLoading: (isLoading) => set({ isLoading }),

  recordFirstChoice: (action) => {
    const { currentTurn, records } = get()
    const exists = records.find((r) => r.turn === currentTurn)
    if (exists) {
      set({ records: records.map((r) => r.turn === currentTurn ? { ...r, firstChoice: action } : r) })
    } else {
      set({ records: [...records, { turn: currentTurn, firstChoice: action, secondChoice: null }] })
    }
  },

  recordSecondChoice: (action, price, pct) => {
    const { currentTurn, records, cash, holdings, avgPrice } = get()
    const updated = records.map((r) =>
      r.turn === currentTurn ? { ...r, secondChoice: action } : r
    )

    let newCash = cash
    let newHoldings = holdings
    let newAvgPrice = avgPrice

    if (action === 'buy' && cash > 0) {
      const tradeAmount = Math.floor(cash * pct)
      const coinsBought = tradeAmount / price
      newAvgPrice = (avgPrice * holdings + price * coinsBought) / (holdings + coinsBought)
      newCash = cash - tradeAmount
      newHoldings = holdings + coinsBought
    } else if (action === 'sell' && holdings > 0) {
      const coinsToSell = holdings * pct
      newCash = cash + coinsToSell * price
      newHoldings = holdings - coinsToSell
      if (newHoldings < 0.000001) { newHoldings = 0; newAvgPrice = 0 }
    }

    set({ records: updated, cash: newCash, holdings: newHoldings, avgPrice: newAvgPrice })
  },

  nextTurn: () => {
    const { currentTurn, totalTurns } = get()
    if (currentTurn >= totalTurns) {
      set({ screen: 'result' })
    } else {
      set({ currentTurn: currentTurn + 1 })
    }
  },

  reset: () =>
    set({
      screen: 'start',
      scenarioId: null,
      currentTurn: 1,
      cash: INITIAL_CASH,
      holdings: 0,
      avgPrice: 0,
      records: [],
      candles: [],
      bgCandles: [],
      fearGreedMap: {},
      newsMap: {},
    }),
}))
