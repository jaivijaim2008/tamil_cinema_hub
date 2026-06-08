'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import md5 from 'md5'
import ReactMarkdown from 'react-markdown'

interface Comment {
  _key?: string
  _id?: string
  author: string
  email?: string
  content: string
  createdAt: string
  edited?: boolean
  parentId?: string
  likes?: string[]
}

interface BlogCommentsProps {
  slug: string
}

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
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [likingKey, setLikingKey] = useState<string | null>(null)
  const [likedKeys, setLikedKeys] = useState<Set<string>>(new Set())
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}&limit=20`)
      .then(r => r.json())
      .then(data => {
        setComments(data.comments ?? [])
        setTotal(data.total ?? 0)
        setHasMore(data.hasMore ?? false)
        setNextCursor(data.nextCursor ?? null)
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [slug])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}&limit=20&before=${encodeURIComponent(nextCursor)}`)
      const data = await res.json()
      setComments(prev => [...prev, ...(data.comments ?? [])])
      setHasMore(data.hasMore ?? false)
      setNextCursor(data.nextCursor ?? null)
    } catch {}
    setLoadingMore(false)
  }, [slug, loadingMore, hasMore, nextCursor])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

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
    topLevel.sort((a, b) => {
      if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    for (const arr of byParent.values()) {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
    return { topLevel, byParent }
  }, [comments, sortOrder])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!author.trim() || !content.trim() || loading) return
    setLoading(true); setError(''); setSuccess(false)
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author: author.trim(), email: email.trim() || undefined, content: content.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to post comment'); setLoading(false); return }
      if (data.comment) { setComments(prev => [data.comment, ...prev]); setTotal(prev => prev + 1) }
      setContent(''); setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  async function handleReply(parentKey: string) {
    if (!author.trim() || !replyContent.trim() || replyLoading) return
    setReplyLoading(true); setError('')
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author: author.trim(), email: email.trim() || undefined, content: replyContent.trim(), parentId: parentKey }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to post reply'); setReplyLoading(false); return }
      if (data.comment) { setComments(prev => [...prev, data.comment]); setTotal(prev => prev + 1) }
      setReplyContent(''); setReplyTo(null)
    } catch { setError('Network error. Please try again.') }
    setReplyLoading(false)
  }

  async function handleEdit(key: string) {
    if (!editContent.trim() || editLoading) return
    setEditLoading(true); setError('')
    try {
      const res = await fetch(`/api/blog/comments/${key}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content: editContent.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to edit'); setEditLoading(false); return }
      setComments(prev => prev.map(c => c._key === key ? { ...c, content: editContent.trim(), edited: true } : c))
      setEditingKey(null); setEditContent('')
    } catch { setError('Network error.') }
    setEditLoading(false)
  }

  async function handleDelete(key: string) {
    if (deletingKey) return
    setDeletingKey(key); setError('')
    try {
      const res = await fetch(`/api/blog/comments/${key}?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to delete'); setDeletingKey(null); return }
      const keysToRemove = new Set(data.deletedKeys ?? [key])
      setComments(prev => prev.filter(c => !keysToRemove.has(c._key!)))
      setTotal(prev => prev - keysToRemove.size)
    } catch { setError('Network error.') }
    setDeletingKey(null)
  }

  async function handleLike(key: string) {
    if (likingKey) return
    setLikingKey(key)
    setLikedKeys(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })
    try {
      const res = await fetch(`/api/blog/comments/${key}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLikedKeys(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })
        return
      }
      setComments(prev => prev.map(c => c._key === key ? { ...c, likes: Array(data.likes) } : c))
    } catch {
      setLikedKeys(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })
    }
    setLikingKey(null)
  }

  function renderContent(text: string) {
    return <div className="prose prose-sm max-w-none"><ReactMarkdown>{text}</ReactMarkdown></div>
  }

  function renderComment(c: Comment, depth: number = 0) {
    const avatarUrl = getAvatarUrl(c.email)
    const replies = threaded.byParent.get(c._key!) ?? []
    const isEditing = editingKey === c._key
    const isReplying = replyTo === c._key
    const likeCount = c.likes?.length ?? 0

    return (
      <div key={c._key ?? c._id} className={depth > 0 ? 'ml-6 sm:ml-10' : ''}>
        <div className="rounded-xl p-4 transition-colors group/comment bg-white border border-[#E8E7E3]" style={depth > 0 ? { background: '#FAFAF8' } : undefined}>
          <div className="flex items-center gap-3 mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={c.author} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#D4291A]" style={{ background: '#FFF5F5' }}>
                {c.author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#111]">{c.author}</span>
              <span className="text-[10px] text-[#888] ml-2">{timeAgo(c.createdAt)}</span>
              {c.edited && <span className="text-[10px] text-[#aaa] ml-1">(edited)</span>}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
              {!isEditing && <button onClick={() => { setReplyTo(c._key!); setReplyContent(''); setEditingKey(null) }} className="text-[10px] text-[#888] hover:text-[#D4291A] transition-colors px-1.5 py-0.5 rounded">Reply</button>}
              {!isEditing && <button onClick={() => { setEditingKey(c._key!); setEditContent(c.content); setReplyTo(null) }} className="text-[10px] text-[#888] hover:text-blue-500 transition-colors px-1.5 py-0.5 rounded">Edit</button>}
              <button onClick={() => handleDelete(c._key!)} disabled={deletingKey === c._key} className="text-[10px] text-[#888] hover:text-red-500 transition-colors px-1.5 py-0.5 rounded disabled:opacity-40">{deletingKey === c._key ? '...' : 'Delete'}</button>
            </div>
          </div>

          {isEditing ? (
            <div className="pl-10">
              <textarea rows={2} maxLength={1000} value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-[#111] outline-none resize-none bg-[#F7F7F5] border border-[#E8E7E3] focus:border-[#D4291A]" />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => handleEdit(c._key!)} disabled={editLoading || !editContent.trim()} className="text-[11px] font-bold text-white rounded-lg px-3 py-1.5 transition-all hover:opacity-90 disabled:opacity-40" style={{ background: '#D4291A' }}>{editLoading ? 'Saving...' : 'Save'}</button>
                <button onClick={() => { setEditingKey(null); setEditContent('') }} className="text-[11px] text-[#888] hover:text-[#444] transition-colors px-3 py-1.5">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="pl-10 text-sm text-[#555] leading-relaxed">{renderContent(c.content)}</div>
          )}

          {!isEditing && (
            <div className="pl-10 mt-2 flex items-center gap-3">
              <button onClick={() => handleLike(c._key!)} disabled={likingKey === c._key} className="flex items-center gap-1 text-[11px] text-[#888] hover:text-pink-500 transition-colors px-1.5 py-0.5 rounded disabled:opacity-40">
                <svg className="w-3.5 h-3.5" fill={likedKeys.has(c._key!) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
            </div>
          )}
        </div>

        {isReplying && (
          <div className="ml-6 sm:ml-10 mt-2 mb-2 rounded-xl p-3 bg-[#FAFAF8] border border-[#E8E7E3]">
            <p className="text-[10px] text-[#888] mb-2 font-medium">Replying to <span className="font-bold text-[#111]">{c.author}</span></p>
            <textarea rows={2} maxLength={1000} value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Write your reply..." className="w-full rounded-lg px-3 py-2 text-sm text-[#111] placeholder:text-[#aaa] outline-none resize-none bg-white border border-[#E8E7E3] focus:border-[#D4291A]" autoFocus />
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => handleReply(c._key!)} disabled={replyLoading || !replyContent.trim() || !author.trim()} className="text-[11px] font-bold text-white rounded-lg px-3 py-1.5 transition-all hover:opacity-90 disabled:opacity-40" style={{ background: '#D4291A' }}>{replyLoading ? 'Posting...' : 'Reply'}</button>
              <button onClick={() => { setReplyTo(null); setReplyContent('') }} className="text-[11px] text-[#888] hover:text-[#444] transition-colors px-3 py-1.5">Cancel</button>
            </div>
          </div>
        )}

        {replies.length > 0 && <div className="space-y-2 mt-2">{replies.map(r => renderComment(r, depth + 1))}</div>}
      </div>
    )
  }

  return (
    <section className="mt-14">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4291A]">Comments</p>
          <h3 className="text-lg font-bold text-[#111]" style={{ fontFamily: "'Fraunces', serif" }}>{total} {total === 1 ? 'Comment' : 'Comments'}</h3>
        </div>
        {total > 1 && (
          <div className="flex items-center gap-1 text-[11px] font-medium rounded-lg p-0.5 bg-[#F7F7F5]">
            <button onClick={() => setSortOrder('newest')} className={`px-2.5 py-1 rounded-md transition-all ${sortOrder === 'newest' ? 'bg-white text-[#111] shadow-sm' : 'text-[#888] hover:text-[#444]'}`}>Newest</button>
            <button onClick={() => setSortOrder('oldest')} className={`px-2.5 py-1 rounded-md transition-all ${sortOrder === 'oldest' ? 'bg-white text-[#111] shadow-sm' : 'text-[#888] hover:text-[#444]'}`}>Oldest</button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888] mb-2">Your Name *</label>
            <input type="text" required maxLength={50} value={author} onChange={e => setAuthor(e.target.value)} placeholder="Enter your name" className="w-full rounded-lg px-4 py-3 text-sm text-[#111] placeholder:text-[#aaa] outline-none transition-all bg-white border border-[#E8E7E3] focus:border-[#D4291A] focus:ring-2 focus:ring-[#D4291A10]" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888] mb-2">Email (optional)</label>
            <input type="email" maxLength={200} value={email} onChange={e => setEmail(e.target.value)} placeholder="For gravatar avatar" className="w-full rounded-lg px-4 py-3 text-sm text-[#111] placeholder:text-[#aaa] outline-none transition-all bg-white border border-[#E8E7E3] focus:border-[#D4291A] focus:ring-2 focus:ring-[#D4291A10]" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888] mb-2">Your Comment (supports **markdown**)</label>
          <textarea required maxLength={2000} rows={3} value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts..." className="w-full rounded-lg px-4 py-3 text-sm text-[#111] placeholder:text-[#aaa] outline-none transition-all resize-none bg-white border border-[#E8E7E3] focus:border-[#D4291A] focus:ring-2 focus:ring-[#D4291A10]" />
          <p className="text-[10px] text-[#aaa] mt-1">{content.length}/2000 — supports **bold**, *italic*, `code`, [links](url)</p>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Comment posted!</p>}

        <button type="submit" disabled={loading || !author.trim() || !content.trim()} className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40" style={{ background: '#D4291A' }}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {fetching ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl p-4 bg-white border border-[#E8E7E3]">
              <div className="flex items-center gap-3 mb-2"><div className="h-3 w-20 rounded bg-[#F2F1EE]" /><div className="h-3 w-12 rounded bg-[#F2F1EE]" /></div>
              <div className="h-3 w-full rounded bg-[#F2F1EE]" />
            </div>
          ))}
        </div>
      ) : threaded.topLevel.length === 0 ? (
        <div className="text-center py-10 rounded-xl bg-white border border-[#E8E7E3]">
          <p className="text-[#888] text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">{threaded.topLevel.map(c => renderComment(c, 0))}</div>
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              {loadingMore ? (
                <p className="text-[#888] text-sm">Loading more comments...</p>
              ) : (
                <button onClick={loadMore} className="text-sm text-[#D4291A] hover:underline font-medium">Load more comments</button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
