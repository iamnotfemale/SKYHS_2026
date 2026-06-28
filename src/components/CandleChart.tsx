import { useEffect, useRef, useState, useMemo } from 'react'
import { createChart, IChartApi } from 'lightweight-charts'
import { Candle } from '@/api/upbit'
import { aggregateCandles, Interval } from '@/utils/candleAggregator'

interface Props {
  bgCandles: Candle[]
  gameCandles: Candle[]
  scenarioStartDate: string
}

const INTERVALS: { key: Interval; label: string }[] = [
  { key: 'day', label: '일봉' },
  { key: 'week', label: '주봉' },
  { key: 'month', label: '월봉' },
]

export default function CandleChart({ bgCandles, gameCandles, scenarioStartDate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [interval, setInterval] = useState<Interval>('day')

  const chartData = useMemo(() => {
    const combined = [...bgCandles, ...gameCandles]
    return aggregateCandles(combined, interval)
  }, [bgCandles, gameCandles, interval])

  useEffect(() => {
    if (!containerRef.current || chartData.length === 0) return

    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: { background: { color: '#0f0f0f' }, textColor: '#a1a1aa' },
      grid: { vertLines: { color: '#1f1f1f' }, horzLines: { color: '#1f1f1f' } },
      timeScale: { borderColor: '#3f3f46', timeVisible: true },
      rightPriceScale: { borderColor: '#3f3f46' },
      crosshair: { mode: 1 },
    })

    // 캔들스틱
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    })

    // 거래량 히스토그램
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    const candleData = chartData.map((c) => ({
      time: c.candle_date_time_kst.split('T')[0] as `${number}-${string}-${string}`,
      open: c.opening_price,
      high: c.high_price,
      low: c.low_price,
      close: c.trade_price,
    }))

    const volumeData = chartData.map((c) => ({
      time: c.candle_date_time_kst.split('T')[0] as `${number}-${string}-${string}`,
      value: c.candle_acc_trade_volume,
      color: c.trade_price >= c.opening_price ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)',
    }))

    candleSeries.setData(candleData)
    volumeSeries.setData(volumeData)

    // 게임 시작 마커
    const gameStartDate = scenarioStartDate as `${number}-${string}-${string}`
    const startCandle = candleData.find((c) => c.time >= gameStartDate)
    if (startCandle) {
      candleSeries.setMarkers([{
        time: startCandle.time,
        position: 'belowBar',
        color: '#facc15',
        shape: 'arrowUp',
        text: '게임 시작',
      }])
    }

    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [chartData, scenarioStartDate])

  const isEmpty = chartData.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* 인터벌 선택 */}
      <div className="flex gap-1 px-3 py-2 border-b border-zinc-800">
        {INTERVALS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setInterval(key)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              interval === key
                ? 'bg-yellow-400 text-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 차트 */}
      <div className="flex-1 relative">
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
            차트 로딩 중...
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
