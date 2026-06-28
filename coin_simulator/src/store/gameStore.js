import { create } from 'zustand'
import {
  TURNS, SCORE_TABLE, SRCQ, SRCLABEL, REVEAL, PRICE_SERIES,
  DOGE_TURNS, DOGE_SCORE_TABLE, DOGE_REVEAL, DOGE_PRICE_SERIES,
  CHAR_EVIDENCE_MULT,
} from '../data/gameContent'

const initialState = {
  screen:            'start',
  char:              'kim',
  scenario:          'doge',
  turn:              0,
  trust:             35,
  startTrust:        35,
  phase:             'advice',
  advice:            null,
  result:            null,
  stage:             0,
  hist:              [],
  opened:            [],
  help:              null,
  blew:              false,
  tradeIdx:          null,
  difficulty:        '보통',
  fixedDice:         false,
  selectedEvidences: [],
}

export const useGameStore = create((set, get) => ({
  ...initialState,

  actions: {
    receive:   () => set({ screen: 'select' }),
    restart:   () => set({ ...initialState, screen: 'start' }),
    goSelect:  () => set({ screen: 'select' }),
    selChar:   (id) => set({ char: id }),
    selScen:   (id) => set({ scenario: id }),
    startGame: () => set(s => ({ ...initialState, char: s.char, scenario: s.scenario, screen: 'main', trust: 35, startTrust: 35 })),
    openHelp:  (k) => set(s => ({ help: k, opened: s.opened.includes(k) ? s.opened : [...s.opened, k] })),
    closeHelp: () => set({ help: null }),

    pickAdvice:  (id) => set(s => s.phase === 'advice' ? { advice: id, phase: 'evidence' } : {}),
    resetAdvice: ()   => set(s => s.phase === 'evidence' ? { advice: null, phase: 'advice', selectedEvidences: [] } : {}),

    toggleEvidence: (src) => {
      const s = get()
      if (s.phase !== 'evidence') return
      const cur = s.selectedEvidences
      if (cur.includes(src)) {
        set({ selectedEvidences: cur.filter(e => e !== src) })
      } else if (cur.length < 3) {
        set({ selectedEvidences: [...cur, src] })
      }
    },

    submitEvidence: () => {
      const s = get()
      if (s.phase !== 'evidence' || s.selectedEvidences.length === 0) return

      const isDoge      = s.scenario === 'doge'
      const turns       = isDoge ? DOGE_TURNS  : TURNS
      const scoreTable  = isDoge ? DOGE_SCORE_TABLE : SCORE_TABLE
      const reveal      = isDoge ? DOGE_REVEAL : REVEAL
      const priceSeries = isDoge ? DOGE_PRICE_SERIES : PRICE_SERIES

      const t   = turns[s.turn]
      const adv = t.advices.find(a => a.id === s.advice)

      const diffUp = { 쉬움: 1.15, 보통: 1, 어려움: 0.85 }
      const diffDn = { 쉬움: 0.80, 보통: 1, 어려움: 1.20 }
      const weights = [1, 0.5, 0.25]

      const charMult = CHAR_EVIDENCE_MULT[s.char] || {}

      const rawDeltas = s.selectedEvidences.map(src => {
        const q  = SRCQ[src]
        let d    = scoreTable[adv.dir][q]
        d = Math.round(d > 0 ? d * diffUp[s.difficulty] : d * diffDn[s.difficulty])
        const cm = charMult[src] ?? 1.0
        d = Math.round(d * cm)
        return { src, q, rawDelta: d, charMult: cm }
      })

      // Sort by absolute impact (largest first) to assign weights
      const sorted = [...rawDeltas].sort((a, b) => Math.abs(b.rawDelta) - Math.abs(a.rawDelta))

      let totalDelta = 0
      const evidences = sorted.map((e, i) => {
        const w  = weights[i]
        const wd = Math.round(e.rawDelta * w)
        totalDelta += wd
        return { ...e, weight: w, weightedDelta: wd }
      })
      totalDelta = Math.round(totalDelta)

      const tB = s.trust
      const tA = Math.max(5, Math.min(95, tB + totalDelta))
      const roll = s.fixedDice
        ? (tA >= 50 ? Math.max(2, tA - 18) : Math.min(98, tA + 18))
        : Math.floor(Math.random() * 100)
      const rational = roll < tA
      const floor    = { 쉬움: 42, 보통: 50, 어려움: 58 }[s.difficulty]
      const outcome  = rational ? 'good' : (tA >= floor ? 'near' : 'panic')

      const primary   = evidences[0]
      const revealIdx = reveal[s.turn]
      const price     = priceSeries[revealIdx]
      const concept   = primary.src === 'fgi'    ? 'fgi'
                      : primary.src === 'chart'  ? t.chartConcept
                      : primary.src === 'news'   ? t.newsConcept
                      : 'herd'

      const result = {
        advice: adv.label, dir: adv.dir,
        src: primary.src, srcLabel: SRCLABEL[primary.src], q: primary.q,
        delta: totalDelta, evidences,
        tB, tA, roll, rational,
        outcome, price, panicAction: t.panicAction,
        reflect: t.reflect[outcome],
      }
      const blew = outcome === 'panic'

      set(prev => ({
        phase: 'result', stage: 0, result, trust: tA, blew,
        selectedEvidences: [],
        hist: [...prev.hist, { dir: adv.dir, q: primary.q, delta: totalDelta, src: primary.src, outcome, evidences }],
        opened: prev.opened.includes(concept) ? prev.opened : [...prev.opened, concept],
        tradeIdx: blew ? revealIdx : prev.tradeIdx,
      }))

      setTimeout(() => set({ stage: 1 }), 850)
      setTimeout(() => set({ stage: 2 }), 1800)
      setTimeout(() => set({ stage: 3 }), 2550)
    },

    next: () => {
      const s     = get()
      const turns = s.scenario === 'doge' ? DOGE_TURNS : TURNS
      if (s.blew || s.turn >= turns.length - 1) {
        set({ screen: 'ending' })
      } else {
        set({ turn: s.turn + 1, phase: 'advice', advice: null, result: null, stage: 0, help: null, selectedEvidences: [] })
      }
    },
  },
}))
