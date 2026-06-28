import { useEffect, useRef, useState, useMemo } from 'react'
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts'
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

type CandlePoint = { time: `${number}-${string}-${string}`; open: number; high: number; low: number; close: number }
type VolPoint  = { time: `${number}-${string}-${string}`; value: number; color: string }

export default function CandleChart({ bgCandles, gameCandles, scenarioStartDate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const hasInitialFit = useRef(false)
  const prevChartDataLen = useRef(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [interval, setInterval] = useState<Interval>('day')

  const chartData = useMemo(() => {
    const combined = [...bgCandles, ...gameCandles]
      .sort((a, b) => a.candle_date_time_kst.localeCompare(b.candle_date_time_kst))
      .filter((c, i, arr) =>
        i === 0 ||
        c.candle_date_time_kst.split('T')[0] !== arr[i - 1].candle_date_time_kst.split('T')[0]
      )
      .slice(1)
    return aggregateCandles(combined, interval)
  }, [bgCandles, gameCandles, interval])

  // Effect 1: 차트 생성
  useEffect(() => {
    if (!containerRef.current) return
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }
    candleSeriesRef.current = null
    volumeSeriesRef.current = null
    hasInitialFit.current = false
    prevChartDataLen.current = 0
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: { background: { color: '#0a0a0a' }, textColor: '#71717a' },
      grid: { vertLines: { color: '#141414' }, horzLines: { color: '#141414' } },
      timeScale: { borderColor: '#3f3f46', timeVisible: true },
      rightPriceScale: { borderColor: '#3f3f46' },
      crosshair: { mode: 1 },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ef4444', downColor: '#3b82f6',
      borderUpColor: '#ef4444', borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444', wickDownColor: '#3b82f6',
    })
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' }, priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [interval])

  // Effect 2: 데이터 업데이트
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return
    if (chartData.length === 0) return

    // Clear pending reveal timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    const candleData: CandlePoint[] = chartData.map((c) => ({
      time: c.candle_date_time_kst.split('T')[0] as `${number}-${string}-${string}`,
      open: c.opening_price, high: c.high_price, low: c.low_price, close: c.trade_price,
    }))
    const volumeData: VolPoint[] = chartData.map((c) => ({
      time: c.candle_date_time_kst.split('T')[0] as `${number}-${string}-${string}`,
      value: c.candle_acc_trade_volume,
      color: c.trade_price >= c.opening_price ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)',
    }))

    const gameStartDate = scenarioStartDate as `${number}-${string}-${string}`

    const applyMarker = (data: CandlePoint[]) => {
      const startCandle = data.find((c) => c.time >= gameStartDate)
      if (startCandle && candleSeriesRef.current) {
        candleSeriesRef.current.setMarkers([{
          time: startCandle.time, position: 'belowBar',
          color: '#ffffff', shape: 'arrowUp', text: '게임 시작',
        }])
      }
    }

    const prevLen = prevChartDataLen.current
    const newLen = candleData.length

    if (hasInitialFit.current && prevLen > 0 && newLen > prevLen) {
      // 새 캔들 순차 공개 애니메이션
      candleSeriesRef.current.setData(candleData.slice(0, prevLen))
      volumeSeriesRef.current.setData(volumeData.slice(0, prevLen))
      applyMarker(candleData.slice(0, prevLen))

      for (let i = prevLen; i < newLen; i++) {
        const delay = (i - prevLen + 1) * 280
        const idx = i
        const t = setTimeout(() => {
          if (!candleSeriesRef.current || !volumeSeriesRef.current || !chartRef.current) return
          const slice = candleData.slice(0, idx + 1)
          candleSeriesRef.current.setData(slice)
          volumeSeriesRef.current.setData(volumeData.slice(0, idx + 1))
          applyMarker(slice)
          // 마지막 새 캔들 공개 후 우측으로 스크롤
          if (idx === newLen - 1) {
            chartRef.current.timeScale().scrollToRealTime()
          }
        }, delay)
        timersRef.current.push(t)
      }
    } else {
      candleSeriesRef.current.setData(candleData)
      volumeSeriesRef.current.setData(volumeData)
      applyMarker(candleData)

      if (!hasInitialFit.current) {
        chartRef.current.timeScale().fitContent()
        hasInitialFit.current = true
      }
    }

    prevChartDataLen.current = newLen
  }, [chartData, scenarioStartDate])

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-3 py-2 border-b border-zinc-800">
        {INTERVALS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setInterval(key)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              interval === key ? 'bg-white text-black' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 relative">
        {chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
            차트 로딩 중...
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
