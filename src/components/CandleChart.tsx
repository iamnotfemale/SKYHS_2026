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

export default function CandleChart({ bgCandles, gameCandles, scenarioStartDate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const hasInitialFit = useRef(false)
  const [interval, setInterval] = useState<Interval>('day')

  const chartData = useMemo(() => {
    const combined = [...bgCandles, ...gameCandles]
      .sort((a, b) => a.candle_date_time_kst.localeCompare(b.candle_date_time_kst))
      .filter((c, i, arr) =>
        i === 0 ||
        c.candle_date_time_kst.split('T')[0] !== arr[i - 1].candle_date_time_kst.split('T')[0]
      )
      .slice(1)   // 첫 번째 캔들(상장 초기 이상가) 제외
    return aggregateCandles(combined, interval)
  }, [bgCandles, gameCandles, interval])

  // Effect 1: 차트 생성 (interval 변경 시 재생성)
  useEffect(() => {
    if (!containerRef.current) return
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }
    candleSeriesRef.current = null
    volumeSeriesRef.current = null
    hasInitialFit.current = false   // interval 바뀌면 초기 배치 다시

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
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    })

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

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
    }
  }, [interval])

  // Effect 2: 데이터 업데이트 (턴 진행 시 차트 위치 유지)
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return
    if (chartData.length === 0) return

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

    candleSeriesRef.current.setData(candleData)
    volumeSeriesRef.current.setData(volumeData)

    // 게임 시작 마커
    const gameStartDate = scenarioStartDate as `${number}-${string}-${string}`
    const startCandle = candleData.find((c) => c.time >= gameStartDate)
    if (startCandle) {
      candleSeriesRef.current.setMarkers([{
        time: startCandle.time,
        position: 'belowBar',
        color: '#ffffff',
        shape: 'arrowUp',
        text: '게임 시작',
      }])
    }

    // 최초 로드: 전체 데이터를 좌우 꽉 채우도록 배치
    if (!hasInitialFit.current) {
      chartRef.current.timeScale().fitContent()
      hasInitialFit.current = true
    }
  }, [chartData, scenarioStartDate])

  const isEmpty = chartData.length === 0

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


