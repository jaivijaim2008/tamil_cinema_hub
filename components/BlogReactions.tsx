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

  useEffect(() => {
    fetch(`/api/blog/reaction?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => { setLikes(data.likes ?? 0); setDislikes(data.dislikes ?? 0) })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    const vote = localStorage.getItem(`blog-vote-${slug}`)
    if (vote === 'like' || vote === 'dislike') setUserVote(vote)
  }, [slug])

  async function react(type: 'like' | 'dislike') {
    if (loading) return
    const prevVote = userVote

    if (prevVote === type) {
      setLoading(true)
      try {
        const res = await fetch('/api/blog/reaction', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, type, action: 'remove' }),
        })
        if (res.ok) {
          const data = await res.json()
          setLikes(data.likes); setDislikes(data.dislikes); setUserVote(null)
          localStorage.removeItem(`blog-vote-${slug}`)
        }
      } catch {}
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/blog/reaction', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type, prev: prevVote }),
      })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes); setDislikes(data.dislikes); setUserVote(type)
        localStorage.setItem(`blog-vote-${slug}`, type)
      }
    } catch {}
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4 py-6">
      <p className="text-sm font-semibold text-[#888]">Was this helpful?</p>
      <button
        onClick={() => react('like')}
        disabled={loading}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
        style={userVote === 'like'
          ? { background: '#F0FFF4', border: '1px solid #BBF7D0', color: '#16A34A' }
          : { background: '#F7F7F5', border: '1px solid #E8E7E3', color: '#444' }
        }
      >
        <svg className="w-4 h-4" fill={userVote === 'like' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
        </svg>
        <span>{likes}</span>
      </button>
      <button
        onClick={() => react('dislike')}
        disabled={loading}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
        style={userVote === 'dislike'
          ? { background: '#FFF5F5', border: '1px solid #FECACA', color: '#DC2626' }
          : { background: '#F7F7F5', border: '1px solid #E8E7E3', color: '#444' }
        }
      >
        <svg className="w-4 h-4" fill={userVote === 'dislike' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
        </svg>
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
