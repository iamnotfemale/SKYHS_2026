import { useGameStore } from '@/store/gameStore'

interface Props {
  turnEndDate: string
  onConfirm: () => void
}

export default function EmotionPanel({ turnEndDate, onConfirm }: Props) {
  const fearGreedMap = useGameStore((s) => s.fearGreedMap)
  const fg = fearGreedMap[turnEndDate]

  const fgValue = fg?.value ?? null
  const fgLabel = fg?.classification ?? '—'
  const fgColor =
    fgValue === null ? 'text-zinc-400'
    : fgValue >= 60 ? 'text-red-400'
    : fgValue >= 40 ? 'text-yellow-400'
    : 'text-blue-400'

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <p className="text-xs text-zinc-500">감정 신호</p>

      {/* 공포탐욕지수 */}
      <div className="flex items-center justify-between bg-zinc-900 rounded-xl px-3 py-2.5">
        <span className="text-xs text-zinc-400">공포탐욕지수</span>
        {fgValue !== null ? (
          <span className={`font-bold text-sm ${fgColor}`}>
            {fgValue} <span className="text-xs font-normal">{fgLabel}</span>
          </span>
        ) : (
          <span className="text-zinc-600 text-xs">로딩 중</span>
        )}
      </div>

      {/* 뉴스 */}
      <div className="bg-zinc-900 rounded-xl px-3 py-2.5">
        <p className="text-[10px] text-zinc-500 mb-1">뉴스</p>
        <p className="text-zinc-300 text-xs">(뉴스 작성 예정)</p>
      </div>

      {/* 커뮤니티 */}
      <div className="bg-zinc-900 rounded-xl px-3 py-2.5">
        <p className="text-[10px] text-zinc-500 mb-1">커뮤니티</p>
        <p className="text-zinc-300 text-xs italic">"(커뮤니티 글 작성 예정)"</p>
      </div>

      <button
        onClick={onConfirm}
        className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition-colors mt-1"
      >
        최종 결정하기 →
      </button>
    </div>
  )
}
