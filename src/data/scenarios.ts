export interface Scenario {
  id: number
  title: string
  description: string
  tags: string[]
  market: string
  startDate: string     // 첫 캔들 날짜 (ISO "YYYY-MM-DD")
  intervalDays: number  // 턴당 간격
  totalTurns: number
  available: boolean
}

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: '21년 도지코인',
    description: '일론 머스크 트윗 한 줄에 5000% 폭등한 그 날',
    tags: ['#밈코인', '#롤러코스터', '#일론효과'],
    market: 'KRW-DOGE',
    startDate: '2021-04-01',   // DOGE 상장 후 폭등 시점
    intervalDays: 3,
    totalTurns: 12,
    available: true,
  },
  {
    id: 2,
    title: '21년 코인 고점',
    description: '비트코인이 8천만원을 넘던 불장의 절정',
    tags: ['#불장', '#천장은어디', '#FOMO'],
    market: 'KRW-BTC',
    startDate: '2021-03-01',
    intervalDays: 7,
    totalTurns: 12,
    available: false,
  },
  {
    id: 3,
    title: '22년 거래소 파산',
    description: 'FTX 붕괴, 루나 폭락 — 공포가 시장을 삼켰다',
    tags: ['#패닉', '#뱅크런', '#폭락장'],
    market: 'KRW-BTC',
    startDate: '2022-05-01',
    intervalDays: 7,
    totalTurns: 12,
    available: false,
  },
  {
    id: 4,
    title: '25년 하반기',
    description: '지금 이 순간, 당신이라면 어떻게 했을까',
    tags: ['#최근장', '#실전', '#현재진행중'],
    market: 'KRW-BTC',
    startDate: '2025-07-01',
    intervalDays: 7,
    totalTurns: 12,
    available: false,
  },
]

/** 특정 턴의 시작 날짜 (화면 표시용) */
export function getTurnStartDate(scenario: Scenario, turn: number): string {
  const d = new Date(scenario.startDate)
  d.setDate(d.getDate() + (turn - 1) * scenario.intervalDays)
  return d.toISOString().split('T')[0]
}

/** 특정 턴의 마지막 날짜 (뉴스·공탐지수 조회용) */
export function getTurnEndDate(scenario: Scenario, turn: number): string {
  const d = new Date(scenario.startDate)
  d.setDate(d.getDate() + turn * scenario.intervalDays - 1)
  return d.toISOString().split('T')[0]
}

/** Upbit API to 파라미터 (전체 시나리오 마지막 날 다음날) */
export function getScenarioToParam(scenario: Scenario): string {
  const d = new Date(scenario.startDate)
  d.setDate(d.getDate() + scenario.totalTurns * scenario.intervalDays)
  return d.toISOString().split('.')[0] + 'Z'
}
