import { useGameStore } from '../../store/gameStore'
import { TURNS, SCENARIOS, CHARACTERS } from '../../data/gameContent'
import InfoPanel   from './InfoPanel'
import ChatPanel   from './ChatPanel'
import StatusPanel from './StatusPanel'

export default function MainScreen() {
  const turn     = useGameStore(s => s.turn)
  const char     = useGameStore(s => s.char)
  const scenario = useGameStore(s => s.scenario)
  const actions  = useGameStore(s => s.actions)

  const charName     = CHARACTERS.find(c => c.id === char)?.name   || ''
  const scenarioName = SCENARIOS.find(s => s.id === scenario)?.name || ''
  const totalTurns   = TURNS.length

  const progDots = TURNS.map((_, i) => ({
    color: i <= turn ? '#1e232b' : '#dde1e7',
  }))

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e4e7ec', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={actions.goSelect}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(30,35,43,.06)', border: '1px solid #e4e7ec', color: '#707a88', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s, color .15s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#1e232b'; e.currentTarget.style.color = '#fff' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(30,35,43,.06)'; e.currentTarget.style.color = '#707a88' }}
          >
            ← 뒤로
          </button>
          <div style={{ width: '1px', height: '14px', background: '#e4e7ec' }} />
          <div style={{ fontSize: '14px', fontWeight: 700 }}>{scenarioName}</div>
          <div style={{ width: '1px', height: '14px', background: '#e4e7ec' }} />
          <div style={{ fontSize: '12.5px', color: '#707a88', whiteSpace: 'nowrap' }}>상담 대상 · {charName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '12px', color: '#9099a6' }}>
            TURN {turn + 1} / {totalTurns}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {progDots.map((d, i) => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, transition: 'background .3s' }} />
            ))}
          </div>
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '344px 1fr 332px', gap: '16px', padding: '16px 20px', minHeight: 0 }}>
        <InfoPanel />
        <ChatPanel />
        <StatusPanel />
      </div>
    </div>
  )
}
