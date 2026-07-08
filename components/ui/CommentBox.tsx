'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Heart, Trash2, Edit3, Send, ChevronDown, User, Reply, Clock } from 'lucide-react'

interface Comment {
  _key: string
  _id?: string
  author: string
  content: string
  createdAt: string
  edited?: boolean
  likes?: string[]
  parentId?: string
  authorIp?: string
}

interface Props {
  blogSlug: string
}

const STORAGE_KEY = 'tamilcinema_user_info'

function getUserInfo(): { name: string; email: string } {
  if (typeof window === 'undefined') return { name: '', email: '' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { name: '', email: '' }
  } catch {
    return { name: '', email: '' }
  }
}

function saveUserInfo(name: string, email: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email }))
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function CommentBox({ blogSlug }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  // Form state
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyAuthor, setReplyAuthor] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load user info from localStorage
  useEffect(() => {
    const info = getUserInfo()
    if (info.name) setAuthor(info.name)
    if (info.email) setEmail(info.email)
  }, [])

  // Fetch comments
  const fetchComments = useCallback(async (before?: string) => {
    try {
      const params = new URLSearchParams({ slug: blogSlug, limit: '20' })
      if (before) params.set('before', before)

      const res = await fetch(`/api/blog/comments?${params}`)
      if (!res.ok) throw new Error('Failed to load comments')
      const data = await res.json()

      if (before) {
        setComments(prev => [...prev, ...data.comments])
      } else {
        setComments(data.comments)
      }
      setTotalComments(data.total)
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [blogSlug])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Post comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) {
      setError('Name and comment are required')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: blogSlug,
          author: author.trim(),
          email: email.trim() || undefined,
          content: content.trim(),
          parentId: replyTo || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to post comment')

      // Save user info
      saveUserInfo(author.trim(), email.trim())

      // Add new comment to list
      const newComment: Comment = {
        _key: data.comment._id,
        author: data.comment.author,
        content: data.comment.content,
        createdAt: data.comment.createdAt,
        parentId: data.comment.parentId,
      }

      setComments(prev => replyTo ? [newComment, ...prev] : [newComment, ...prev])
      setTotalComments(prev => prev + 1)
      setContent('')
      setReplyTo(null)
      setReplyAuthor('')
      setSuccess('Comment posted successfully! ✨')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  // Edit comment
  const handleEdit = async (key: string) => {
    if (!editContent.trim()) return

    try {
      const res = await fetch(`/api/blog/comments/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: blogSlug, content: editContent.trim() }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to edit')

      setComments(prev => prev.map(c =>
        c._key === key ? { ...c, content: editContent.trim(), edited: true } : c
      ))
      setEditingKey(null)
      setEditContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit comment')
    }
  }

  // Delete comment
  const handleDelete = async (key: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      const res = await fetch(`/api/blog/comments/${key}?slug=${blogSlug}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      setComments(prev => prev.filter(c => c._key !== key && c.parentId !== key))
      setTotalComments(prev => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }

  // Like comment
  const handleLike = async (key: string) => {
    try {
      const res = await fetch(`/api/blog/comments/${key}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: blogSlug }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to like')

      setComments(prev => prev.map(c => {
        if (c._key !== key) return c
        const likes = c.likes || []
        const newLikes = data.liked ? [...likes, 'user'] : likes.filter(l => l !== 'user')
        return { ...c, likes: newLikes }
      }))
    } catch {
      // Silent fail
    }
  }

  // Organize comments into threads
  const rootComments = comments.filter(c => !c.parentId)
  const repliesMap = new Map<string, Comment[]>()
  comments.filter(c => c.parentId).forEach(c => {
    const list = repliesMap.get(c.parentId!) || []
    list.push(c)
    repliesMap.set(c.parentId!, list)
  })

  return (
    <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
            <MessageCircle size={16} className="text-accent-gold" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary">Discussion</h2>
            <p className="text-[11px] sm:text-xs text-text-muted">{totalComments} comment{totalComments !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Comment Form — mobile-first layout */}
      <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-bg-card border border-border">
          {/* User info — stack on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 self-start sm:self-center"
              style={{ backgroundColor: getAvatarColor(author || 'Anonymous') }}>
              {author ? getInitials(author) : <User size={14} />}
            </div>
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Your name *"
                className="flex-1 px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors min-h-[44px]"
                required
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="flex-1 px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors min-h-[44px]"
              />
            </div>
          </div>

          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-lg bg-accent-gold/5 border border-accent-gold/20">
              <Reply size={12} className="text-accent-gold shrink-0" />
              <span className="text-xs text-accent-gold truncate">Replying to {replyAuthor}</span>
              <button type="button" onClick={() => { setReplyTo(null); setReplyAuthor('') }}
                className="ml-auto text-base text-text-muted hover:text-text-primary min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0">×</button>
            </div>
          )}

          {/* Content textarea — taller on mobile for easier typing */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts about this article..."
            rows={4}
            maxLength={1000}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors resize-none mb-3 min-h-[100px]"
            required
          />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">{content.length}/1000</span>
            <button
              type="submit"
              disabled={submitting || !author.trim() || !content.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-gold text-text-inverse text-sm font-semibold hover:bg-accent-gold-dim disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] touch-manipulation"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span className="hidden sm:inline">{submitting ? 'Posting...' : 'Post Comment'}</span>
              <span className="sm:hidden">{submitting ? '...' : 'Post'}</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
            {success}
          </div>
        )}
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse p-4 rounded-2xl bg-bg-card border border-border">
              <div className="flex gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-bg-elevated shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-bg-elevated" />
                  <div className="h-3 w-full rounded bg-bg-elevated" />
                  <div className="h-3 w-3/4 rounded bg-bg-elevated" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rootComments.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <MessageCircle size={36} className="text-text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-text-muted">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {rootComments.map(comment => (
            <CommentItem
              key={comment._key}
              comment={comment}
              replies={repliesMap.get(comment._key) || []}
              blogSlug={blogSlug}
              onReply={(key, name) => { setReplyTo(key); setReplyAuthor(name) }}
              onEdit={(key, content) => { setEditingKey(key); setEditContent(content) }}
              onDelete={handleDelete}
              onLike={handleLike}
              editingKey={editingKey}
              editContent={editContent}
              setEditContent={setEditContent}
              onSaveEdit={handleEdit}
              onCancelEdit={() => { setEditingKey(null); setEditContent('') }}
            />
          ))}

          {hasMore && nextCursor && (
            <button
              onClick={() => fetchComments(nextCursor)}
              className="w-full py-3.5 rounded-xl bg-bg-card border border-border text-sm text-text-muted hover:text-accent-gold hover:border-accent-gold/30 transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
            >
              <ChevronDown size={14} />
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Comment Item Component — mobile-first with proper touch targets
function CommentItem({
  comment,
  replies,
  blogSlug,
  onReply,
  onEdit,
  onDelete,
  onLike,
  editingKey,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit,
}: {
  comment: Comment
  replies: Comment[]
  blogSlug: string
  onReply: (key: string, name: string) => void
  onEdit: (key: string, content: string) => void
  onDelete: (key: string) => void
  onLike: (key: string) => void
  editingKey: string | null
  editContent: string
  setEditContent: (v: string) => void
  onSaveEdit: (key: string) => void
  onCancelEdit: () => void
}) {
  const isEditing = editingKey === comment._key
  const isLiked = comment.likes?.includes('user')
  const likeCount = comment.likes?.length || 0

  return (
    <div className="group">
      {/* Main comment */}
      <div className={`p-3.5 sm:p-4 rounded-2xl transition-all ${isEditing ? 'bg-accent-gold/5 border border-accent-gold/20' : 'bg-bg-card border border-border hover:border-border-light'}`}>
        <div className="flex gap-2.5 sm:gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: getAvatarColor(comment.author) }}>
            {getInitials(comment.author)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
              <span className="text-sm font-semibold text-text-primary">{comment.author}</span>
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Clock size={10} />
                {formatDate(comment.createdAt)}
              </span>
              {comment.edited && (
                <span className="text-[10px] text-text-muted italic">(edited)</span>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary focus:outline-none focus:border-accent-gold/50 resize-none min-h-[80px]"
                />
                <div className="flex gap-2">
                  <button onClick={() => onSaveEdit(comment._key)}
                    className="px-4 py-2 rounded-lg bg-accent-gold text-text-inverse text-xs font-semibold hover:bg-accent-gold-dim transition-colors min-h-[36px] touch-manipulation">
                    Save
                  </button>
                  <button onClick={onCancelEdit}
                    className="px-4 py-2 rounded-lg bg-bg-elevated border border-border text-xs text-text-muted hover:text-text-primary transition-colors min-h-[36px] touch-manipulation">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            )}

            {/* Actions — always visible on mobile, hover on desktop */}
            {!isEditing && (
              <div className="flex items-center gap-1 sm:gap-4 mt-2.5 sm:mt-3 -ml-1 sm:ml-0">
                <button onClick={() => onLike(comment._key)}
                  className={`flex items-center gap-1.5 text-xs transition-colors min-h-[40px] min-w-[40px] px-2 rounded-lg touch-manipulation ${isLiked ? 'text-red-400' : 'text-text-muted hover:text-red-400'}`}>
                  <Heart size={13} className={isLiked ? 'fill-current' : ''} />
                  <span className="text-[11px]">{likeCount > 0 ? likeCount : ''}</span>
                </button>
                <button onClick={() => onReply(comment._key, comment.author)}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-gold transition-colors min-h-[40px] px-2 rounded-lg touch-manipulation">
                  <Reply size={12} />
                  <span className="hidden sm:inline">Reply</span>
                </button>
                <button onClick={() => onEdit(comment._key, comment.content)}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-gold transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 min-h-[40px] px-2 rounded-lg touch-manipulation">
                  <Edit3 size={12} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button onClick={() => onDelete(comment._key)}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 min-h-[40px] px-2 rounded-lg touch-manipulation">
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies — reduced margin on mobile */}
      {replies.length > 0 && (
        <div className="ml-6 sm:ml-8 mt-2.5 sm:mt-3 space-y-2.5 sm:space-y-3">
          {replies.map(reply => (
            <div key={reply._key} className="p-3 sm:p-4 rounded-2xl bg-bg-card/50 border border-border/50">
              <div className="flex gap-2.5 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: getAvatarColor(reply.author) }}>
                  {getInitials(reply.author)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
                    <span className="text-xs font-semibold text-text-primary">{reply.author}</span>
                    <span className="text-[10px] text-text-muted">{formatDate(reply.createdAt)}</span>
                    {reply.edited && <span className="text-[10px] text-text-muted italic">(edited)</span>}
                  </div>
                  <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 -ml-1 sm:ml-0">
                    <button onClick={() => onLike(reply._key)}
                      className={`flex items-center gap-1 text-[11px] transition-colors min-h-[36px] min-w-[36px] px-1.5 rounded-lg touch-manipulation ${(reply.likes?.includes('user')) ? 'text-red-400' : 'text-text-muted hover:text-red-400'}`}>
                      <Heart size={11} className={(reply.likes?.includes('user')) ? 'fill-current' : ''} />
                      {(reply.likes?.length || 0) > 0 && <span>{reply.likes!.length}</span>}
                    </button>
                    <button onClick={() => onDelete(reply._key)}
                      className="flex items-center gap-1 text-[11px] text-text-muted hover:text-red-400 transition-colors min-h-[36px] min-w-[36px] px-1.5 rounded-lg touch-manipulation">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
