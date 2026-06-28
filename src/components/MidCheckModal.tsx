interface Props {
  totalTurns: number
  profit: number
  profitRate: number
  changedCount: number
  totalDecisions: number
  onClose: () => void
}

function midMessage(changedCount: number, totalDecisions: number, profit: number) {
  const changeRate = totalDecisions > 0 ? changedCount / totalDecisions : 0
  if (changeRate >= 0.5)
    return '감정 신호에 절반 이상 흔들렸습니다. 후반전엔 차트를 더 신뢰해보세요.'
  if (changedCount === 0)
    return '지금까지 한 번도 흔들리지 않았습니다. 후반전도 냉정하게.'
  if (profit > 0)
    return `${changedCount}번 마음을 바꿨지만 수익 중입니다. 감정이 도움이 됐는지 확인해보세요.`
  return `${changedCount}번 흔들렸고 현재 손실입니다. 후반전은 다르게 접근해보세요.`
}

export default function MidCheckModal({ totalTurns, profit, profitRate, changedCount, totalDecisions, onClose }: Props) {
  const half = totalTurns / 2
  const msg = midMessage(changedCount, totalDecisions, profit)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-[#111] border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 바 */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="p-7">
          {/* 타이틀 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mb-1">Midpoint Check</p>
              <h2 className="text-xl font-bold text-white">{half}턴 완료 — 절반을 지났습니다</h2>
            </div>
            <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors text-xl leading-none">✕</button>
          </div>

          {/* 수익 현황 */}
          <div className="bg-zinc-900 rounded-xl p-4 mb-4">
            <p className="text-[10px] text-zinc-500 mb-1">현재 평가 손익</p>
            <p className={`text-3xl font-black font-mono ${profit >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()}원
            </p>
            <p className={`text-sm font-mono mt-0.5 ${profit >= 0 ? 'text-red-400/70' : 'text-blue-400/70'}`}>
              {profit >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
            </p>
          </div>

          {/* 감정 신호 반응 통계 */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="bg-zinc-900 rounded-xl p-3 text-center">
              <p className="text-2xl font-black font-mono text-white">{changedCount}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">마음 바꾼 횟수</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-3 text-center">
              <p className="text-2xl font-black font-mono text-white">{totalDecisions - changedCount}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">결정 유지 횟수</p>
            </div>
          </div>

          {/* 메시지 */}
          <p className="text-sm text-zinc-300 leading-relaxed border-l-2 border-zinc-700 pl-3 mb-6">
            {msg}
          </p>

          {/* 계속 버튼 */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
          >
            후반전 시작
          </button>
        </div>
      </div>
    </div>
  )
}
