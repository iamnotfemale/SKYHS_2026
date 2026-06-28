import { useGameStore } from '@/store/gameStore'

interface Props {
  turnEndDate: string   // "YYYY-MM-DD"
  onConfirm: () => void
}

export default function EmotionPanel({ turnEndDate, onConfirm }: Props) {
  const fearGreedMap = useGameStore((s) => s.fearGreedMap)
  const fg = fearGreedMap[turnEndDate]

  const fgValue = fg?.value ?? null
  const fgLabel = fg?.classification ?? '데이터 없음'
  const fgColor =
    fgValue === null ? 'text-zinc-400'
    : fgValue >= 60 ? 'text-red-400'
    : fgValue >= 40 ? 'text-yellow-400'
    : 'text-blue-400'

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-zinc-400 text-sm">시장의 감정을 확인하세요</p>

      {/* 공포탐욕지수 */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <p className="text-xs text-zinc-500 mb-1">공포탐욕지수 ({turnEndDate})</p>
        {fgValue !== null ? (
          <p className={`text-3xl font-bold ${fgColor}`}>
            {fgValue} <span className="text-lg">{fgLabel}</span>
          </p>
        ) : (
          <p className="text-zinc-500 text-sm">데이터를 불러오는 중...</p>
        )}
      </div>

      {/* 커뮤니티 — TODO: 시나리오별 실제 데이터 */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <p className="text-xs text-zinc-500 mb-2">커뮤니티 반응</p>
        <p className="text-zinc-300 text-sm italic">"(커뮤니티 글 작성 예정)"</p>
      </div>

      {/* 뉴스 — TODO: 시나리오별 실제 데이터 */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <p className="text-xs text-zinc-500 mb-2">오늘의 뉴스</p>
        <p className="text-zinc-300 text-sm">(뉴스 작성 예정)</p>
      </div>

      <button
        onClick={onConfirm}
        className="py-3 rounded-2xl bg-zinc-800 text-zinc-200 font-bold hover:bg-zinc-700 transition-colors"
      >
        최종 결정하기 →
      </button>
    </div>
  )
}
