import { useEffect, useRef } from 'react'
import { createChart, IChartApi } from 'lightweight-charts'
import { Candle } from '@/api/upbit'
import { TurnRecord } from '@/store/gameStore'

interface Props {
  candles: Candle[]
  records: TurnRecord[]
  turnDates: string[]  // index i → 턴 i+1의 종료 날짜
}

export default function ResultChart({ candles, records, turnDates }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: { background: { color: '#0f0f0f' }, textColor: '#a1a1aa' },
      grid: { vertLines: { color: '#1f1f1f' }, horzLines: { color: '#1f1f1f' } },
      timeScale: { borderColor: '#3f3f46' },
      rightPriceScale: { borderColor: '#3f3f46' },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    })

    const candleData = candles.map((c) => ({
      time: c.candle_date_time_kst.split('T')[0] as `${number}-${string}-${string}`,
      open: c.opening_price,
      high: c.high_price,
      low: c.low_price,
      close: c.trade_price,
    }))
    candleSeries.setData(candleData)

    // 매수/매도 마커
    const markers = records
      .filter((r) => r.secondChoice && r.secondChoice !== 'hold')
      .map((r) => {
        const date = turnDates[r.turn - 1] as `${number}-${string}-${string}`
        const changed = r.firstChoice !== r.secondChoice
        const isBuy = r.secondChoice === 'buy'
        return {
          time: date,
          position: (isBuy ? 'belowBar' : 'aboveBar') as 'belowBar' | 'aboveBar',
          color: isBuy ? '#ef4444' : '#3b82f6',
          shape: (isBuy ? 'arrowUp' : 'arrowDown') as 'arrowUp' | 'arrowDown',
          text: `${isBuy ? '매수' : '매도'}${changed ? ' ↩' : ''}`,
          size: changed ? 2 : 1,
        }
      })
      .sort((a, b) => a.time.localeCompare(b.time))

    if (markers.length > 0) candleSeries.setMarkers(markers)

    chart.timeScale().fitContent()
    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    })
    ro.observe(containerRef.current)

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null }
  }, [candles, records, turnDates])

  return <div ref={containerRef} className="w-full h-full" />
}
