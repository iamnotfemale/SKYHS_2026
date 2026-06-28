import { Action } from '@/store/gameStore'

interface Props {
  onSelect: (action: Action) => void
  canBuy: boolean
  canSell: boolean
}

export default function ActionButtons({ onSelect, canBuy, canSell }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => canBuy && onSelect('buy')}
        disabled={!canBuy}
        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all duration-100
          ${canBuy
            ? 'border-zinc-800 text-red-400 hover:border-red-500/50 hover:bg-red-500/8 active:scale-95'
            : 'border-zinc-800/50 text-zinc-700 cursor-not-allowed'
          }`}
      >
        매수
        {!canBuy && <span className="block text-[9px] font-normal mt-0.5">현금 없음</span>}
      </button>
      <button
        onClick={() => onSelect('hold')}
        className="py-2.5 rounded-lg border border-zinc-800 text-zinc-400 text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-800 active:scale-95 transition-all duration-100"
      >
        보유
      </button>
      <button
        onClick={() => canSell && onSelect('sell')}
        disabled={!canSell}
        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all duration-100
          ${canSell
            ? 'border-zinc-800 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/8 active:scale-95'
            : 'border-zinc-800/50 text-zinc-700 cursor-not-allowed'
          }`}
      >
        매도
        {!canSell && <span className="block text-[9px] font-normal mt-0.5">보유 없음</span>}
      </button>
    </div>
  )
}
