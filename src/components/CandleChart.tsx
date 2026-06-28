import { useEffect, useRef } from 'react'
import { createChart, IChartApi } from 'lightweight-charts'
import { Candle } from '@/api/upbit'

interface Props {
  candles: Candle[]
}

export default function CandleChart({ candles }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return

    if (chartRef.current) chartRef.current.remove()

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 260,
      layout: { background: { color: '#0f0f0f' }, textColor: '#a1a1aa' },
      grid: { vertLines: { color: '#27272a' }, horzLines: { color: '#27272a' } },
      timeScale: { borderColor: '#3f3f46' },
    })

    const series = chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    })

    const chartData = candles.map((c) => ({
      time: c.candle_date_time_kst.split('T')[0] as `${number}-${string}-${string}`,
      open: c.opening_price,
      high: c.high_price,
      low: c.low_price,
      close: c.trade_price,
    }))

    series.setData(chartData)
    chart.timeScale().fitContent()
    chartRef.current = chart

    return () => {
      chart.remove()
      chartRef.current = null
    }
  }, [candles])

  if (candles.length === 0) {
    return (
      <div className="w-full h-[260px] rounded-2xl border border-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
        차트 로딩 중...
      </div>
    )
  }

  return <div ref={containerRef} className="w-full rounded-2xl overflow-hidden border border-zinc-800" />
}
