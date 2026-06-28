import { useGameStore } from '@/store/gameStore'

export default function StartScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-[#0a0a0a]">

      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 w-full max-w-md text-center">

        <div className="mb-12 w-full opacity-35">
          <svg viewBox="0 0 800 50" preserveAspectRatio="none" className="w-full h-8" xmlns="http://www.w3.org/2000/svg">
            <path
              className="ecg-path"
              d="M 0,25 L 260,25 L 278,25 L 290,18 L 302,32 L 310,3 L 318,47 L 326,25 L 344,25 L 800,25"
              fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-[52px] font-black leading-[1.05] tracking-tight mb-6 text-white">
          감정은 결정을<br />바꿀까요?
        </h1>

        <p className="text-zinc-500 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
          차트만 보고 내린 판단과 군중의 공포·탐욕을 본 뒤 바꾼 결정을 비교합니다.
        </p>

        <button
          onClick={() => setScreen('scenario')}
          className="px-8 py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors duration-150"
        >
          시작하기
        </button>

        <p className="mt-8 text-zinc-600 text-xs">
          12턴 &nbsp;·&nbsp; 5가지 유형 &nbsp;·&nbsp; 실제 시장 데이터
        </p>

      </div>
    </div>
  )
}
