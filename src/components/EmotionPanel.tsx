import { useState, useEffect } from 'react'
import { SCENARIO_NEWS } from '@/data/scenarioNews'
import { SCENARIO_COMMUNITY } from '@/data/scenarioCommunity'

interface Props {
  scenarioId: number
  turnEndDate: string
  isRevealed: boolean
  onConfirm: () => void
  showConfirm: boolean
  scrollLayout?: boolean   // 모바일: 탭 없이 뉴스→커뮤니티 연속 스크롤
}

type Tab = 'news' | 'community'

export default function EmotionPanel({
  scenarioId, turnEndDate, isRevealed, onConfirm, showConfirm, scrollLayout = false,
}: Props) {
  const [tab, setTab] = useState<Tab>('news')
  useEffect(() => { setTab('news') }, [turnEndDate])

  const news = SCENARIO_NEWS[scenarioId]?.[turnEndDate] ?? []
  const community = SCENARIO_COMMUNITY[scenarioId]?.[turnEndDate] ?? []

  /* ── 잠금 상태 (공통) ── */
  if (!isRevealed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 text-zinc-600 ${scrollLayout ? 'py-12' : 'flex-1'}`}>
        <span className="text-3xl">🔒</span>
        <p className="text-sm">1차 결정 후 공개됩니다</p>
        <p className="text-xs">차트만 보고 먼저 결정해보세요</p>
      </div>
    )
  }

  /* ── 모바일: 연속 스크롤 레이아웃 ── */
  if (scrollLayout) {
    return (
      <div>
        {/* 뉴스 섹션 */}
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">📰 뉴스</p>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {news.length > 0 ? news.map((n, i) => (
            <div key={i} className="px-4 py-3">
              <p className="text-sm font-semibold text-zinc-100 leading-snug mb-1">{n.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed mb-1.5">{n.summary}</p>
              <p className="text-[10px] text-zinc-600">{n.source} · {n.date ?? turnEndDate}</p>
            </div>
          )) : (
            <p className="px-4 py-4 text-zinc-600 text-xs">해당 날짜 뉴스 없음</p>
          )}
        </div>

        {/* 커뮤니티 섹션 */}
        <div className="px-4 pt-5 pb-1 border-t border-zinc-800 mt-2">
          <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">💬 커뮤니티</p>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {community.length > 0 ? community.map((p, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-300">{p.user}</span>
                <span className="text-[10px] text-zinc-600">{p.time}</span>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed mb-1.5">{p.content}</p>
              <div className="flex gap-3 text-[10px] text-zinc-600">
                <span>👍 {p.likes.toLocaleString()}</span>
                <span>💬 {p.comments.toLocaleString()}</span>
              </div>
            </div>
          )) : (
            <p className="px-4 py-4 text-zinc-600 text-xs">해당 날짜 게시물 없음</p>
          )}
        </div>
      </div>
    )
  }

  /* ── 데스크탑: 탭 레이아웃 ── */
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-zinc-800 shrink-0">
        {(['news', 'community'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t ? 'border-b-2 border-white text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            {t === 'news' ? '📰 뉴스' : '💬 커뮤니티'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'news' && (
          <div className="divide-y divide-zinc-800/60">
            {news.length > 0 ? news.map((n, i) => (
              <div key={i} className="px-4 py-4 hover:bg-zinc-900/40 transition-colors">
                <p className="text-sm font-semibold text-zinc-100 leading-snug mb-1.5">{n.title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed mb-2">{n.summary}</p>
                <p className="text-[10px] text-zinc-600">{n.source} · {n.date ?? turnEndDate}</p>
              </div>
            )) : <p className="px-4 py-6 text-zinc-600 text-sm text-center">해당 날짜 뉴스 없음</p>}
          </div>
        )}
        {tab === 'community' && (
          <div className="divide-y divide-zinc-800/60">
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
            )) : <p className="px-4 py-6 text-zinc-600 text-sm text-center">해당 날짜 게시물 없음</p>}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
          <button onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/80 transition-colors">
            감정 신호 확인 완료 — 최종 결정하기 →
          </button>
        </div>
      )}
    </div>
  )
}
