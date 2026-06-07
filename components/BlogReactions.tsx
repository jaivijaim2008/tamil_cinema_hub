'use client'

import { useState, useEffect } from 'react'

interface BlogReactionsProps {
  slug: string
}

export default function BlogReactions({ slug }: BlogReactionsProps) {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null)
  const [loading, setLoading] = useState(false)

  // Load reaction counts
  useEffect(() => {
    fetch(`/api/blog/reaction?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        setLikes(data.likes ?? 0)
        setDislikes(data.dislikes ?? 0)
      })
      .catch(() => {})
  }, [slug])

  // Load user's previous vote from localStorage
  useEffect(() => {
    const vote = localStorage.getItem(`blog-vote-${slug}`)
    if (vote === 'like' || vote === 'dislike') setUserVote(vote)
  }, [slug])

  async function react(type: 'like' | 'dislike') {
    if (loading) return
    // If already voted this way, toggle off
    if (userVote === type) return

    setLoading(true)
    try {
      const res = await fetch('/api/blog/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type }),
      })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes)
        setDislikes(data.dislikes)
        setUserVote(type)
        localStorage.setItem(`blog-vote-${slug}`, type)
      }
    } catch {}
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4 py-6">
      <p className="text-sm font-semibold text-white/50">Was this helpful?</p>

      {/* Like button */}
      <button
        onClick={() => react('like')}
        disabled={loading}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
          userVote === 'like'
            ? 'bg-green-500/20 border border-green-500/40 text-green-400 shadow-lg shadow-green-500/10'
            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'
        }`}
      >
        <svg className="w-4 h-4" fill={userVote === 'like' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
        </svg>
        <span>{likes}</span>
      </button>

      {/* Dislike button */}
      <button
        onClick={() => react('dislike')}
        disabled={loading}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
          userVote === 'dislike'
            ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-lg shadow-red-500/10'
            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
        }`}
      >
        <svg className="w-4 h-4" fill={userVote === 'dislike' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
        </svg>
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
