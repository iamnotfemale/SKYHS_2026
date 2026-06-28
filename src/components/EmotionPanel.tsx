import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { SCENARIO_NEWS } from '@/data/scenarioNews'
import { SCENARIO_COMMUNITY } from '@/data/scenarioCommunity'

interface Props {
  scenarioId: number
  turnEndDate: string
  isRevealed: boolean   // phase === 'emotion' | 'second' 일 때만 공개
  onConfirm: () => void
  showConfirm: boolean  // phase === 'emotion' 일 때만 버튼 표시
}

type Tab = 'news' | 'community' | 'fg'

const TAB_LABELS: Record<Tab, string> = {
  news: '📰 뉴스',
  community: '💬 커뮤니티',
  fg: '📊 공탐지수',
}

export default function EmotionPanel({ scenarioId, turnEndDate, isRevealed, onConfirm, showConfirm }: Props) {
  const [tab, setTab] = useState<Tab>('news')
  const fearGreedMap = useGameStore((s) => s.fearGreedMap)

  const fg = fearGreedMap[turnEndDate]
  const fgValue = fg?.value ?? null
  const fgLabel = fg?.classification ?? '데이터 없음'

  const news = SCENARIO_NEWS[scenarioId]?.[turnEndDate] ?? []
  const community = SCENARIO_COMMUNITY[scenarioId]?.[turnEndDate] ?? []

  const fgColor =
    fgValue === null ? 'text-zinc-400'
    : fgValue >= 60 ? 'text-red-400'
    : fgValue >= 40 ? 'text-yellow-400'
    : 'text-blue-400'

  const fgBg =
    fgValue === null ? 'bg-zinc-800'
    : fgValue >= 60 ? 'bg-red-900/20'
    : fgValue >= 40 ? 'bg-yellow-900/20'
    : 'bg-blue-900/20'

  return (
    <div className="flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex border-b border-zinc-800 shrink-0">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => isRevealed && setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t && isRevealed
                ? 'border-b-2 border-yellow-400 text-yellow-400'
                : 'text-zinc-500 hover:text-zinc-300'
            } ${!isRevealed ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* 잠금 오버레이 */}
      {!isRevealed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-600">
          <span className="text-3xl">🔒</span>
          <p className="text-sm">1차 결정 후 공개됩니다</p>
          <p className="text-xs">차트만 보고 먼저 결정해보세요</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">

          {/* 뉴스 탭 */}
          {tab === 'news' && (
            <div className="flex flex-col divide-y divide-zinc-800/60">
              {news.length > 0 ? news.map((n, i) => (
                <div key={i} className="px-4 py-4 hover:bg-zinc-900/40 transition-colors">
                  <p className="text-sm font-semibold text-zinc-100 leading-snug mb-1.5">{n.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">{n.summary}</p>
                  <p className="text-[10px] text-zinc-600">{n.source} · {turnEndDate}</p>
                </div>
              )) : (
                <div className="px-4 py-6 text-zinc-600 text-sm text-center">해당 날짜 뉴스 없음</div>
              )}
            </div>
          )}

          {/* 커뮤니티 탭 */}
          {tab === 'community' && (
            <div className="flex flex-col divide-y divide-zinc-800/60">
              {community.length > 0 ? community.map((p, i) => (
                <div key={i} className="px-4 py-4 hover:bg-zinc-900/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-300">{p.user}</span>
                    <span className="text-[10px] text-zinc-600">{p.time}</span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed mb-2">{p.content}</p>
                  <div className="flex gap-3 text-[10px] text-zinc-600">
                    <span>👍 {p.likes.toLocaleString()}</span>
                    <span>💬 {p.comments.toLocaleString()}</span>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-6 text-zinc-600 text-sm text-center">해당 날짜 게시물 없음</div>
              )}
            </div>
          )}

          {/* 공탐지수 탭 */}
          {tab === 'fg' && (
            <div className="px-4 py-6 flex flex-col items-center gap-4">
              {fgValue !== null ? (
                <>
                  <div className={`w-full rounded-2xl p-6 ${fgBg} border border-zinc-800 text-center`}>
                    <p className="text-xs text-zinc-500 mb-2">{turnEndDate} 기준</p>
                    <p className={`text-6xl font-bold ${fgColor} mb-1`}>{fgValue}</p>
                    <p className={`text-lg font-medium ${fgColor}`}>{fgLabel}</p>
                  </div>
                  {/* 게이지 바 */}
                  <div className="w-full">
                    <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                      <span>극단적 공포 (0)</span>
                      <span>극단적 탐욕 (100)</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-gradient-to-r from-blue-600 via-yellow-400 to-red-500">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-zinc-900 shadow"
                        style={{ left: `calc(${fgValue}% - 8px)` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-3 text-center leading-relaxed">
                      {fgValue >= 75 && '시장이 극도로 탐욕적입니다. 고점 매도 관점을 고려해보세요.'}
                      {fgValue >= 55 && fgValue < 75 && '탐욕이 지배하는 시장입니다. 추격 매수는 위험할 수 있습니다.'}
                      {fgValue >= 45 && fgValue < 55 && '중립적인 시장 분위기입니다.'}
                      {fgValue >= 25 && fgValue < 45 && '공포가 퍼져있습니다. 역발상 매수 관점도 고려해보세요.'}
                      {fgValue < 25 && '극단적 공포 상태입니다. 과거 데이터상 저점 매수 기회일 수 있습니다.'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-zinc-600 text-sm">해당 날짜 데이터 없음</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 최종 결정 버튼 */}
      {showConfirm && isRevealed && (
        <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition-colors"
          >
            감정 신호 확인 완료 — 최종 결정하기 →
          </button>
        </div>
      )}
    </div>
  )
}
