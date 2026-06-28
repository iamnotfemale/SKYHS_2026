import { useGameStore } from '@/store/gameStore'

interface Props {
  currentPrice: number
}

export default function Portfolio({ currentPrice }: Props) {
  const { cash, holdings } = useGameStore()

  const holdingsValue = holdings * currentPrice
  const total = cash + holdingsValue
  const profit = total - 100_000_000

  return (
    <div className="text-right text-xs text-zinc-400">
      <p>현금 {(cash / 10000).toFixed(0)}만</p>
      <p className={profit >= 0 ? 'text-red-400' : 'text-blue-400'}>
        {profit >= 0 ? '▲' : '▼'} 총 {(total / 10000).toFixed(0)}만
      </p>
    </div>
  )
}
