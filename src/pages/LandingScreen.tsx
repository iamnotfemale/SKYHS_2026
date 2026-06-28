import { useGameStore } from '@/store/gameStore'

export default function LandingScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-white">

      {/* 배경 도트 그리드 */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* 상단 레이블 */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg">


        {/* 타이틀 */}
        <h1 className="text-[72px] md:text-[96px] font-black leading-none tracking-tighter text-zinc-900 mb-3">
          Emotion<br />
          <span className="text-zinc-400">LAB</span>
        </h1>

        <p className="text-zinc-500 text-sm leading-relaxed mb-14 max-w-xs">
          당신의 감정에 따른 결정을 파악합니다.
        </p>

        {/* 실험 카드 목록 */}
        <div className="w-full flex flex-col gap-3 mb-6">

          {/* 실험 01 — 감성투자 */}
          <button
            onClick={() => setScreen('start')}
            className="group w-full flex items-center gap-5 px-6 py-5 rounded-2xl border border-zinc-300 bg-white hover:bg-zinc-50 hover:border-zinc-500 transition-all duration-150 text-left"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-lg">
              📈
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono text-zinc-400 tracking-widest">EXP 01</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-medium">운영중</span>
              </div>
              <p className="text-sm font-bold text-zinc-900">감성 투자</p>
              <p className="text-xs text-zinc-500 truncate">코인 시장에서 감정에 얼마나 흔들리는지 진단</p>
            </div>
            <span className="text-zinc-300 group-hover:text-zinc-600 transition-colors text-lg">→</span>
          </button>

          {/* 실험 02 — 준비중 */}
          <button
            disabled
            className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl border border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed text-left"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-400 text-lg">
              🔬
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono text-zinc-400 tracking-widest">EXP 02</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-400 font-medium">준비중</span>
              </div>
              <p className="text-sm font-bold text-zinc-400">미공개 실험</p>
              <p className="text-xs text-zinc-400">Coming soon</p>
            </div>
            <span className="text-zinc-200 text-lg">→</span>
          </button>

        </div>

        <p className="text-[11px] text-zinc-300 font-mono">emotion-lab.vercel.app</p>
      </div>
    </div>
  )
}
