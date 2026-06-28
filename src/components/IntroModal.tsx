import { Scenario } from '@/data/scenarios'

interface Props {
  scenario: Scenario
  onStart: () => void
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}

export default function IntroModal({ scenario, onStart }: Props) {
  const coin = scenario.market.split('-')[1]
  const totalDays = scenario.totalTurns * scenario.intervalDays

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4 bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-up">

        {/* 상단 강조 바 */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="p-8">

          {/* 날짜 브리핑 */}
          <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-6">Mission Briefing</p>

          <div className="mb-6">
            <p className="text-zinc-400 text-sm mb-1">오늘은</p>
            <p className="text-3xl font-black text-white tracking-tight">{formatDate(scenario.startDate)}</p>
            <p className="text-zinc-500 text-sm mt-1">입니다.</p>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed mb-6">
            당신은 지금부터{' '}
            <span className="text-white font-bold">{scenario.totalTurns}턴 ({totalDays}일)</span>
            {' '}동안{' '}
            <span className="text-white font-bold">{coin}</span>{' '}
            시장에서 {(100_000_000).toLocaleString()}원을 운용합니다.
          </p>

          {/* 규칙 */}
          <div className="space-y-2.5 mb-7">
            {[
              { step: '01', text: '차트만 보고 1차 결정을 내립니다' },
              { step: '02', text: '뉴스·커뮤니티·공포탐욕지수 등 감정 신호가 공개됩니다' },
              { step: '03', text: '신호를 확인한 뒤 최종 결정을 바꿀 수 있습니다' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="shrink-0 text-[10px] font-mono text-zinc-600 mt-0.5">{step}</span>
                <p className="text-zinc-400 text-sm">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-600 mb-6">
            게임 종료 후 당신의 투자 심리 유형을 진단합니다.
          </p>

          <button
            onClick={onStart}
            className="w-full py-3.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
          >
            {formatDate(scenario.startDate)}부터 시작
          </button>
        </div>
      </div>
    </div>
  )
}
