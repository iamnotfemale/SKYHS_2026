import { useGameStore } from '@/store/gameStore'
import { SCENARIOS } from '@/data/scenarios'

export default function ScenarioSelect() {
  const selectScenario = useGameStore((s) => s.selectScenario)

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-20 dot-grid">
      <div className="relative z-10 w-full max-w-2xl">

        <div className="mb-12 text-center">
          <p className="font-mono text-signal text-[10px] tracking-[0.25em] uppercase mb-4">
            SCENARIO SELECT
          </p>
          <h2 className="text-3xl font-extrabold text-slate-50">어떤 시장을 경험하겠습니까?</h2>
          <p className="text-slate-500 text-sm mt-2">시나리오는 실제 역사적 사건을 기반으로 합니다</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => s.available && selectScenario(s.id)}
              disabled={!s.available}
              className={`
                group relative flex flex-col items-start gap-4 p-6 rounded-2xl border text-left transition-all duration-200
                ${s.available
                  ? 'border-slate-800 bg-slate-900/40 hover:border-signal/50 hover:bg-slate-900/80 cursor-pointer'
                  : 'border-slate-800/50 bg-slate-900/20 opacity-40 cursor-not-allowed'
                }
              `}
            >
              {/* 인덱스 워터마크 */}
              <span className="absolute top-4 right-5 font-mono text-5xl font-bold text-slate-800 select-none leading-none">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {!s.available && (
                <span className="absolute top-4 left-4 text-[10px] text-slate-500 border border-slate-700 px-2 py-0.5 rounded font-mono">
                  COMING SOON
                </span>
              )}

              <div className="mt-1">
                <p className="text-lg font-bold text-slate-100 mb-1.5 group-hover:text-signal transition-colors">
                  {s.title}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-mono text-signal bg-signal/10 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {s.available && (
                <div className="w-full pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-600">
                  <span>{s.market}</span>
                  <span>{s.totalTurns} TURNS · {s.intervalDays}D INTERVAL</span>
                </div>
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
