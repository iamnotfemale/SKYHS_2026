import { useGameStore } from '@/store/gameStore'

export default function StartScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 dot-grid overflow-hidden">

      {/* 배경 그라데이션 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-signal/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl text-center">

        {/* 아이덴티티 레이블 */}
        <p className="font-mono text-signal text-[10px] tracking-[0.25em] uppercase mb-10">
          EMOTION LAB · INVESTMENT PSYCHOLOGY
        </p>

        {/* ECG 시그니처 애니메이션 */}
        <div className="mb-10 w-full">
          <svg
            viewBox="0 0 800 60"
            preserveAspectRatio="none"
            className="w-full h-12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="ecg-path"
              d="M 0,30 L 260,30 L 278,30 L 290,22 L 302,38 L 310,4 L 318,56 L 326,30 L 344,30 L 800,30"
              fill="none"
              stroke="#00BF8F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 헤드라인 */}
        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-5 text-slate-50">
          감정이<br />
          <span className="text-signal">결정</span>을 바꿉니까?
        </h1>

        {/* 서브텍스트 */}
        <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm mx-auto">
          차트만 보고 내린 판단과, 군중의 공포와 탐욕을 본 뒤 바꾼 결정을 비교합니다.
          당신의 투자 심리 유형을 진단합니다.
        </p>

        {/* CTA */}
        <button
          onClick={() => setScreen('scenario')}
          className="signal-glow inline-flex items-center gap-2 px-10 py-4 border border-signal text-signal font-bold text-base rounded-full transition-all duration-200 hover:bg-signal hover:text-black"
        >
          진단 시작
          <span className="font-mono text-sm">→</span>
        </button>

        {/* 스탯 */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span><span className="font-mono text-slate-300">12</span> 턴</span>
          <span className="text-slate-700">·</span>
          <span><span className="font-mono text-slate-300">5</span>가지 유형</span>
          <span className="text-slate-700">·</span>
          <span>실제 시장 데이터</span>
        </div>

      </div>
    </div>
  )
}
