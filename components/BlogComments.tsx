'use client'

import { useState, useEffect, useMemo } from 'react'
import md5 from 'md5'

interface Comment {
  _key?: string
  _id?: string
  author: string
  email?: string
  content: string
  createdAt: string
  edited?: boolean
  parentId?: string
}

interface BlogCommentsProps {
  slug: string
}

// Extracted outside component — pure function, no React deps
function getAvatarUrl(email?: string): string | null {
  if (!email) return null
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=64`
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

export default function BlogComments({ slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Reply state
  const [replyTo, setReplyTo] = useState<string | null>(null) // _key of parent
  const [replyContent, setReplyContent] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)

  // Edit state
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Delete state
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  // Load comments
  useEffect(() => {
    fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => setComments(data.comments ?? []))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [slug])

  // Build threaded structure with useMemo
  const threaded = useMemo(() => {
    const topLevel = comments.filter(c => !c.parentId)
    const byParent = new Map<string, Comment[]>()
    for (const c of comments) {
      if (c.parentId) {
        const arr = byParent.get(c.parentId) ?? []
        arr.push(c)
        byParent.set(c.parentId, arr)
      }
    }
    // Sort top-level
    topLevel.sort((a, b) => {
      if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    // Sort replies oldest-first (chronological)
    for (const arr of byParent.values()) {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
    return { topLevel, byParent }
  }, [comments, sortOrder])

  // Post new top-level comment
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
        body: JSON.stringify({ slug, author: author.trim(), email: email.trim() || undefined, content: content.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to post comment')
        setLoading(false)
        return
      }
      if (data.comment) setComments(prev => [data.comment, ...prev])
      setContent('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  // Post reply
  async function handleReply(parentKey: string) {
    if (!author.trim() || !replyContent.trim() || replyLoading) return
    setReplyLoading(true)
    setError('')
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug, author: author.trim(), email: email.trim() || undefined,
          content: replyContent.trim(), parentId: parentKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to post reply')
        setReplyLoading(false)
        return
      }
      if (data.comment) setComments(prev => [...prev, data.comment])
      setReplyContent('')
      setReplyTo(null)
    } catch {
      setError('Network error. Please try again.')
    }
    setReplyLoading(false)
  }

  // Edit comment
  async function handleEdit(key: string) {
    if (!editContent.trim() || editLoading) return
    setEditLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/blog/comments/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content: editContent.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to edit comment')
        setEditLoading(false)
        return
      }
      setComments(prev => prev.map(c =>
        c._key === key ? { ...c, content: editContent.trim(), edited: true } : c
      ))
      setEditingKey(null)
      setEditContent('')
    } catch {
      setError('Network error. Please try again.')
    }
    setEditLoading(false)
  }

  // Delete comment
  async function handleDelete(key: string) {
    if (deletingKey) return
    setDeletingKey(key)
    setError('')
    try {
      const res = await fetch(`/api/blog/comments/${key}?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to delete comment')
        setDeletingKey(null)
        return
      }
      // Remove the comment and its replies from state
      const keysToRemove = new Set(data.deletedKeys ?? [key])
      setComments(prev => prev.filter(c => !keysToRemove.has(c._key!)))
    } catch {
      setError('Network error. Please try again.')
    }
    setDeletingKey(null)
  }

  // Render a single comment with its actions
  function renderComment(c: Comment, depth: number = 0) {
    const avatarUrl = getAvatarUrl(c.email)
    const replies = threaded.byParent.get(c._key!) ?? []
    const isEditing = editingKey === c._key
    const isReplying = replyTo === c._key

    return (
      <div key={c._key ?? c._id} className={depth > 0 ? 'ml-6 sm:ml-10' : ''}>
        <div
          className="rounded-xl p-4 transition-colors group/comment"
          style={{
            background: depth > 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
            border: depth > 0
              ? '1px solid rgba(168,85,247,0.1)'
              : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Header: avatar + author + time */}
          <div className="flex items-center gap-3 mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={c.author} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-violet-300"
                style={{ background: 'rgba(168,85,247,0.15)' }}
              >
                {c.author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white/80">{c.author}</span>
              <span className="text-[10px] text-white/30 ml-2">{timeAgo(c.createdAt)}</span>
              {c.edited && <span className="text-[10px] text-white/20 ml-1">(edited)</span>}
            </div>

            {/* Action buttons — show on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
              {!isEditing && (
                <button
                  onClick={() => { setReplyTo(c._key!); setReplyContent(''); setEditingKey(null); }}
                  className="text-[10px] text-white/30 hover:text-violet-400 transition-colors px-1.5 py-0.5 rounded"
                  title="Reply"
                >
                  Reply
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={() => { setEditingKey(c._key!); setEditContent(c.content); setReplyTo(null); }}
                  className="text-[10px] text-white/30 hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded"
                  title="Edit"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(c._key!)}
                disabled={deletingKey === c._key}
                className="text-[10px] text-white/30 hover:text-red-400 transition-colors px-1.5 py-0.5 rounded disabled:opacity-40"
                title="Delete"
              >
                {deletingKey === c._key ? '...' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Content or edit form */}
          {isEditing ? (
            <div className="pl-10">
              <textarea
                rows={2}
                maxLength={1000}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.3)' }}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleEdit(c._key!)}
                  disabled={editLoading || !editContent.trim()}
                  className="text-[11px] font-bold text-white rounded-lg px-3 py-1.5 transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingKey(null); setEditContent(''); }}
                  className="text-[11px] text-white/40 hover:text-white/60 transition-colors px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap pl-10">{c.content}</p>
          )}
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="ml-6 sm:ml-10 mt-2 mb-2">
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}
            >
              <p className="text-[10px] text-violet-400 mb-2 font-medium">
                Replying to <span className="font-bold text-violet-300">{c.author}</span>
              </p>
              <textarea
                rows={2}
                maxLength={1000}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                autoFocus
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleReply(c._key!)}
                  disabled={replyLoading || !replyContent.trim() || !author.trim()}
                  className="text-[11px] font-bold text-white rounded-lg px-3 py-1.5 transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  {replyLoading ? 'Posting...' : 'Reply'}
                </button>
                <button
                  onClick={() => { setReplyTo(null); setReplyContent(''); }}
                  className="text-[11px] text-white/40 hover:text-white/60 transition-colors px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <div className="space-y-2 mt-2">
            {replies.map(r => renderComment(r, depth + 1))}
          </div>
        )}
      </div>
    )
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
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500">Comments</p>
          <h3 className="text-lg font-black text-white">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</h3>
        </div>
        {comments.length > 1 && (
          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
            <button
              onClick={() => setSortOrder('newest')}
              className={`px-2.5 py-1 rounded-md transition-all ${sortOrder === 'newest' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortOrder('oldest')}
              className={`px-2.5 py-1 rounded-md transition-all ${sortOrder === 'oldest' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}
            >
              Oldest
            </button>
          </div>
        )}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Your Name *</label>
            <input
              type="text" required maxLength={50} value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Email (optional)</label>
            <input
              type="email" maxLength={200} value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="For gravatar avatar"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Your Comment</label>
          <textarea
            required maxLength={1000} rows={3} value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <p className="text-[10px] text-white/25 mt-1">{content.length}/1000</p>
        </div>

        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">Comment posted!</p>}

        <button
          type="submit" disabled={loading || !author.trim() || !content.trim()}
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
      ) : threaded.topLevel.length === 0 ? (
        <div className="text-center py-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/30 text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threaded.topLevel.map(c => renderComment(c, 0))}
        </div>
      )}
    </section>
  )
}
