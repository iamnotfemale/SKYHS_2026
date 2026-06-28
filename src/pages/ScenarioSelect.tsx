import { useGameStore } from '@/store/gameStore'
import { SCENARIOS } from '@/data/scenarios'

export default function ScenarioSelect() {
  const selectScenario = useGameStore((s) => s.selectScenario)

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16 bg-[#0a0a0a]">
      <div className="w-full max-w-2xl">

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-1">시나리오 선택</h2>
          <p className="text-zinc-500 text-sm">실제 역사적 사건을 기반으로 합니다</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => s.available && selectScenario(s.id)}
              disabled={!s.available}
              className={`
                group flex flex-col items-start gap-3 p-5 rounded-xl text-left transition-all duration-150
                ${s.available
                  ? 'bg-zinc-900 hover:bg-zinc-800 cursor-pointer'
                  : 'bg-zinc-900/50 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-start justify-between w-full">
                <p className="text-base font-semibold text-white leading-snug">{s.title}</p>
                {!s.available && (
                  <span className="shrink-0 ml-2 text-[10px] text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded text-nowrap">
                    준비중
                  </span>
                )}
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed">{s.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((tag) => (
                  <span key={tag} className="text-[11px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              {s.available && (
                <p className="text-[11px] text-zinc-600 font-mono">{s.market} · {s.totalTurns}턴</p>
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
