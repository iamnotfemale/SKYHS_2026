import { useState, useRef, useEffect, ReactNode } from 'react'

interface Props {
  left: ReactNode
  right: ReactNode
  defaultLeftPct?: number
  minLeftPct?: number
  maxLeftPct?: number
}

export default function ResizableLayout({
  left,
  right,
  defaultLeftPct = 38,
  minLeftPct = 22,
  maxLeftPct = 65,
}: Props) {
  const [leftPct, setLeftPct] = useState(defaultLeftPct)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(Math.max(pct, minLeftPct), maxLeftPct))
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [minLeftPct, maxLeftPct])

  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden">
      {/* 좌측 패널 */}
      <div style={{ width: `${leftPct}%` }} className="flex flex-col overflow-hidden shrink-0">
        {left}
      </div>

      {/* 드래그 핸들 */}
      <div
        onMouseDown={() => {
          dragging.current = true
          document.body.style.cursor = 'col-resize'
          document.body.style.userSelect = 'none'
        }}
        className="w-1 shrink-0 bg-zinc-800 hover:bg-signal active:bg-signal cursor-col-resize transition-colors"
        title="드래그해서 크기 조절"
      />

      {/* 우측 패널 */}
      <div style={{ width: `${100 - leftPct}%` }} className="flex flex-col overflow-hidden shrink-0">
        {right}
      </div>
    </div>
  )
}

