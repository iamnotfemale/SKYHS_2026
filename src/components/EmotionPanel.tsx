import { useState, useEffect } from 'react'
import { SCENARIO_NEWS } from '@/data/scenarioNews'
import { SCENARIO_COMMUNITY } from '@/data/scenarioCommunity'

interface Props {
  scenarioId: number
  turnEndDate: string
  isRevealed: boolean
  onConfirm: () => void
  showConfirm: boolean
}

type Tab = 'news' | 'community'

const TAB_LABELS: Record<Tab, string> = {
  news: '📰 뉴스',
  community: '💬 커뮤니티',
}

export default function EmotionPanel({ scenarioId, turnEndDate, isRevealed, onConfirm, showConfirm }: Props) {
  const [tab, setTab] = useState<Tab>('news')

  // 새 턴 시작 시 항상 뉴스 탭으로 리셋
  useEffect(() => { setTab('news') }, [turnEndDate])

  const news = SCENARIO_NEWS[scenarioId]?.[turnEndDate] ?? []
  const community = SCENARIO_COMMUNITY[scenarioId]?.[turnEndDate] ?? []

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
                ? 'border-b-2 border-white text-white'
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
                  <p className="text-[10px] text-zinc-600">{n.source} · {n.date ?? turnEndDate}</p>
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
        </div>
      )}

      {/* 최종 결정하기 버튼 */}
      {showConfirm && isRevealed && (
        <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/80 transition-colors"
          >
            감정 신호 확인 완료 — 최종 결정하기 →
          </button>
        </div>
      )}
    </div>
  )
}


