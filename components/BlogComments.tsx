'use client'

import { useState, useEffect } from 'react'

interface Comment {
  _id: string
  author: string
  content: string
  createdAt: string
}

interface BlogCommentsProps {
  slug: string
}

export default function BlogComments({ slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load comments
  useEffect(() => {
    fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => setComments(data.comments ?? []))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!author.trim() || !content.trim() || loading) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author: author.trim(), content: content.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to post comment')
        setLoading(false)
        return
      }

      // Add the new comment to the top
      if (data.comment) {
        setComments(prev => [data.comment, ...prev])
      }
      setContent('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <section className="mt-14">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}
        >
          <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500">Comments</p>
          <h3 className="text-lg font-black text-white">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</h3>
        </div>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Your Name</label>
            <input
              type="text"
              required
              maxLength={50}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Your Comment</label>
          <textarea
            required
            maxLength={1000}
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <p className="text-[10px] text-white/25 mt-1">{content.length}/1000</p>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">Comment posted!</p>
        )}

        <button
          type="submit"
          disabled={loading || !author.trim() || !content.trim()}
          className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Posting...
            </>
          ) : 'Post Comment'}
        </button>
      </form>

      {/* Comments list */}
      {fetching ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-3 w-12 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
              <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/30 text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c._id}
              className="rounded-xl p-4 transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-violet-300"
                  style={{ background: 'rgba(168,85,247,0.15)' }}
                >
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-bold text-white/80">{c.author}</span>
                  <span className="text-[10px] text-white/30 ml-2">{timeAgo(c.createdAt)}</span>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap pl-10">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
