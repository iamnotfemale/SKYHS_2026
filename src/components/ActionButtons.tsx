import { Action } from '@/store/gameStore'

interface Props {
  onSelect: (action: Action) => void
}

export default function ActionButtons({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => onSelect('buy')}
        className="py-2.5 rounded-lg border border-zinc-800 text-red-400 text-sm font-semibold hover:border-red-500/50 hover:bg-red-500/8 transition-all"
      >
        매수
      </button>
      <button
        onClick={() => onSelect('hold')}
        className="py-2.5 rounded-lg border border-zinc-800 text-zinc-400 text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-800 transition-all"
      >
        보유
      </button>
      <button
        onClick={() => onSelect('sell')}
        className="py-2.5 rounded-lg border border-zinc-800 text-blue-400 text-sm font-semibold hover:border-blue-500/50 hover:bg-blue-500/8 transition-all"
      >
        매도
      </button>
    </div>
  )
}
