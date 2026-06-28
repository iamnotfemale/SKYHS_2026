import { useGameStore, TurnRecord } from '@/store/gameStore'

const ACTION_LABEL: Record<string, string> = {
  buy: '매수',
  sell: '매도',
  hold: '보유',
}

const ACTION_COLOR: Record<string, string> = {
  buy: 'text-red-400',
  sell: 'text-blue-400',
  hold: 'text-zinc-400',
}

export default function TradeHistory() {
  const records = useGameStore((s) => s.records)

  if (records.length === 0) {
    return <p className="text-zinc-600 text-xs text-center py-3">아직 거래 내역이 없습니다</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {[...records].reverse().map((r: TurnRecord) => (
        <div key={r.turn} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0">
          <span className="text-zinc-500 w-10">턴 {r.turn}</span>
          <span className={r.secondChoice ? ACTION_COLOR[r.secondChoice] : 'text-zinc-600'}>
            {r.secondChoice ? ACTION_LABEL[r.secondChoice] : '—'}
          </span>
          {r.firstChoice !== r.secondChoice && r.secondChoice && (
            <span className="text-yellow-500 text-[10px]">마음 바꿈</span>
          )}
          {r.firstChoice === r.secondChoice && r.secondChoice && (
            <span className="text-zinc-600 text-[10px]">유지</span>
          )}
        </div>
      ))}
    </div>
  )
}
